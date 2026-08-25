/**
 * Post-purchase share entitlement.
 * Link alone does not earn on clicks. Buyer must post an approved reel
 * (Origin) to earn on qualified views; purchases from the link still pay.
 */
import type { DistributorRole, ShareEntitlementStatus } from "@/lib/domain/enums";

/** Days a claim token stays valid after purchase before expiry. */
export const SHARE_CLAIM_WINDOW_DAYS = 90;

export function computeShareExpiry(orderedAt: Date, windowDays = SHARE_CLAIM_WINDOW_DAYS): Date {
  const d = new Date(orderedAt);
  d.setDate(d.getDate() + windowDays);
  return d;
}

export function effectiveShareStatus(row: {
  status: string;
  expiresAt: Date | null;
}, now: Date = new Date()): ShareEntitlementStatus {
  if (row.status === "claimed") return "claimed";
  if (row.status === "expired") return "expired";
  if (row.expiresAt && now > row.expiresAt) return "expired";
  return "eligible";
}

/**
 * Role after claim. Starts as sharer (purchase attribution only).
 * Origin unlocks only after merchant approves the buyer's reel.
 */
export function initialRoleAfterClaim(): DistributorRole {
  return "sharer";
}

export function canUpgradeToOrigin(role: DistributorRole, ugcApproved: boolean): boolean {
  return ugcApproved && (role === "sharer" || role === "origin");
}
