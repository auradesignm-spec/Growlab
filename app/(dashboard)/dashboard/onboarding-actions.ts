"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * First-run role claim — public registration is merchant-only.
 * Buyer marketers are provisioned via share claim after purchase.
 * Starts as unsubmitted so MerchantKycForm can collect documents.
 */
export async function claimRole(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("سجّل دخولك أولاً.");

  const role = String(formData.get("role") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (role !== "merchant") throw new Error("التسجيل متاح للتجار فقط.");
  if (!displayName) throw new Error("أدخل اسم المتجر أو النشاط.");

  let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkUserId: userId, name: displayName, role: "unassigned" },
    });
  }
  if (user.role !== "unassigned") throw new Error("هذا الحساب له دور مسبقاً.");

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { role: "merchant" } }),
    prisma.merchantProfile.create({
      data: {
        userId: user.id,
        businessName: displayName,
        verificationStatus: "unsubmitted",
        wallet: { create: { balance: 0, currency: "OMR" } },
      },
    }),
  ]);

  revalidatePath("/dashboard");
  // KYC first — store wizard opens after verified (or admin approve).
  redirect("/dashboard");
}
