-- Strict reel-view attestation progress on ContentAsset
ALTER TABLE "ContentAsset" ADD COLUMN "lastPaidViewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ContentAsset" ADD COLUMN "lastViewReportAt" DATETIME;
ALTER TABLE "ContentAsset" ADD COLUMN "viewReportsToday" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ContentAsset" ADD COLUMN "viewReportDayKey" TEXT NOT NULL DEFAULT '';
