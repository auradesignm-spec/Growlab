ALTER TABLE "Order" ADD COLUMN "merchantMarkedDeliveredAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "buyerConfirmedReceivedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "buyerDeniedReceivedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "receiveConfirmToken" TEXT NOT NULL DEFAULT '';
CREATE INDEX "Order_receiveConfirmToken_idx" ON "Order"("receiveConfirmToken");
