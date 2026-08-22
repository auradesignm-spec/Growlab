-- Buyer checkout, tracking, and logical COD escrow on Order.

ALTER TABLE "Order" ADD COLUMN "buyerAddress" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "buyerCity" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "variantLabel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "trackingToken" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "escrowStatus" TEXT NOT NULL DEFAULT 'held';
ALTER TABLE "Order" ADD COLUMN "escrowReleasedAt" DATETIME;

CREATE INDEX "Order_trackingToken_idx" ON "Order"("trackingToken");
CREATE INDEX "Order_escrowStatus_idx" ON "Order"("escrowStatus");
