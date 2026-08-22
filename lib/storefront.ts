import { prisma } from "@/lib/db";
import { productTags, productVariants } from "@/lib/catalog-db";

export interface StorefrontDeal {
  dealId: string;
  productTitle: string;
  category: string;
  tags: string[];
  variants: string[];
  priceOmr: number;
  currency: string;
  featured: boolean;
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
        where: { status: "active" },
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

  // Only verified merchants' products may appear on a creator storefront.
  const eligibleDeals = creator.deals.filter(
    (deal) => deal.product.active && deal.product.merchant.verificationStatus === "verified"
  );

  const toDeal = (deal: (typeof eligibleDeals)[number]): StorefrontDeal => ({
    dealId: deal.id,
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
