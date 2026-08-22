"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { ACCOUNT_STATUSES, ESCROW_STATUSES, PAYOUT_STATUSES, VERIFICATION_STATUSES, type AccountStatus, type EscrowStatus, type PayoutStatusId, type VerificationStatus } from "@/lib/domain/enums";
import type { OrderActionStatus } from "@/lib/domain/orders";
import { applyOrderStatusTransition } from "@/lib/shop/orderTransition";
import { creditMerchantWallet, ensureMerchantWallet } from "@/lib/ledger/wallet";
import { computeCreatorBalances } from "@/lib/ledger/payouts";
import { CONTACT_LEAK_WARNING_AR, generateShippingRef, scanForContactLeak } from "@/lib/security/antiLeak";
import { computeUgcDeadline } from "@/lib/domain/ugc";

async function requireAdmin() {
  const allowed = await isCurrentUserAdmin();
  if (!allowed) throw new Error("Admin access required.");
}

function revalidateAdmin() {
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}

export async function adminSetMerchantVerification(
  merchantProfileId: string,
  status: "pending" | "verified" | "rejected",
  note = ""
) {
  await requireAdmin();
  if (!VERIFICATION_STATUSES.includes(status)) throw new Error("Invalid status.");
  const kycReviewNote = note.trim().slice(0, 400);
  if (kycReviewNote && scanForContactLeak(kycReviewNote).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);

  await prisma.merchantProfile.update({
    where: { id: merchantProfileId },
    data: { verificationStatus: status, kycReviewNote: kycReviewNote || null },
  });
  revalidateAdmin();
}

export async function adminSetCreatorVerification(
  creatorProfileId: string,
  status: VerificationStatus,
  note = ""
) {
  await requireAdmin();
  if (status === "unsubmitted") throw new Error("Cannot reset to unsubmitted from here.");
  const kycReviewNote = note.trim().slice(0, 400);
  if (kycReviewNote && scanForContactLeak(kycReviewNote).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);

  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: { verificationStatus: status, kycReviewNote: kycReviewNote || null },
  });
  revalidateAdmin();
}

export async function adminSetAccountStatus(userId: string, status: AccountStatus, reason = "") {
  await requireAdmin();
  if (!ACCOUNT_STATUSES.includes(status)) throw new Error("Invalid account status.");
  const banReason = reason.trim().slice(0, 400);

  await prisma.user.update({
    where: { id: userId },
    data:
      status === "banned"
        ? { accountStatus: "banned", bannedAt: new Date(), banReason: banReason || "Suspended by admin." }
        : { accountStatus: "active", bannedAt: null, banReason: null },
  });
  revalidateAdmin();
}

export async function adminEditMerchant(
  merchantProfileId: string,
  input: { businessName: string; commercialRegNo: string; ownerFullName: string; city: string }
) {
  await requireAdmin();
  const businessName = input.businessName.trim().slice(0, 120);
  const commercialRegNo = input.commercialRegNo.trim().slice(0, 40);
  const ownerFullName = input.ownerFullName.trim().slice(0, 80);
  const city = input.city.trim().slice(0, 60);
  if (!businessName) throw new Error("Business name is required.");
  for (const field of [businessName, commercialRegNo, ownerFullName, city]) {
    if (field && scanForContactLeak(field).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);
  }

  await prisma.merchantProfile.update({
    where: { id: merchantProfileId },
    data: { businessName, commercialRegNo, ownerFullName, city },
  });
  revalidateAdmin();
}

export interface AdminCreateMerchantInput {
  businessName: string;
  commercialRegNo: string;
  ownerFullName: string;
  city: string;
  inviteEmail: string;
  verifyNow: boolean;
}

export async function adminCreateMerchant(input: AdminCreateMerchantInput) {
  await requireAdmin();
  const businessName = input.businessName.trim().slice(0, 120);
  const commercialRegNo = input.commercialRegNo.trim().slice(0, 40);
  const ownerFullName = input.ownerFullName.trim().slice(0, 80);
  const city = input.city.trim().slice(0, 60);
  const inviteEmail = input.inviteEmail.trim().toLowerCase();

  if (!businessName || !commercialRegNo || !ownerFullName || !city) {
    throw new Error("Fill every merchant identity field.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
    throw new Error("A valid invite email is required so the merchant can claim this account.");
  }

  const emailTaken = await prisma.user.findUnique({ where: { inviteEmail } });
  if (emailTaken) throw new Error("That invite email is already assigned.");

  await prisma.user.create({
    data: {
      name: ownerFullName,
      role: "merchant",
      inviteEmail,
      email: inviteEmail,
      merchantProfile: {
        create: {
          businessName,
          commercialRegNo,
          ownerFullName,
          city,
          verificationStatus: input.verifyNow ? "verified" : "pending",
          kycSubmittedAt: new Date(),
          wallet: { create: { balance: 0, currency: "OMR" } },
        },
      },
    },
  });

  revalidateAdmin();
}

export async function adminSetOrderStatus(orderId: string, status: OrderActionStatus) {
  await requireAdmin();
  const updated = await applyOrderStatusTransition(orderId, status);
  revalidateAdmin();
  if (updated.trackingToken) revalidatePath(`/order/${updated.trackingToken}`);
}

export async function adminCreditMerchantWallet(merchantProfileId: string, amount: number, note = "") {
  await requireAdmin();
  await ensureMerchantWallet(merchantProfileId);
  await creditMerchantWallet({
    merchantId: merchantProfileId,
    amount,
    reason: "topup",
    note: note.trim().slice(0, 200) || "شحن يدوي من الإدارة",
  });
  revalidateAdmin();
}

export async function adminSetEscrowStatus(orderId: string, escrowStatus: EscrowStatus) {
  await requireAdmin();
  if (!ESCROW_STATUSES.includes(escrowStatus)) throw new Error("Invalid escrow status.");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found.");
  if (escrowStatus === "released" && order.status !== "fulfilled") {
    throw new Error("Release escrow only after the merchant confirms collection.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      escrowStatus,
      escrowReleasedAt: escrowStatus === "released" ? new Date() : null,
    },
  });
  revalidateAdmin();
  if (order.trackingToken) revalidatePath(`/order/${order.trackingToken}`);
}

