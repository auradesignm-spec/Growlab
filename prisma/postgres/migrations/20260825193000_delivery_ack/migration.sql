ALTER TABLE "Order" ADD COLUMN "merchantMarkedDeliveredAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "buyerConfirmedReceivedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "buyerDeniedReceivedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "receiveConfirmToken" TEXT NOT NULL DEFAULT '';
CREATE INDEX "Order_receiveConfirmToken_idx" ON "Order"("receiveConfirmToken");
