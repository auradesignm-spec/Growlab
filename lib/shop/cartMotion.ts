export const CART_ADDED_EVENT = "gl:cart-added";

export function announceCartAdded() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_ADDED_EVENT));
}
