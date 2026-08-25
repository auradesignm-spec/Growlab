import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { computeShareExpiry, initialRoleAfterClaim } from "@/lib/domain/share";

type Db = Prisma.TransactionClient | typeof import("@/lib/db").prisma;

function newClaimToken(): string {
  return randomBytes(24).toString("hex");
}

/**
 * Right after checkout every buyer gets a claimable share link.
 * Reel / view earn still waits for merchant approval — see content-actions.
 */
export async function grantShareEntitlementOnPurchase(input: {
  orderId: string;
  productId: string;
  buyerName: string;
  buyerPhone: string;
  orderedAt?: Date;
  db: Db;
}) {
  const existing = await input.db.shareEntitlement.findUnique({
    where: { orderId: input.orderId },
    select: { id: true, claimToken: true },
  });
  if (existing) return existing;

  const campaign = await input.db.performanceCampaign.findUnique({
    where: { productId: input.productId },
    select: { id: true },
  });

  const orderedAt = input.orderedAt ?? new Date();

  return input.db.shareEntitlement.create({
    data: {
      orderId: input.orderId,
      productId: input.productId,
      campaignId: campaign?.id ?? null,
      buyerName: input.buyerName,
      buyerPhone: input.buyerPhone,
      claimToken: newClaimToken(),
      status: "eligible",
      role: initialRoleAfterClaim(),
      expiresAt: computeShareExpiry(orderedAt),
    },
  });
}

/** @deprecated Use grantShareEntitlementOnPurchase — kept for idempotent backfill. */
export async function grantShareEntitlementOnFulfill(input: {
  orderId: string;
  productId: string;
  buyerName: string;
  buyerPhone: string;
  fulfilledAt?: Date;
  db: Db;
}) {
  return grantShareEntitlementOnPurchase({
    orderId: input.orderId,
    productId: input.productId,
    buyerName: input.buyerName,
    buyerPhone: input.buyerPhone,
    orderedAt: input.fulfilledAt,
    db: input.db,
  });
}
