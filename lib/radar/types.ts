export type TargetMarket = "OM" | "SA" | "AE" | "KW" | "QA" | "BH" | "ALL";
export type AdPlatform = "meta" | "tiktok" | "snapchat" | "google";
export type CompetitorTier = "direct" | "potential" | "weak";
export type SpendVelocity = "high" | "medium" | "low";
export type WeaknessType = "creative" | "offer" | "trust" | "positioning" | "shipping";
export type ConfidenceLevel = "high" | "medium" | "low";
export type OpportunityType = "white_space" | "unserved_angle" | "offer_gap" | "creative_gap";

export interface CompetitorProjectData {
  id: string;
  userId: string;
  name: string;
  productKeyword: string;
  targetMarket: TargetMarket;
  niche: string;
  platforms: string;
  createdAt: Date;
  updatedAt: Date;
  competitors: CompetitorData[];
  opportunities: MarketOpportunityData[];
}

export interface CompetitorData {
  id: string;
  projectId: string;
  name: string;
  domain?: string | null;
  brandHandle?: string | null;
  logoUrl?: string | null;
  market: TargetMarket;
  threatScore: number;      // 0 - 100
  relevanceScore: number;   // 0 - 100
  activityScore: number;    // 0 - 100
  creativeScore: number;    // 0 - 100
  offerScore: number;       // 0 - 100
  confidenceScore: number;  // 0 - 100
  tier: CompetitorTier;
  activeAdsCount: number;
  platforms: string;
  primaryOffer: string;
  priceRange: string;
  shippingOffer: string;
  guaranteeOffer: string;
  ads: CompetitorAdData[];
  analyses?: CompetitorAnalysisData[];
  weaknesses: CompetitorWeaknessData[];
}

export interface CompetitorAdData {
  id: string;
  competitorId: string;
  platform: AdPlatform;
  adLibraryId?: string | null;
  format: "video" | "image" | "carousel" | "story";
  headline: string;
  bodyCopy: string;
  hook: string;
  painPoint: string;
  promise: string;
  proof: string;
  offer: string;
  cta: string;
  firstSeenAt?: Date | null;
  lastSeenAt?: Date | null;
  daysActive: number;
  isActive: boolean;
  spendVelocity: SpendVelocity;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  sourceUrl?: string | null;
}

export interface CompetitorAnalysisData {
  id: string;
  competitorId: string;
  creativeStrategy: string;
  offerStrategy: string;
  positioning: string;
  strengths: string[];
  counterAngles: string[];
  estimatedVelocity: string;
  aiSummary: string;
}

export interface CompetitorWeaknessData {
  id: string;
  competitorId: string;
  type: WeaknessType;
  title: string;
  description: string;
  evidence: string;
  confidence: ConfidenceLevel;
  exploitationAngle: string;
}

export interface MarketOpportunityData {
  id: string;
  projectId: string;
  type: OpportunityType;
  title: string;
  description: string;
  opportunityScore: number; // 0 - 100
  competitionLevel: "low" | "medium" | "high";
  recommendedDirection: string;
  suggestedHooks: string[];
  suggestedOffers: string[];
}

export interface CounterStrategyBattleplan {
  positioningStrategy: string;
  offerStrategy: string;
  creativeStrategy: string;
  contentStrategy: string;
  landingPageRecommendations: string[];
  top3Actions: Array<{
    title: string;
    description: string;
    why: string;
    confidence: ConfidenceLevel;
    expectedOutcome: string;
    risk: string;
  }>;
  hooks: string[];
  adConcepts: Array<{
    hook: string;
    format: string;
    angle: string;
    cta: string;
  }>;
  offerIdeas: string[];
}
