"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { DEV_VIEWER_COOKIE } from "@/lib/dev/session";
import { isDevImpersonationEnabled, isLoopbackHost } from "@/lib/dev/guard";

/** Dev-only — sets the "viewing as" cookie. See lib/dev/session.ts. */
export async function setDevViewer(formData: FormData) {
  const host = headers().get("host")?.split(":")[0] ?? "";
  if (!isDevImpersonationEnabled() || !isLoopbackHost(host)) return;

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return;

  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) return;

  cookies().set(DEV_VIEWER_COOKIE, userId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}
