import { prisma } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/meta/crypto";
import { graphBase } from "@/lib/meta/config";
import { fireLeadSubmittedForLead } from "@/lib/meta/capi";
import { isYesIntent, scheduleFirstFollowUp, stopLeadRecovery } from "@/lib/meta/recovery";

export type EmbeddedSignupPayload = {
  code: string;
  wabaId: string;
  phoneNumberId: string;
  businessId?: string;
  pageId?: string;
};

export type CtwaReferral = {
  ctwaClid: string;
  metaAdId: string;
  metaAdsetId: string;
  metaCampaignId: string;
  referralJson: string;
};

type GraphError = { error?: { message?: string } };

async function graphGet<T>(path: string, accessToken: string): Promise<T> {
  const url = `${graphBase()}${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const json = (await res.json()) as T & GraphError;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Graph GET failed (${res.status})`);
  }
  return json;
}

async function graphPost<T>(path: string, accessToken: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${graphBase()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as T & GraphError;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Graph POST failed (${res.status})`);
  }
  return json;
}

/** Exchange Embedded Signup auth code for a long-lived business token. */
export async function exchangeEmbeddedSignupCode(code: string): Promise<string> {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appId || !appSecret) throw new Error("Meta app credentials are not configured.");

  const url =
    `${graphBase()}/oauth/access_token` +
    `?client_id=${encodeURIComponent(appId)}` +
    `&client_secret=${encodeURIComponent(appSecret)}` +
    `&code=${encodeURIComponent(code)}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const json = (await res.json()) as { access_token?: string; error?: { message?: string } };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error?.message || "Failed to exchange Meta signup code.");
  }
  return json.access_token;
}

export async function fetchDisplayPhone(phoneNumberId: string, accessToken: string): Promise<string> {
  try {
    const data = await graphGet<{ display_phone_number?: string; verified_name?: string }>(
      `/${phoneNumberId}?fields=display_phone_number,verified_name`,
      accessToken,
    );
    return data.display_phone_number?.trim() || "";
  } catch {
    return "";
  }
}

export async function upsertMerchantMetaConnection(
  merchantId: string,
  input: EmbeddedSignupPayload & { accessToken: string },
) {
  const displayPhone = await fetchDisplayPhone(input.phoneNumberId, input.accessToken);
  const accessTokenEnc = encryptSecret(input.accessToken);
  const now = new Date();

  const existingByPhone = await prisma.metaConnection.findUnique({
    where: { phoneNumberId: input.phoneNumberId },
  });
  if (existingByPhone && existingByPhone.merchantId !== merchantId) {
    throw new Error("This WhatsApp number is already linked to another Growlab merchant.");
  }

  return prisma.metaConnection.upsert({
    where: { merchantId },
    create: {
      merchantId,
      wabaId: input.wabaId,
      phoneNumberId: input.phoneNumberId,
      displayPhone,
      accessTokenEnc,
      businessId: input.businessId?.trim() || "",
      pageId: input.pageId?.trim() || "",
      datasetId: "",
      status: "active",
      lastError: "",
      connectedAt: now,
    },
    update: {
      wabaId: input.wabaId,
      phoneNumberId: input.phoneNumberId,
      displayPhone: displayPhone || undefined,
      accessTokenEnc,
      businessId: input.businessId?.trim() || "",
      pageId: input.pageId?.trim() || "",
      status: "active",
      lastError: "",
      connectedAt: now,
    },
  });
}

export function connectionAccessToken(accessTokenEnc: string): string {
  return decryptSecret(accessTokenEnc);
}

export async function sendWhatsAppText(input: {
  phoneNumberId: string;
  accessToken: string;
  toPhone: string;
  body: string;
}): Promise<{ messageId: string }> {
  const to = input.toPhone.replace(/\D/g, "");
  const data = await graphPost<{ messages?: Array<{ id?: string }> }>(
    `/${input.phoneNumberId}/messages`,
    input.accessToken,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: input.body.slice(0, 4000) },
    },
  );
  return { messageId: data.messages?.[0]?.id ?? "" };
}

