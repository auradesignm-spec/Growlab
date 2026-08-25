import { prisma } from "@/lib/db";
import { nextOrderStatuses, type OrderActionStatus } from "@/lib/domain/orders";
import { escrowPatchForStatus } from "@/lib/shop/escrow";
import { assertWalletCanConfirm, reverseOrderSettlement, settleOrderOnFulfill } from "@/lib/ledger/wallet";
import { recordPurchasePerformanceForOrder } from "@/lib/performance/recordEarn";
import { recordStatusAttribution } from "@/lib/ledger/attribution";
import { firePurchaseForCollectedOrder } from "@/lib/meta/capi";

export async function applyOrderStatusTransition(orderId: string, status: OrderActionStatus) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      ledgerEntry: true,
      deal: { include: { product: true } },
    },
  });
  if (!order) throw new Error("الطلب غير موجود.");

  const allowed = nextOrderStatuses(order.status);
  if (!allowed.includes(status)) {
    throw new Error(`لا يمكن نقل الطلب من ${order.status} إلى ${status}.`);
  }

  const merchantId = order.deal.product.merchantId;
  const line = order.ledgerEntry
    ? { creatorShare: order.ledgerEntry.creatorShare, platformShare: order.ledgerEntry.platformShare }
    : { creatorShare: 0, platformShare: 0 };

  if (status === "confirmed" && order.ledgerEntry) {
    await assertWalletCanConfirm(merchantId, line);
  }

  const fromStatus = order.status;
  const escrowPatch = escrowPatchForStatus(status);

  await prisma.$transaction(async (tx) => {
    if (status === "fulfilled" && order.ledgerEntry) {
      await settleOrderOnFulfill({ merchantId, orderId: order.id, line, db: tx });
    }
    if (status === "returned" && order.status === "fulfilled" && order.ledgerEntry) {
      await reverseOrderSettlement({ merchantId, orderId: order.id, line, db: tx });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status, ...escrowPatch },
    });

    await recordStatusAttribution({
      orderId: order.id,
      fromStatus,
      toStatus: status,
      escrowStatus: escrowPatch.escrowStatus ?? order.escrowStatus,
      db: tx,
    });

    if (status === "fulfilled" && order.ledgerEntry) {
      await recordPurchasePerformanceForOrder({
        orderId: order.id,
        productId: order.deal.productId,
        referrerCreatorId: order.referrerCreatorId,
        attributedGmv: order.ledgerEntry.attributedGmv,
        buyerPhone: order.buyerPhone,
        db: tx,
      });
    }
  });

  // Outside the transaction — CAPI must not roll back ledger on Meta failures.
  if (status === "fulfilled") {
    void firePurchaseForCollectedOrder(orderId);
  }

  return order;
}
