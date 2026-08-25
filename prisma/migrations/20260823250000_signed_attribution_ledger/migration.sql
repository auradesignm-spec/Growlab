-- Signed attribution ledger (HMAC hash chain per order)
CREATE TABLE IF NOT EXISTS "AttributionChain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "receiptCode" TEXT NOT NULL,
    "tipHash" TEXT NOT NULL,
    "tipSeq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttributionChain_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "AttributionChain_orderId_key" ON "AttributionChain"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "AttributionChain_receiptCode_key" ON "AttributionChain"("receiptCode");
CREATE INDEX IF NOT EXISTS "AttributionChain_receiptCode_idx" ON "AttributionChain"("receiptCode");

CREATE TABLE IF NOT EXISTS "AttributionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "eventHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttributionEvent_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "AttributionChain" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "AttributionEvent_eventHash_key" ON "AttributionEvent"("eventHash");
CREATE UNIQUE INDEX IF NOT EXISTS "AttributionEvent_chainId_seq_key" ON "AttributionEvent"("chainId", "seq");
CREATE INDEX IF NOT EXISTS "AttributionEvent_chainId_idx" ON "AttributionEvent"("chainId");
CREATE INDEX IF NOT EXISTS "AttributionEvent_createdAt_idx" ON "AttributionEvent"("createdAt");
