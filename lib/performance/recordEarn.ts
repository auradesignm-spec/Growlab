import type { Prisma } from "@prisma/client";
import {
  computePerformancePayout,
  DEFAULT_PERFORMANCE_RATES,
  isCampaignSpendable,
  type PerformanceRates,
} from "@/lib/domain/performance";
import type { DistributorRole, PerformanceEventType } from "@/lib/domain/enums";
import {
  qualifyPurchaseEarn,
  qualifyVisitEarn,
  qualifyViewEarn,
} from "@/lib/domain/performanceRules";
import { debitPerformanceSpend, getWalletSnapshot } from "@/lib/ledger/wallet";
import { recordEarnAttribution } from "@/lib/ledger/attribution";

type Db = Prisma.TransactionClient | typeof import("@/lib/db").prisma;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function ratesFromCampaign(campaign: {
  visitRateSharer: number;
  visitRateOrigin: number;
  visitRateClipper: number;
  purchasePctSharer: number;
  purchasePctOrigin: number;
  purchasePctClipper: number;
  viewCpmOrigin: number;
  viewCpmClipper: number;
  originBonusPct: number;
}): PerformanceRates {
  return {
    // Force visit rates to 0 regardless of stored campaign values.
    visitRateSharer: 0,
    visitRateOrigin: 0,
    visitRateClipper: 0,
    purchasePctSharer: campaign.purchasePctSharer,
    purchasePctOrigin: campaign.purchasePctOrigin,
    purchasePctClipper: campaign.purchasePctClipper,
    viewCpmOrigin: campaign.viewCpmOrigin || DEFAULT_PERFORMANCE_RATES.viewCpmOrigin,
    viewCpmClipper: 0,
    originBonusPct: campaign.originBonusPct,
  };
}

async function loadActiveCampaign(productId: string, db: Db) {
  return db.performanceCampaign.findUnique({
    where: { productId },
  });
}

function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s()-]/g, "");
}

export async function recordPerformanceEarn(input: {
  productId: string;
  creatorId: string;
  role: DistributorRole;
  eventType: PerformanceEventType;
  attributedGmv?: number;
  orderId?: string;
  visitId?: string;
  contentAssetId?: string;
  viewCount?: number;
  db: Db;
}): Promise<{ recorded: boolean; amount: number; reason: string }> {
  if (input.eventType === "visit") {
    const gate = qualifyVisitEarn();
    if (gate !== "ok") return { recorded: false, amount: 0, reason: gate };
  }

  const campaign = await loadActiveCampaign(input.productId, input.db);
  if (!campaign) return { recorded: false, amount: 0, reason: "no_campaign" };
  if (!isCampaignSpendable(campaign.status, { budgetCap: campaign.budgetCap, budgetSpent: campaign.budgetSpent })) {
    return { recorded: false, amount: 0, reason: "campaign_inactive" };
  }

  if (input.orderId) {
    const dup = await input.db.performanceEarn.findFirst({
      where: {
        campaignId: campaign.id,
        orderId: input.orderId,
        eventType: input.eventType,
        creatorId: input.creatorId,
      },
      select: { id: true },
    });
    if (dup) return { recorded: false, amount: 0, reason: "duplicate" };
  }

  if (input.visitId) {
    const dup = await input.db.performanceEarn.findFirst({
      where: { campaignId: campaign.id, visitId: input.visitId, creatorId: input.creatorId },
      select: { id: true },
    });
    if (dup) return { recorded: false, amount: 0, reason: "duplicate" };
  }

  const rates = ratesFromCampaign(campaign);
  const payout = computePerformancePayout({
    eventType: input.eventType,
    role: input.role,
    rates,
    attributedGmv: input.attributedGmv,
    viewCount: input.viewCount,
    budget: { budgetCap: campaign.budgetCap, budgetSpent: campaign.budgetSpent },
    viewsEnabled: input.eventType === "view",
  });

  if (payout.amount <= 0) return { recorded: false, amount: 0, reason: payout.reason };

  const wallet = await getWalletSnapshot(campaign.merchantId, input.db);
  if (wallet.available + 1e-9 < payout.amount) {
    return { recorded: false, amount: 0, reason: "wallet_short" };
  }

  const earn = await input.db.performanceEarn.create({
    data: {
      campaignId: campaign.id,
      creatorId: input.creatorId,
      role: input.role,
      eventType: input.eventType,
      amount: payout.amount,
      currency: campaign.currency,
      orderId: input.orderId ?? null,
      visitId: input.visitId ?? null,
      contentAssetId: input.contentAssetId ?? null,
    },
  });

  await debitPerformanceSpend({
    merchantId: campaign.merchantId,
    amount: payout.amount,
    earnId: earn.id,
    note: input.eventType,
    db: input.db,
  });

  if (input.orderId) {
    await recordEarnAttribution({
      orderId: input.orderId,
      creatorId: input.creatorId,
      role: input.role,
      eventType: input.eventType,
      amount: payout.amount,
      currency: campaign.currency,
      db: input.db,
    });
  }

  const spent = round2(campaign.budgetSpent + payout.amount);
  await input.db.performanceCampaign.update({
    where: { id: campaign.id },
    data: {
      budgetSpent: spent,
      ...(spent >= campaign.budgetCap - 1e-9 ? { status: "paused" } : {}),
    },
  });

  return { recorded: true, amount: payout.amount, reason: "ok" };
}

