-- Meta Connect wave 1: WhatsApp Embedded Signup + InterestLead bank
CREATE TABLE "MetaConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "wabaId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "displayPhone" TEXT NOT NULL DEFAULT '',
    "accessTokenEnc" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT '',
    "pageId" TEXT NOT NULL DEFAULT '',
    "autoReplyText" TEXT NOT NULL DEFAULT 'حياك في متجرنا. السعر والدفع عند الاستلام. للتأكيد اكتب: نعم',
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastError" TEXT NOT NULL DEFAULT '',
    "connectedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetaConnection_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MetaConnection_merchantId_key" ON "MetaConnection"("merchantId");
CREATE UNIQUE INDEX "MetaConnection_phoneNumberId_key" ON "MetaConnection"("phoneNumberId");
CREATE INDEX "MetaConnection_wabaId_idx" ON "MetaConnection"("wabaId");
CREATE INDEX "MetaConnection_status_idx" ON "MetaConnection"("status");

CREATE TABLE "InterestLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "productId" TEXT,
    "campaignId" TEXT,
    "ctwaClid" TEXT,
    "metaAdId" TEXT NOT NULL DEFAULT '',
    "metaAdsetId" TEXT NOT NULL DEFAULT '',
    "metaCampaignId" TEXT NOT NULL DEFAULT '',
    "referralJson" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'new',
    "lastMessagePreview" TEXT NOT NULL DEFAULT '',
    "lastInboundAt" DATETIME,
    "lastOutboundAt" DATETIME,
    "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
    "lastWaMessageId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterestLead_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "InterestLead_merchantId_phone_key" ON "InterestLead"("merchantId", "phone");
CREATE INDEX "InterestLead_merchantId_idx" ON "InterestLead"("merchantId");
CREATE INDEX "InterestLead_status_idx" ON "InterestLead"("status");
CREATE INDEX "InterestLead_ctwaClid_idx" ON "InterestLead"("ctwaClid");
CREATE INDEX "InterestLead_lastInboundAt_idx" ON "InterestLead"("lastInboundAt");
