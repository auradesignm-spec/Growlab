-- Merchant-owned customizable storefront + rich product pages.

CREATE TABLE "MerchantStore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "aboutHtml" TEXT NOT NULL DEFAULT '',
    "themeJson" TEXT NOT NULL DEFAULT '{}',
    "offerHeadline" TEXT NOT NULL DEFAULT '',
    "offerBody" TEXT NOT NULL DEFAULT '',
    "offerActive" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "heroProductId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MerchantStore_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MerchantStore_merchantId_key" ON "MerchantStore"("merchantId");
CREATE UNIQUE INDEX "MerchantStore_slug_key" ON "MerchantStore"("slug");
CREATE INDEX "MerchantStore_published_idx" ON "MerchantStore"("published");

ALTER TABLE "Product" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "shortDescription" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "descriptionHtml" TEXT NOT NULL DEFAULT '';
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

ALTER TABLE "CreatorDeal" ADD COLUMN "dealChannel" TEXT NOT NULL DEFAULT 'creator';