/** Parse CTWA referral from the first inbound WhatsApp message. */
export function parseCtwaReferral(message: Record<string, unknown>): CtwaReferral | null {
  const referral = message.referral as Record<string, unknown> | undefined;
  if (!referral || typeof referral !== "object") return null;

  const sourceId = String(referral.source_id ?? "");
  const ctwa =
    (referral.ctwa_clid as string | undefined) ||
    (referral.ctwaClid as string | undefined) ||
    "";

  // Meta nests ad context inconsistently; keep the whole object.
  const referralJson = JSON.stringify(referral);

  let metaAdId = sourceId;
  let metaAdsetId = "";
  let metaCampaignId = "";

  const context = referral.context as Record<string, unknown> | undefined;
  const ad = (context?.ad ?? referral.ad) as Record<string, unknown> | undefined;
  if (ad && typeof ad === "object") {
    metaAdId = String(ad.id ?? metaAdId);
    metaAdsetId = String(ad.adset_id ?? ad.adsetId ?? "");
    metaCampaignId = String(ad.campaign_id ?? ad.campaignId ?? "");
  }

  const ctwaClid =
    ctwa ||
    String((ad as { ctwa_clid?: string } | undefined)?.ctwa_clid ?? "") ||
    String(referral.source_url ?? "");

  if (!ctwaClid && !metaAdId && referralJson === "{}") return null;

  return {
    ctwaClid: ctwaClid || metaAdId || "unknown",
    metaAdId,
    metaAdsetId,
    metaCampaignId,
    referralJson,
  };
}

function inboundText(message: Record<string, unknown>): string {
  const type = String(message.type ?? "");
  if (type === "text") {
    const text = message.text as { body?: string } | undefined;
    return text?.body?.trim() || "";
  }
  if (type === "button") {
    const button = message.button as { text?: string; payload?: string } | undefined;
    return button?.text?.trim() || button?.payload?.trim() || "[button]";
  }
  if (type === "interactive") {
    const interactive = message.interactive as Record<string, unknown> | undefined;
    const buttonReply = interactive?.button_reply as { title?: string } | undefined;
    const listReply = interactive?.list_reply as { title?: string } | undefined;
    return buttonReply?.title?.trim() || listReply?.title?.trim() || "[interactive]";
  }
  return type ? `[${type}]` : "";
}

