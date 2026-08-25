"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function requestWalletTopup(input: { amount: number; proofNote: string }) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can request a top-up.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");

  const amount = Math.round(Number(input.amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount < 5 || amount > 500) {
    throw new Error("Amount must be between 5 and 500 OMR.");
  }

  const proofNote = input.proofNote.trim().slice(0, 200);
  if (proofNote.length < 4) throw new Error("Enter your bank transfer reference.");

  const pending = await prisma.walletTopupRequest.count({
    where: { merchantId: viewer.merchantProfile.id, status: "pending" },
  });
  if (pending >= 3) throw new Error("You already have pending top-up requests.");

  await prisma.walletTopupRequest.create({
    data: {
      merchantId: viewer.merchantProfile.id,
      amount,
      proofNote,
    },
  });

  revalidatePath("/dashboard");
}

export async function loadWalletTopupRequests(merchantId: string) {
  return prisma.walletTopupRequest.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      amount: true,
      currency: true,
      proofNote: true,
      status: true,
      adminNote: true,
      createdAt: true,
      processedAt: true,
    },
  });
}
