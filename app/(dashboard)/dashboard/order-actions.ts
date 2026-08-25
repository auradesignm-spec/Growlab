"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/auth/guards";
import type { OrderActionStatus } from "@/lib/domain/orders";
import { applyOrderStatusTransition } from "@/lib/shop/orderTransition";
import { canMerchantMarkDelivered, mintReceiveConfirmToken } from "@/lib/domain/deliveryAck";

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

  if (status === "fulfilled") {
    if (order.status === "fulfilled") return;
    if (!canMerchantMarkDelivered({ status: order.status, buyerRefundRequestedAt: order.buyerRefundRequestedAt })) {
      throw new Error("أكّد الطلب للشحن أولاً قبل ضغط تم التسليم.");
    }
    const token = mintReceiveConfirmToken();
    await prisma.order.update({
      where: { id: order.id },
      data: {
        merchantMarkedDeliveredAt: new Date(),
        buyerDeniedReceivedAt: null,
        receiveConfirmToken: token,
      },
    });
    revalidatePath("/dashboard");
    if (order.trackingToken) revalidatePath(`/order/${order.trackingToken}`);
    return;
  }

  const updated = await applyOrderStatusTransition(orderId, status);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
  if (updated.trackingToken) revalidatePath(`/order/${updated.trackingToken}`);
}

export async function merchantSetShippingRef(orderId: string, shippingRef: string) {
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

  const ref = shippingRef.trim().slice(0, 80);
  await prisma.order.update({
    where: { id: orderId },
    data: { shippingRef: ref || null },
  });
  revalidatePath("/dashboard");
  if (order.trackingToken) revalidatePath(`/order/${order.trackingToken}`);
}
