import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { metaConfigured, publicMetaClientConfig } from "@/lib/meta/config";
import {
  exchangeEmbeddedSignupCode,
  upsertMerchantMetaConnection,
  type EmbeddedSignupPayload,
} from "@/lib/meta/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(publicMetaClientConfig());
}

export async function POST(req: Request) {
  if (!metaConfigured()) {
    return NextResponse.json({ error: "Meta WhatsApp is not configured on this server." }, { status: 503 });
  }

  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    return NextResponse.json({ error: "Merchant only." }, { status: 401 });
  }
  if (viewer.accountStatus === "banned") {
    return NextResponse.json({ error: "Account suspended." }, { status: 403 });
  }
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Verify your merchant account first." }, { status: 403 });
  }

  let body: EmbeddedSignupPayload;
  try {
    body = (await req.json()) as EmbeddedSignupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const code = body.code?.trim();
  const wabaId = body.wabaId?.trim();
  const phoneNumberId = body.phoneNumberId?.trim();
  if (!code || !wabaId || !phoneNumberId) {
    return NextResponse.json(
      { error: "code, wabaId, and phoneNumberId are required from Embedded Signup." },
      { status: 400 },
    );
  }

  try {
    const accessToken = await exchangeEmbeddedSignupCode(code);
    const connection = await upsertMerchantMetaConnection(viewer.merchantProfile.id, {
      code,
      wabaId,
      phoneNumberId,
      businessId: body.businessId,
      pageId: body.pageId,
      accessToken,
    });

    return NextResponse.json({
      ok: true,
      connection: {
        id: connection.id,
        displayPhone: connection.displayPhone,
        phoneNumberId: connection.phoneNumberId,
        wabaId: connection.wabaId,
        status: connection.status,
        autoReplyEnabled: connection.autoReplyEnabled,
        autoReplyText: connection.autoReplyText,
        connectedAt: connection.connectedAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connect failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
