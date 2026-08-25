import { NextResponse } from "next/server";
import { ingestWhatsAppWebhookPayload } from "@/lib/meta/whatsapp";

export const runtime = "nodejs";

/** Meta webhook verification challenge. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN?.trim();

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Inbound WhatsApp messages (including CTWA referral on first message). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await ingestWhatsAppWebhookPayload(body);
    // Always 200 quickly so Meta does not retry-storm; log via processed count.
    return NextResponse.json({ ok: true, processed: result.processed });
  } catch (err) {
    console.error("[meta/whatsapp/webhook]", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
