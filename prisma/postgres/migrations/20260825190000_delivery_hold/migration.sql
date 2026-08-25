-- Prepaid delivery hold: product SLA + order clock + buyer refund flag.

ALTER TABLE "Product" ADD COLUMN "deliveryDaysMax" INTEGER NOT NULL DEFAULT 4;
ALTER TABLE "Order" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "deliveryDueAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "buyerRefundRequestedAt" TIMESTAMP(3);
