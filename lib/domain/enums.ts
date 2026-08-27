/**
 * String-union "enums" for fields stored as plain SQLite text columns
 * (Prisma's SQLite connector has no native enum support). This is the single
 * source of truth for allowed values — do not hardcode these strings elsewhere.
 */

export const USER_ROLES = ["merchant", "creator"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** UI party — buyers are guests, not a Clerk User.role. */
export const PLATFORM_PARTIES = ["buyer", "marketer", "merchant", "admin"] as const;
export type PlatformParty = (typeof PLATFORM_PARTIES)[number];

export const VERIFICATION_STATUSES = ["unsubmitted", "pending", "verified", "rejected"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const ACCOUNT_STATUSES = ["active", "suspended", "banned"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const MERCHANT_KYC_KINDS = [
  "commercial_register",
  "owner_id_front",
  "owner_id_back",
  "face_scan",
] as const;
export type MerchantKycKind = (typeof MERCHANT_KYC_KINDS)[number];

export const CREATOR_KYC_KINDS = [
  "national_id_front",
  "national_id_back",
  "face_right",
  "face_left",
  "face_up",
  "face_down",
] as const;
export type CreatorKycKind = (typeof CREATOR_KYC_KINDS)[number];

export const KYC_DOCUMENT_KINDS = [...MERCHANT_KYC_KINDS, ...CREATOR_KYC_KINDS] as const;
export type KycDocumentKind = (typeof KYC_DOCUMENT_KINDS)[number];

export const CREATOR_TIERS = ["NEW", "RISING", "ELITE"] as const;
export type CreatorTierId = (typeof CREATOR_TIERS)[number];

export const DEAL_STATUSES = ["pending", "active", "paused", "ended"] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];

/** Creator storefront vs merchant-owned direct store checkout. */
export const DEAL_CHANNELS = ["creator", "merchant_store"] as const;
export type DealChannel = (typeof DEAL_CHANNELS)[number];

export const ORDER_STATUSES = ["pending", "confirmed", "fulfilled", "returned", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * First-touch creator attribution wins. `platform_agent` (the WhatsApp closing
 * bot) is a cost center that can close a sale but never "steals" attribution
 * from the creator link that first brought the buyer in.
 */
export const ATTRIBUTION_SOURCES = ["creator_link", "platform_agent", "direct"] as const;
export type AttributionSource = (typeof ATTRIBUTION_SOURCES)[number];

/** Ledger escrow. Card uses delivery-hold clock in lib/domain/deliveryHold.ts. */
export const ESCROW_STATUSES = ["held", "released", "refunded"] as const;
export type EscrowStatus = (typeof ESCROW_STATUSES)[number];

/** How the buyer settles. COD is cash on delivery — no gateway fee. */
export const SETTLEMENT_CHANNELS = ["cod", "card"] as const;
export type SettlementChannel = (typeof SETTLEMENT_CHANNELS)[number];

export const WALLET_TXN_TYPES = ["credit", "debit"] as const;
export type WalletTxnType = (typeof WALLET_TXN_TYPES)[number];

export const WALLET_TXN_REASONS = [
  "topup",
  "order_settlement",
  "order_reversal",
  "admin_adjust",
  "performance_spend",
] as const;
export type WalletTxnReason = (typeof WALLET_TXN_REASONS)[number];

export const PAYOUT_TYPES = ["instant", "scheduled"] as const;
export type PayoutTypeId = (typeof PAYOUT_TYPES)[number];

export const PAYOUT_STATUSES = ["requested", "approved", "paid", "rejected"] as const;
export type PayoutStatusId = (typeof PAYOUT_STATUSES)[number];

export const SAMPLE_REQUEST_STATUSES = ["pending", "approved", "rejected", "shipped"] as const;
export type SampleRequestStatus = (typeof SAMPLE_REQUEST_STATUSES)[number];

export const MEDIA_ASSET_TYPES = ["image", "video"] as const;
export type MediaAssetType = (typeof MEDIA_ASSET_TYPES)[number];

/** How a merchant expresses the marketer commission on a product: a
 * percentage of the retail price, or a flat currency amount per sale. */
export const COMMISSION_TYPES = ["pct", "fixed"] as const;
export type CommissionType = (typeof COMMISSION_TYPES)[number];

/** How a creator chose to promote a product: reuse the merchant's ready-made
 * media kit, or request a physical sample to film original UGC. */
export const CAMPAIGN_APPLY_PATHS = ["media_kit", "sample_ugc"] as const;
export type CampaignApplyPath = (typeof CAMPAIGN_APPLY_PATHS)[number];

/**
 * "not_applicable" — media-kit path, no deposit/UGC clock involved.
 * "pending" — deposit held, sample shipped (or not yet), clock running.
 * "submitted" — creator submitted a video, awaiting merchant review.
 * "approved" — merchant approved the UGC, deposit released.
 * "forfeited" — deadline passed with no approved video, deposit kept.
 */
export const UGC_STATUSES = ["not_applicable", "pending", "submitted", "approved", "forfeited"] as const;
export type UgcStatus = (typeof UGC_STATUSES)[number];

/**
 * Performance-distribution loop (share → optional UGC → clip).
 * sharer  — bought, shares link only (no filming required)
 * origin  — approved UGC for the campaign (higher rates + clip bonus)
 * clipper — republishes approved library clips with own link
 */
export const DISTRIBUTOR_ROLES = ["sharer", "origin", "clipper"] as const;
export type DistributorRole = (typeof DISTRIBUTOR_ROLES)[number];

/** Payable performance events. Views are optional / gated until verification exists. */
export const PERFORMANCE_EVENT_TYPES = ["visit", "purchase", "view", "origin_bonus"] as const;
export type PerformanceEventType = (typeof PERFORMANCE_EVENT_TYPES)[number];

export const PERFORMANCE_CAMPAIGN_STATUSES = ["draft", "active", "paused", "ended"] as const;
export type PerformanceCampaignStatus = (typeof PERFORMANCE_CAMPAIGN_STATUSES)[number];

/** Post-purchase share right — buyer can earn before (or without) filming. */
export const SHARE_ENTITLEMENT_STATUSES = ["eligible", "claimed", "expired"] as const;
export type ShareEntitlementStatus = (typeof SHARE_ENTITLEMENT_STATUSES)[number];

/** Approved UGC that enters the clip library. */
export const CONTENT_ASSET_STATUSES = ["pending", "approved", "rejected"] as const;
export type ContentAssetStatus = (typeof CONTENT_ASSET_STATUSES)[number];

export const MERCHANT_PLANS = ["free", "pro"] as const;
export type MerchantPlanId = (typeof MERCHANT_PLANS)[number];

export const MERCHANT_PLAN_SOURCES = ["default", "admin", "stripe"] as const;
export type MerchantPlanSource = (typeof MERCHANT_PLAN_SOURCES)[number];
