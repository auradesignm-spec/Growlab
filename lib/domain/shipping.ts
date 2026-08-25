/** Buyer shipping, always prepaid — even when the product itself is pay-at-the-door. */
export const DEFAULT_SHIPPING_FEE = 1.5;
export const MIN_SHIPPING_FEE = 0.1;
export const MAX_SHIPPING_FEE = 50;

export function clampShippingFee(value: number): number {
  if (!Number.isFinite(value) || value < MIN_SHIPPING_FEE) return DEFAULT_SHIPPING_FEE;
  return Math.min(MAX_SHIPPING_FEE, Math.round(value * 1000) / 1000);
}

/** One shipment per checkout: highest line shipping fee. */
export function checkoutShippingFee(lineFees: readonly number[]): number {
  if (lineFees.length === 0) return DEFAULT_SHIPPING_FEE;
  return clampShippingFee(Math.max(...lineFees));
}
