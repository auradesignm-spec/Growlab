/**
 * Signed attribution ledger — append-only hash chain per order.
 * Not a public blockchain: HMAC-signed events Growlab (and merchants) can verify.
 */

import { createHmac, createHash, randomBytes, timingSafeEqual } from "crypto";
import type { Prisma } from "@prisma/client";

export const ATTRIBUTION_GENESIS = "0".repeat(64);

export type AttributionEventType =
  | "order_placed"
  | "attribution_bound"
  | "share_granted"
  | "status_changed"
  | "earn_recorded";

type Db = Prisma.TransactionClient | typeof import("@/lib/db").prisma;

export type AttributionPayload = Record<string, string | number | boolean | null>;

export interface AttributionEventView {
  seq: number;
  eventType: string;
  payload: AttributionPayload;
  prevHash: string;
  eventHash: string;
  signature: string;
  createdAt: string;
}

export interface AttributionReceiptView {
  receiptCode: string;
  orderId: string;
  tipHash: string;
  tipSeq: number;
  chainValid: boolean;
  signaturesValid: boolean;
  events: AttributionEventView[];
}

function signingSecret(): string {
  const explicit = process.env.ATTRIBUTION_SIGNING_SECRET?.trim();
  if (explicit) return explicit;
  const clerk = process.env.CLERK_SECRET_KEY?.trim();
  if (clerk) return `growlab-attr:${clerk}`;
  return "growlab-attr-dev-only";
}

