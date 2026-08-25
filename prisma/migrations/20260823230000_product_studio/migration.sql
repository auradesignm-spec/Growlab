-- Product studio: structured attributes, features, and product-scoped promo.
ALTER TABLE "Product" ADD COLUMN "attributesJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Product" ADD COLUMN "featuresJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN "promoJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Product" ADD COLUMN "promoEndsAt" DATETIME;
