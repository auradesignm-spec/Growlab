-- Merchant subscription plan (free / pro)
ALTER TABLE "MerchantProfile" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "MerchantProfile" ADD COLUMN "planSource" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "MerchantProfile" ADD COLUMN "planExpiresAt" DATETIME;
ALTER TABLE "MerchantProfile" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "MerchantProfile" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "MerchantProfile" ADD COLUMN "adminPlanNote" TEXT;

CREATE INDEX "MerchantProfile_plan_idx" ON "MerchantProfile"("plan");
