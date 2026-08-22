import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { DEV_VIEWER_COOKIE, getCurrentDevUser } from "@/lib/dev/session";
import { isDevImpersonationEnabled } from "@/lib/dev/guard";

/**
 * Real session resolution via Clerk. Local impersonation of seeded users is
 * gated by isDevImpersonationEnabled() — never NODE_ENV alone.
 */
export async function getCurrentUser() {
  if (isDevImpersonationEnabled()) {
    const cookieUid = cookies().get(DEV_VIEWER_COOKIE)?.value;
    if (cookieUid) {
      const impersonated = await prisma.user.findUnique({
        where: { id: cookieUid },
        include: { merchantProfile: true, creatorProfile: true },
      });
      if (impersonated) return impersonated;
    }
  }

  const { userId } = await auth();
  if (!userId) {
    if (isDevImpersonationEnabled()) return getCurrentDevUser();
    return null;
  }

  const existing = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { merchantProfile: true, creatorProfile: true },
  });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress?.trim().toLowerCase() ?? "";

  if (existing) {
    if (email && (!existing.email || !existing.firstName || !existing.lastName)) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          email: existing.email || email,
          firstName: existing.firstName || clerkUser?.firstName?.trim() || "",
          lastName: existing.lastName || clerkUser?.lastName?.trim() || "",
        },
        include: { merchantProfile: true, creatorProfile: true },
      });
    }
    return existing;
  }
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
        data: {
          clerkUserId: userId,
          name: invited.name || name,
          email: invited.email || email,
          firstName: invited.firstName || clerkUser?.firstName?.trim() || "",
          lastName: invited.lastName || clerkUser?.lastName?.trim() || "",
        },
        include: { merchantProfile: true, creatorProfile: true },
      });
    }
  }

  return prisma.user.create({
    data: {
      clerkUserId: userId,
      name,
      role: "unassigned",
      email,
      firstName: clerkUser?.firstName?.trim() ?? "",
      lastName: clerkUser?.lastName?.trim() ?? "",
    },
    include: { merchantProfile: true, creatorProfile: true },
  });
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