export async function recordPurchasePerformanceForOrder(input: {
  orderId: string;
  productId: string;
  referrerCreatorId: string | null | undefined;
  attributedGmv: number;
  buyerPhone: string;
  db: Db;
}) {
  if (!input.referrerCreatorId) return;

  const referrer = await input.db.creatorProfile.findUnique({
    where: { id: input.referrerCreatorId },
    include: { user: { select: { phone: true } } },
  });
  if (!referrer) return;

  const selfReferral =
    normalizePhone(referrer.user.phone).length >= 8 &&
    normalizePhone(referrer.user.phone) === normalizePhone(input.buyerPhone);

  const gate = qualifyPurchaseEarn({ selfReferral });
  if (gate !== "ok") return;

  await recordPerformanceEarn({
    productId: input.productId,
    creatorId: input.referrerCreatorId,
    role: "sharer",
    eventType: "purchase",
    attributedGmv: input.attributedGmv,
    orderId: input.orderId,
    db: input.db,
  });
}

/** Link visits never pay under strict policy — tracking may still record analytics. */
export async function recordVisitPerformance(_input: {
  productId: string;
  dealId: string | null;
  referrerCreatorId: string;
  visitId: string;
  db: Db;
}) {
  return { recorded: false, amount: 0, reason: qualifyVisitEarn() };
}

/**
 * Merchant-attested incremental views on an approved buyer reel.
 * Creator cannot self-certify views.
 */
export async function recordQualifiedReelViews(input: {
  contentAssetId: string;
  attestedViewCount: number;
  db: Db;
}): Promise<{ recorded: boolean; amount: number; reason: string; payableViews: number }> {
  const asset = await input.db.contentAsset.findUnique({
    where: { id: input.contentAssetId },
  });
  if (!asset) return { recorded: false, amount: 0, reason: "invalid", payableViews: 0 };
  if (asset.status !== "approved") {
    return { recorded: false, amount: 0, reason: "views_require_approved_reel", payableViews: 0 };
  }

  const now = new Date();
  const today = dayKey(now);
  const reportsToday = asset.viewReportDayKey === today ? asset.viewReportsToday : 0;

  const gate = qualifyViewEarn({
    role: "origin",
    contentApproved: asset.status === "approved",
    hasSocialPostUrl: Boolean(asset.socialPostUrl),
    report: {
      lastPaidViewCount: asset.lastPaidViewCount,
      attestedViewCount: input.attestedViewCount,
      lastViewReportAt: asset.lastViewReportAt,
      reportsToday,
      now,
    },
  });

  if (gate.reason !== "ok") {
    return { recorded: false, amount: 0, reason: gate.reason, payableViews: 0 };
  }

  const result = await recordPerformanceEarn({
    productId: asset.productId,
    creatorId: asset.originCreatorId,
    role: "origin",
    eventType: "view",
    viewCount: gate.payableViews,
    contentAssetId: asset.id,
    db: input.db,
  });

  if (result.recorded) {
    await input.db.contentAsset.update({
      where: { id: asset.id },
      data: {
        lastPaidViewCount: input.attestedViewCount,
        lastViewReportAt: now,
        viewReportDayKey: today,
        viewReportsToday: reportsToday + 1,
      },
    });
  }

  return { ...result, payableViews: gate.payableViews };
}

export { DEFAULT_PERFORMANCE_RATES };
