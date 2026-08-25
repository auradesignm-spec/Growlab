-- Structured merchant store promotions (rules + optional end time).
ALTER TABLE "MerchantStore" ADD COLUMN "promoJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "MerchantStore" ADD COLUMN "offerEndsAt" DATETIME;
