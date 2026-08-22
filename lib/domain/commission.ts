import type { CommissionType, SettlementChannel } from "@/lib/domain/enums";

/**
 * Platform defaults for a self-service deal — a creator adding a product to
 * their own storefront (or applying to a campaign from the feed) without a
 * merchant negotiating custom terms first.
 */
export const DEFAULT_SELF_SERVICE_COMMISSION_PCT = 0.15;
export const DEFAULT_SELF_SERVICE_DISCOUNT_CAP_PCT = 0.1;

/** Growlab take on collected GMV. Charged only after cash is confirmed. */
export const PLATFORM_FEE_PCT = 0.06;

/** Card/online gateway cut. COD cash never hits a gateway — use 0. */
export const CARD_PAYMENT_FEE_PCT = 0.025;
/** @deprecated Use CARD_PAYMENT_FEE_PCT. Kept so older imports still type-check. */
export const PAYMENT_FEE_PCT = CARD_PAYMENT_FEE_PCT;

/** Standard quick-picks. 25% is unlocked only when gross margin ≥ 50%. */
export const COMMISSION_QUICK_PICKS = [0.1, 0.15, 0.2] as const;
export const HIGH_MARGIN_COMMISSION_PCT = 0.25;
export const HIGH_MARGIN_GROSS_PCT = 0.5;
export const MAX_STANDARD_COMMISSION_PCT = 0.2;

export const DEFAULT_SETTLEMENT_CHANNEL: SettlementChannel = "cod";

export function paymentFeePctFor(channel: SettlementChannel | string = DEFAULT_SETTLEMENT_CHANNEL): number {
  return channel === "card" ? CARD_PAYMENT_FEE_PCT : 0;
}

export interface CommissionTerms {
  commissionType: CommissionType | string;
  commissionValue: number;
}

export interface SimpleSplitInput extends CommissionTerms {
  retailPrice: number;
  costPrice?: number;
  settlementChannel?: SettlementChannel | string;
}

export interface SimpleSplitResult {
  marketerCommission: number;
  platformFee: number;
  paymentFee: number;
  merchantNet: number;
  merchantNetAfterCogs: number;
  settlementChannel: SettlementChannel | string;
}

/**
 * Sale split on collected cash:
 * retail − marketerCommission − platformFee − paymentFee(card only) = merchantNet
 * merchantNet − costPrice = merchantNetAfterCogs (must be ≥ 0 to publish)
 */
export function computeSimpleSplit({
  retailPrice,
  commissionType,
  commissionValue,
  costPrice = 0,
  settlementChannel = DEFAULT_SETTLEMENT_CHANNEL,
}: SimpleSplitInput): SimpleSplitResult {
  const marketerCommission =
    commissionType === "fixed" ? Math.min(commissionValue, retailPrice) : retailPrice * commissionValue;
  const platformFee = retailPrice * PLATFORM_FEE_PCT;
  const paymentFee = retailPrice * paymentFeePctFor(settlementChannel);
  const merchantNet = retailPrice - marketerCommission - platformFee - paymentFee;
  const merchantNetAfterCogs = merchantNet - Math.max(0, costPrice);

  return {
    marketerCommission: round2(marketerCommission),
    platformFee: round2(platformFee),
    paymentFee: round2(paymentFee),
    merchantNet: round2(merchantNet),
    merchantNetAfterCogs: round2(merchantNetAfterCogs),
    settlementChannel,
  };
}

export function isHighMarginProduct(retailPrice: number, costPrice: number): boolean {
  if (retailPrice <= 0) return false;
  return (retailPrice - Math.max(0, costPrice)) / retailPrice >= HIGH_MARGIN_GROSS_PCT;
}

export function maxCommissionPctFor(retailPrice: number, costPrice: number): number {
  return isHighMarginProduct(retailPrice, costPrice) ? HIGH_MARGIN_COMMISSION_PCT : MAX_STANDARD_COMMISSION_PCT;
}

export function assertPublishableProduct(input: SimpleSplitInput): SimpleSplitResult {
  const split = computeSimpleSplit(input);
  if (input.retailPrice <= 0) {
    throw new Error("يجب أن يكون سعر البيع أكبر من صفر.");
  }
  if (split.merchantNet <= 0) {
    throw new Error("العمولة ورسوم المنصة تلتهم سعر البيع. خفّض العمولة أو ارفع السعر.");
  }
  if ((input.costPrice ?? 0) > 0 && split.merchantNetAfterCogs < 0) {
    throw new Error("هامشك بعد التكلفة والعمولة و6٪ للمنصة سالب. لا يُنشر المنتج حتى يصبح ربحك موجباً.");
  }
  if (input.commissionType !== "fixed") {
    const maxPct = maxCommissionPctFor(input.retailPrice, input.costPrice ?? 0);
    if (input.commissionValue > maxPct + 1e-9) {
      throw new Error(
        maxPct < HIGH_MARGIN_COMMISSION_PCT
          ? "العمولة فوق 20٪ للمنتجات ذات الهامش العادي. ارفع الهامش الإجمالي فوق 50٪ لتصل إلى 25٪."
          : "لا تتجاوز العمولة 25٪."
      );
    }
  }
  return split;
}

/**
 * Normalizes the merchant's commission into the fraction stored on CreatorDeal.lockedCommissionPct.
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
