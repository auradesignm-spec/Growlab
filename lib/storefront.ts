import { prisma } from "@/lib/db";
import { productTags, productVariants } from "@/lib/catalog-db";

export const RESERVED_STOREFRONT_SLUGS = new Set(["checkout", "p"]);

export interface StorefrontDeal {
  dealId: string;
  slug: string;
  productTitle: string;
  category: string;
  tags: string[];
  variants: string[];
  priceOmr: number;
  currency: string;
  featured: boolean;
}

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

export async function getCreatorDealSlugs(usernameRaw: string): Promise<Map<string, string> | null> {
  const username = decodeURIComponent(usernameRaw).trim().toLowerCase();
  const creator = await prisma.creatorProfile.findUnique({
    where: { username },
    include: {
      deals: {
        where: { status: { in: ["pending", "active"] } },
        include: { product: { select: { title: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!creator) return null;
  return uniqueDealSlugs(
    creator.deals.map((deal) => ({ dealId: deal.id, productTitle: deal.product.title }))
  );
}

export interface StorefrontData {
  username: string;
  name: string;
  bio: string | null;
  tier: string;
  heroDeal: StorefrontDeal | null;
  otherDeals: StorefrontDeal[];
}

/** Returns null only when no CreatorProfile exists for this username at all (true 404). */
export async function getCreatorStorefront(usernameRaw: string): Promise<StorefrontData | null> {
  const username = decodeURIComponent(usernameRaw).trim().toLowerCase();

  const creator = await prisma.creatorProfile.findUnique({
    where: { username },
    include: {
      user: true,
      deals: {
        where: { status: { in: ["pending", "active"] } },
        include: { product: { include: { merchant: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!creator) return null;
  if (creator.user.accountStatus === "banned") return null;
  if (creator.verificationStatus !== "verified") {
    return {
      username: creator.username,
      name: creator.user.name,
      bio: creator.bio,
      tier: creator.tier,
      heroDeal: null,
      otherDeals: [],
    };
  }

  const slugByDealId = uniqueDealSlugs(
    [...creator.deals]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((deal) => ({ dealId: deal.id, productTitle: deal.product.title }))
  );

  // Only accepted deals from verified merchants appear on the public storefront.
  const eligibleDeals = creator.deals.filter(
    (deal) =>
      deal.status === "active" &&
      deal.product.active &&
      deal.product.merchant.verificationStatus === "verified"
  );

  const toDeal = (deal: (typeof eligibleDeals)[number]): StorefrontDeal => ({
    dealId: deal.id,
    slug: slugByDealId.get(deal.id) ?? productSlug(deal.product.title),
    productTitle: deal.product.title,
    category: deal.product.category,
    tags: productTags(deal.product),
    variants: productVariants(deal.product),
    priceOmr: deal.lockedUnitPrice,
    currency: deal.product.currency,
    featured: deal.featured,
  });

  const heroSource = eligibleDeals.find((d) => d.featured) ?? eligibleDeals[0] ?? null;
  const otherSources = eligibleDeals.filter((d) => d.id !== heroSource?.id);

  return {
    username: creator.username,
    name: creator.user.name,
    bio: creator.bio,
    tier: creator.tier,
    heroDeal: heroSource ? toDeal(heroSource) : null,
    otherDeals: otherSources.map(toDeal),
  };
}

export async function getStorefrontDeal(usernameRaw: string, dealId: string): Promise<{
  username: string;
  name: string;
  bio: string | null;
  deal: StorefrontDeal;
} | null> {
  const storefront = await getCreatorStorefront(usernameRaw);
  if (!storefront) return null;
  const deal =
    storefront.heroDeal?.dealId === dealId
      ? storefront.heroDeal
      : storefront.otherDeals.find((item) => item.dealId === dealId) ?? null;
  if (!deal) return null;
  return {
    username: storefront.username,
    name: storefront.name,
    bio: storefront.bio,
    deal,
  };
}

export async function getStorefrontDealBySlug(
  usernameRaw: string,
  slugRaw: string
): Promise<{
  username: string;
  name: string;
  bio: string | null;
  deal: StorefrontDeal;
} | null> {
  const slug = decodeURIComponent(slugRaw).trim();
  if (!slug || RESERVED_STOREFRONT_SLUGS.has(slug.toLowerCase())) return null;

  const storefront = await getCreatorStorefront(usernameRaw);
  if (!storefront) return null;

  const deal =
    storefront.heroDeal?.slug === slug
      ? storefront.heroDeal
      : storefront.otherDeals.find((item) => item.slug === slug) ?? null;
  if (!deal) return null;

  return {
    username: storefront.username,
    name: storefront.name,
    bio: storefront.bio,
    deal,
  };
}
