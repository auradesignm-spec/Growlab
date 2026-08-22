"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { computeWaterfall } from "@/lib/ledger/waterfall";
import type { AttributionSource } from "@/lib/domain/enums";
import { CONTACT_LEAK_WARNING_AR, scanForContactLeak } from "@/lib/security/antiLeak";
import { productVariants } from "@/lib/catalog-db";
import {
  clearCartCookie,
  normalizeCreatorHandle,
  readCartCookie,
  readRefCookie,
  writeCartCookie,
  type CartItem,
  type ShopCart,
} from "@/lib/shop/cookies";
import { clientIpFromHeaders, consumeRateLimit } from "@/lib/shop/rateLimit";
import { headers } from "next/headers";

const MAX_QTY = 8;

export interface PlaceCodOrderInput {
  dealId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  quantity: number;
  size: string;
}

export interface PlaceCodOrderResult {
  orderId: string;
  trackingToken: string;
}

function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s()-]/g, "");
}

function isPlausiblePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && /^\+?\d+$/.test(value);
}

function newTrackingToken(): string {
  return randomBytes(12).toString("base64url");
}

function attributionFor(_storeUsername: string): AttributionSource {
  return readRefCookie() ? "creator_link" : "direct";
}

async function loadActiveDeal(dealId: string) {
  const deal = await prisma.creatorDeal.findUnique({
    where: { id: dealId },
    include: {
      creator: { include: { user: true } },
      product: { include: { merchant: { include: { user: true } } } },
    },
  });

  if (!deal || deal.status !== "active") throw new Error("This piece is no longer available.");
  if (!deal.product.active) throw new Error("This piece is no longer available.");
  if (deal.product.merchant.verificationStatus !== "verified") {
    throw new Error("This piece is no longer available.");
  }
  if (deal.product.merchant.user.accountStatus === "banned" || deal.creator.user.accountStatus === "banned") {
    throw new Error("This piece is no longer available.");
  }
  if (deal.creator.verificationStatus !== "verified") {
    throw new Error("This piece is no longer available.");
  }
  return deal;
}

export async function addToCart(input: { username: string; dealId: string; quantity?: number; size?: string }) {
  const username = normalizeCreatorHandle(input.username);
  const deal = await loadActiveDeal(input.dealId);
  if (deal.creator.username !== username) throw new Error("This piece is no longer available.");

  const variants = productVariants(deal.product);
  const size = (input.size ?? "").trim().slice(0, 40);
  if (variants.length > 0 && (!size || !variants.includes(size))) {
    throw new Error("Pick a valid size.");
  }

  const quantity = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(input.quantity) || 1)));
  const current = readCartCookie();
  const cart: ShopCart =
    current && current.username === username ? current : { username, items: [] };

  const existing = cart.items.find((item) => item.dealId === input.dealId && item.size === size);
  if (existing) {
    existing.quantity = Math.min(MAX_QTY, existing.quantity + quantity);
  } else {
    cart.items.push({ dealId: input.dealId, quantity, size });
  }
  writeCartCookie(cart);
  revalidatePath(`/creator/${username}`);
  revalidatePath(`/creator/${username}/checkout`);
}

export async function updateCartItem(dealId: string, size: string, quantity: number) {
  const cart = readCartCookie();
  if (!cart) return;
  const nextQty = Math.floor(Number(quantity));
  cart.items = cart.items
    .map((item) =>
      item.dealId === dealId && item.size === size
        ? { ...item, quantity: Math.min(MAX_QTY, Math.max(0, nextQty)) }
        : item,
    )
    .filter((item) => item.quantity > 0);
  if (cart.items.length === 0) clearCartCookie();
  else writeCartCookie(cart);
  revalidatePath(`/creator/${cart.username}/checkout`);
}

