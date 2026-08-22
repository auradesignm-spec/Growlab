-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MerchantProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MerchantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'NEW',
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "variants" TEXT NOT NULL DEFAULT '',
    "basePrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "cogsPct" REAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreatorDeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lockedUnitPrice" REAL NOT NULL,
    "lockedCommissionPct" REAL NOT NULL,
    "lockedCogsPct" REAL NOT NULL,
    "discountCapPct" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorDeal_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CreatorDeal_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dealId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCharged" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "attributionSource" TEXT NOT NULL DEFAULT 'creator_link',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CreatorDeal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "attributedGmv" REAL NOT NULL,
    "returnsReserve" REAL NOT NULL,
    "netAttributedSales" REAL NOT NULL,
    "paymentFee" REAL NOT NULL,
    "cogs" REAL NOT NULL,
    "adSpendAllocated" REAL NOT NULL,
    "contributionPool" REAL NOT NULL,
    "creatorFloorAmount" REAL NOT NULL,
    "creatorProfitShare" REAL NOT NULL,
    "creatorShare" REAL NOT NULL,
    "merchantShare" REAL NOT NULL,
    "platformShare" REAL NOT NULL,
    "holdbackAmount" REAL NOT NULL,
    "availableAmount" REAL NOT NULL,
    "holdbackDays" INTEGER NOT NULL,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LedgerEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dealId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unfunded',
    "availableBalance" REAL NOT NULL DEFAULT 0,
    "dailyCap" REAL NOT NULL,
    "dealCap" REAL NOT NULL,
    "lifetimeSpent" REAL NOT NULL DEFAULT 0,
    "merKillThreshold" REAL NOT NULL DEFAULT 2.5,
    "merKillConsecutiveDays" INTEGER NOT NULL DEFAULT 3,
    "autoPauseFlag" BOOLEAN NOT NULL DEFAULT false,
    "autoPauseReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdWallet_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CreatorDeal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdWallet_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdSpendEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "spentAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual_ops',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdSpendEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "AdWallet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdSpendAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spendEntryId" TEXT NOT NULL,
    "orderId" TEXT,
    "dealId" TEXT NOT NULL,
    "allocatedAmount" REAL NOT NULL,
    CONSTRAINT "AdSpendAllocation_spendEntryId_fkey" FOREIGN KEY ("spendEntryId") REFERENCES "AdSpendEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdSpendAllocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MerDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "netAttributedSales" REAL NOT NULL,
    "adSpend" REAL NOT NULL,
    "mer" REAL NOT NULL,
    "belowThreshold" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MerDay_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "AdWallet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "feeAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "PayoutRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantProfile_userId_key" ON "MerchantProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_username_key" ON "CreatorProfile"("username");

-- CreateIndex
CREATE INDEX "Product_merchantId_idx" ON "Product"("merchantId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "CreatorDeal_creatorId_idx" ON "CreatorDeal"("creatorId");

-- CreateIndex
CREATE INDEX "CreatorDeal_productId_idx" ON "CreatorDeal"("productId");

-- CreateIndex
CREATE INDEX "Order_dealId_idx" ON "Order"("dealId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_orderId_key" ON "LedgerEntry"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "AdWallet_dealId_key" ON "AdWallet"("dealId");

-- CreateIndex
CREATE INDEX "AdWallet_merchantId_idx" ON "AdWallet"("merchantId");

-- CreateIndex
CREATE INDEX "AdSpendEntry_walletId_idx" ON "AdSpendEntry"("walletId");

-- CreateIndex
CREATE INDEX "AdSpendAllocation_spendEntryId_idx" ON "AdSpendAllocation"("spendEntryId");

-- CreateIndex
CREATE INDEX "AdSpendAllocation_dealId_idx" ON "AdSpendAllocation"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "MerDay_walletId_date_key" ON "MerDay"("walletId", "date");

-- CreateIndex
CREATE INDEX "PayoutRequest_creatorId_idx" ON "PayoutRequest"("creatorId");
