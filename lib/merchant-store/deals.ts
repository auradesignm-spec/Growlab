import { prisma } from "@/lib/db";
import { commissionToPoolSharePct } from "@/lib/domain/commission";

const PLATFORM_STORE_USERNAME = "growlab-direct";

/** Hidden platform creator that holds merchant-store direct deals (0% marketer share). */
export async function getPlatformStoreCreatorId(): Promise<string> {
  const existing = await prisma.creatorProfile.findUnique({
    where: { username: PLATFORM_STORE_USERNAME },
    select: { id: true },
  });
  if (existing) return existing.id;

  const user = await prisma.user.create({
    data: {
      name: "Growlab Direct",
      role: "creator",
      locale: "ar",
      firstName: "Growlab",
      lastName: "Direct",
      email: "direct@growlab.local",
      profileCompletedAt: new Date(),
      creatorProfile: {
        create: {
          username: PLATFORM_STORE_USERNAME,
          tier: "ELITE",
          bio: "Direct merchant storefront channel",
          verificationStatus: "verified",
          kycSubmittedAt: new Date(),
        },
      },
    },
    include: { creatorProfile: true },
  });
  return user.creatorProfile!.id;
}

/** Ensures an active merchant_store deal exists for COD checkout on the merchant storefront. */
export async function ensureMerchantStoreDeal(product: {
  id: string;
  basePrice: number;
  cogsPct: number;
  commissionType: string;
  commissionValue: number;
}): Promise<string> {
  const existing = await prisma.creatorDeal.findFirst({
    where: { productId: product.id, dealChannel: "merchant_store", status: "active" },
    select: { id: true },
  });
  if (existing) return existing.id;

  const creatorId = await getPlatformStoreCreatorId();
  const lockedCommissionPct = commissionToPoolSharePct({
    basePrice: product.basePrice,
    commissionType: "pct",
    commissionValue: 0,
  });

  const deal = await prisma.creatorDeal.create({
    data: {
      creatorId,
      productId: product.id,
      dealChannel: "merchant_store",
      status: "active",
      lockedUnitPrice: product.basePrice,
      lockedCommissionPct,
      lockedCogsPct: product.cogsPct,
      discountCapPct: 0.15,
    },
  });
  return deal.id;
}
