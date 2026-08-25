"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { clientIpFromHeaders, consumeRateLimit } from "@/lib/shop/rateLimit";
import { applyOrderStatusTransition } from "@/lib/shop/orderTransition";

async function loadLiveToken(tokenRaw: string) {
  const token = tokenRaw.trim();
  if (token.length < 16) return null;
  return prisma.order.findFirst({
    where: { receiveConfirmToken: token },
    include: { deal: { include: { product: true } } },
  });
}

export async function buyerAnswerReceive(tokenRaw: string, received: boolean) {
  const ip = clientIpFromHeaders(headers());
  if (!consumeRateLimit(`recv:${ip}`, 20, 60 * 60 * 1000)) {
    throw new Error("محاولات كثيرة. حاول لاحقاً.");
  }

  const order = await loadLiveToken(tokenRaw);
  if (!order) throw new Error("هذا الرابط منتهٍ أو غير صالح.");
  if (order.status !== "confirmed" || !order.merchantMarkedDeliveredAt) {
    throw new Error("لا يمكن تأكيد هذا الطلب الآن.");
  }
  if (order.buyerConfirmedReceivedAt || order.buyerDeniedReceivedAt) {
    throw new Error("تم تسجيل إجابة سابقة.");
  }

  const now = new Date();
  if (received) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        buyerConfirmedReceivedAt: now,
        buyerDeniedReceivedAt: null,
        receiveConfirmToken: "",
      },
    });
    await applyOrderStatusTransition(order.id, "fulfilled");
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        buyerDeniedReceivedAt: now,
        receiveConfirmToken: "",
      },
    });
  }

  revalidatePath("/dashboard");
  if (order.trackingToken) revalidatePath(`/order/${order.trackingToken}`);
  return { trackingToken: order.trackingToken };
}
