import type { CreatorTierId, UgcStatus } from "@/lib/domain/enums";

/** Strict window a creator has to upload an approved UGC video after a
 * sample is marked shipped, before the deposit is forfeited. */
export const UGC_DEADLINE_DAYS = 7;

/** NEW marketers start on the media kit. Physical samples unlock later. */
export const RISING_SAMPLE_DEPOSIT_PCT = 0.25;

export interface SamplePolicy {
  readonly allowed: boolean;
  readonly depositPct: number;
  readonly reason: "new_tier" | "rising" | "elite";
}

export function samplePolicyForTier(tier: CreatorTierId | string): SamplePolicy {
  if (tier === "ELITE") return { allowed: true, depositPct: 0, reason: "elite" };
  if (tier === "RISING") return { allowed: true, depositPct: RISING_SAMPLE_DEPOSIT_PCT, reason: "rising" };
  return { allowed: false, depositPct: 0, reason: "new_tier" };
}

export function sampleDepositAmount(basePrice: number, tier: CreatorTierId | string): number | null {
  const policy = samplePolicyForTier(tier);
  if (!policy.allowed) return null;
  return Math.round(basePrice * policy.depositPct * 100) / 100;
}

export function computeUgcDeadline(shippedAt: Date): Date {
  const deadline = new Date(shippedAt);
  deadline.setDate(deadline.getDate() + UGC_DEADLINE_DAYS);
  return deadline;
}

/**
 * Derives the effective status without mutating the DB — there's no
 * background job ticking the clock, so "forfeited" is computed on read
 * whenever the deadline has passed without an on-time, approved (or at
 * least submitted) video.
 */
export function effectiveUgcStatus(row: {
  ugcStatus: string;
  ugcDeadline: Date | null;
  ugcSubmittedAt: Date | null;
}, now: Date = new Date()): UgcStatus {
  const { ugcStatus, ugcDeadline, ugcSubmittedAt } = row;

  if (ugcStatus === "approved" || ugcStatus === "forfeited" || ugcStatus === "not_applicable") {
    return ugcStatus as UgcStatus;
  }

  const missedDeadline = ugcDeadline && now > ugcDeadline && (!ugcSubmittedAt || ugcSubmittedAt > ugcDeadline);
  if (missedDeadline) return "forfeited";

  return ugcStatus as UgcStatus;
}
