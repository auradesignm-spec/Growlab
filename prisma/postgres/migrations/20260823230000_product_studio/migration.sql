-- Product studio: structured attributes, features, and product-scoped promo.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "attributesJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "featuresJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "promoJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "promoEndsAt" TIMESTAMP(3);
