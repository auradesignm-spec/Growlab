-- Product source URL for import-from-merchant-site flow.
ALTER TABLE "Product" ADD COLUMN "sourceUrl" TEXT NOT NULL DEFAULT '';
