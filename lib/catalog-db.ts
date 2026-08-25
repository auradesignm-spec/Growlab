import type { Product } from "@prisma/client";
import {
  DEFAULT_PROMO,
  isPromoLive,
  parsePromoJson,
  serializePromo,
  type StorePromo,
} from "@/lib/merchant-store/promo";

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

export interface ProductCustomAttr {
  name: string;
  values: string[];
}

export interface ProductAttributes {
  size: string[];
  color: string[];
  material: string[];
  custom: ProductCustomAttr[];
}

export const EMPTY_ATTRIBUTES: ProductAttributes = {
  size: [],
  color: [],
  material: [],
  custom: [],
};

function cleanValues(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 24);
}

export function parseAttributesJson(
  raw: string | null | undefined,
  legacyVariants?: string
): ProductAttributes {
  const legacySize = legacyVariants ? parseList(legacyVariants) : [];
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<ProductAttributes>) : {};
    const customRaw = Array.isArray(parsed.custom) ? parsed.custom : [];
    const custom: ProductCustomAttr[] = customRaw
      .filter((c): c is ProductCustomAttr => !!c && typeof c === "object")
      .map((c) => ({
        name: String((c as ProductCustomAttr).name ?? "")
          .trim()
          .slice(0, 40),
        values: cleanValues((c as ProductCustomAttr).values),
      }))
      .filter((c) => c.name && c.values.length > 0)
      .slice(0, 8);

    const size = cleanValues(parsed.size);
    return {
      size: size.length > 0 ? size : legacySize,
      color: cleanValues(parsed.color),
      material: cleanValues(parsed.material),
      custom,
    };
  } catch {
    return { ...EMPTY_ATTRIBUTES, size: legacySize };
  }
}

export function serializeAttributes(attrs: ProductAttributes): string {
  return JSON.stringify({
    size: cleanValues(attrs.size),
    color: cleanValues(attrs.color),
    material: cleanValues(attrs.material),
    custom: (attrs.custom ?? [])
      .map((c) => ({
        name: String(c.name ?? "")
          .trim()
          .slice(0, 40),
        values: cleanValues(c.values),
      }))
      .filter((c) => c.name && c.values.length > 0)
      .slice(0, 8),
  });
}

/** Flat option labels for cart/size pickers (size first, then color, material, custom). */
export function attributeOptionGroups(attrs: ProductAttributes): Array<{ key: string; label: string; values: string[] }> {
  const groups: Array<{ key: string; label: string; values: string[] }> = [];
  if (attrs.size.length) groups.push({ key: "size", label: "size", values: attrs.size });
  if (attrs.color.length) groups.push({ key: "color", label: "color", values: attrs.color });
  if (attrs.material.length) groups.push({ key: "material", label: "material", values: attrs.material });
  for (const c of attrs.custom) {
    groups.push({ key: `custom:${c.name}`, label: c.name, values: c.values });
  }
  return groups;
}

export function parseFeaturesJson(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim().slice(0, 120))
      .filter(Boolean)
      .slice(0, 20);
  } catch {
    return [];
  }
}

export function serializeFeatures(features: readonly string[]): string {
  return JSON.stringify(
    features
      .map((f) => f.trim().slice(0, 120))
      .filter(Boolean)
      .slice(0, 20)
  );
}

export function productAttributes(product: {
  attributesJson?: string | null;
  variants?: string | null;
}): ProductAttributes {
  return parseAttributesJson(product.attributesJson, product.variants ?? undefined);
}

export function productFeatures(product: { featuresJson?: string | null }): string[] {
  return parseFeaturesJson(product.featuresJson);
}

export function productPromo(product: {
  promoJson?: string | null;
  promoEndsAt?: Date | string | null;
}): StorePromo {
  const endsAt =
    product.promoEndsAt instanceof Date
      ? product.promoEndsAt.toISOString()
      : typeof product.promoEndsAt === "string"
        ? product.promoEndsAt
        : null;
  const promo = parsePromoJson(product.promoJson, { endsAt });
  if (endsAt && !promo.endsAt) promo.endsAt = endsAt;
  return promo;
}

export function liveProductPromo(product: {
  id: string;
  promoJson?: string | null;
  promoEndsAt?: Date | string | null;
}): StorePromo | null {
  const promo = productPromo(product);
  if (!isPromoLive(promo)) return null;
  return {
    ...promo,
    productIds: [product.id],
  };
}

export function serializeProductPromo(promo: StorePromo): string {
  return serializePromo(promo);
}

export { DEFAULT_PROMO, isPromoLive, type StorePromo };

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

export function productTags(product: Product): string[] {
  return parseList(product.tags);
}

export function productVariants(product: Product & { attributesJson?: string | null }): string[] {
  const attrs = productAttributes(product);
  if (attrs.size.length > 0) return attrs.size;
  return parseList(product.variants);
}
