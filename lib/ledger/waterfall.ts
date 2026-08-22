/**
 * The profit waterfall — the single source of truth for how an order's GMV
 * turns into merchant / creator / platform shares.
 *
 * Order of operations (never reordered, in UI or in code):
 *   1. attributedGmv        — GMV actually charged to the buyer
 *   2. returnsReserve       — reserve held back against future returns
 *   3. netAttributedSales   — (1) − (2), the creator-floor base
 *   4. paymentFee           — payment gateway cut
 *   5. cogs                 — locked COGS %, applied to real charged GMV
 *   6. adSpendAllocated     — first-class ledger line, never hidden in "net"
 *   7. contributionPool     — (3) − (4) − (5) − (6)
 *   8. creatorShare         — max(floor, tier-boosted pool share)
 *   9. merchantShare / platformShare — split what's left of the pool
 *  10. holdback             — ~20% of the creator's share held for the return/
 *      fraud window before it becomes available
 *
 * Discount-cap protection: if the actual discount exceeds `discountCapPct`,
 * the creator's floor/pool base is computed on `lockedUnitPrice`, not the
 * discounted price actually charged — the merchant absorbs the discount, the
 * creator's earnings are not punished for a discount decision they didn't make.
 * Fees/COGS/reserve still use the real charged amount because that is real cash.
 *
 * This is a pure function — no I/O, no Prisma. Both prisma/seed.ts and any
 * live order-creation path must call this, never re-implement the math.
 */

export const WATERFALL_DEFAULTS = {
  /** Returns reserve — product decision range is ~7–15%; this is the single default used unless a deal overrides it. */
  returnsReservePct: 0.1,
  /** Card/payment gateway fee. */
  paymentFeePct: 0.029,
  /** Creator floor — ~5% of net attributed sales (post-returns, pre-ad-spend). */
  creatorFloorPct: 0.05,
  /** Creator's base share of the contribution pool before any tier multiplier is applied. */
  creatorPoolSharePct: 0.28,
  /** Of what's left after the creator's share, how much goes to the merchant vs. the platform. */
  merchantSplitPct: 0.62,
  platformSplitPct: 0.38,
  /** Held for a return/fraud window (~21–30 days) before release. */
  holdbackPct: 0.2,
  holdbackDays: 25,
} as const;

export interface WaterfallInput {
  /** Units sold on this order. */
  quantity: number;
  /** Actual per-unit price charged to the buyer (post any discount). */
  unitPriceCharged: number;
  /** Immutable snapshot fields captured at deal creation — never re-read from a live product. */
  lockedUnitPrice: number;
  lockedCommissionPct: number;
  lockedCogsPct: number;
  discountCapPct: number;
  /** Ad spend allocated to this specific order (pro-rata GMV allocation for the day). Defaults to 0. */
  adSpendAllocated?: number;
  /** Tier multiplier applied to the creator's pool-share percentage (1.0 for NEW). */
  tierMultiplier?: number;
  /** Overrides for the shared defaults above — a deal snapshot could carry its own rates later. */
  returnsReservePct?: number;
  paymentFeePct?: number;
  creatorFloorPct?: number;
  merchantSplitPct?: number;
  platformSplitPct?: number;
  holdbackPct?: number;
  holdbackDays?: number;
}

export interface WaterfallResult {
  attributedGmv: number;
  returnsReserve: number;
  netAttributedSales: number;
  paymentFee: number;
  cogs: number;
  adSpendAllocated: number;
  contributionPool: number;
  /** True if the actual discount broke the deal's discountCapPct — the creator's base switched to the locked price. */
  discountCapBreached: boolean;
  creatorFloorAmount: number;
  creatorProfitShare: number;
  creatorShare: number;
  merchantShare: number;
  platformShare: number;
  holdbackAmount: number;
  availableAmount: number;
  holdbackDays: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeWaterfall(input: WaterfallInput): WaterfallResult {
  const d = WATERFALL_DEFAULTS;
  const returnsReservePct = input.returnsReservePct ?? d.returnsReservePct;
  const paymentFeePct = input.paymentFeePct ?? d.paymentFeePct;
  const creatorFloorPct = input.creatorFloorPct ?? d.creatorFloorPct;
  const merchantSplitPct = input.merchantSplitPct ?? d.merchantSplitPct;
  const platformSplitPct = input.platformSplitPct ?? d.platformSplitPct;
  const holdbackPct = input.holdbackPct ?? d.holdbackPct;
  const holdbackDays = input.holdbackDays ?? d.holdbackDays;
  const tierMultiplier = input.tierMultiplier ?? 1;
  const adSpendAllocated = input.adSpendAllocated ?? 0;

  const attributedGmv = input.quantity * input.unitPriceCharged;

  const actualDiscountPct =
    input.lockedUnitPrice > 0
      ? Math.max(0, (input.lockedUnitPrice - input.unitPriceCharged) / input.lockedUnitPrice)
      : 0;
  const discountCapBreached = actualDiscountPct > input.discountCapPct;

  // Real cash flow: returns reserve, fees, and COGS are always computed on what
  // actually changed hands — the locked-price substitution below only protects
  // the creator's own earnings base, never inflates real accounting figures.
  const returnsReserve = attributedGmv * returnsReservePct;
  const netAttributedSales = attributedGmv - returnsReserve;
  const paymentFee = attributedGmv * paymentFeePct;
  const cogs = attributedGmv * input.lockedCogsPct;
  const contributionPool = netAttributedSales - paymentFee - cogs - adSpendAllocated;

  const creatorBaseGmv = discountCapBreached
    ? input.quantity * input.lockedUnitPrice
    : attributedGmv;
  const creatorFloorBase = creatorBaseGmv * (1 - returnsReservePct);
  const creatorFloorAmount = creatorFloorBase * creatorFloorPct;

  const creatorPoolSharePct = (input.lockedCommissionPct || d.creatorPoolSharePct) * tierMultiplier;
  const creatorProfitShare = contributionPool > 0 ? contributionPool * creatorPoolSharePct : 0;

  const creatorShare = Math.max(creatorFloorAmount, creatorProfitShare);
  const remainingPool = contributionPool - creatorShare;
  const merchantShare = remainingPool > 0 ? remainingPool * merchantSplitPct : remainingPool;
  const platformShare = remainingPool > 0 ? remainingPool * platformSplitPct : 0;

  const holdbackAmount = creatorShare > 0 ? creatorShare * holdbackPct : 0;
  const availableAmount = creatorShare - holdbackAmount;

  return {
    attributedGmv: round2(attributedGmv),
    returnsReserve: round2(returnsReserve),
    netAttributedSales: round2(netAttributedSales),
    paymentFee: round2(paymentFee),
    cogs: round2(cogs),
    adSpendAllocated: round2(adSpendAllocated),
    contributionPool: round2(contributionPool),
    discountCapBreached,
    creatorFloorAmount: round2(creatorFloorAmount),
    creatorProfitShare: round2(creatorProfitShare),
    creatorShare: round2(creatorShare),
    merchantShare: round2(merchantShare),
    platformShare: round2(platformShare),
    holdbackAmount: round2(holdbackAmount),
    availableAmount: round2(availableAmount),
    holdbackDays,
  };
}
