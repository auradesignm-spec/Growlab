import type { NormalizedCompetitorResult, NormalizedAdResult } from "./providers/types";
import type { CompetitorTier } from "./types";

export interface ComputedScores {
  relevanceScore: number;   // 0 - 100
  activityScore: number;    // 0 - 100
  creativeScore: number;    // 0 - 100
  offerScore: number;       // 0 - 100
  threatScore: number;      // 0 - 100
  confidenceScore: number;  // 0 - 100
  tier: CompetitorTier;
}

/**
 * Deterministic Scoring Engine (0-100 range)
 * Strictly mathematical without AI hallucination.
 */
export function calculateCompetitorScores(
  keyword: string,
  competitor: NormalizedCompetitorResult
): ComputedScores {
  const kw = keyword.toLowerCase().trim();
  const name = competitor.name.toLowerCase();

  // 1. Relevance Score (0-100)
  let relevance = 50;
  if (name.includes(kw)) {
    relevance += 35;
  } else {
    const kwTokens = kw.split(/\s+/);
    const matchedTokens = kwTokens.filter((t) => name.includes(t) || competitor.primaryOffer.toLowerCase().includes(t));
    relevance += (matchedTokens.length / Math.max(1, kwTokens.length)) * 30;
  }
  if (competitor.ads.some((a) => a.headline.toLowerCase().includes(kw) || a.bodyCopy.toLowerCase().includes(kw))) {
    relevance += 15;
  }
  const relevanceScore = Math.min(100, Math.max(20, Math.round(relevance)));

  // 2. Activity Score (0-100)
  // Based on active ads count and longevity (days active)
  let activity = 30;
  const totalAds = competitor.activeAdsCount || competitor.ads.length;
  activity += Math.min(35, totalAds * 6);

  const maxDays = competitor.ads.reduce((max, ad) => Math.max(max, ad.daysActive || 0), 0);
  if (maxDays >= 30) activity += 25;
  else if (maxDays >= 14) activity += 15;
  else if (maxDays >= 7) activity += 8;

  const activityScore = Math.min(100, Math.max(15, Math.round(activity)));

  // 3. Creative Score (0-100)
  // Based on video formats, UGC presence, multiple hook variations
  let creative = 40;
  const hasVideo = competitor.ads.some((a) => a.format === "video");
  const hasCarousel = competitor.ads.some((a) => a.format === "carousel");
  if (hasVideo) creative += 25;
  if (hasCarousel) creative += 10;
  if (competitor.ads.length >= 3) creative += 15;
  if (competitor.ads.some((a) => a.spendVelocity === "high")) creative += 10;

  const creativeScore = Math.min(100, Math.max(20, Math.round(creative)));

  // 4. Offer Score (0-100)
  // Based on explicit discount, bundle, free shipping, guarantee
  let offer = 45;
  const offerText = (competitor.primaryOffer + " " + competitor.shippingOffer + " " + competitor.guaranteeOffer).toLowerCase();
  if (offerText.includes("مجاني") || offerText.includes("free")) offer += 18;
  if (offerText.includes("خصم") || offerText.includes("%") || offerText.includes("off")) offer += 15;
  if (offerText.includes("هدية") || offerText.includes("gift") || offerText.includes("عينة")) offer += 12;
  if (offerText.includes("ضمان") || offerText.includes("guarantee")) offer += 10;

  const offerScore = Math.min(100, Math.max(25, Math.round(offer)));

  // 5. Threat Score (0-100)
  // Weighted composite: Relevance (30%) + Activity (30%) + Creative (20%) + Offer (20%)
  const threatRaw = (relevanceScore * 0.30) + (activityScore * 0.30) + (creativeScore * 0.20) + (offerScore * 0.20);
  const threatScore = Math.min(100, Math.max(10, Math.round(threatRaw)));

  // 6. Confidence Score (0-100)
  let confidence = competitor.confidence || 80;
  if (competitor.ads.length >= 2) confidence += 8;
  if (competitor.domain) confidence += 7;
  const confidenceScore = Math.min(98, Math.max(50, Math.round(confidence)));

  // 7. Tier Classification
  let tier: CompetitorTier = "weak";
  if (threatScore >= 75 && relevanceScore >= 70) {
    tier = "direct";
  } else if (threatScore >= 50 || relevanceScore >= 55) {
    tier = "potential";
  }

  return {
    relevanceScore,
    activityScore,
    creativeScore,
    offerScore,
    threatScore,
    confidenceScore,
    tier,
  };
}
