/**
 * Merchant commission wallet — the cash loop the ledger was missing.
 *
 * COD cash lands with the merchant on delivery. Creator commission + the 6%
 * platform fee are pulled from this pre-funded wallet when collection is
 * confirmed (fulfilled). Confirming an order only checks the float; it does
 * not debit. A return after collection credits the wallet back.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { settlementObligation } from "@/lib/ledger/waterfall";
import type { WalletTxnReason, WalletTxnType } from "@/lib/domain/enums";

export const WALLET_SHORT_AR =
  "رصيد المحفظة لا يكفي لتغطية عمولة المسوّق و6٪ للمنصة. اشحن المحفظة ثم أكّد.";

export const WALLET_SETTLE_SHORT_AR =
  "رصيد المحفظة لا يكفي لتأكيد التحصيل وصرف العمولة. اشحن المحفظة أولاً.";

type Db = Prisma.TransactionClient | typeof prisma;

export interface WalletSnapshot {
  walletId: string;
  merchantId: string;
  balance: number;
  reserved: number;
  available: number;
  currency: string;
}

export interface SettlementLine {
  creatorShare: number;
  platformShare: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function ensureMerchantWallet(merchantId: string, db: Db = prisma) {
  const existing = await db.merchantWallet.findUnique({ where: { merchantId } });
  if (existing) return existing;
  return db.merchantWallet.create({
    data: { merchantId, balance: 0, currency: "OMR" },
  });
}

async function reservedForMerchant(merchantId: string, db: Db, exceptOrderId?: string): Promise<number> {
  const orders = await db.order.findMany({
    where: {
      status: "confirmed",
      deal: { product: { merchantId } },
      ...(exceptOrderId ? { id: { not: exceptOrderId } } : {}),
    },
    include: { ledgerEntry: true },
  });

  return round2(
    orders.reduce((sum, order) => {
      if (!order.ledgerEntry) return sum;
      return sum + settlementObligation(order.ledgerEntry);
    }, 0)
  );
}

export async function getWalletSnapshot(merchantId: string, db: Db = prisma): Promise<WalletSnapshot> {
  const wallet = await ensureMerchantWallet(merchantId, db);
  const reserved = await reservedForMerchant(merchantId, db);
  return {
    walletId: wallet.id,
    merchantId,
    balance: round2(wallet.balance),
    reserved,
    available: round2(wallet.balance - reserved),
    currency: wallet.currency,
  };
}

export async function assertWalletCanConfirm(
  merchantId: string,
  line: SettlementLine,
  db: Db = prisma
): Promise<WalletSnapshot> {
  const snapshot = await getWalletSnapshot(merchantId, db);
  const need = settlementObligation(line);
  if (snapshot.available + 1e-9 < need) {
    throw new Error(WALLET_SHORT_AR);
  }
  return snapshot;
}

async function writeTxn(
  db: Db,
  input: {
    walletId: string;
    type: WalletTxnType;
    reason: WalletTxnReason;
    amount: number;
    balanceAfter: number;
    orderId?: string | null;
    note?: string | null;
    createdBy?: string | null;
  }
) {
  return db.merchantWalletTxn.create({
    data: {
      walletId: input.walletId,
      type: input.type,
      reason: input.reason,
      amount: round2(input.amount),
      balanceAfter: round2(input.balanceAfter),
      orderId: input.orderId ?? null,
      note: input.note ?? null,
      createdBy: input.createdBy ?? null,
    },
  });
}

export async function creditMerchantWallet(input: {
  merchantId: string;
  amount: number;
  reason: Extract<WalletTxnReason, "topup" | "admin_adjust" | "order_reversal">;
  note?: string;
  createdBy?: string;
  orderId?: string;
}) {
  const amount = round2(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("أدخل مبلغ شحن أكبر من صفر.");
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await ensureMerchantWallet(input.merchantId, tx);
    const balanceAfter = round2(wallet.balance + amount);
    await tx.merchantWallet.update({
      where: { id: wallet.id },
      data: { balance: balanceAfter },
    });
    await writeTxn(tx, {
      walletId: wallet.id,
      type: "credit",
      reason: input.reason,
      amount,
      balanceAfter,
      orderId: input.orderId,
      note: input.note,
      createdBy: input.createdBy,
    });
    return balanceAfter;
  });
}

export async function settleOrderOnFulfill(input: {
  merchantId: string;
  orderId: string;
  line: SettlementLine;
  db: Prisma.TransactionClient;
}) {
  const amount = settlementObligation(input.line);
  if (amount <= 0) return;

  const already = await input.db.merchantWalletTxn.findFirst({
    where: { orderId: input.orderId, reason: "order_settlement" },
  });
  if (already) return;

  const wallet = await ensureMerchantWallet(input.merchantId, input.db);
  if (wallet.balance + 1e-9 < amount) {
    throw new Error(WALLET_SETTLE_SHORT_AR);
  }

  const balanceAfter = round2(wallet.balance - amount);
  await input.db.merchantWallet.update({
    where: { id: wallet.id },
    data: { balance: balanceAfter },
  });
  await writeTxn(input.db, {
    walletId: wallet.id,
    type: "debit",
    reason: "order_settlement",
    amount,
    balanceAfter,
    orderId: input.orderId,
  });
}

/** Debit merchant float for a performance-campaign earn (share / reel views). */
export async function debitPerformanceSpend(input: {
  merchantId: string;
  amount: number;
  earnId: string;
  note?: string;
  db?: Db;
}) {
  const db = input.db ?? prisma;
  const amount = round2(input.amount);
  if (amount <= 0) return;

  const already = await db.merchantWalletTxn.findFirst({
    where: { note: { startsWith: `perf:${input.earnId}` }, reason: "performance_spend" },
  });
  if (already) return;

  const wallet = await ensureMerchantWallet(input.merchantId, db);
  if (wallet.balance + 1e-9 < amount) {
    throw new Error(WALLET_SETTLE_SHORT_AR);
  }

  const balanceAfter = round2(wallet.balance - amount);
  await db.merchantWallet.update({
    where: { id: wallet.id },
    data: { balance: balanceAfter },
  });
  await writeTxn(db, {
    walletId: wallet.id,
    type: "debit",
    reason: "performance_spend",
    amount,
    balanceAfter,
    note: `perf:${input.earnId}${input.note ? ` ${input.note}` : ""}`.slice(0, 200),
  });
}

export async function reverseOrderSettlement(input: {
  merchantId: string;
  orderId: string;
  line: SettlementLine;
  db: Prisma.TransactionClient;
}) {
  const settled = await input.db.merchantWalletTxn.findFirst({
    where: { orderId: input.orderId, reason: "order_settlement" },
  });
  if (!settled) return;

  const already = await input.db.merchantWalletTxn.findFirst({
    where: { orderId: input.orderId, reason: "order_reversal" },
  });
  if (already) return;

  const amount = settlementObligation(input.line);
  if (amount <= 0) return;

  const wallet = await ensureMerchantWallet(input.merchantId, input.db);
  const balanceAfter = round2(wallet.balance + amount);
  await input.db.merchantWallet.update({
    where: { id: wallet.id },
    data: { balance: balanceAfter },
  });
  await writeTxn(input.db, {
    walletId: wallet.id,
    type: "credit",
    reason: "order_reversal",
    amount,
    balanceAfter,
    orderId: input.orderId,
    note: "إرجاع بعد التحصيل",
  });
}
