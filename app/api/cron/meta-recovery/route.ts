import { NextResponse } from "next/server";
import { processDueRecoveryFollowUps } from "@/lib/meta/recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim() || process.env.META_RECOVERY_CRON_SECRET?.trim();
  if (!secret) {
    // Allow local/dev without secret only on loopback.
    const host = req.headers.get("host") ?? "";
    return host.startsWith("localhost") || host.startsWith("127.0.0.1");
  }
  const header = req.headers.get("authorization")?.trim() ?? "";
  return header === `Bearer ${secret}`;
}

/** Cron: send due WhatsApp recovery nudges (+1h / +6h / +24h). */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await processDueRecoveryFollowUps(50);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Recovery cron failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
