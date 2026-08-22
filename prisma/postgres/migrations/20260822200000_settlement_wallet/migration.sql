-- AlterTable
ALTER TABLE "Order" ADD COLUMN "settlementChannel" TEXT NOT NULL DEFAULT 'cod';

-- CreateTable
CREATE TABLE "MerchantWallet" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantWalletTxn" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantWalletTxn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantWallet_merchantId_key" ON "MerchantWallet"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantWalletTxn_walletId_idx" ON "MerchantWalletTxn"("walletId");

-- CreateIndex
CREATE INDEX "MerchantWalletTxn_orderId_idx" ON "MerchantWalletTxn"("orderId");

-- CreateIndex
CREATE INDEX "MerchantWalletTxn_reason_idx" ON "MerchantWalletTxn"("reason");

-- AddForeignKey
ALTER TABLE "MerchantWallet" ADD CONSTRAINT "MerchantWallet_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantWalletTxn" ADD CONSTRAINT "MerchantWalletTxn_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "MerchantWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
