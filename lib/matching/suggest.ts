import { prisma } from "@/lib/db";
import { parseList } from "@/lib/catalog-db";

/**
 * Lightweight matching signal — HEURISTIC, NOT AI/ML.
 *
 * For a given creator, scores candidate products (from verified merchants,
 * not already in a deal with this creator) by:
 *   - category overlap with the creator's existing deal products (+3)
 *   - tag overlap with the creator's existing deal products (+1 per tag)
 *   - "proven converter" bonus: the candidate product already converted well
 *     (net attributed sales) for other creators who share this creator's tier
 *     or share a tag with this creator's existing products (+ scaled bonus)
 *
 * This is a plain scored query over local data — no model, no training, no
 * external service. Label it as heuristic everywhere it surfaces in the UI.
 */

export interface MatchSuggestion {
  productId: string;
  title: string;
  category: string;
  tags: string[];
  basePrice: number;
  currency: string;
  merchantBusinessName: string;
  score: number;
  reasons: string[];
}

const CATEGORY_MATCH_SCORE = 3;
const TAG_MATCH_SCORE = 1;
const PROVEN_CONVERTER_MAX_BONUS = 4;
const MAX_SUGGESTIONS = 6;

export async function suggestProductsForCreator(creatorId: string): Promise<MatchSuggestion[]> {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorId },
    include: {
      deals: { include: { product: true } },
    },
  });
  if (!creator) return [];

  const dealtProductIds = new Set(creator.deals.map((d) => d.productId));
  const interestCategories = new Set(creator.deals.map((d) => d.product.category));
  const interestTags = new Set(creator.deals.flatMap((d) => parseList(d.product.tags)));

  const candidates = await prisma.product.findMany({
    where: {
      active: true,
      merchant: { verificationStatus: "verified" },
      id: { notIn: Array.from(dealtProductIds) },
    },
    include: { merchant: true },
  });

  if (candidates.length === 0) return [];

  // "Proven converter" signal: for every product, sum net attributed sales
  // across deals held by creators in this creator's tier OR who share at
  // least one tag with this creator's own product interests.
  const allDeals = await prisma.creatorDeal.findMany({
    include: {
      product: true,
      creator: true,
      orders: { include: { ledgerEntry: true } },
    },
  });

  const convertedNetSalesByProductId = new Map<string, number>();
  for (const deal of allDeals) {
    const dealCreatorTags = new Set(
      allDeals
        .filter((d) => d.creatorId === deal.creatorId)
        .flatMap((d) => parseList(d.product.tags))
    );
    const sharesTier = deal.creator.tier === creator.tier;
    const sharesTag = [...dealCreatorTags].some((tag) => interestTags.has(tag));
    if (!sharesTier && !sharesTag) continue;

    const netSales = deal.orders.reduce(
      (sum, order) => sum + (order.ledgerEntry?.netAttributedSales ?? 0),
      0
    );
    convertedNetSalesByProductId.set(
      deal.productId,
      (convertedNetSalesByProductId.get(deal.productId) ?? 0) + netSales
    );
  }

  const maxConvertedNetSales = Math.max(1, ...convertedNetSalesByProductId.values());

  const suggestions: MatchSuggestion[] = candidates.map((product) => {
    const productTags = parseList(product.tags);
    const reasons: string[] = [];
    let score = 0;

    if (interestCategories.has(product.category)) {
      score += CATEGORY_MATCH_SCORE;
      reasons.push(`Same category as your active deals: ${product.category}`);
    }

    const sharedTags = productTags.filter((tag) => interestTags.has(tag));
    if (sharedTags.length > 0) {
      score += sharedTags.length * TAG_MATCH_SCORE;
      reasons.push(`Shared tags: ${sharedTags.join(", ")}`);
    }

    const convertedNetSales = convertedNetSalesByProductId.get(product.id) ?? 0;
    if (convertedNetSales > 0) {
      const bonus = (convertedNetSales / maxConvertedNetSales) * PROVEN_CONVERTER_MAX_BONUS;
      score += bonus;
      reasons.push(`Converts well for creators in your tier or interest area`);
    }

    return {
      productId: product.id,
      title: product.title,
      category: product.category,
      tags: productTags,
      basePrice: product.basePrice,
      currency: product.currency,
      merchantBusinessName: product.merchant.businessName,
      score: Math.round(score * 10) / 10,
      reasons,
    };
  });

  return suggestions
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS);
}

export interface CreatorMatchSuggestion {
  creatorId: string;
  username: string;
  tier: string;
  score: number;
  reasons: string[];
}

/**
 * Reverse direction of the same heuristic: for one of the merchant's products
 * that has no active deal yet, suggest which creators are the best fit —
 * scored by the creator's existing category/tag interests, boosted if their
 * tier has a strong conversion history on similar products. Still a plain
 * scored query, not AI/ML.
 */
export async function suggestCreatorsForProduct(productId: string): Promise<CreatorMatchSuggestion[]> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return [];

  const productTags = new Set(parseList(product.tags));

  const creators = await prisma.creatorProfile.findMany({
    include: { deals: { include: { product: true, orders: { include: { ledgerEntry: true } } } } },
  });

  const suggestions: CreatorMatchSuggestion[] = creators
    .filter((creator) => !creator.deals.some((d) => d.productId === productId))
    .map((creator) => {
      const creatorCategories = new Set(creator.deals.map((d) => d.product.category));
      const creatorTags = new Set(creator.deals.flatMap((d) => parseList(d.product.tags)));
      const reasons: string[] = [];
      let score = 0;

      if (creatorCategories.has(product.category)) {
        score += CATEGORY_MATCH_SCORE;
        reasons.push(`Already active in ${product.category}`);
      }

      const sharedTags = [...creatorTags].filter((tag) => productTags.has(tag));
      if (sharedTags.length > 0) {
        score += sharedTags.length * TAG_MATCH_SCORE;
        reasons.push(`Shared tags: ${sharedTags.join(", ")}`);
      }

      const netSales = creator.deals.reduce(
        (sum, deal) =>
          sum + deal.orders.reduce((s, o) => s + (o.ledgerEntry?.netAttributedSales ?? 0), 0),
        0
      );
      if (netSales > 0) {
        reasons.push(`Proven seller — net sales to date`);
        score += Math.min(PROVEN_CONVERTER_MAX_BONUS, netSales / 200);
      }

      return {
        creatorId: creator.id,
        username: creator.username,
        tier: creator.tier,
        score: Math.round(score * 10) / 10,
        reasons,
      };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS);

  return suggestions;
}
