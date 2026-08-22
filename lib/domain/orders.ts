import { ORDER_STATUSES, type OrderStatus } from "@/lib/domain/enums";

export type OrderActionStatus = Exclude<OrderStatus, "pending">;

/** Sequential order flow. Same constraints for merchant and admin. */
export const ORDER_NEXT: Record<OrderStatus, OrderActionStatus[]> = {
  pending: ["confirmed", "returned", "cancelled"],
  confirmed: ["fulfilled", "returned", "cancelled"],
  fulfilled: ["returned"],
  returned: [],
  cancelled: [],
};

export function nextOrderStatuses(status: string): OrderActionStatus[] {
  if (!ORDER_STATUSES.includes(status as OrderStatus)) return [];
  return ORDER_NEXT[status as OrderStatus];
}
