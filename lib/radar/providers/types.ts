import type { TargetMarket, AdPlatform, SpendVelocity } from "../types";

export type ProviderStatusCode = "ready" | "rate_limited" | "unauthorized" | "mock_dev" | "unavailable";

export interface NormalizedAdResult {
  externalId: string;
  platform: AdPlatform;
  format: "video" | "image" | "carousel" | "story";
  headline: string;
  bodyCopy: string;
  hook: string;
  painPoint: string;
  promise: string;
  proof: string;
  offer: string;
  cta: string;
  firstSeenAt?: Date;
  lastSeenAt?: Date;
  daysActive: number;
  isActive: boolean;
  spendVelocity: SpendVelocity;
  mediaUrl?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
}

export interface NormalizedCompetitorResult {
  name: string;
  domain?: string;
  brandHandle?: string;
  market: TargetMarket;
  platform: AdPlatform;
  activeAdsCount: number;
  primaryOffer: string;
  priceRange: string;
  shippingOffer: string;
  guaranteeOffer: string;
  ads: NormalizedAdResult[];
  confidence: number;
}

export interface ProviderSearchQuery {
  keyword: string;
  market: TargetMarket;
  limit?: number;
}

export interface ProviderSearchResult {
  providerId: string;
  providerName: string;
  status: ProviderStatusCode;
  message?: string;
  competitors: NormalizedCompetitorResult[];
  lastUpdated: Date;
}

export interface CompetitorDataProvider {
  readonly id: string;
  readonly name: string;
  readonly supportedPlatforms: AdPlatform[];
  search(query: ProviderSearchQuery): Promise<ProviderSearchResult>;
  getAdsForCompetitor(competitorName: string, market: TargetMarket): Promise<NormalizedAdResult[]>;
}
