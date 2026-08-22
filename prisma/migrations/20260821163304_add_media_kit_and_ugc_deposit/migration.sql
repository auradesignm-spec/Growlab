-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaAsset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SampleRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    "shippingRef" TEXT,
    "depositAmount" REAL,
    "depositCurrency" TEXT,
    "ugcDeadline" DATETIME,
    "ugcVideoUrl" TEXT,
    "ugcSubmittedAt" DATETIME,
    "ugcStatus" TEXT NOT NULL DEFAULT 'not_applicable',
    CONSTRAINT "SampleRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleRequest_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SampleRequest" ("createdAt", "creatorId", "id", "merchantId", "note", "productId", "respondedAt", "shippingRef", "status") SELECT "createdAt", "creatorId", "id", "merchantId", "note", "productId", "respondedAt", "shippingRef", "status" FROM "SampleRequest";
DROP TABLE "SampleRequest";
ALTER TABLE "new_SampleRequest" RENAME TO "SampleRequest";
CREATE INDEX "SampleRequest_creatorId_idx" ON "SampleRequest"("creatorId");
CREATE INDEX "SampleRequest_merchantId_idx" ON "SampleRequest"("merchantId");
CREATE INDEX "SampleRequest_productId_idx" ON "SampleRequest"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "MediaAsset_productId_idx" ON "MediaAsset"("productId");
