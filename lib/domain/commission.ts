import type { CommissionType } from "@/lib/domain/enums";

/**
 * Platform defaults for a self-service deal — a creator adding a product to
 * their own storefront (or applying to a campaign from the feed) without a
 * merchant negotiating custom terms first. Kept as the fallback used only
 * where a product predates per-product commission (see commissionToPoolSharePct).
 */
export const DEFAULT_SELF_SERVICE_COMMISSION_PCT = 0.25;
export const DEFAULT_SELF_SERVICE_DISCOUNT_CAP_PCT = 0.1;

/** Flat platform cut shown in the simple, pre-sale estimate (see computeSimpleSplit).
 * Within the 5-10% range requested — the *real* platform take on an actual
 * order is whatever lib/ledger/waterfall.ts#platformShare works out to. */
export const PLATFORM_FEE_PCT = 0.07;

/** Quick-pick commission percentages offered in the merchant product form. */
export const COMMISSION_QUICK_PICKS = [0.15, 0.2, 0.25] as const;

export interface CommissionTerms {
  commissionType: CommissionType | string;
  commissionValue: number;
}

export interface SimpleSplitInput extends CommissionTerms {
  retailPrice: number;
}

export interface SimpleSplitResult {
  marketerCommission: number;
  platformFee: number;
  merchantNet: number;
}

/**
 * The simple, deterministic estimate requested alongside the detailed
 * waterfall ledger: retailPrice - marketerCommission - platformFee = merchantNet.
 * This is a pre-sale preview only — the actual per-order payout still runs
 * through lib/ledger/waterfall.ts#computeWaterfall (returns reserve, payment
 * fee, ad spend, tier floor, holdback). Never conflate the two in the UI:
 * always label this one "estimated".
 */
export function computeSimpleSplit({ retailPrice, commissionType, commissionValue }: SimpleSplitInput): SimpleSplitResult {
  const marketerCommission =
    commissionType === "fixed" ? Math.min(commissionValue, retailPrice) : retailPrice * commissionValue;
  const platformFee = retailPrice * PLATFORM_FEE_PCT;
  const merchantNet = retailPrice - marketerCommission - platformFee;

  return {
    marketerCommission: round2(marketerCommission),
    platformFee: round2(platformFee),
    merchantNet: round2(merchantNet),
  };
}

/**
 * Normalizes whichever commission type a merchant chose into the
 * fraction-of-retail-price that becomes CreatorDeal.lockedCommissionPct —
 * the same field the waterfall engine already consumes as the creator's
 * share weight of the contribution pool (see lib/ledger/waterfall.ts
 * `creatorPoolSharePct`). This is an approximation for "fixed" commissions
 * (there is no literal per-order GMV-based commission concept in the
 * waterfall) but keeps a single, well-understood knob instead of
 * restructuring the ledger engine itself.
 */
export function commissionToPoolSharePct(product: { basePrice: number } & CommissionTerms): number {
  if (product.commissionType === "fixed") {
    if (product.basePrice <= 0) return DEFAULT_SELF_SERVICE_COMMISSION_PCT;
    return Math.max(0, Math.min(1, product.commissionValue / product.basePrice));
  }
  return product.commissionValue || DEFAULT_SELF_SERVICE_COMMISSION_PCT;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
