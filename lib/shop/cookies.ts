import { cookies } from "next/headers";
import {
  CART_MAX_AGE_SEC,
  GL_CART_COOKIE,
  GL_REF_COOKIE,
  normalizeCreatorHandle,
} from "@/lib/shop/cookieNames";

export {
  CART_MAX_AGE_SEC,
  GL_CART_COOKIE,
  GL_REF_COOKIE,
  REF_MAX_AGE_SEC,
  normalizeCreatorHandle,
} from "@/lib/shop/cookieNames";

export interface CartItem {
  dealId: string;
  quantity: number;
  size: string;
}

export interface ShopCart {
  username: string;
  items: CartItem[];
}

export function parseCart(raw: string | undefined | null): ShopCart | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ShopCart;
    if (!parsed || typeof parsed.username !== "string" || !Array.isArray(parsed.items)) return null;
    return {
      username: normalizeCreatorHandle(parsed.username),
      items: parsed.items
        .filter((item) => item && typeof item.dealId === "string")
        .map((item) => ({
          dealId: item.dealId,
          quantity: Math.min(8, Math.max(1, Math.floor(Number(item.quantity) || 1))),
          size: typeof item.size === "string" ? item.size.slice(0, 40) : "",
        })),
    };
  } catch {
    return null;
  }
}

export function cartItemCount(cart: ShopCart | null): number {
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function readRefCookie(): string | null {
  const value = cookies().get(GL_REF_COOKIE)?.value;
  if (!value) return null;
  const handle = normalizeCreatorHandle(value);
  return handle || null;
}

export function readCartCookie(): ShopCart | null {
  return parseCart(cookies().get(GL_CART_COOKIE)?.value);
}

export function writeCartCookie(cart: ShopCart) {
  cookies().set(GL_CART_COOKIE, JSON.stringify(cart), {
    path: "/",
    maxAge: CART_MAX_AGE_SEC,
    sameSite: "lax",
    httpOnly: true,
  });
}

export function clearCartCookie() {
  cookies().set(GL_CART_COOKIE, "", { path: "/", maxAge: 0 });
}
