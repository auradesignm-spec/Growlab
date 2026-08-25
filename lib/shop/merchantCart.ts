import { cookies } from "next/headers";
import { CART_MAX_AGE_SEC, GL_MERCHANT_CART_COOKIE } from "@/lib/shop/cookieNames";
import type { CartItem } from "@/lib/shop/cookies";

export interface MerchantCart {
  storeSlug: string;
  items: CartItem[];
}

export function parseMerchantCart(raw: string | undefined | null): MerchantCart | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MerchantCart;
    if (!parsed || typeof parsed.storeSlug !== "string" || !Array.isArray(parsed.items)) return null;
    return {
      storeSlug: parsed.storeSlug.trim().toLowerCase(),
      items: parsed.items
        .filter((item) => item && typeof item.dealId === "string")
        .map((item) => ({
          dealId: item.dealId,
          quantity: Math.min(8, Math.max(1, Math.floor(Number(item.quantity) || 1))),
          size: typeof item.size === "string" ? item.size.slice(0, 120) : "",
        })),
    };
  } catch {
    return null;
  }
}

export function readMerchantCartCookie(): MerchantCart | null {
  return parseMerchantCart(cookies().get(GL_MERCHANT_CART_COOKIE)?.value);
}

export function writeMerchantCartCookie(cart: MerchantCart) {
  cookies().set(GL_MERCHANT_CART_COOKIE, JSON.stringify(cart), {
    path: "/",
    maxAge: CART_MAX_AGE_SEC,
    sameSite: "lax",
    httpOnly: true,
  });
}

export function clearMerchantCartCookie() {
  cookies().set(GL_MERCHANT_CART_COOKIE, "", { path: "/", maxAge: 0 });
}

export function merchantCartItemCount(cart: MerchantCart | null): number {
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
