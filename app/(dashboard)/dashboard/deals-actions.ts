"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  DEFAULT_SELF_SERVICE_DISCOUNT_CAP_PCT as DEFAULT_DISCOUNT_CAP_PCT,
  commissionToPoolSharePct,
} from "@/lib/domain/commission";

/**
 * Self-service: a creator picks a verified merchant's active product and
 * adds it to their own storefront by creating their own CreatorDeal.
 * Price/COGS are snapshotted from the live product at creation time, same as
 * every other deal-creation path (see prisma/schema.prisma CreatorDeal note).
 */
export async function joinDeal(productId: string): Promise<{ dealId: string }> {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "creator" || !viewer.creatorProfile) {
    throw new Error("Only a creator can add a product to their storefront.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.creatorProfile.verificationStatus !== "verified") {
    throw new Error("Complete identity verification before adding products.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { merchant: true },
  });
  if (!product || !product.active || product.merchant.verificationStatus !== "verified") {
    throw new Error("This product isn't open for creator deals.");
  }

  const existing = await prisma.creatorDeal.findFirst({
    where: { creatorId: viewer.creatorProfile.id, productId, status: "active" },
  });
  if (existing) {
    revalidatePath("/dashboard/browse");
    return { dealId: existing.id };
  }

  const hasAnyActiveDeal = await prisma.creatorDeal.findFirst({
    where: { creatorId: viewer.creatorProfile.id, status: "active" },
  });

  const deal = await prisma.creatorDeal.create({
    data: {
      creatorId: viewer.creatorProfile.id,
      productId,
      lockedUnitPrice: product.basePrice,
      lockedCommissionPct: commissionToPoolSharePct(product),
      lockedCogsPct: product.cogsPct,
      discountCapPct: DEFAULT_DISCOUNT_CAP_PCT,
      status: "active",
      // First deal a creator ever joins becomes their storefront hero by default.
      featured: !hasAnyActiveDeal,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");

  return { dealId: deal.id };
}

/** Pauses (does not delete) a self-joined or assigned deal — reversible, keeps order history intact. */
export async function leaveDeal(dealId: string) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "creator" || !viewer.creatorProfile) {
    throw new Error("Only a creator can manage their own deals.");
  }

  const deal = await prisma.creatorDeal.findUnique({ where: { id: dealId } });
  if (!deal || deal.creatorId !== viewer.creatorProfile.id) {
    throw new Error("Not your deal.");
  }

  await prisma.creatorDeal.update({ where: { id: dealId }, data: { status: "paused", featured: false } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}
