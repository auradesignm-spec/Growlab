"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { computeCreatorBalances, computeInstantPayoutFee, MIN_PAYOUT_OMR } from "@/lib/ledger/payouts";
import { creatorHasPayoutAccount } from "@/lib/ledger/account";

/**
 * Self-serve verification is closed. Merchants submit KYC; only ADMIN_CLERK_USER_IDS
 * can approve via adminSetMerchantVerification.
 */
export async function toggleMerchantVerification(_merchantProfileId: string) {
  throw new Error("Verification is admin-only. Submit KYC documents and wait for review.");
}

async function assertOwningCreator(creatorProfileId: string) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "creator" || viewer.creatorProfile?.id !== creatorProfileId) {
    throw new Error("Only the owning creator can request a payout for their own balance.");
  }
}

async function currentAvailableBalance(creatorProfileId: string) {
  const creator = await prisma.creatorProfile.findUniqueOrThrow({
    where: { id: creatorProfileId },
    include: {
      deals: { include: { orders: { include: { ledgerEntry: true } } } },
      payoutRequests: true,
    },
  });
  const orders = creator.deals.flatMap((d) => d.orders).filter((o) => o.ledgerEntry);
  return computeCreatorBalances(
    orders.map((o) => ({
      orderCreatedAt: o.createdAt,
      creatorShare: o.ledgerEntry!.creatorShare,
      holdbackAmount: o.ledgerEntry!.holdbackAmount,
      availableAmount: o.ledgerEntry!.availableAmount,
      holdbackDays: o.ledgerEntry!.holdbackDays,
      orderStatus: o.status,
      escrowStatus: o.escrowStatus,
      escrowReleasedAt: o.escrowReleasedAt,
    })),
    creator.payoutRequests.map((p) => ({ amount: p.amount, status: p.status }))
  );
}

/**
 * Instant payout — fee applies. Status stays requested until admin marks paid
 * after the bank transfer.
 */
export async function requestInstantPayout(creatorProfileId: string, amount: number) {
  await assertOwningCreator(creatorProfileId);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid payout amount.");
  if (amount < MIN_PAYOUT_OMR) throw new Error("BELOW_MIN_PAYOUT");

  const account = await prisma.creatorProfile.findUniqueOrThrow({
    where: { id: creatorProfileId },
    select: { bankName: true, accountName: true, accountNumber: true },
  });
  if (!creatorHasPayoutAccount(account)) throw new Error("PAYOUT_ACCOUNT_REQUIRED");

  const balances = await currentAvailableBalance(creatorProfileId);
  if (amount > balances.availableBalance) {
    throw new Error("Requested amount exceeds available (unheld) balance.");
  }

  const feeAmount = computeInstantPayoutFee(amount);

  await prisma.payoutRequest.create({
    data: {
      creatorId: creatorProfileId,
      type: "instant",
      amount,
      feeAmount,
      status: "requested",
    },
  });

  revalidatePath("/dashboard");
}

/** Scheduled payout — no fee, waits for the normal payout cycle; still bounded to availableBalance. */
export async function requestScheduledPayout(creatorProfileId: string, amount: number) {
  await assertOwningCreator(creatorProfileId);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid payout amount.");
  if (amount < MIN_PAYOUT_OMR) throw new Error("BELOW_MIN_PAYOUT");

  const account = await prisma.creatorProfile.findUniqueOrThrow({
    where: { id: creatorProfileId },
    select: { bankName: true, accountName: true, accountNumber: true },
  });
  if (!creatorHasPayoutAccount(account)) throw new Error("PAYOUT_ACCOUNT_REQUIRED");

  const balances = await currentAvailableBalance(creatorProfileId);
  if (amount > balances.availableBalance) {
    throw new Error("Requested amount exceeds available (unheld) balance.");
  }

  await prisma.payoutRequest.create({
    data: {
      creatorId: creatorProfileId,
      type: "scheduled",
      amount,
      feeAmount: 0,
      status: "requested",
    },
  });

  revalidatePath("/dashboard");
}

export async function saveCreatorPayoutAccount(
  creatorProfileId: string,
  input: { bankName: string; accountName: string; accountNumber: string }
) {
  await assertOwningCreator(creatorProfileId);
  const bankName = input.bankName.trim().slice(0, 80);
  const accountName = input.accountName.trim().slice(0, 80);
  const accountNumber = input.accountNumber.replace(/\s+/g, "").slice(0, 34);
  if (!creatorHasPayoutAccount({ bankName, accountName, accountNumber })) {
    throw new Error("PAYOUT_ACCOUNT_INVALID");
  }
  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: { bankName, accountName, accountNumber },
  });
  revalidatePath("/dashboard");
}
