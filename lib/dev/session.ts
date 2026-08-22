import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Dev-only "viewing as" account switcher. NOT real authentication — there is
 * no password, token, or session security here, just a cookie holding a
 * seeded user id so both dashboards are demoable locally. Real auth
 * (NextAuth/Clerk/phone OTP/etc.) is an explicit open decision, not built here.
 */
export const DEV_VIEWER_COOKIE = "gl_dev_uid";

export async function getCurrentDevUser() {
  const cookieUid = cookies().get(DEV_VIEWER_COOKIE)?.value;

  if (cookieUid) {
    const user = await prisma.user.findUnique({
      where: { id: cookieUid },
      include: { merchantProfile: true, creatorProfile: true },
    });
    if (user) return user;
  }

  // Fall back to the first seeded merchant so the dashboard is never empty
  // on a fresh clone before anyone has picked a viewer.
  return prisma.user.findFirst({
    where: { role: "merchant" },
    include: { merchantProfile: true, creatorProfile: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function listDevUsers() {
  return prisma.user.findMany({
    include: { merchantProfile: true, creatorProfile: true },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}
