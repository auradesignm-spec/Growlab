import type { UgcStatus } from "@/lib/domain/enums";

/** Strict window a creator has to upload an approved UGC video after a
 * sample is marked shipped, before the deposit is forfeited. */
export const UGC_DEADLINE_DAYS = 7;

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
