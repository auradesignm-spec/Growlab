-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN "bankName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CreatorProfile" ADD COLUMN "accountName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CreatorProfile" ADD COLUMN "accountNumber" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "shippingRef" TEXT;

-- CreateTable
CREATE TABLE "ContactLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "biz" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "msg" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ContactLead_createdAt_idx" ON "ContactLead"("createdAt");

-- CreateTable
CREATE TABLE "StorefrontVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "dealId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StorefrontVisit_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CreatorDeal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StorefrontVisit_username_idx" ON "StorefrontVisit"("username");

-- CreateIndex
CREATE INDEX "StorefrontVisit_dealId_idx" ON "StorefrontVisit"("dealId");

-- CreateIndex
CREATE INDEX "StorefrontVisit_createdAt_idx" ON "StorefrontVisit"("createdAt");
