-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "variants" TEXT NOT NULL DEFAULT '',
    "basePrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "cogsPct" REAL NOT NULL,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "commissionType" TEXT NOT NULL DEFAULT 'pct',
    "commissionValue" REAL NOT NULL DEFAULT 0.25,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("active", "basePrice", "category", "cogsPct", "createdAt", "currency", "id", "merchantId", "tags", "title", "variants") SELECT "active", "basePrice", "category", "cogsPct", "createdAt", "currency", "id", "merchantId", "tags", "title", "variants" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_merchantId_idx" ON "Product"("merchantId");
CREATE INDEX "Product_category_idx" ON "Product"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
