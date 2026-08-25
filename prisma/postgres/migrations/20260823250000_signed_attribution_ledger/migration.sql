-- Signed attribution ledger (HMAC hash chain per order)
CREATE TABLE IF NOT EXISTS "AttributionChain" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "receiptCode" TEXT NOT NULL,
    "tipHash" TEXT NOT NULL,
    "tipSeq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AttributionChain_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AttributionChain_orderId_key" ON "AttributionChain"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "AttributionChain_receiptCode_key" ON "AttributionChain"("receiptCode");
CREATE INDEX IF NOT EXISTS "AttributionChain_receiptCode_idx" ON "AttributionChain"("receiptCode");

ALTER TABLE "AttributionChain" ADD CONSTRAINT "AttributionChain_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Align referrer column if missing on older Postgres deployments
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "referrerCreatorId" TEXT;
CREATE INDEX IF NOT EXISTS "Order_referrerCreatorId_idx" ON "Order"("referrerCreatorId");

CREATE TABLE IF NOT EXISTS "AttributionEvent" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "eventHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttributionEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AttributionEvent_eventHash_key" ON "AttributionEvent"("eventHash");
CREATE UNIQUE INDEX IF NOT EXISTS "AttributionEvent_chainId_seq_key" ON "AttributionEvent"("chainId", "seq");
CREATE INDEX IF NOT EXISTS "AttributionEvent_chainId_idx" ON "AttributionEvent"("chainId");
CREATE INDEX IF NOT EXISTS "AttributionEvent_createdAt_idx" ON "AttributionEvent"("createdAt");

ALTER TABLE "AttributionEvent" ADD CONSTRAINT "AttributionEvent_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "AttributionChain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
