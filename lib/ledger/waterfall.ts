/**
 * Order split — how collected GMV becomes marketer / merchant / platform shares.
 *
 *   attributedGmv − marketerCommission − platformFee (6%) − paymentFee (card only) = merchantShare
 *
 * COD cash never hits a gateway, so paymentFee is 0 unless settlementChannel is "card".
 * Commission is payable only after the merchant confirms collection (fulfilled).
 *
 * Returns reserve: 10% of the marketer share is held 14 days after collection.
 * A return in that window claws the line back out of payable balances.
 *
 * Discount-cap: if the charged price breaks discountCapPct, commission is
 * computed on the locked unit price; the merchant absorbs the discount.
 */

import { DEFAULT_SETTLEMENT_CHANNEL, PLATFORM_FEE_PCT, paymentFeePctFor } from "@/lib/domain/commission";
import type { SettlementChannel } from "@/lib/domain/enums";

export const WATERFALL_DEFAULTS = {
  paymentFeePct: 0,
  platformFeePct: PLATFORM_FEE_PCT,
  /** Returns reserve on the marketer share. */
  holdbackPct: 0.1,
  holdbackDays: 14,
} as const;

export const RETURNS_RESERVE_PCT = WATERFALL_DEFAULTS.holdbackPct;
export const RETURNS_RESERVE_DAYS = WATERFALL_DEFAULTS.holdbackDays;

export interface WaterfallInput {
  quantity: number;
  unitPriceCharged: number;
  lockedUnitPrice: number;
  lockedCommissionPct: number;
  discountCapPct: number;
  settlementChannel?: SettlementChannel | string;
  paymentFeePct?: number;
  platformFeePct?: number;
  holdbackPct?: number;
  holdbackDays?: number;
}

export interface WaterfallResult {
  attributedGmv: number;
  paymentFee: number;
  creatorShare: number;
  merchantShare: number;
  platformShare: number;
  discountCapBreached: boolean;
  holdbackAmount: number;
  availableAmount: number;
  holdbackDays: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeWaterfall(input: WaterfallInput): WaterfallResult {
  const d = WATERFALL_DEFAULTS;
  const channel = input.settlementChannel ?? DEFAULT_SETTLEMENT_CHANNEL;
  const paymentFeePct = input.paymentFeePct ?? paymentFeePctFor(channel);
  const platformFeePct = input.platformFeePct ?? d.platformFeePct;
  const holdbackPct = input.holdbackPct ?? d.holdbackPct;
  const holdbackDays = input.holdbackDays ?? d.holdbackDays;

  const attributedGmv = input.quantity * input.unitPriceCharged;

  const actualDiscountPct =
    input.lockedUnitPrice > 0
      ? Math.max(0, (input.lockedUnitPrice - input.unitPriceCharged) / input.lockedUnitPrice)
      : 0;
  const discountCapBreached = actualDiscountPct > input.discountCapPct;

  const commissionBase = discountCapBreached
    ? input.quantity * input.lockedUnitPrice
    : attributedGmv;

  const creatorShare = commissionBase * input.lockedCommissionPct;
  const platformShare = attributedGmv * platformFeePct;
  const paymentFee = attributedGmv * paymentFeePct;
  const merchantShare = attributedGmv - creatorShare - platformShare - paymentFee;

  const holdbackAmount = creatorShare > 0 ? creatorShare * holdbackPct : 0;
  const availableAmount = creatorShare - holdbackAmount;

  return {
    attributedGmv: round2(attributedGmv),
    paymentFee: round2(paymentFee),
    creatorShare: round2(creatorShare),
    merchantShare: round2(merchantShare),
    platformShare: round2(platformShare),
    discountCapBreached,
    holdbackAmount: round2(holdbackAmount),
    availableAmount: round2(availableAmount),
    holdbackDays,
  };
}

/** What the merchant wallet must cover when this order is collected. */
export function settlementObligation(shares: { creatorShare: number; platformShare: number }): number {
  return round2(Math.max(0, shares.creatorShare + shares.platformShare));
}
