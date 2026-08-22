"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  DEFAULT_SELF_SERVICE_DISCOUNT_CAP_PCT as DEFAULT_DISCOUNT_CAP_PCT,
  commissionToPoolSharePct,
} from "@/lib/domain/commission";
import { MAX_MARKETERS_PER_PRODUCT } from "@/lib/domain/deals";

export interface JoinDealResult {
  dealId: string;
  status: string;
}

async function assertOpenSeat(
  tx: Prisma.TransactionClient,
  productId: string,
  excludeDealId?: string
) {
  const openSeats = await tx.creatorDeal.count({
    where: {
      productId,
      status: { in: ["pending", "active"] },
      ...(excludeDealId ? { id: { not: excludeDealId } } : {}),
    },
  });
  if (openSeats >= MAX_MARKETERS_PER_PRODUCT) {
    throw new Error("This product has no remaining marketer seats.");
  }
}

/**
 * A creator applies to sell a merchant's product. The deal stays pending until
 * the merchant accepts — then the kit and tracked link land on the storefront.
 */
export async function joinDeal(productId: string): Promise<JoinDealResult> {
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

  const creatorId = viewer.creatorProfile.id;

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.creatorDeal.findFirst({
      where: { creatorId, productId },
      orderBy: { createdAt: "desc" },
    });
    if (existing && (existing.status === "active" || existing.status === "pending")) {
      return { dealId: existing.id, status: existing.status };
    }

    await assertOpenSeat(tx, productId);

    if (existing && (existing.status === "paused" || existing.status === "ended")) {
      const revived = await tx.creatorDeal.update({
        where: { id: existing.id },
        data: { status: "pending", featured: false },
      });
      return { dealId: revived.id, status: revived.status };
    }

    const deal = await tx.creatorDeal.create({
      data: {
        creatorId,
        productId,
        lockedUnitPrice: product.basePrice,
        lockedCommissionPct: commissionToPoolSharePct(product),
        lockedCogsPct: product.cogsPct,
        discountCapPct: DEFAULT_DISCOUNT_CAP_PCT,
        status: "pending",
        featured: false,
      },
    });
    return { dealId: deal.id, status: deal.status };
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
  return result;
}

/** Merchant accept/reject for a pending application. Accept transfers the kit to the storefront. */
export async function respondToDeal(dealId: string, accept: boolean) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only the owning merchant can respond to applications.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");

  const merchantId = viewer.merchantProfile.id;

  const creatorUsername = await prisma.$transaction(async (tx) => {
    const deal = await tx.creatorDeal.findUnique({
      where: { id: dealId },
      include: { product: true, creator: true },
    });
    if (!deal || deal.product.merchantId !== merchantId) {
      throw new Error("Not your deal.");
    }
    if (deal.status !== "pending") {
      throw new Error("This application is no longer waiting.");
    }

    if (!accept) {
      await tx.creatorDeal.update({ where: { id: dealId }, data: { status: "ended", featured: false } });
      return deal.creator.username;
    }

    await assertOpenSeat(tx, deal.productId, deal.id);

    const hasAnyActiveDeal = await tx.creatorDeal.findFirst({
      where: { creatorId: deal.creatorId, status: "active" },
    });

    await tx.creatorDeal.update({
      where: { id: dealId },
      data: { status: "active", featured: !hasAnyActiveDeal },
    });
    return deal.creator.username;
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
  revalidatePath(`/creator/${creatorUsername}`);
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
