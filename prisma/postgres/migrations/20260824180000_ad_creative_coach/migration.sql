-- Ad Coach Wave A: creative analysis drafts with approval gate
CREATE TABLE "AdCreativeDraft" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "productId" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "originalHook" TEXT NOT NULL DEFAULT '',
    "originalCaption" TEXT NOT NULL DEFAULT '',
    "originalScript" TEXT NOT NULL DEFAULT '',
    "originalVisualHook" TEXT NOT NULL DEFAULT '',
    "analysisJson" TEXT NOT NULL DEFAULT '{}',
    "suggestedHook" TEXT NOT NULL DEFAULT '',
    "suggestedCaption" TEXT NOT NULL DEFAULT '',
    "suggestedScript" TEXT NOT NULL DEFAULT '',
    "suggestedVisualHook" TEXT NOT NULL DEFAULT '',
    "suggestedCta" TEXT NOT NULL DEFAULT '',
    "rationale" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdCreativeDraft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdCreativeDraft_merchantId_idx" ON "AdCreativeDraft"("merchantId");
CREATE INDEX "AdCreativeDraft_status_idx" ON "AdCreativeDraft"("status");
CREATE INDEX "AdCreativeDraft_createdAt_idx" ON "AdCreativeDraft"("createdAt");

ALTER TABLE "AdCreativeDraft" ADD CONSTRAINT "AdCreativeDraft_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
