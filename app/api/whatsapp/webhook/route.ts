import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const DEFAULT_INFOBIP_API_KEY =
  process.env.INFOBIP_API_KEY || "b9a2ac1b7e039099892b0defa7cd9e58-f1cf66c8-86db-472a-b22d-196f982d1825";
const DEFAULT_INFOBIP_BASE_URL =
  process.env.INFOBIP_BASE_URL || "https://pdv3ge.api.infobip.com";
const DEFAULT_INFOBIP_SENDER =
  process.env.INFOBIP_SENDER_NUMBER || "447860088970";

// Meta / Generic Webhook Verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "growlab_webhook_secret_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WhatsApp Webhook verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { status: "active", endpoint: "Growlab AI WhatsApp Webhook (Infobip & Meta)" },
    { status: 200 }
  );
}

// WhatsApp Webhook Message Receiver (POST) - Supports Infobip & Meta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WhatsApp Webhook] Incoming payload:", JSON.stringify(body).slice(0, 300));

    let incomingFrom = "";
    let incomingText = "";
    let incomingSenderNumber = DEFAULT_INFOBIP_SENDER;

    // 1. Check Infobip Webhook format (results array)
    if (body.results && Array.isArray(body.results) && body.results.length > 0) {
      const result = body.results[0];
      incomingFrom = result.from;
      incomingSenderNumber = result.to || DEFAULT_INFOBIP_SENDER;
      incomingText = result.message?.text || result.cleanText || "";
    }
    // 2. Check Meta Graph Webhook format
    else if (body.object === "whatsapp_business_account" || body.entry) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        incomingFrom = message.from;
        incomingText = message.text?.body || "";
      }
    }

    if (!incomingFrom || !incomingText) {
      return NextResponse.json({ status: "acknowledged_no_message", timestamp: new Date().toISOString() });
    }

    console.log(`[WhatsApp Webhook] Processing message from ${incomingFrom}: "${incomingText}"`);

    // Run Gemini 3.5 Flash Agent to craft a natural sales response
    let aiReply = "أهلاً بك في متجرنا! 👋 كيف نقدر نساعدك اليوم في تفاصيل المنتجات وتأكيد طلبك؟";
    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: incomingText,
          config: {
            systemInstruction: `أنت وكيل ذكي لمبيعات متجر عماني وخليجي في منصة Growlab.
مهمتك: الترحيب بالعميل بودية ولهجة خليجية مهذبة، الإجابة عن المنتجات، تشجيعه على تأكيد الطلب، والتوضيح أن التوصيل سريع لباب المنزل والدفع عند الاستلام.
اجعل الردود مختصرة واحترافية ومناسبة لمحادثات واتساب.`,
          },
        });

        if (response.text) {
          aiReply = response.text;
        }
      }
    } catch (aiErr) {
      console.error("[WhatsApp Webhook] Gemini agent generation error:", aiErr);
    }

    // Auto-dispatch response back to customer via Infobip WhatsApp API
    try {
      const authHeader = DEFAULT_INFOBIP_API_KEY.startsWith("App ")
        ? DEFAULT_INFOBIP_API_KEY
        : `App ${DEFAULT_INFOBIP_API_KEY}`;

      const sendRes = await fetch(`${DEFAULT_INFOBIP_BASE_URL}/whatsapp/1/message/text`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          from: incomingSenderNumber.replace(/[\s\+\-]/g, ""),
          to: incomingFrom.replace(/[\s\+\-]/g, ""),
          messageId: `reply_${Date.now()}`,
          content: {
            text: aiReply,
          },
        }),
      });

      const sendData = await sendRes.json().catch(() => ({}));
      console.log("[WhatsApp Webhook] Outbound auto-reply sent status:", sendRes.status, sendData);
    } catch (sendErr) {
      console.error("[WhatsApp Webhook] Outbound reply dispatch error:", sendErr);
    }

    return NextResponse.json({
      status: "success",
      from: incomingFrom,
      receivedText: incomingText,
      replySent: aiReply,
    });
  } catch (error: any) {
    console.error("[WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

