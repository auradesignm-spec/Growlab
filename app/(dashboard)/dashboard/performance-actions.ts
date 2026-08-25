"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_PERFORMANCE_RATES } from "@/lib/domain/performance";
import { getWalletSnapshot } from "@/lib/ledger/wallet";
import {
  BUDGET_CAP_LIMIT_AR,
  CAMPAIGN_LIMIT_AR,
  maxBudgetCap,
  planLimits,
} from "@/lib/billing/entitlements";

const MIN_WALLET_TO_ACTIVATE = 5;

export interface PerformanceCampaignDraft {
  productId: string;
  budgetCap: number;
  purchasePctSharer: number;
  purchasePctOrigin: number;
  viewCpmOrigin: number;
  ugcBrief: string;
}

function assertMerchantProfile() {
  return getCurrentUser().then((viewer) => {
    if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
      throw new Error("Only a merchant can manage campaigns.");
    }
    if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
    return viewer.merchantProfile;
  });
}

export async function savePerformanceCampaign(input: PerformanceCampaignDraft) {
  const merchant = await assertMerchantProfile();
  const product = await prisma.product.findFirst({
    where: { id: input.productId, merchantId: merchant.id, active: true },
  });
  if (!product) throw new Error("Product not found.");

  const budgetCap = Math.max(0, Math.round(Number(input.budgetCap) * 100) / 100);
  if (budgetCap < 10) throw new Error("Budget cap must be at least 10 OMR.");
  const capMax = maxBudgetCap(merchant);
  if (budgetCap > capMax) throw new Error(BUDGET_CAP_LIMIT_AR);

  const data = {
    merchantId: merchant.id,
    budgetCap,
    // Visits never pay — force zero even if old UI posted rates.
    visitRateSharer: 0,
    visitRateOrigin: 0,
    visitRateClipper: 0,
    purchasePctSharer: Math.max(0, Number(input.purchasePctSharer) || DEFAULT_PERFORMANCE_RATES.purchasePctSharer),
    purchasePctOrigin: Math.max(0, Number(input.purchasePctOrigin) || DEFAULT_PERFORMANCE_RATES.purchasePctOrigin),
    purchasePctClipper: DEFAULT_PERFORMANCE_RATES.purchasePctClipper,
    viewCpmOrigin: Math.max(0, Number(input.viewCpmOrigin) || DEFAULT_PERFORMANCE_RATES.viewCpmOrigin),
    viewCpmClipper: 0,
    ugcBrief: input.ugcBrief.trim().slice(0, 2000),
  };

  await prisma.performanceCampaign.upsert({
    where: { productId: product.id },
    create: { productId: product.id, status: "draft", ...data },
    update: {
      budgetCap: data.budgetCap,
      visitRateSharer: 0,
      visitRateOrigin: 0,
      visitRateClipper: 0,
      purchasePctSharer: data.purchasePctSharer,
      purchasePctOrigin: data.purchasePctOrigin,
      viewCpmOrigin: data.viewCpmOrigin,
      ugcBrief: data.ugcBrief,
    },
  });

  revalidatePath("/dashboard");
}

export async function setPerformanceCampaignStatus(productId: string, status: "active" | "paused" | "ended") {
  const merchant = await assertMerchantProfile();
  if (merchant.verificationStatus !== "verified") {
    throw new Error("Your business must be verified before activating a campaign.");
  }

  const campaign = await prisma.performanceCampaign.findFirst({
    where: { productId, merchantId: merchant.id },
  });
  if (!campaign) throw new Error("Campaign not found.");

  if (status === "active") {
    const wallet = await getWalletSnapshot(merchant.id);
    if (wallet.available < MIN_WALLET_TO_ACTIVATE) {
      throw new Error("Top up your wallet before activating a campaign.");
    }
    if (campaign.budgetCap <= campaign.budgetSpent) {
      throw new Error("Raise the budget cap — current spend already reached the limit.");
    }
    const limits = planLimits(merchant);
    if (Number.isFinite(limits.maxActiveCampaigns)) {
      const activeCount = await prisma.performanceCampaign.count({
        where: { merchantId: merchant.id, status: "active", NOT: { id: campaign.id } },
      });
      if (activeCount >= limits.maxActiveCampaigns) {
        throw new Error(CAMPAIGN_LIMIT_AR);
      }
    }
  }

  await prisma.performanceCampaign.update({
    where: { id: campaign.id },
    data: { status },
  });

  revalidatePath("/dashboard");
}

export async function loadMerchantCampaigns(merchantId: string) {
  const rows = await prisma.performanceCampaign.findMany({
    where: { merchantId },
    include: { product: { select: { id: true, title: true, active: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    productId: row.productId,
    productTitle: row.product.title,
    productActive: row.product.active,
    status: row.status,
    budgetCap: row.budgetCap,
    budgetSpent: row.budgetSpent,
    currency: row.currency,
    visitRateSharer: row.visitRateSharer,
    visitRateOrigin: row.visitRateOrigin,
    purchasePctSharer: row.purchasePctSharer,
    purchasePctOrigin: row.purchasePctOrigin,
    viewCpmOrigin: row.viewCpmOrigin,
    ugcBrief: row.ugcBrief,
  }));
}
