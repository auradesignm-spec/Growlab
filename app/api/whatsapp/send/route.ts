import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_INFOBIP_API_KEY =
  process.env.INFOBIP_API_KEY || "b9a2ac1b7e039099892b0defa7cd9e58-f1cf66c8-86db-472a-b22d-196f982d1825";
const DEFAULT_INFOBIP_BASE_URL =
  process.env.INFOBIP_BASE_URL || "https://pdv3ge.api.infobip.com";
const DEFAULT_INFOBIP_SENDER =
  process.env.INFOBIP_SENDER_NUMBER || "447860088970";

export async function GET() {
  return NextResponse.json({ status: "active", endpoint: "/api/whatsapp/send" });
}

export async function POST(req: NextRequest) {
  try {
    const {
      to,
      from,
      message,
      type = "text",
      templateName = "test_whatsapp_template_en",
      placeholders = ["qusay"],
      language = "en",
      apiKey,
      baseUrl,
    } = await req.json();

    if (!to) {
      return NextResponse.json({ error: "Missing recipient phone number ('to')" }, { status: 400 });
    }

    const cleanTo = to.replace(/[\s\+\-\(\)]/g, "");
    const cleanFrom = (from || DEFAULT_INFOBIP_SENDER).replace(/[\s\+\-\(\)]/g, "");
    const activeApiKey = apiKey || DEFAULT_INFOBIP_API_KEY;
    const activeBaseUrl = (baseUrl || DEFAULT_INFOBIP_BASE_URL).replace(/\/+$/, "");

    const authHeader = activeApiKey.startsWith("App ") ? activeApiKey : `App ${activeApiKey}`;

    let endpoint = "";
    let payload: any = {};

    if (type === "template") {
      endpoint = `${activeBaseUrl}/whatsapp/1/message/template`;
      payload = {
        messages: [
          {
            from: cleanFrom,
            to: cleanTo,
            messageId: `msg_${Date.now()}`,
            content: {
              templateName: templateName,
              templateData: {
                body: {
                  placeholders: placeholders || ["عميلنا العزيز"],
                },
              },
              language: language || "en",
            },
          },
        ],
      };
    } else {
      endpoint = `${activeBaseUrl}/whatsapp/1/message/text`;
      payload = {
        from: cleanFrom,
        to: cleanTo,
        messageId: `msg_${Date.now()}`,
        content: {
          text: message || "مرحباً بك من منصة Growlab وكيل الذكاء الاصطناعي!",
        },
      };
    }

    console.log(`[WhatsApp Infobip] Sending ${type} to ${cleanTo} via ${endpoint}`);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[WhatsApp Infobip] API Error:", res.status, responseData);
      return NextResponse.json(
        {
          success: false,
          status: res.status,
          error: responseData?.requestError?.serviceException?.text || responseData?.message || "فشل إرسال رسالة الواتساب",
          details: responseData,
        },
        { status: res.status }
      );
    }

    console.log("[WhatsApp Infobip] Message sent successfully:", responseData);
    return NextResponse.json({
      success: true,
      provider: "Infobip WhatsApp Business API",
      to: cleanTo,
      from: cleanFrom,
      type: type,
      response: responseData,
    });
  } catch (error: any) {
    console.error("[WhatsApp Infobip] Unexpected exception:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