/** Stable JSON for hashing — sorted keys, no whitespace drift. */
export function canonicalizePayload(payload: AttributionPayload): string {
  const keys = Object.keys(payload).sort();
  const sorted: AttributionPayload = {};
  for (const key of keys) sorted[key] = payload[key] ?? null;
  return JSON.stringify(sorted);
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function hmacHex(message: string): string {
  return createHmac("sha256", signingSecret()).update(message, "utf8").digest("hex");
}

export function computeEventHash(
  prevHash: string,
  eventType: string,
  payloadJson: string,
  createdAtIso: string
): string {
  return sha256Hex(`${prevHash}\n${eventType}\n${payloadJson}\n${createdAtIso}`);
}

export function signEventHash(eventHash: string): string {
  return hmacHex(eventHash);
}

export function verifyEventSignature(eventHash: string, signature: string): boolean {
  const expected = signEventHash(eventHash);
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function newReceiptCode(): string {
  return `gl_${randomBytes(10).toString("hex")}`;
}

/** Mask phone for public receipts — keep last 4 digits only. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `***${digits.slice(-4)}`;
}

export async function ensureAttributionChain(orderId: string, db: Db) {
  const existing = await db.attributionChain.findUnique({ where: { orderId } });
  if (existing) return existing;

  return db.attributionChain.create({
    data: {
      orderId,
      receiptCode: newReceiptCode(),
      tipHash: ATTRIBUTION_GENESIS,
      tipSeq: 0,
    },
  });
}

export async function appendAttributionEvent(input: {
  orderId: string;
  eventType: AttributionEventType;
  payload: AttributionPayload;
  db: Db;
  at?: Date;
}): Promise<{ receiptCode: string; eventHash: string; seq: number }> {
  const chain = await ensureAttributionChain(input.orderId, input.db);
  const createdAt = input.at ?? new Date();
  const createdAtIso = createdAt.toISOString();
  const payloadJson = canonicalizePayload(input.payload);
  const prevHash = chain.tipHash;
  const seq = chain.tipSeq + 1;
  const eventHash = computeEventHash(prevHash, input.eventType, payloadJson, createdAtIso);
  const signature = signEventHash(eventHash);

  await input.db.attributionEvent.create({
    data: {
      chainId: chain.id,
      seq,
      eventType: input.eventType,
      payloadJson,
      prevHash,
      eventHash,
      signature,
      createdAt,
    },
  });

  await input.db.attributionChain.update({
    where: { id: chain.id },
    data: { tipHash: eventHash, tipSeq: seq },
  });

  return { receiptCode: chain.receiptCode, eventHash, seq };
}

/** Record order placement + optional first-touch attribution + share grant. */
export async function sealOrderAttribution(input: {
  orderId: string;
  productId: string;
  dealId: string;
  attributionSource: string;
  referrerCreatorId: string | null;
  attributedGmv: number;
  currency: string;
  quantity: number;
  unitPriceCharged: number;
  buyerPhone: string;
  shareClaimToken?: string | null;
  db: Db;
}) {
  await appendAttributionEvent({
    orderId: input.orderId,
    eventType: "order_placed",
    payload: {
      productId: input.productId,
      dealId: input.dealId,
      attributionSource: input.attributionSource,
      attributedGmv: input.attributedGmv,
      currency: input.currency,
      quantity: input.quantity,
      unitPriceCharged: input.unitPriceCharged,
      buyerPhoneMask: maskPhone(input.buyerPhone),
    },
    db: input.db,
  });

  if (input.referrerCreatorId) {
    await appendAttributionEvent({
      orderId: input.orderId,
      eventType: "attribution_bound",
      payload: {
        referrerCreatorId: input.referrerCreatorId,
        rule: "first_touch_ref",
      },
      db: input.db,
    });
  }

  if (input.shareClaimToken) {
    await appendAttributionEvent({
      orderId: input.orderId,
      eventType: "share_granted",
      payload: {
        claimTokenPrefix: input.shareClaimToken.slice(0, 8),
        role: "sharer",
      },
      db: input.db,
    });
  }
}

export async function recordStatusAttribution(input: {
  orderId: string;
  fromStatus: string;
  toStatus: string;
  escrowStatus?: string | null;
  db: Db;
}) {
  return appendAttributionEvent({
    orderId: input.orderId,
    eventType: "status_changed",
    payload: {
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      escrowStatus: input.escrowStatus ?? null,
    },
    db: input.db,
  });
}

export async function recordEarnAttribution(input: {
  orderId: string;
  creatorId: string;
  role: string;
  eventType: string;
  amount: number;
  currency: string;
  db: Db;
}) {
  return appendAttributionEvent({
    orderId: input.orderId,
    eventType: "earn_recorded",
    payload: {
      creatorId: input.creatorId,
      role: input.role,
      earnEventType: input.eventType,
      amount: input.amount,
      currency: input.currency,
    },
    db: input.db,
  });
}

function parsePayload(raw: string): AttributionPayload {
  try {
    const parsed = JSON.parse(raw) as AttributionPayload;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function verifyChainEvents(
  events: Array<{
    seq: number;
    eventType: string;
    payloadJson: string;
    prevHash: string;
    eventHash: string;
    signature: string;
    createdAt: Date;
  }>
): { chainValid: boolean; signaturesValid: boolean } {
  let prev = ATTRIBUTION_GENESIS;
  let chainValid = true;
  let signaturesValid = true;

  const sorted = [...events].sort((a, b) => a.seq - b.seq);
  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];
    if (ev.seq !== i + 1) chainValid = false;
    if (ev.prevHash !== prev) chainValid = false;
    const expectedHash = computeEventHash(
      ev.prevHash,
      ev.eventType,
      ev.payloadJson,
      ev.createdAt.toISOString()
    );
    if (expectedHash !== ev.eventHash) chainValid = false;
    if (!verifyEventSignature(ev.eventHash, ev.signature)) signaturesValid = false;
    prev = ev.eventHash;
  }

  return { chainValid, signaturesValid };
}

export async function getAttributionReceiptByCode(
  codeRaw: string,
  db: Db
): Promise<AttributionReceiptView | null> {
  const receiptCode = codeRaw.trim();
  if (!receiptCode) return null;

  const chain =
    (await db.attributionChain.findUnique({ where: { receiptCode } })) ??
    (await db.attributionChain.findUnique({ where: { orderId: receiptCode } }));
  if (!chain) return null;
  return loadReceiptView(chain, db);
}

export async function getAttributionReceiptByOrderId(
  orderId: string,
  db: Db
): Promise<AttributionReceiptView | null> {
  const chain = await db.attributionChain.findUnique({ where: { orderId } });
  if (!chain) return null;
  return loadReceiptView(chain, db);
}

async function loadReceiptView(
  chain: { id: string; orderId: string; receiptCode: string; tipHash: string; tipSeq: number },
  db: Db
): Promise<AttributionReceiptView> {
  const events = await db.attributionEvent.findMany({
    where: { chainId: chain.id },
    orderBy: { seq: "asc" },
  });

  const { chainValid, signaturesValid } = verifyChainEvents(events);
  const tipOk = events.length === 0 || events[events.length - 1]?.eventHash === chain.tipHash;

  return {
    receiptCode: chain.receiptCode,
    orderId: chain.orderId,
    tipHash: chain.tipHash,
    tipSeq: chain.tipSeq,
    chainValid: chainValid && tipOk,
    signaturesValid,
    events: events.map((ev) => ({
      seq: ev.seq,
      eventType: ev.eventType,
      payload: parsePayload(ev.payloadJson),
      prevHash: ev.prevHash,
      eventHash: ev.eventHash,
      signature: ev.signature,
      createdAt: ev.createdAt.toISOString(),
    })),
  };
}
