import { prisma } from "@/lib/db";
import { shouldAutoConfirmReceive } from "@/lib/domain/deliveryAck";
import { applyOrderStatusTransition } from "@/lib/shop/orderTransition";

/** Buyer silent after merchant marked delivered → treat as received. */
export async function settleSilentReceiveAcks(now = new Date()): Promise<number> {
  try {
    return await settleSilentReceiveAcksInner(now);
  } catch (error) {
    console.warn("settleSilentReceiveAcks skipped (schema not migrated yet)", error);
    return 0;
  }
}

async function settleSilentReceiveAcksInner(now = new Date()): Promise<number> {
  const rows = await prisma.order.findMany({
    where: {
      status: "confirmed",
      merchantMarkedDeliveredAt: { not: null },
      buyerConfirmedReceivedAt: null,
      buyerDeniedReceivedAt: null,
    },
    select: {
      id: true,
      status: true,
      merchantMarkedDeliveredAt: true,
      buyerConfirmedReceivedAt: true,
      buyerDeniedReceivedAt: true,
    },
  });

  let n = 0;
  for (const row of rows) {
    if (!shouldAutoConfirmReceive({ ...row, now })) continue;
    await applyOrderStatusTransition(row.id, "fulfilled");
    n += 1;
  }
  return n;
}