export async function adminRespondToSample(sampleRequestId: string, action: "approve" | "reject" | "ship") {
  await requireAdmin();

  const request = await prisma.sampleRequest.findUnique({ where: { id: sampleRequestId } });
  if (!request) throw new Error("Sample request not found.");

  if (action === "ship" && request.status !== "approved") {
    throw new Error("Approve the sample before marking it shipped.");
  }
  if (action !== "ship" && request.status !== "pending") {
    throw new Error("This request was already answered.");
  }

  const nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "shipped";
  const now = new Date();

  await prisma.sampleRequest.update({
    where: { id: sampleRequestId },
    data: {
      status: nextStatus,
      respondedAt: now,
      ...(action === "ship" ? { shippingRef: generateShippingRef(), ugcDeadline: computeUgcDeadline(now) } : {}),
      ...(action === "reject" ? { ugcStatus: "not_applicable" } : {}),
    },
  });
  revalidateAdmin();
}

export async function adminSetPayoutStatus(payoutId: string, status: PayoutStatusId) {
  await requireAdmin();
  if (!PAYOUT_STATUSES.includes(status) || status === "requested") {
    throw new Error("Invalid payout status.");
  }

  const payout = await prisma.payoutRequest.findUnique({ where: { id: payoutId } });
  if (!payout) throw new Error("Payout not found.");
  if (payout.status === "paid" || payout.status === "rejected") {
    throw new Error("This payout is already closed.");
  }
  if (payout.status === "approved" && status === "approved") {
    throw new Error("Already approved.");
  }

  if (status === "paid") {
    const creator = await prisma.creatorProfile.findUniqueOrThrow({
      where: { id: payout.creatorId },
      include: {
        deals: { include: { orders: { include: { ledgerEntry: true } } } },
        payoutRequests: true,
      },
    });
    const others = creator.payoutRequests
      .filter((row) => row.id !== payout.id)
      .map((row) => ({ amount: row.amount, status: row.status }));
    const balances = computeCreatorBalances(
      creator.deals.flatMap((deal) =>
        deal.orders
          .filter((order) => order.ledgerEntry)
          .map((order) => ({
            orderCreatedAt: order.createdAt,
            creatorShare: order.ledgerEntry!.creatorShare,
            holdbackAmount: order.ledgerEntry!.holdbackAmount,
            availableAmount: order.ledgerEntry!.availableAmount,
            holdbackDays: order.ledgerEntry!.holdbackDays,
            orderStatus: order.status,
            escrowStatus: order.escrowStatus,
            escrowReleasedAt: order.escrowReleasedAt,
          }))
      ),
      others
    );
    if (payout.amount > balances.availableBalance) {
      throw new Error("Payout exceeds the creator's remaining available balance.");
    }
  }

  await prisma.payoutRequest.update({
    where: { id: payoutId },
    data: {
      status,
      processedAt: status === "paid" || status === "rejected" ? new Date() : payout.processedAt,
    },
  });
  revalidateAdmin();
}

export async function adminEditCreator(creatorProfileId: string, input: { username: string; legalName: string }) {
  await requireAdmin();
  const legalName = input.legalName.trim().slice(0, 80);
  const username = input.username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!username) throw new Error("Username is required.");
  if (legalName && scanForContactLeak(legalName).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);
  if (scanForContactLeak(username).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);

  const clash = await prisma.creatorProfile.findFirst({
    where: { username, NOT: { id: creatorProfileId } },
  });
  if (clash) throw new Error("That username is already taken.");

  const existing = await prisma.creatorProfile.findUnique({ where: { id: creatorProfileId } });
  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: { username, legalName },
  });
  if (existing) revalidatePath(`/creator/${existing.username}`);
  revalidatePath(`/creator/${username}`);
  revalidateAdmin();
}

export async function adminSetProductActive(productId: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { active } });
  revalidateAdmin();
}
