/** Pure storefront path helpers — safe for client components (no Prisma/fs). */

export const RESERVED_STOREFRONT_SLUGS = new Set(["checkout", "p"]);

/** Title → path segment. Spaces become hyphens; Arabic letters stay. */
export function productSlug(title: string): string {
  const slug = title
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "product";
}

export function uniqueDealSlugs(
  deals: readonly { dealId: string; productTitle: string }[]
): Map<string, string> {
  const taken = new Set<string>();
  const byDeal = new Map<string, string>();

  for (const deal of deals) {
    const base = productSlug(deal.productTitle);
    let slug = base;
    let n = 2;
    while (taken.has(slug.toLowerCase()) || RESERVED_STOREFRONT_SLUGS.has(slug.toLowerCase())) {
      slug = `${base}-${n}`;
      n += 1;
    }
    taken.add(slug.toLowerCase());
    byDeal.set(deal.dealId, slug);
  }

  return byDeal;
}

export function creatorProductPath(username: string, slug: string): string {
  return `/creator/${username}/${slug}`;
}
