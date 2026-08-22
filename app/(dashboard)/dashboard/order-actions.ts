"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/auth/guards";
import { nextOrderStatuses, type OrderActionStatus } from "@/lib/domain/orders";
import { escrowPatchForStatus } from "@/lib/shop/escrow";

export async function merchantSetOrderStatus(orderId: string, status: OrderActionStatus) {
  const viewer = await requireVerifiedMerchant();
  const merchant = viewer.merchantProfile;
  if (!merchant) throw new Error("Only a merchant can do this.");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { deal: { include: { product: true } } },
  });
  if (!order || order.deal.product.merchantId !== merchant.id) {
    throw new Error("Order not found.");
  }

  const allowed = nextOrderStatuses(order.status);
  if (!allowed.includes(status)) {
    throw new Error(`Cannot move an order from ${order.status} to ${status}.`);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status, ...escrowPatchForStatus(status) },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
  if (order.trackingToken) revalidatePath(`/order/${order.trackingToken}`);
}
