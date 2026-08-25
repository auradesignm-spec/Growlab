export type CommissionPayState = "pending" | "confirmed" | "void";

/** Payable only after COD collection (fulfilled). Clicks never confirm. */
export function commissionPayState(statuses: readonly string[]): CommissionPayState {
  if (statuses.some((status) => status === "fulfilled")) return "confirmed";
  if (
    statuses.length > 0 &&
    statuses.every((status) => status === "returned" || status === "cancelled")
  ) {
    return "void";
  }
  return "pending";
}