export async function ingestWhatsAppWebhookPayload(body: unknown): Promise<{ processed: number }> {
  const root = body as {
    object?: string;
    entry?: Array<{
      changes?: Array<{
        value?: {
          metadata?: { phone_number_id?: string };
          messages?: Array<Record<string, unknown>>;
          contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
        };
      }>;
    }>;
  };

  if (root.object !== "whatsapp_business_account" || !Array.isArray(root.entry)) {
    return { processed: 0 };
  }

  let processed = 0;

  for (const entry of root.entry) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id?.trim();
      if (!phoneNumberId || !value?.messages?.length) continue;

      const connection = await prisma.metaConnection.findUnique({
        where: { phoneNumberId },
      });
      if (!connection || connection.status !== "active") continue;

      let accessToken: string;
      try {
        accessToken = connectionAccessToken(connection.accessTokenEnc);
      } catch {
        await prisma.metaConnection.update({
          where: { id: connection.id },
          data: { status: "error", lastError: "Token decrypt failed" },
        });
        continue;
      }

      for (const message of value.messages) {
        const waMessageId = String(message.id ?? "");
        const from = String(message.from ?? "").replace(/\D/g, "");
        if (!from) continue;

        if (waMessageId) {
          const dup = await prisma.interestLead.findFirst({
            where: { merchantId: connection.merchantId, lastWaMessageId: waMessageId },
            select: { id: true },
          });
          if (dup) continue;
        }

        const preview = inboundText(message).slice(0, 280);
        const referral = parseCtwaReferral(message);
        const now = new Date();
        const yes = isYesIntent(preview);

        const existing = await prisma.interestLead.findUnique({
          where: {
            merchantId_phone: { merchantId: connection.merchantId, phone: from },
          },
        });

        const isFirstTouch = !existing;
        const shouldAutoReply =
          connection.autoReplyEnabled &&
          Boolean(connection.autoReplyText.trim()) &&
          (isFirstTouch || existing?.status === "new");

        let nextStatus =
          !existing || existing.status === "new" || existing.status === "rejected"
            ? "chatting"
            : existing.status;
        if (yes && nextStatus !== "ordered" && nextStatus !== "collected" && nextStatus !== "rejected") {
          nextStatus = "interested";
        }

        const scheduleFollowUp =
          isFirstTouch ||
          (existing &&
            existing.followUpStep < 3 &&
            (existing.status === "chatting" || existing.status === "interested" || existing.status === "new"));

        const lead = await prisma.interestLead.upsert({
          where: {
            merchantId_phone: { merchantId: connection.merchantId, phone: from },
          },
          create: {
            merchantId: connection.merchantId,
            phone: from,
            status: yes ? "interested" : "chatting",
            lastMessagePreview: preview,
            lastInboundAt: now,
            lastWaMessageId: waMessageId,
            ctwaClid: referral?.ctwaClid ?? null,
            metaAdId: referral?.metaAdId ?? "",
            metaAdsetId: referral?.metaAdsetId ?? "",
            metaCampaignId: referral?.metaCampaignId ?? "",
            referralJson: referral?.referralJson ?? "{}",
            followUpStep: 0,
            nextFollowUpAt: scheduleFirstFollowUp(now),
            consentMarketing: yes,
          },
          update: {
            status: nextStatus,
            lastMessagePreview: preview || existing?.lastMessagePreview || "",
            lastInboundAt: now,
            lastWaMessageId: waMessageId || existing?.lastWaMessageId || "",
            ...(yes ? { consentMarketing: true } : {}),
            // Reset recovery clock when they reply (still open) — nudge again in 1h if needed.
            ...(scheduleFollowUp &&
            existing &&
            existing.status !== "ordered" &&
            existing.status !== "collected" &&
            existing.status !== "rejected"
              ? {
                  nextFollowUpAt:
                    existing.followUpStep >= 3 ? existing.nextFollowUpAt : scheduleFirstFollowUp(now),
                }
              : {}),
            // Only fill CTWA fields once — Meta sends referral on first message only.
            ...(referral && !existing?.ctwaClid
              ? {
                  ctwaClid: referral.ctwaClid,
                  metaAdId: referral.metaAdId,
                  metaAdsetId: referral.metaAdsetId,
                  metaCampaignId: referral.metaCampaignId,
                  referralJson: referral.referralJson,
                }
              : {}),
          },
        });

        if (shouldAutoReply) {
          try {
            await sendWhatsAppText({
              phoneNumberId: connection.phoneNumberId,
              accessToken,
              toPhone: from,
              body: connection.autoReplyText.trim(),
            });
            await prisma.interestLead.update({
              where: { id: lead.id },
              data: { lastOutboundAt: new Date() },
            });
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Auto-reply failed";
            await prisma.metaConnection.update({
              where: { id: connection.id },
              data: { lastError: msg.slice(0, 500) },
            });
          }
        }

        // CTWA CAPI Lead — fire once when we have a real click id.
        if (lead.ctwaClid && !lead.capiLeadAt) {
          void fireLeadSubmittedForLead(lead.id);
        }

        if (yes) {
          // Stop further recovery once they confirm interest (merchant takes over / COD flow).
          await stopLeadRecovery(lead.id, "interested");
        }

        processed += 1;
      }
    }
  }

  return { processed };
}
