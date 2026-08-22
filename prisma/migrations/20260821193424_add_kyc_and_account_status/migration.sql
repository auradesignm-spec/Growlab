-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KycDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreatorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'NEW',
    "bio" TEXT,
    "legalName" TEXT NOT NULL DEFAULT '',
    "verificationStatus" TEXT NOT NULL DEFAULT 'unsubmitted',
    "kycSubmittedAt" DATETIME,
    "kycReviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CreatorProfile" ("bio", "createdAt", "id", "tier", "userId", "username") SELECT "bio", "createdAt", "id", "tier", "userId", "username" FROM "CreatorProfile";
DROP TABLE "CreatorProfile";
ALTER TABLE "new_CreatorProfile" RENAME TO "CreatorProfile";
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");
CREATE UNIQUE INDEX "CreatorProfile_username_key" ON "CreatorProfile"("username");
CREATE TABLE "new_MerchantProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "commercialRegNo" TEXT NOT NULL DEFAULT '',
    "taxNumber" TEXT NOT NULL DEFAULT '',
    "ownerFullName" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "verificationStatus" TEXT NOT NULL DEFAULT 'unsubmitted',
    "kycSubmittedAt" DATETIME,
    "kycReviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MerchantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MerchantProfile" ("businessName", "createdAt", "id", "userId", "verificationStatus") SELECT "businessName", "createdAt", "id", "userId", "verificationStatus" FROM "MerchantProfile";
DROP TABLE "MerchantProfile";
ALTER TABLE "new_MerchantProfile" RENAME TO "MerchantProfile";
CREATE UNIQUE INDEX "MerchantProfile_userId_key" ON "MerchantProfile"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkUserId" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "accountStatus" TEXT NOT NULL DEFAULT 'active',
    "bannedAt" DATETIME,
    "banReason" TEXT,
    "inviteEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("clerkUserId", "createdAt", "id", "locale", "name", "role") SELECT "clerkUserId", "createdAt", "id", "locale", "name", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");
CREATE UNIQUE INDEX "User_inviteEmail_key" ON "User"("inviteEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "KycDocument_userId_idx" ON "KycDocument"("userId");

-- CreateIndex
CREATE INDEX "KycDocument_kind_idx" ON "KycDocument"("kind");
