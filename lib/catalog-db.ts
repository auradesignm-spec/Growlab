import { prisma } from "@/lib/db";
import type { Product } from "@prisma/client";

/**
 * SQLite has no native array column via Prisma, so `Product.tags` and
 * `Product.variants` are stored as comma-separated strings. These helpers are
 * the only place that should split/join them.
 */

export function parseList(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function serializeList(values: readonly string[]): string {
  return values.map((v) => v.trim()).filter(Boolean).join(",");
}

/**
 * Only `verified` merchants' products may appear in the public shop or be
 * assignable to a creator storefront (merchant-verification gate, decision #2).
 */
export function isProductPubliclyVisible(product: {
  active: boolean;
  merchant: { verificationStatus: string };
}): boolean {
  return product.active && product.merchant.verificationStatus === "verified";
}

export async function getPubliclyVisibleProducts() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      merchant: { verificationStatus: "verified" },
    },
    include: { merchant: true },
    orderBy: { createdAt: "desc" },
  });
  return products;
}

export function productTags(product: Product): string[] {
  return parseList(product.tags);
}

export function productVariants(product: Product): string[] {
  return parseList(product.variants);
}
