-- Wave C: Meta Marketing API ad account + CTWA Advantage+ launches
CREATE TABLE "MetaAdAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "adAccountId" TEXT NOT NULL,
    "adAccountName" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "currencyOffset" INTEGER NOT NULL DEFAULT 1000,
    "pageId" TEXT NOT NULL DEFAULT '',
    "accessTokenEnc" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastError" TEXT NOT NULL DEFAULT '',
    "connectedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetaAdAccount_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MetaAdAccount_merchantId_key" ON "MetaAdAccount"("merchantId");
CREATE INDEX "MetaAdAccount_adAccountId_idx" ON "MetaAdAccount"("adAccountId");
CREATE INDEX "MetaAdAccount_status_idx" ON "MetaAdAccount"("status");

CREATE TABLE "MetaAdLaunch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "draftId" TEXT,
    "productId" TEXT,
    "metaCampaignId" TEXT NOT NULL DEFAULT '',
    "metaAdsetId" TEXT NOT NULL DEFAULT '',
    "metaAdId" TEXT NOT NULL DEFAULT '',
    "metaCreativeId" TEXT NOT NULL DEFAULT '',
    "imageHash" TEXT NOT NULL DEFAULT '',
    "dailyBudgetOmr" REAL NOT NULL,
    "dailyBudgetMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "countries" TEXT NOT NULL DEFAULT 'OM',
    "placementsMode" TEXT NOT NULL DEFAULT 'advantage',
    "objective" TEXT NOT NULL DEFAULT 'OUTCOME_ENGAGEMENT',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "primaryText" TEXT NOT NULL DEFAULT '',
    "headline" TEXT NOT NULL DEFAULT '',
    "ctaType" TEXT NOT NULL DEFAULT 'WHATSAPP_MESSAGE',
    "status" TEXT NOT NULL DEFAULT 'creating',
    "lastError" TEXT NOT NULL DEFAULT '',
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "launchedAt" DATETIME,
    "pausedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MetaAdLaunch_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MetaAdLaunch_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "AdCreativeDraft" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "MetaAdLaunch_merchantId_idx" ON "MetaAdLaunch"("merchantId");
CREATE INDEX "MetaAdLaunch_draftId_idx" ON "MetaAdLaunch"("draftId");
CREATE INDEX "MetaAdLaunch_status_idx" ON "MetaAdLaunch"("status");
CREATE INDEX "MetaAdLaunch_createdAt_idx" ON "MetaAdLaunch"("createdAt");
