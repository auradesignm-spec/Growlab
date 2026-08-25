/**
 * Conversions API for Business Messaging (CTWA).
 * LeadSubmitted on first ad chat; Purchase only when COD is collected (fulfilled).
 */

import { prisma } from "@/lib/db";
import { graphBase } from "@/lib/meta/config";
import { decryptSecret } from "@/lib/meta/crypto";

type GraphError = { error?: { message?: string; error_user_msg?: string } };

export type CapiEventName = "LeadSubmitted" | "Purchase" | "QualifiedLead" | "OrderCreated";

export function metaCapiDryRun(): boolean {
  const v = process.env.META_CAPI_DRY_RUN?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function digitsPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function phonesMatch(a: string, b: string): boolean {
  const da = digitsPhone(a);
  const db = digitsPhone(b);
  if (da.length < 8 || db.length < 8) return false;
  if (da === db) return true;
  return da.endsWith(db) || db.endsWith(da);
}

function isRealCtwaClid(clid: string | null | undefined): boolean {
  if (!clid) return false;
  const c = clid.trim();
  return c.length >= 8 && c !== "unknown";
}

async function graphJson<T>(
  method: "GET" | "POST",
  path: string,
  accessToken: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const url =
    method === "GET"
      ? `${graphBase()}${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(accessToken)}`
      : `${graphBase()}${path}`;
  const res = await fetch(url, {
    method,
    headers:
      method === "POST"
        ? {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          }
        : undefined,
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    cache: "no-store",
  });
  const json = (await res.json()) as T & GraphError;
  if (!res.ok || json.error) {
    throw new Error(json.error?.error_user_msg || json.error?.message || `Graph ${method} failed (${res.status})`);
  }
  return json;
}

/** Ensure WABA has a CAPI dataset; persist on MetaConnection. */
export async function ensureWhatsAppDataset(connectionId: string): Promise<string> {
  const connection = await prisma.metaConnection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new Error("Meta connection not found.");
  if (connection.datasetId.trim()) return connection.datasetId.trim();

  if (metaCapiDryRun()) {
    const fake = `dry_dataset_${connection.wabaId.slice(0, 8)}`;
    await prisma.metaConnection.update({
      where: { id: connection.id },
      data: { datasetId: fake },
    });
    return fake;
  }

  const token = decryptSecret(connection.accessTokenEnc);
  const created = await graphJson<{ id?: string }>("POST", `/${connection.wabaId}/dataset`, token, {});
  let datasetId = created.id?.trim() ?? "";
  if (!datasetId) {
    const existing = await graphJson<{ data?: Array<{ id?: string }>; id?: string }>(
      "GET",
      `/${connection.wabaId}/dataset`,
      token,
    );
    datasetId = existing.id?.trim() || existing.data?.[0]?.id?.trim() || "";
  }
  if (!datasetId) throw new Error("Meta did not return a dataset id for this WABA.");

  await prisma.metaConnection.update({
    where: { id: connection.id },
    data: { datasetId },
  });
  return datasetId;
}

export async function sendBusinessMessagingEvent(input: {
  connectionId: string;
  wabaId: string;
  ctwaClid: string;
  eventName: CapiEventName;
  eventTime?: Date;
  value?: number;
  currency?: string;
  orderId?: string;
}): Promise<{ ok: boolean; dryRun: boolean; skipped?: string }> {
  if (!isRealCtwaClid(input.ctwaClid)) {
    return { ok: false, dryRun: false, skipped: "no_ctwa_clid" };
  }

  const datasetId = await ensureWhatsAppDataset(input.connectionId);
  const connection = await prisma.metaConnection.findUnique({ where: { id: input.connectionId } });
  if (!connection) return { ok: false, dryRun: false, skipped: "no_connection" };

  const eventTime = Math.floor((input.eventTime ?? new Date()).getTime() / 1000);
  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: eventTime,
        action_source: "business_messaging",
        messaging_channel: "whatsapp",
        user_data: {
          whatsapp_business_account_id: input.wabaId || connection.wabaId,
          ctwa_clid: input.ctwaClid,
        },
        ...(input.eventName === "Purchase" || input.value != null
          ? {
              custom_data: {
                currency: (input.currency || "OMR").toUpperCase(),
                value: Number(input.value ?? 0),
                ...(input.orderId ? { order_id: input.orderId } : {}),
              },
            }
          : {}),
      },
    ],
    partner_agent: "growlab",
  };

  if (metaCapiDryRun() || datasetId.startsWith("dry_")) {
    return { ok: true, dryRun: true };
  }

  const token = decryptSecret(connection.accessTokenEnc);
  await graphJson("POST", `/${datasetId}/events`, token, payload);
  return { ok: true, dryRun: false };
}

/** Fire LeadSubmitted once for a CTWA lead. */
export async function fireLeadSubmittedForLead(leadId: string): Promise<void> {
  const lead = await prisma.interestLead.findUnique({ where: { id: leadId } });
  if (!lead || lead.capiLeadAt) return;
  if (!isRealCtwaClid(lead.ctwaClid)) return;

  const connection = await prisma.metaConnection.findUnique({
    where: { merchantId: lead.merchantId },
  });
  if (!connection || connection.status !== "active") return;

  try {
    const result = await sendBusinessMessagingEvent({
      connectionId: connection.id,
      wabaId: connection.wabaId,
      ctwaClid: lead.ctwaClid!,
      eventName: "LeadSubmitted",
    });
    if (result.ok) {
      await prisma.interestLead.update({
        where: { id: lead.id },
        data: { capiLeadAt: new Date() },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "CAPI Lead failed";
    await prisma.metaConnection.update({
      where: { id: connection.id },
      data: { lastError: `CAPI Lead: ${msg}`.slice(0, 500) },
    });
  }
}

/** Fire Purchase when order is collected (fulfilled), matching InterestLead by phone. */
export async function firePurchaseForCollectedOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      deal: { include: { product: true } },
      ledgerEntry: true,
    },
  });
  if (!order || order.status !== "fulfilled") return;

  const merchantId = order.deal.product.merchantId;
  const leads = await prisma.interestLead.findMany({
    where: {
      merchantId,
      ctwaClid: { not: null },
      capiPurchaseAt: null,
      OR: [{ status: { in: ["chatting", "interested", "ordered", "collected"] } }, { linkedOrderId: orderId }],
    },
    take: 200,
  });

  const lead = leads.find((l) => phonesMatch(l.phone, order.buyerPhone) && isRealCtwaClid(l.ctwaClid));
  if (!lead) return;

  const connection = await prisma.metaConnection.findUnique({ where: { merchantId } });
  if (!connection || connection.status !== "active") return;

  const value =
    order.ledgerEntry?.attributedGmv ??
    order.unitPriceCharged * order.quantity;

  try {
    const result = await sendBusinessMessagingEvent({
      connectionId: connection.id,
      wabaId: connection.wabaId,
      ctwaClid: lead.ctwaClid!,
      eventName: "Purchase",
      value,
      currency: order.currency,
      orderId: order.id,
    });
    if (result.ok) {
      await prisma.interestLead.update({
        where: { id: lead.id },
        data: {
          capiPurchaseAt: new Date(),
          status: "collected",
          linkedOrderId: order.id,
          nextFollowUpAt: null,
          followUpStep: 3,
        },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "CAPI Purchase failed";
    await prisma.metaConnection.update({
      where: { id: connection.id },
      data: { lastError: `CAPI Purchase: ${msg}`.slice(0, 500) },
    });
  }
}
