"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DEV_VIEWER_COOKIE } from "@/lib/dev/session";
import { demoHomeForRole, resolveDemoPersonas } from "@/lib/dev/demo";
import { isDemoExperienceEnabled, isLoopbackHost } from "@/lib/dev/guard";

function assertDemoHost() {
  const host = headers().get("host")?.split(":")[0] ?? "";
  if (!isDemoExperienceEnabled() || !isLoopbackHost(host)) {
    throw new Error("Demo mode is only available on localhost in development.");
  }
}

async function setDemoViewer(userId: string) {
  cookies().set(DEV_VIEWER_COOKIE, userId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });
}

/** Dev-only — sets the "viewing as" cookie. See lib/dev/session.ts. */
export async function setDevViewer(formData: FormData) {
  assertDemoHost();
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return;

  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) return;

  await setDemoViewer(userId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}

export async function startDemoExperience(formData: FormData) {
  assertDemoHost();
  const role = String(formData.get("role") ?? "").trim();
  if (role !== "merchant" && role !== "buyer") throw new Error("Invalid demo role.");

  const personas = await resolveDemoPersonas();
  const userId = role === "merchant" ? personas.merchantUserId : personas.buyerUserId;
  if (!userId) {
    throw new Error("Demo data missing — run npm run db:seed.");
  }

  await setDemoViewer(userId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
  revalidatePath("/dashboard/store/edit");
  redirect(demoHomeForRole(role));
}

export async function clearDemoExperience() {
  assertDemoHost();
  cookies().delete(DEV_VIEWER_COOKIE);
  redirect("/enter");
}
