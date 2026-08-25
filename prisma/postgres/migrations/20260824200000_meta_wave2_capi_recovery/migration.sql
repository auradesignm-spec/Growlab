-- Wave 2: CTWA CAPI dataset + recovery follow-ups on InterestLead
ALTER TABLE "MetaConnection" ADD COLUMN "datasetId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "MetaConnection" ADD COLUMN "recoveryEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "MetaConnection" ADD COLUMN "recoveryText1h" TEXT NOT NULL DEFAULT 'هل ما زلت مهتم؟ للطلب اكتب: نعم';
ALTER TABLE "MetaConnection" ADD COLUMN "recoveryText6h" TEXT NOT NULL DEFAULT 'باقي كمية محدودة. للدفع عند الاستلام اكتب: نعم';
ALTER TABLE "MetaConnection" ADD COLUMN "recoveryText24h" TEXT NOT NULL DEFAULT 'آخر تذكير — نقدر نجهّز طلبك COD. اكتب: نعم';

ALTER TABLE "InterestLead" ADD COLUMN "followUpStep" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "InterestLead" ADD COLUMN "nextFollowUpAt" TIMESTAMP(3);
ALTER TABLE "InterestLead" ADD COLUMN "capiLeadAt" TIMESTAMP(3);
ALTER TABLE "InterestLead" ADD COLUMN "capiPurchaseAt" TIMESTAMP(3);
ALTER TABLE "InterestLead" ADD COLUMN "linkedOrderId" TEXT;

CREATE INDEX "InterestLead_nextFollowUpAt_idx" ON "InterestLead"("nextFollowUpAt");
