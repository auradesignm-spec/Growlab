"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { DEV_VIEWER_COOKIE } from "@/lib/dev/session";

/** Dev-only — sets the "viewing as" cookie. See lib/dev/session.ts. */
export async function setDevViewer(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  cookies().set(DEV_VIEWER_COOKIE, userId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  revalidatePath("/dashboard");
}
