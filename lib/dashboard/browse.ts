import { prisma } from "@/lib/db";
import { productTags } from "@/lib/catalog-db";
import { suggestProductsForCreator } from "@/lib/matching/suggest";
import { computeSimpleSplit } from "@/lib/domain/commission";
import { MAX_MARKETERS_PER_PRODUCT, seatsRemaining } from "@/lib/domain/deals";
import { sampleDepositAmount, samplePolicyForTier, type SamplePolicy } from "@/lib/domain/ugc";

export interface BrowseMediaAsset {
  id: string;
  type: string;
  url: string;
  caption: string | null;
}

export interface BrowseProductRow {
  productId: string;
  title: string;
  category: string;
  tags: string[];
  basePrice: number;
  currency: string;
  // Terms the merchant declared (never costPrice — that stays merchant-only).
  commissionType: string;
  commissionValue: number;
  /** Pre-sale estimate of what this creator earns per unit — see
   * lib/domain/commission.ts#computeSimpleSplit. Not a guarantee: the real,
   * final payout runs through the waterfall ledger after an actual sale. */
  estimatedNetProfit: number;
  merchantBusinessName: string;
  merchantCity: string;
  merchantVerified: boolean;
  suggestionScore: number | null;
  suggestionReasons: string[];
  sampleStatus: string | null;
  mediaAssets: BrowseMediaAsset[];
  weeklyOrders: number;
  seatsRemaining: number;
  maxSeats: number;
  sampleDeposit: number | null;
}

export interface CreatorBrowseData {
  suggested: BrowseProductRow[];
  others: BrowseProductRow[];
  weekly: BrowseProductRow[];
  categories: string[];
  samplePolicy: SamplePolicy;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Products a creator can apply to sell. Excludes products they already have
 * pending or active. Full seats drop off the feed.
 */
export async function loadCreatorBrowseData(creatorId: string): Promise<CreatorBrowseData> {
  const weekAgo = new Date(Date.now() - WEEK_MS);
  const creator = await prisma.creatorProfile.findUnique({ where: { id: creatorId }, select: { tier: true } });
  const samplePolicy = samplePolicyForTier(creator?.tier ?? "NEW");
  const [suggestions, dealtRows, sampleRequests, eligibleProducts, openDeals, weeklyOrders] = await Promise.all([
    suggestProductsForCreator(creatorId),
    prisma.creatorDeal.findMany({
      where: { creatorId, status: { in: ["active", "pending"] } },
      select: { productId: true },
    }),
    prisma.sampleRequest.findMany({ where: { creatorId } }),
    prisma.product.findMany({
      where: { active: true, merchant: { verificationStatus: "verified", user: { accountStatus: "active" } } },
      include: { merchant: true, mediaAssets: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.creatorDeal.groupBy({
      by: ["productId"],
      where: { status: { in: ["pending", "active"] } },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["dealId"],
      where: {
        createdAt: { gte: weekAgo },
        status: { notIn: ["cancelled", "returned"] },
      },
      _count: { _all: true },
    }),
  ]);

  const dealtProductIds = new Set(dealtRows.map((r) => r.productId));
  const sampleStatusByProductId = new Map(sampleRequests.map((s) => [s.productId, s.status]));
  const suggestionByProductId = new Map(suggestions.map((s) => [s.productId, s]));
  const openByProductId = new Map(openDeals.map((row) => [row.productId, row._count._all]));

  const weeklyDealIds = weeklyOrders.map((row) => row.dealId);
  const weeklyDeals =
    weeklyDealIds.length === 0
      ? []
      : await prisma.creatorDeal.findMany({
          where: { id: { in: weeklyDealIds } },
          select: { id: true, productId: true },
        });
  const weeklyByProductId = new Map<string, number>();
  for (const deal of weeklyDeals) {
    const count = weeklyOrders.find((row) => row.dealId === deal.id)?._count._all ?? 0;
    weeklyByProductId.set(deal.productId, (weeklyByProductId.get(deal.productId) ?? 0) + count);
  }

  const eligible = eligibleProducts.filter((p) => {
    if (dealtProductIds.has(p.id)) return false;
    return seatsRemaining(openByProductId.get(p.id) ?? 0) > 0;
  });

  const toRow = (p: (typeof eligible)[number]): BrowseProductRow => {
    const suggestion = suggestionByProductId.get(p.id);
    const split = computeSimpleSplit({
      retailPrice: p.basePrice,
      commissionType: p.commissionType,
      commissionValue: p.commissionValue,
    });
    const openCount = openByProductId.get(p.id) ?? 0;
    return {
      productId: p.id,
      title: p.title,
      category: p.category,
      tags: productTags(p),
      basePrice: p.basePrice,
      currency: p.currency,
      commissionType: p.commissionType,
      commissionValue: p.commissionValue,
      estimatedNetProfit: split.marketerCommission,
      merchantBusinessName: p.merchant.businessName,
      merchantCity: p.merchant.city,
      merchantVerified: p.merchant.verificationStatus === "verified",
      suggestionScore: suggestion?.score ?? null,
      suggestionReasons: suggestion?.reasons ?? [],
      sampleStatus: sampleStatusByProductId.get(p.id) ?? null,
      mediaAssets: p.mediaAssets.map((a) => ({ id: a.id, type: a.type, url: a.url, caption: a.caption })),
      weeklyOrders: weeklyByProductId.get(p.id) ?? 0,
      seatsRemaining: seatsRemaining(openCount),
      maxSeats: MAX_MARKETERS_PER_PRODUCT,
      sampleDeposit: sampleDepositAmount(p.basePrice, creator?.tier ?? "NEW"),
    };
  };

  const suggested = eligible
    .filter((p) => suggestionByProductId.has(p.id))
    .map(toRow)
    .sort((a, b) => (b.suggestionScore ?? 0) - (a.suggestionScore ?? 0));
  const others = eligible.filter((p) => !suggestionByProductId.has(p.id)).map(toRow);
  const weekly = eligible
    .map(toRow)
    .filter((row) => row.weeklyOrders > 0)
    .sort((a, b) => b.weeklyOrders - a.weeklyOrders)
    .slice(0, 6);

  const categories = [...new Set(eligible.map((p) => p.category))].sort((a, b) => a.localeCompare(b));

  return { suggested, others, weekly, categories, samplePolicy };
}
