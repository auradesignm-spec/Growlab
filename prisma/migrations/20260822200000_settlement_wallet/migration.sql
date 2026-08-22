-- AlterTable
ALTER TABLE "Order" ADD COLUMN "settlementChannel" TEXT NOT NULL DEFAULT 'cod';

-- CreateTable
CREATE TABLE "MerchantWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MerchantWallet_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MerchantWalletTxn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "balanceAfter" REAL NOT NULL,
    "orderId" TEXT,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MerchantWalletTxn_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "MerchantWallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantWallet_merchantId_key" ON "MerchantWallet"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantWalletTxn_walletId_idx" ON "MerchantWalletTxn"("walletId");

-- CreateIndex
CREATE INDEX "MerchantWalletTxn_orderId_idx" ON "MerchantWalletTxn"("orderId");

-- CreateIndex
CREATE INDEX "MerchantWalletTxn_reason_idx" ON "MerchantWalletTxn"("reason");
