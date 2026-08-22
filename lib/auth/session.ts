import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Real session resolution via Clerk. Replaces the dev-only cookie switcher
 * (lib/dev/session.ts, kept but no longer wired into the live dashboard).
 *
 * On first sign-in, a bare `User` row is auto-provisioned with role
 * "unassigned" and linked by `clerkUserId` — the dashboard then prompts the
 * user to choose merchant/creator before any profile exists.
 *
 * Admin-invited merchants: if Clerk's primary email matches `User.inviteEmail`
 * on a row that has no clerkUserId yet, that row is claimed instead of creating
 * a second account.
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { merchantProfile: true, creatorProfile: true },
  });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress?.trim().toLowerCase() ?? "";
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ").trim() ||
    email ||
    "عضو جديد";

  if (email) {
    const invited = await prisma.user.findFirst({
      where: { inviteEmail: email, clerkUserId: null },
      include: { merchantProfile: true, creatorProfile: true },
    });
    if (invited) {
      return prisma.user.update({
        where: { id: invited.id },
        data: { clerkUserId: userId, name: invited.name || name },
        include: { merchantProfile: true, creatorProfile: true },
      });
    }
  }

  return prisma.user.create({
    data: { clerkUserId: userId, name, role: "unassigned" },
    include: { merchantProfile: true, creatorProfile: true },
  });
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