export async function placeCodOrder(input: PlaceCodOrderInput): Promise<PlaceCodOrderResult> {
  return placeCodCheckout({
    username: "",
    buyerName: input.buyerName,
    buyerPhone: input.buyerPhone,
    buyerAddress: input.buyerAddress,
    buyerCity: input.buyerCity,
    items: [{ dealId: input.dealId, quantity: input.quantity, size: input.size }],
  });
}

export async function placeCodCheckout(input: {
  username: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  items?: CartItem[];
}): Promise<PlaceCodOrderResult> {
  const buyerName = input.buyerName.trim().slice(0, 80);
  const buyerPhone = normalizePhone(input.buyerPhone);
  const buyerAddress = input.buyerAddress.trim().slice(0, 200);
  const buyerCity = input.buyerCity.trim().slice(0, 80);

  if (buyerName.length < 2) throw new Error("Name is required.");
  if (scanForContactLeak(buyerName).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);
  if (scanForContactLeak(buyerAddress).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);
  if (!isPlausiblePhone(buyerPhone)) throw new Error("Enter a valid phone number.");
  if (buyerAddress.length < 6) throw new Error("Enter a delivery address.");
  if (buyerCity.length < 2) throw new Error("Enter a city.");

  const ip = clientIpFromHeaders(headers());
  if (!consumeRateLimit(`cod:ip:${ip}`, 8, 60 * 60 * 1000)) {
    throw new Error("Too many orders from this network. Try again later.");
  }
  if (!consumeRateLimit(`cod:phone:${buyerPhone}`, 5, 60 * 60 * 1000)) {
    throw new Error("Too many orders for this phone. Try again later.");
  }

  const cartItems = input.items ?? readCartCookie()?.items ?? [];
  if (cartItems.length === 0) throw new Error("Your cart is empty.");

  const trackingToken = newTrackingToken();
  const firstDeal = await loadActiveDeal(cartItems[0].dealId);
  const storeUsername = input.username
    ? normalizeCreatorHandle(input.username)
    : firstDeal.creator.username;

  const createdIds: string[] = [];

  for (const line of cartItems) {
    const quantity = Math.floor(Number(line.quantity));
    const size = line.size.trim().slice(0, 40);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new Error(`Quantity must be between 1 and ${MAX_QTY}.`);
    }

    const deal = await loadActiveDeal(line.dealId);
    if (deal.creator.username !== storeUsername) {
      throw new Error("This piece is no longer available.");
    }

    const variants = productVariants(deal.product);
    if (variants.length > 0) {
      if (!size || !variants.includes(size)) throw new Error("Pick a valid size.");
    }

    const unitPriceCharged = deal.lockedUnitPrice;
    const waterfall = computeWaterfall({
      quantity,
      unitPriceCharged,
      lockedUnitPrice: deal.lockedUnitPrice,
      lockedCommissionPct: deal.lockedCommissionPct,
      discountCapPct: deal.discountCapPct,
      settlementChannel: "cod",
    });

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          dealId: deal.id,
          buyerName,
          buyerPhone,
          buyerAddress,
          buyerCity,
          variantLabel: size,
          quantity,
          unitPriceCharged,
          currency: deal.product.currency,
          attributionSource: attributionFor(deal.creator.username),
          settlementChannel: "cod",
          trackingToken,
          escrowStatus: "held",
          status: "pending",
        },
      });
      await tx.ledgerEntry.create({
        data: {
          orderId: created.id,
          attributedGmv: waterfall.attributedGmv,
          paymentFee: waterfall.paymentFee,
          platformShare: waterfall.platformShare,
          merchantShare: waterfall.merchantShare,
          creatorShare: waterfall.creatorShare,
          holdbackAmount: waterfall.holdbackAmount,
          availableAmount: waterfall.availableAmount,
          holdbackDays: waterfall.holdbackDays,
        },
      });
      return created;
    });
    createdIds.push(order.id);
  }

  clearCartCookie();
  revalidatePath(`/creator/${storeUsername}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");

  return { orderId: createdIds[0], trackingToken };
}
