import { prisma } from "@/lib/db";

export interface BuyerShareProduct {
  entitlementId: string;
  claimToken: string;
  productId: string;
  productTitle: string;
  storeName: string;
  storeUrl: string | null;
  shareUrl: string | null;
  storePublished: boolean;
  role: string;
  reelStatus: string | null;
  reelUrl: string | null;
  claimedAt: string | null;
}

export interface BuyerShareLoopData {
  username: string;
  products: BuyerShareProduct[];
}

/** Products this buyer already claimed to distribute (post-purchase share loop). */
export async function loadBuyerShareLoopData(creatorId: string): Promise<BuyerShareLoopData> {
  const creator = await prisma.creatorProfile.findUniqueOrThrow({
    where: { id: creatorId },
    select: { username: true },
  });

  const rows = await prisma.shareEntitlement.findMany({
    where: { creatorId, status: "claimed" },
    include: {
      product: { include: { merchant: { include: { store: true } } } },
    },
    orderBy: { claimedAt: "desc" },
  });

  const productIds = rows.map((r) => r.productId);
  const reels =
    productIds.length === 0
      ? []
      : await prisma.contentAsset.findMany({
          where: {
            originCreatorId: creatorId,
            productId: { in: productIds },
            status: { in: ["pending", "approved"] },
          },
          orderBy: { createdAt: "desc" },
        });

  const reelByProduct = new Map<string, (typeof reels)[number]>();
  for (const reel of reels) {
    if (!reelByProduct.has(reel.productId)) reelByProduct.set(reel.productId, reel);
  }

  const products: BuyerShareProduct[] = rows.map((row) => {
    const store = row.product.merchant.store;
    const storeUrl = store?.published ? `/m/${store.slug}` : null;
    const shareUrl = storeUrl
      ? `${storeUrl}?ref=${encodeURIComponent(creator.username)}`
      : null;
    const reel = reelByProduct.get(row.productId);
    return {
      entitlementId: row.id,
      claimToken: row.claimToken,
      productId: row.productId,
      productTitle: row.product.title,
      storeName: row.product.merchant.businessName,
      storeUrl,
      shareUrl,
      storePublished: Boolean(store?.published),
      role: row.role,
      reelStatus: reel?.status ?? null,
      reelUrl: reel?.socialPostUrl ?? null,
      claimedAt: row.claimedAt?.toISOString() ?? null,
    };
  });

  return { username: creator.username, products };
}
