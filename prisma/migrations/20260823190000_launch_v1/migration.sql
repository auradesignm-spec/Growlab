-- Launch v1: referrer attribution + wallet top-up requests
ALTER TABLE "Order" ADD COLUMN "referrerCreatorId" TEXT;
CREATE INDEX "Order_referrerCreatorId_idx" ON "Order"("referrerCreatorId");

CREATE TABLE "WalletTopupRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "proofNote" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "WalletTopupRequest_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "WalletTopupRequest_merchantId_idx" ON "WalletTopupRequest"("merchantId");
CREATE INDEX "WalletTopupRequest_status_idx" ON "WalletTopupRequest"("status");
CREATE INDEX "WalletTopupRequest_createdAt_idx" ON "WalletTopupRequest"("createdAt");
