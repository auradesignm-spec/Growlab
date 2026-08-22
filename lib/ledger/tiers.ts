import type { CreatorTierId } from "@/lib/domain/enums";

/**
 * Creator tier thresholds — data, not magic numbers buried in feature code.
 * A creator unlocks a tier once their total net sales meet `minNetSales`
 * AND their return rate stays at or under `maxReturnRatePct`.
 */
export interface TierDefinition {
  readonly id: CreatorTierId;
  readonly minNetSales: number;
  readonly maxReturnRatePct: number;
  /** Multiplies the creator's pool-share percentage in the waterfall. */
  readonly commissionMultiplier: number;
  /** Creators at this tier see new products in the matching feed before lower tiers. */
  readonly earlyAccessDays: number;
}

export const CREATOR_TIER_THRESHOLDS: readonly TierDefinition[] = [
  { id: "NEW", minNetSales: 0, maxReturnRatePct: 1, commissionMultiplier: 1.0, earlyAccessDays: 0 },
  { id: "RISING", minNetSales: 500, maxReturnRatePct: 0.15, commissionMultiplier: 1.15, earlyAccessDays: 2 },
  { id: "ELITE", minNetSales: 2000, maxReturnRatePct: 0.08, commissionMultiplier: 1.35, earlyAccessDays: 5 },
];

export function getTierDefinition(tier: CreatorTierId): TierDefinition {
  return CREATOR_TIER_THRESHOLDS.find((t) => t.id === tier) ?? CREATOR_TIER_THRESHOLDS[0];
}

export function tierMultiplier(tier: CreatorTierId): number {
  return getTierDefinition(tier).commissionMultiplier;
}

/**
 * Resolves the tier a creator qualifies for given lifetime net sales and
 * return rate. Picks the highest tier whose thresholds are all satisfied.
 */
export function resolveTier(totalNetSales: number, returnRatePct: number): CreatorTierId {
  let resolved: CreatorTierId = "NEW";
  for (const def of CREATOR_TIER_THRESHOLDS) {
    if (totalNetSales >= def.minNetSales && returnRatePct <= def.maxReturnRatePct) {
      resolved = def.id;
    }
  }
  return resolved;
}

export interface TierProgress {
  readonly current: TierDefinition;
  readonly next: TierDefinition | null;
  readonly netSalesToNext: number;
  readonly progressPct: number;
}

export function tierProgress(tier: CreatorTierId, totalNetSales: number): TierProgress {
  const currentIndex = CREATOR_TIER_THRESHOLDS.findIndex((t) => t.id === tier);
  const current = CREATOR_TIER_THRESHOLDS[currentIndex] ?? CREATOR_TIER_THRESHOLDS[0];
  const next = CREATOR_TIER_THRESHOLDS[currentIndex + 1] ?? null;

  if (!next) {
    return { current, next: null, netSalesToNext: 0, progressPct: 1 };
  }

  const span = next.minNetSales - current.minNetSales;
  const progressed = totalNetSales - current.minNetSales;
  const progressPct = span > 0 ? Math.min(1, Math.max(0, progressed / span)) : 1;

  return {
    current,
    next,
    netSalesToNext: Math.max(0, next.minNetSales - totalNetSales),
    progressPct,
  };
}
