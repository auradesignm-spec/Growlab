export const GL_REF_COOKIE = "gl_ref";
export const GL_SREF_COOKIE = "gl_sref";
export const GL_CART_COOKIE = "gl_cart";
export const GL_MERCHANT_CART_COOKIE = "gl_m_cart";

/** First-touch window. Matches a typical affiliate cookie life. */
export const REF_MAX_AGE_SEC = 60 * 60 * 24 * 21;
export const CART_MAX_AGE_SEC = 60 * 60 * 24 * 14;

export function normalizeCreatorHandle(raw: string): string {
  return decodeURIComponent(raw).trim().toLowerCase();
}
