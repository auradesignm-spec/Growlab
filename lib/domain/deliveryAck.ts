import { randomBytes } from "crypto";

/** After the merchant marks delivered, the buyer has this long to tap yes/no. */
export const BUYER_RECEIVE_ACK_MS = 48 * 60 * 60 * 1000;

export type DeliveryBucket = "not_delivered" | "awaiting_buyer" | "delivered" | "closed";

export function mintReceiveConfirmToken(): string {
  return randomBytes(24).toString("base64url");
}

export function deliveryBucket(input: {
  status: string;
  merchantMarkedDeliveredAt: Date | string | null;
  buyerConfirmedReceivedAt: Date | string | null;
  buyerDeniedReceivedAt: Date | string | null;
}): DeliveryBucket {
  if (input.status === "cancelled" || input.status === "returned") return "closed";
  if (input.status === "fulfilled" || input.buyerConfirmedReceivedAt) return "delivered";
  if (input.merchantMarkedDeliveredAt && !input.buyerDeniedReceivedAt) return "awaiting_buyer";
  return "not_delivered";
}

export function canMerchantMarkDelivered(input: {
  status: string;
  buyerRefundRequestedAt: Date | string | null;
}): boolean {
  if (input.buyerRefundRequestedAt) return false;
  return input.status === "confirmed";
}

export function shouldAutoConfirmReceive(input: {
  status: string;
  merchantMarkedDeliveredAt: Date | null;
  buyerConfirmedReceivedAt: Date | null;
  buyerDeniedReceivedAt: Date | null;
  now?: Date;
}): boolean {
  if (input.status !== "confirmed") return false;
  if (!input.merchantMarkedDeliveredAt) return false;
  if (input.buyerConfirmedReceivedAt || input.buyerDeniedReceivedAt) return false;
  const now = input.now ?? new Date();
  return now.getTime() - input.merchantMarkedDeliveredAt.getTime() >= BUYER_RECEIVE_ACK_MS;
}
