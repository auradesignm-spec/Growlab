import { prisma } from "@/lib/db";
import { productTags } from "@/lib/catalog-db";
import { suggestProductsForCreator } from "@/lib/matching/suggest";
import { computeSimpleSplit } from "@/lib/domain/commission";

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
  suggestionScore: number | null;
  suggestionReasons: string[];
  sampleStatus: string | null;
  mediaAssets: BrowseMediaAsset[];
}

export interface CreatorBrowseData {
  suggested: BrowseProductRow[];
  others: BrowseProductRow[];
  categories: string[];
}

/**
 * Products a creator can self-service add to their storefront (see
 * app/(dashboard)/dashboard/campaign-actions.ts#applyToCampaign) — either by
 * reusing the merchant's media kit or requesting a physical sample (see
 * sample-actions.ts#requestSample). Excludes products the creator already
 * has an active deal on.
 */
export async function loadCreatorBrowseData(creatorId: string): Promise<CreatorBrowseData> {
  const [suggestions, dealtRows, sampleRequests, eligibleProducts] = await Promise.all([
    suggestProductsForCreator(creatorId),
    prisma.creatorDeal.findMany({ where: { creatorId, status: "active" }, select: { productId: true } }),
    prisma.sampleRequest.findMany({ where: { creatorId } }),
    prisma.product.findMany({
      where: { active: true, merchant: { verificationStatus: "verified", user: { accountStatus: "active" } } },
      include: { merchant: true, mediaAssets: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const dealtProductIds = new Set(dealtRows.map((r) => r.productId));
  const sampleStatusByProductId = new Map(sampleRequests.map((s) => [s.productId, s.status]));
  const suggestionByProductId = new Map(suggestions.map((s) => [s.productId, s]));

  const eligible = eligibleProducts.filter((p) => !dealtProductIds.has(p.id));

  const toRow = (p: (typeof eligible)[number]): BrowseProductRow => {
    const suggestion = suggestionByProductId.get(p.id);
    const split = computeSimpleSplit({
      retailPrice: p.basePrice,
      commissionType: p.commissionType,
      commissionValue: p.commissionValue,
    });
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
      suggestionScore: suggestion?.score ?? null,
      suggestionReasons: suggestion?.reasons ?? [],
      sampleStatus: sampleStatusByProductId.get(p.id) ?? null,
      mediaAssets: p.mediaAssets.map((a) => ({ id: a.id, type: a.type, url: a.url, caption: a.caption })),
    };
  };

  const suggested = eligible
    .filter((p) => suggestionByProductId.has(p.id))
    .map(toRow)
    .sort((a, b) => (b.suggestionScore ?? 0) - (a.suggestionScore ?? 0));
  const others = eligible.filter((p) => !suggestionByProductId.has(p.id)).map(toRow);

  const categories = [...new Set(eligible.map((p) => p.category))].sort((a, b) => a.localeCompare(b));

  return { suggested, others, categories };
}
