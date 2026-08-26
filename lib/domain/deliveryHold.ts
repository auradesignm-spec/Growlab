import { SETTLEMENT_CHANNELS, type SettlementChannel } from "@/lib/domain/enums";

/** Merchant-stated ship-by window. Default and usual cap is 4 days. */
export const DEFAULT_DELIVERY_DAYS_MAX = 4;
export const MIN_DELIVERY_DAYS_MAX = 1;
export const MAX_DELIVERY_DAYS_MAX = 14;

export function clampDeliveryDays(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_DELIVERY_DAYS_MAX;
  return Math.min(MAX_DELIVERY_DAYS_MAX, Math.max(MIN_DELIVERY_DAYS_MAX, Math.round(value)));
}

export function computeDeliveryDueAt(paidAt: Date, deliveryDaysMax: number): Date {
  const due = new Date(paidAt.getTime());
  due.setUTCDate(due.getUTCDate() + clampDeliveryDays(deliveryDaysMax));
  return due;
}

export function isCardChannel(channel: string): channel is SettlementChannel {
  return channel === "card";
}

export function parseSettlementChannel(value: string | null | undefined): SettlementChannel {
  return value === "card" ? "card" : SETTLEMENT_CHANNELS[0];
}

export const DELIVERY_HOLD_UNCLAIMED_GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * Card hold: buyer pays the platform. Funds stay held until:
 * - merchant marks fulfilled (received) → release to merchant
 * - window elapsed and buyer filed a refund → refund buyer
 * - window elapsed, 24h grace with no refund claim → release to merchant
 * Inside the window, unpaid-to-merchant stays held (unless fulfilled).
 * COD does not use this clock — cash is on delivery.
 */
export type DeliveryHoldDecision = "hold" | "release_merchant" | "refund_buyer";

export function decideDeliveryHold(input: {
  settlementChannel: string;
  escrowStatus: string;
  orderStatus: string;
  paidAt: Date | null;
  deliveryDueAt: Date | null;
  buyerRefundRequestedAt: Date | null;
  buyerDeniedReceivedAt?: Date | null;
  now?: Date;
}): DeliveryHoldDecision {
  if (input.escrowStatus === "released") return "release_merchant";
  if (input.escrowStatus === "refunded") return "refund_buyer";
  if (input.orderStatus === "cancelled" || input.orderStatus === "returned") return "refund_buyer";
  if (!isCardChannel(input.settlementChannel)) return "hold";
  if (!input.paidAt || !input.deliveryDueAt) return "hold";
  if (input.buyerDeniedReceivedAt) return "hold";

  if (input.orderStatus === "fulfilled") return "release_merchant";

  const now = input.now ?? new Date();
  const late = now.getTime() > input.deliveryDueAt.getTime();
  if (late && input.buyerRefundRequestedAt) return "refund_buyer";
  const graceOver =
    late && now.getTime() > input.deliveryDueAt.getTime() + DELIVERY_HOLD_UNCLAIMED_GRACE_MS;
  if (graceOver && !input.buyerRefundRequestedAt) return "release_merchant";
  return "hold";
}

export function canBuyerRequestRefund(input: {
  settlementChannel: string;
  escrowStatus: string;
  orderStatus: string;
  paidAt: Date | null;
  deliveryDueAt: Date | null;
  buyerRefundRequestedAt: Date | null;
  now?: Date;
}): boolean {
  if (input.buyerRefundRequestedAt) return false;
  if (input.escrowStatus !== "held") return false;
  if (!isCardChannel(input.settlementChannel) || !input.deliveryDueAt) return false;
  if (input.orderStatus === "fulfilled" || input.orderStatus === "cancelled" || input.orderStatus === "returned") {
    return false;
  }
  const now = input.now ?? new Date();
  return now.getTime() > input.deliveryDueAt.getTime();
}

export function cardHoldCreateFields(deliveryDaysMax: number, now = new Date()) {
  return {
    paidAt: now,
    deliveryDueAt: computeDeliveryDueAt(now, deliveryDaysMax),
    buyerRefundRequestedAt: null as Date | null,
  };
}
