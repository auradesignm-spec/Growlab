"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * First-run role claim for a freshly-provisioned Clerk-linked User
 * (role === "unassigned"). Creates the matching profile and locks the role.
 */
export async function claimRole(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("سجّل دخولك أولاً.");

  const role = String(formData.get("role") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (role !== "merchant" && role !== "creator") throw new Error("اختر تاجراً أو مسوّقاً.");
  if (!displayName) throw new Error("أدخل الاسم.");

  let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkUserId: userId, name: displayName, role: "unassigned" },
    });
  }
  if (user.role !== "unassigned") throw new Error("هذا الحساب له دور مسبقاً.");

  if (role === "merchant") {
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { role: "merchant" } }),
      prisma.merchantProfile.create({
        data: {
          userId: user.id,
          businessName: displayName,
          verificationStatus: "pending",
          wallet: { create: { balance: 0, currency: "OMR" } },
        },
      }),
    ]);
  } else {
    const username = slugify(displayName);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { role: "creator" } }),
      prisma.creatorProfile.create({
        data: { userId: user.id, username, tier: "NEW" },
      }),
    ]);
  }

  revalidatePath("/dashboard");
}

function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${suffix}` : `creator-${suffix}`;
}
