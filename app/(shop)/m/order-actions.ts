"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  applyProductThenStorePromo,
  promoFromStoreFields,
  type PromoCartLine,
  type StorePromo,
} from "@/lib/merchant-store/promo";
import { placeCodCheckout } from "@/app/(creator)/creator/order-actions";
import { liveProductPromo, productAttributes, productVariants } from "@/lib/catalog-db";
import {
  clearMerchantCartCookie,
  readMerchantCartCookie,
  writeMerchantCartCookie,
} from "@/lib/shop/merchantCart";

const MAX_QTY = 8;

async function loadMerchantStoreDeal(dealId: string, storeSlug: string) {
  const deal = await prisma.creatorDeal.findUnique({
    where: { id: dealId },
    include: {
      product: { include: { merchant: { include: { store: true } } } },
    },
  });
  if (!deal || deal.dealChannel !== "merchant_store" || deal.status !== "active") {
    throw new Error("This product is no longer available.");
  }
  if (deal.product.merchant.store?.slug !== storeSlug || !deal.product.merchant.store.published) {
    throw new Error("This product is no longer available.");
  }
  if (!deal.product.active || deal.product.merchant.verificationStatus !== "verified") {
    throw new Error("This product is no longer available.");
  }
  return deal;
}

function storePromoFromRow(store: {
  promoJson?: string | null;
  offerHeadline: string;
  offerBody: string;
  offerActive: boolean;
  offerEndsAt?: Date | null;
}) {
  return promoFromStoreFields({
    promoJson: store.promoJson,
    offerHeadline: store.offerHeadline,
    offerBody: store.offerBody,
    offerActive: store.offerActive,
    offerEndsAt: store.offerEndsAt,
  });
}

export async function addToMerchantCart(input: {
  storeSlug: string;
  dealId: string;
  quantity?: number;
  size?: string;
}) {
  const storeSlug = input.storeSlug.trim().toLowerCase();
  const deal = await loadMerchantStoreDeal(input.dealId, storeSlug);

  const variants = productVariants(deal.product);
  const attrs = productAttributes(deal.product);
  const hasAttrs =
    attrs.size.length + attrs.color.length + attrs.material.length + attrs.custom.length > 0;
  const size = (input.size ?? "").trim().slice(0, 120);
  if ((variants.length > 0 || hasAttrs) && !size) {
    throw new Error("Pick a valid size.");
  }
  if (variants.length > 0 && !hasAttrs && size && !variants.includes(size)) {
    throw new Error("Pick a valid size.");
  }

  const quantity = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(input.quantity) || 1)));
  const current = readMerchantCartCookie();
  const cart =
    current && current.storeSlug === storeSlug ? current : { storeSlug, items: [] };

  const existing = cart.items.find((item) => item.dealId === input.dealId && item.size === size);
  if (existing) existing.quantity = Math.min(MAX_QTY, existing.quantity + quantity);
  else cart.items.push({ dealId: input.dealId, quantity, size });

  writeMerchantCartCookie(cart);
  revalidatePath(`/m/${storeSlug}`);
}

export async function placeMerchantStoreCheckout(input: {
  storeSlug: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
}) {
  const storeSlug = input.storeSlug.trim().toLowerCase();
  const cart = readMerchantCartCookie();
  if (!cart || cart.storeSlug !== storeSlug || cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const store = await prisma.merchantStore.findFirst({
    where: { slug: storeSlug, published: true },
  });
  if (!store) throw new Error("This store is no longer available.");

  const storePromo = storePromoFromRow(
    store as typeof store & { promoJson?: string; offerEndsAt?: Date | null }
  );
  const cartLines: PromoCartLine[] = [];
  const productPromos = new Map<string, StorePromo | null>();

  for (const line of cart.items) {
    const deal = await loadMerchantStoreDeal(line.dealId, storeSlug);
    cartLines.push({
      dealId: line.dealId,
      size: line.size,
      title: deal.product.title,
      productId: deal.product.id,
      quantity: line.quantity,
      unitPrice: deal.lockedUnitPrice,
      currency: deal.product.currency,
    });
    if (!productPromos.has(deal.product.id)) {
      productPromos.set(deal.product.id, liveProductPromo(deal.product));
    }
  }

  const priced = applyProductThenStorePromo(cartLines, productPromos, storePromo);
  const unitPriceOverrides: Record<string, number> = {};
  for (const line of priced.lines) {
    unitPriceOverrides[`${line.dealId}::${line.size}`] = line.unitPriceCharged;
  }

  const result = await placeCodCheckout({
    username: "growlab-direct",
    buyerName: input.buyerName,
    buyerPhone: input.buyerPhone,
    buyerAddress: input.buyerAddress,
    buyerCity: input.buyerCity,
    items: cart.items,
    unitPriceOverrides: priced.applied ? unitPriceOverrides : undefined,
  });

  clearMerchantCartCookie();
  revalidatePath(`/m/${storeSlug}`);
  return result;
}
