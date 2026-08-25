import { productSlug } from "@/lib/storefront-slugs";

const RESERVED = new Set(["checkout", "p", "edit", "api"]);

export function slugifyStoreName(name: string): string {
  const base = productSlug(name) || "store";
  return base.slice(0, 48);
}

export function slugifyProductTitle(title: string): string {
  return productSlug(title).slice(0, 64) || "product";
}

export function isReservedStoreSlug(slug: string): boolean {
  return RESERVED.has(slug.toLowerCase());
}

export function uniqueProductSlug(title: string, taken: Set<string>): string {
  let slug = slugifyProductTitle(title);
  let n = 2;
  while (taken.has(slug.toLowerCase())) {
    slug = `${slugifyProductTitle(title)}-${n}`;
    n += 1;
  }
  taken.add(slug.toLowerCase());
  return slug;
}
