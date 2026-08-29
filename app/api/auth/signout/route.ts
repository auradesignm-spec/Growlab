import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEV_VIEWER_COOKIE } from "@/lib/dev/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const cookieStore = cookies();
  // Clear dev impersonation cookie if present
  try {
    cookieStore.delete(DEV_VIEWER_COOKIE);
  } catch (_) {}

  return NextResponse.json({ success: true });
}
