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
  const role = String(formData.get("role") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (role !== "merchant" && role !== "buyer" && role !== "creator") {
    throw new Error("Invalid demo role.");
  }

  const personas = await resolveDemoPersonas();
  let userId = role === "merchant" ? personas.merchantUserId : personas.buyerUserId;
  if (!userId) {
    // Fallback if needed
    const fallbackUser = await prisma.user.findFirst({
      where: role === "merchant" ? { role: "merchant" } : { role: "creator" },
    });
    userId = fallbackUser?.id ?? "";
  }

  if (!userId) {
    throw new Error("Demo data missing — please ensure seed data exists.");
  }

  // If email was provided, update/note the user email for realism
  if (email && email.includes("@")) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { inviteEmail: email },
      });
    } catch {
      // Ignore if read-only or unique constraint
    }
  }

  await setDemoViewer(userId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
  revalidatePath("/dashboard/store/edit");
  redirect(demoHomeForRole(role === "creator" ? "buyer" : role));
}

export async function startEmailDemoExperience(email: string, role: "merchant" | "buyer" | "creator" = "merchant") {
  const personas = await resolveDemoPersonas();
  let userId = role === "merchant" ? personas.merchantUserId : personas.buyerUserId;
  if (!userId) {
    const fallbackUser = await prisma.user.findFirst({
      where: role === "merchant" ? { role: "merchant" } : { role: "creator" },
    });
    userId = fallbackUser?.id ?? "";
  }

  if (userId) {
    if (email && email.includes("@")) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { inviteEmail: email.trim().toLowerCase() },
        });
      } catch {
        // Non-blocking
      }
    }
    await setDemoViewer(userId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/browse");
    revalidatePath("/dashboard/store/edit");
    return { success: true, redirectUrl: demoHomeForRole(role === "creator" ? "buyer" : role) };
  }
  return { success: false, error: "Demo user not found" };
}


export async function clearDemoExperience() {
  assertDemoHost();
  cookies().delete(DEV_VIEWER_COOKIE);
  redirect("/enter");
}
