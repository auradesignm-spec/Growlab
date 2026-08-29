import { NextRequest, NextResponse } from "next/server";
import { processShopifyWebhook, verifyShopifyWebhook, type ShopifyWebhookOrder } from "@/services/shopify";
import { sanitizeObject } from "@/lib/security/inputSanitizer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";
    const topic = req.headers.get("x-shopify-topic") || "orders/create";
    const shopDomain = req.headers.get("x-shopify-shop-domain") || "growlab-store.myshopify.com";

    // Verify webhook signature (with graceful fallback if not set)
    const isValid = verifyShopifyWebhook(rawBody, hmacHeader, process.env.SHOPIFY_WEBHOOK_SECRET);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
    }

    const json = JSON.parse(rawBody) as ShopifyWebhookOrder;
    const sanitizedPayload = sanitizeObject(json);

    const result = await processShopifyWebhook(topic, sanitizedPayload, shopDomain);

    return NextResponse.json({
      status: "success",
      received: true,
      result,
    });
  } catch (error: any) {
    console.error("Shopify Webhook Error:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
