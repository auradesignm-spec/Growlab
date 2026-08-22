-- CreateTable
CREATE TABLE "SampleRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    CONSTRAINT "SampleRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleRequest_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SampleRequest_creatorId_idx" ON "SampleRequest"("creatorId");

-- CreateIndex
CREATE INDEX "SampleRequest_merchantId_idx" ON "SampleRequest"("merchantId");

-- CreateIndex
CREATE INDEX "SampleRequest_productId_idx" ON "SampleRequest"("productId");
