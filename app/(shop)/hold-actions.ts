"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { canBuyerRequestRefund } from "@/lib/domain/deliveryHold";

export async function requestDeliveryHoldRefund(trackingTokenRaw: string) {
  const trackingToken = trackingTokenRaw.trim();
  if (!trackingToken) throw new Error("الطلب غير موجود.");

  const orders = await prisma.order.findMany({ where: { trackingToken } });
  if (orders.length === 0) throw new Error("الطلب غير موجود.");

  const now = new Date();
  let any = false;
  for (const order of orders) {
    if (
      !canBuyerRequestRefund({
        settlementChannel: order.settlementChannel,
        escrowStatus: order.escrowStatus,
        orderStatus: order.status,
        paidAt: order.paidAt,
        deliveryDueAt: order.deliveryDueAt,
        buyerRefundRequestedAt: order.buyerRefundRequestedAt,
        now,
      })
    ) {
      continue;
    }
    await prisma.order.update({
      where: { id: order.id },
      data: {
        buyerRefundRequestedAt: now,
        status: "cancelled",
        escrowStatus: "refunded",
        escrowReleasedAt: null,
      },
    });
    any = true;
  }
  if (!any) {
    throw new Error("لا يمكن طلب الاسترجاع الآن — إما المهلة ما انتهت، أو المبلغ لم يعد محتجزاً.");
  }
  revalidatePath(`/order/${trackingToken}`);
}
