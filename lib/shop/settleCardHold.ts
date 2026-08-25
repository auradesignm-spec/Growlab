import { prisma } from "@/lib/db";
import { decideDeliveryHold } from "@/lib/domain/deliveryHold";

/** Apply the delivery-hold clock to card orders (idempotent). */
export async function settleDueCardHolds(now = new Date()): Promise<number> {
  try {
    return await settleDueCardHoldsInner(now);
  } catch (error) {
    console.warn("settleDueCardHolds skipped (schema not migrated yet)", error);
    return 0;
  }
}

async function settleDueCardHoldsInner(now = new Date()): Promise<number> {
  const rows = await prisma.order.findMany({
    where: { settlementChannel: "card", escrowStatus: "held" },
    select: {
      id: true,
      settlementChannel: true,
      escrowStatus: true,
      status: true,
      paidAt: true,
      deliveryDueAt: true,
      buyerRefundRequestedAt: true,
      buyerDeniedReceivedAt: true,
    },
  });

  let n = 0;
  for (const row of rows) {
    const decision = decideDeliveryHold({
      settlementChannel: row.settlementChannel,
      escrowStatus: row.escrowStatus,
      orderStatus: row.status,
      paidAt: row.paidAt,
      deliveryDueAt: row.deliveryDueAt,
      buyerRefundRequestedAt: row.buyerRefundRequestedAt,
      buyerDeniedReceivedAt: row.buyerDeniedReceivedAt,
      now,
    });
    if (decision === "hold") continue;
    if (decision === "refund_buyer") {
      await prisma.order.update({
        where: { id: row.id },
        data: {
          status: row.status === "returned" ? "returned" : "cancelled",
          escrowStatus: "refunded",
          escrowReleasedAt: null,
        },
      });
      n += 1;
      continue;
    }
    await prisma.order.update({
      where: { id: row.id },
      data: { escrowStatus: "released", escrowReleasedAt: now },
    });
    n += 1;
  }
  return n;
}
