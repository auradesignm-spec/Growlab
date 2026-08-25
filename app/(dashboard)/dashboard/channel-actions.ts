"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { metaConfigured, publicMetaClientConfig } from "@/lib/meta/config";

async function requireVerifiedMerchant() {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a verified merchant can manage channels.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new Error("Verify your merchant account before connecting Meta.");
  }
  return viewer.merchantProfile;
}

export type ChannelConnectionView = {
  connected: boolean;
  configured: boolean;
  appId: string;
  configId: string;
  displayPhone: string;
  phoneNumberId: string;
  wabaId: string;
  status: string;
  autoReplyEnabled: boolean;
  autoReplyText: string;
  recoveryEnabled: boolean;
  recoveryText1h: string;
  recoveryText6h: string;
  recoveryText24h: string;
  datasetId: string;
  lastError: string;
  connectedAt: string | null;
};

export type InterestLeadView = {
  id: string;
  phone: string;
  status: string;
  fromAd: boolean;
  ctwaClid: string | null;
  metaAdId: string;
  lastMessagePreview: string;
  lastInboundAt: string | null;
  lastOutboundAt: string | null;
  createdAt: string;
};

export async function loadChannelState(): Promise<{
  connection: ChannelConnectionView;
  leads: InterestLeadView[];
  stats: { total: number; fromAd: number; organic: number };
}> {
  const merchant = await requireVerifiedMerchant();
  const pub = publicMetaClientConfig();
  const connection = await prisma.metaConnection.findUnique({
    where: { merchantId: merchant.id },
  });

  const leads = await prisma.interestLead.findMany({
    where: { merchantId: merchant.id },
    orderBy: [{ lastInboundAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  const fromAd = leads.filter((l) => Boolean(l.ctwaClid)).length;

  return {
    connection: {
      connected: Boolean(connection && connection.status === "active"),
      configured: metaConfigured(),
      appId: pub.appId,
      configId: pub.configId,
      displayPhone: connection?.displayPhone ?? "",
      phoneNumberId: connection?.phoneNumberId ?? "",
      wabaId: connection?.wabaId ?? "",
      status: connection?.status ?? "disconnected",
      autoReplyEnabled: connection?.autoReplyEnabled ?? true,
      autoReplyText:
        connection?.autoReplyText ??
        "حياك في متجرنا. السعر والدفع عند الاستلام. للتأكيد اكتب: نعم",
      recoveryEnabled: connection?.recoveryEnabled ?? true,
      recoveryText1h: connection?.recoveryText1h ?? "هل ما زلت مهتم؟ للطلب اكتب: نعم",
      recoveryText6h:
        connection?.recoveryText6h ?? "باقي كمية محدودة. للدفع عند الاستلام اكتب: نعم",
      recoveryText24h:
        connection?.recoveryText24h ?? "آخر تذكير — نقدر نجهّز طلبك COD. اكتب: نعم",
      datasetId: connection?.datasetId ?? "",
      lastError: connection?.lastError ?? "",
      connectedAt: connection?.connectedAt?.toISOString() ?? null,
    },
    leads: leads.map((l) => ({
      id: l.id,
      phone: l.phone,
      status: l.status,
      fromAd: Boolean(l.ctwaClid),
      ctwaClid: l.ctwaClid,
      metaAdId: l.metaAdId,
      lastMessagePreview: l.lastMessagePreview,
      lastInboundAt: l.lastInboundAt?.toISOString() ?? null,
      lastOutboundAt: l.lastOutboundAt?.toISOString() ?? null,
      createdAt: l.createdAt.toISOString(),
    })),
    stats: {
      total: leads.length,
      fromAd,
      organic: leads.length - fromAd,
    },
  };
}

export async function updateAutoReplySettings(input: {
  enabled: boolean;
  text: string;
}): Promise<{ ok: true }> {
  const merchant = await requireVerifiedMerchant();
  const connection = await prisma.metaConnection.findUnique({
    where: { merchantId: merchant.id },
  });
  if (!connection) throw new Error("Connect WhatsApp first.");

  const text = input.text.trim().slice(0, 1000);
  if (input.enabled && text.length < 3) {
    throw new Error("Auto-reply text is too short.");
  }

  await prisma.metaConnection.update({
    where: { id: connection.id },
    data: {
      autoReplyEnabled: input.enabled,
      autoReplyText: text || connection.autoReplyText,
    },
  });

  revalidatePath("/dashboard/channels");
  return { ok: true };
}

export async function updateRecoverySettings(input: {
  enabled: boolean;
  text1h: string;
  text6h: string;
  text24h: string;
}): Promise<{ ok: true }> {
  const merchant = await requireVerifiedMerchant();
  const connection = await prisma.metaConnection.findUnique({
    where: { merchantId: merchant.id },
  });
  if (!connection) throw new Error("Connect WhatsApp first.");

  await prisma.metaConnection.update({
    where: { id: connection.id },
    data: {
      recoveryEnabled: input.enabled,
      recoveryText1h: input.text1h.trim().slice(0, 1000) || connection.recoveryText1h,
      recoveryText6h: input.text6h.trim().slice(0, 1000) || connection.recoveryText6h,
      recoveryText24h: input.text24h.trim().slice(0, 1000) || connection.recoveryText24h,
    },
  });

  revalidatePath("/dashboard/channels");
  return { ok: true };
}

export async function disconnectMetaConnection(): Promise<{ ok: true }> {
  const merchant = await requireVerifiedMerchant();
  await prisma.metaConnection.updateMany({
    where: { merchantId: merchant.id },
    data: { status: "disconnected", lastError: "" },
  });
  revalidatePath("/dashboard/channels");
  return { ok: true };
}

export async function setInterestLeadStatus(
  leadId: string,
  status: "interested" | "rejected" | "chatting",
): Promise<{ ok: true }> {
  const merchant = await requireVerifiedMerchant();
  const lead = await prisma.interestLead.findFirst({
    where: { id: leadId, merchantId: merchant.id },
  });
  if (!lead) throw new Error("Lead not found.");

  await prisma.interestLead.update({
    where: { id: lead.id },
    data: {
      status,
      ...(status === "rejected"
        ? { nextFollowUpAt: null, followUpStep: 3 }
        : status === "interested"
          ? { nextFollowUpAt: null }
          : {}),
    },
  });
  revalidatePath("/dashboard/channels");
  return { ok: true };
}
