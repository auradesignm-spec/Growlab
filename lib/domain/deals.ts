/** Cap on open (pending + active) marketer seats per product. Scarcity on the feed. */
export const MAX_MARKETERS_PER_PRODUCT = 8;

export function seatsRemaining(openDealCount: number): number {
  return Math.max(0, MAX_MARKETERS_PER_PRODUCT - openDealCount);
}
