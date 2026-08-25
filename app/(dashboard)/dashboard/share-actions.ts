"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s()-]/g, "");
}

function slugifyBuyer(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${suffix}` : `buyer-${suffix}`;
}

/**
 * Buyer → marketer happens here after purchase, not via public role signup.
 * Unassigned signed-in users get a creator profile automatically on claim.
 */
async function resolveBuyerMarketer() {
  const viewer = await getCurrentUser();
  if (!viewer) return null;
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");

  if (viewer.role === "creator" && viewer.creatorProfile) {
    return viewer.creatorProfile;
  }

  if (viewer.role === "merchant") {
    throw new Error("حساب التاجر لا يفعّل رابط المشتري. استخدم حساب المشتري أو سجّل دخولاً جديداً.");
  }

  if (viewer.role !== "unassigned") {
    throw new Error("Sign in to claim your share link.");
  }

  const username = slugifyBuyer(viewer.firstName || viewer.name || "buyer");
  const [, profile] = await prisma.$transaction([
    prisma.user.update({
      where: { id: viewer.id },
      data: { role: "creator" },
    }),
    prisma.creatorProfile.create({
      data: {
        userId: viewer.id,
        username,
        tier: "NEW",
        legalName: [viewer.firstName, viewer.lastName].filter(Boolean).join(" ") || viewer.name,
        verificationStatus: "verified",
        kycSubmittedAt: new Date(),
      },
    }),
  ]);

  return profile;
}

export async function claimShareEntitlement(claimToken: string, phone: string) {
  const creator = await resolveBuyerMarketer();
  if (!creator) {
    throw new Error("سجّل دخولك أولاً لتفعيل رابط المشاركة بعد الشراء.");
  }

  const token = claimToken.trim();
  const buyerPhone = normalizePhone(phone);
  if (!token || buyerPhone.length < 8) throw new Error("Enter the phone number used for the order.");

  const entitlement = await prisma.shareEntitlement.findUnique({
    where: { claimToken: token },
  });
  if (!entitlement) throw new Error("Share link not found.");
  if (entitlement.status === "expired" || (entitlement.expiresAt && entitlement.expiresAt.getTime() < Date.now())) {
    if (entitlement.status !== "expired") {
      await prisma.shareEntitlement.update({
        where: { id: entitlement.id },
        data: { status: "expired" },
      });
    }
    throw new Error("انتهت صلاحية رابط المشاركة.");
  }
  if (entitlement.status === "claimed" && entitlement.creatorId !== creator.id) {
    throw new Error("This share link was already claimed.");
  }
  if (normalizePhone(entitlement.buyerPhone) !== buyerPhone) {
    throw new Error("Phone number does not match this order.");
  }

  await prisma.shareEntitlement.update({
    where: { id: entitlement.id },
    data: {
      status: "claimed",
      creatorId: creator.id,
      claimedAt: new Date(),
    },
  });

  revalidatePath(`/share/${token}`);
  revalidatePath("/dashboard/browse");
}
