import type { EscrowStatus, OrderStatus } from "@/lib/domain/enums";

/** Map fulfillment to ledger escrow. COD cash is not captured until the merchant marks fulfilled. */
export function escrowForOrderStatus(status: OrderStatus | string): EscrowStatus {
  if (status === "fulfilled") return "released";
  if (status === "returned" || status === "cancelled") return "refunded";
  return "held";
}

export function escrowPatchForStatus(status: OrderStatus | string): {
  escrowStatus: EscrowStatus;
  escrowReleasedAt: Date | null;
} {
  const escrowStatus = escrowForOrderStatus(status);
  return {
    escrowStatus,
    escrowReleasedAt: escrowStatus === "released" ? new Date() : null,
  };
}
