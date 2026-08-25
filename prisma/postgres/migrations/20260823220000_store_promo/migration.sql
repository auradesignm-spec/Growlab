-- Structured merchant store promotions (rules + optional end time).
ALTER TABLE "MerchantStore" ADD COLUMN IF NOT EXISTS "promoJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "MerchantStore" ADD COLUMN IF NOT EXISTS "offerEndsAt" TIMESTAMP(3);
