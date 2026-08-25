-- Performance distribution loop: campaigns, share entitlements, content library, clip publishes, earns.

CREATE TABLE "PerformanceCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "budgetCap" REAL NOT NULL DEFAULT 0,
    "budgetSpent" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "visitRateSharer" REAL NOT NULL DEFAULT 0.08,
    "visitRateOrigin" REAL NOT NULL DEFAULT 0.12,
    "visitRateClipper" REAL NOT NULL DEFAULT 0.1,
    "purchasePctSharer" REAL NOT NULL DEFAULT 0.1,
    "purchasePctOrigin" REAL NOT NULL DEFAULT 0.15,
    "purchasePctClipper" REAL NOT NULL DEFAULT 0.1,
    "viewCpmOrigin" REAL NOT NULL DEFAULT 0,
    "viewCpmClipper" REAL NOT NULL DEFAULT 0,
    "originBonusPct" REAL NOT NULL DEFAULT 0.03,
    "ugcBrief" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PerformanceCampaign_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PerformanceCampaign_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PerformanceCampaign_productId_key" ON "PerformanceCampaign"("productId");
CREATE INDEX "PerformanceCampaign_merchantId_idx" ON "PerformanceCampaign"("merchantId");
CREATE INDEX "PerformanceCampaign_status_idx" ON "PerformanceCampaign"("status");

CREATE TABLE "ShareEntitlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "campaignId" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "claimToken" TEXT NOT NULL,
    "creatorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'eligible',
    "role" TEXT NOT NULL DEFAULT 'sharer',
    "expiresAt" DATETIME,
    "claimedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShareEntitlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShareEntitlement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShareEntitlement_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PerformanceCampaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ShareEntitlement_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ShareEntitlement_orderId_key" ON "ShareEntitlement"("orderId");
CREATE UNIQUE INDEX "ShareEntitlement_claimToken_key" ON "ShareEntitlement"("claimToken");
CREATE INDEX "ShareEntitlement_productId_idx" ON "ShareEntitlement"("productId");
CREATE INDEX "ShareEntitlement_buyerPhone_idx" ON "ShareEntitlement"("buyerPhone");
CREATE INDEX "ShareEntitlement_creatorId_idx" ON "ShareEntitlement"("creatorId");
CREATE INDEX "ShareEntitlement_campaignId_idx" ON "ShareEntitlement"("campaignId");
CREATE INDEX "ShareEntitlement_status_idx" ON "ShareEntitlement"("status");

CREATE TABLE "ContentAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "campaignId" TEXT,
    "originCreatorId" TEXT NOT NULL,
    "sampleRequestId" TEXT,
    "videoUrl" TEXT NOT NULL,
    "socialPostUrl" TEXT,
    "caption" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentAsset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentAsset_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PerformanceCampaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContentAsset_originCreatorId_fkey" FOREIGN KEY ("originCreatorId") REFERENCES "CreatorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentAsset_sampleRequestId_fkey" FOREIGN KEY ("sampleRequestId") REFERENCES "SampleRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ContentAsset_sampleRequestId_key" ON "ContentAsset"("sampleRequestId");
CREATE INDEX "ContentAsset_productId_idx" ON "ContentAsset"("productId");
CREATE INDEX "ContentAsset_campaignId_idx" ON "ContentAsset"("campaignId");
CREATE INDEX "ContentAsset_originCreatorId_idx" ON "ContentAsset"("originCreatorId");
CREATE INDEX "ContentAsset_status_idx" ON "ContentAsset"("status");

CREATE TABLE "ClipPublish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentAssetId" TEXT NOT NULL,
    "clipperId" TEXT NOT NULL,
    "dealId" TEXT,
    "socialPostUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClipPublish_contentAssetId_fkey" FOREIGN KEY ("contentAssetId") REFERENCES "ContentAsset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClipPublish_clipperId_fkey" FOREIGN KEY ("clipperId") REFERENCES "CreatorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClipPublish_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CreatorDeal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ClipPublish_contentAssetId_idx" ON "ClipPublish"("contentAssetId");
CREATE INDEX "ClipPublish_clipperId_idx" ON "ClipPublish"("clipperId");
CREATE INDEX "ClipPublish_dealId_idx" ON "ClipPublish"("dealId");

CREATE TABLE "PerformanceEarn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "orderId" TEXT,
    "visitId" TEXT,
    "contentAssetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceEarn_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PerformanceCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PerformanceEarn_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PerformanceEarn_contentAssetId_fkey" FOREIGN KEY ("contentAssetId") REFERENCES "ContentAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "PerformanceEarn_campaignId_idx" ON "PerformanceEarn"("campaignId");
CREATE INDEX "PerformanceEarn_creatorId_idx" ON "PerformanceEarn"("creatorId");
CREATE INDEX "PerformanceEarn_eventType_idx" ON "PerformanceEarn"("eventType");
CREATE INDEX "PerformanceEarn_orderId_idx" ON "PerformanceEarn"("orderId");
CREATE INDEX "PerformanceEarn_createdAt_idx" ON "PerformanceEarn"("createdAt");
