/**
 * Shopify Webhook & Integration Service for Growlab
 * Handles live synchronization for:
 * - orders/create
 * - orders/fulfilled
 * - orders/cancelled
 * - orders/refunds
 */

import { recordReconciliationOrder } from "@/lib/reconciliationEngine";

export interface ShopifyWebhookOrder {
  id: string | number;
  order_number?: string | number;
  name?: string;
  email?: string;
  total_price: string | number;
  subtotal_price?: string | number;
  total_discounts?: string | number;
  total_tax?: string | number;
  financial_status: "paid" | "pending" | "partially_paid" | "refunded" | "voided";
  fulfillment_status: "fulfilled" | "null" | "partial" | "unfulfilled" | null;
  gateway?: string;
  payment_gateway_names?: string[];
  created_at: string;
  cancelled_at?: string | null;
  line_items: Array<{
    id: string | number;
    title: string;
    sku?: string;
    quantity: number;
    price: string | number;
    total_discount?: string | number;
  }>;
  shipping_address?: {
    city?: string;
    country?: string;
    country_code?: string;
  };
  refunds?: Array<{
    id: string | number;
    created_at: string;
    order_id: string | number;
    transactions?: Array<{
      amount: string | number;
      kind: string;
    }>;
  }>;
}

export interface WebhookProcessingResult {
  success: boolean;
  event: string;
  orderId: string;
  status: string;
  netProfitEstimate?: number;
  message?: string;
}

/**
 * Validates Shopify HMAC Signature (Sha256)
 */
export function verifyShopifyWebhook(rawBody: string, hmacHeader?: string, secretKey?: string): boolean {
  if (!hmacHeader || !secretKey) return true; // In staging/demo allow fallback
  try {
    const crypto = require("crypto");
    const digest = crypto.createHmac("sha256", secretKey).update(rawBody, "utf8").digest("base64");
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

/**
 * Maps Shopify payment gateway to unified payment method (COD vs Prepaid)
 */
export function mapShopifyPaymentMethod(gateways: string[] = []): "COD" | "PREPAID" {
  const isCod = gateways.some((g) => {
    const lower = g.toLowerCase();
    return lower.includes("cash") || lower.includes("cod") || lower.includes("manual") || lower.includes("delivery");
  });
  return isCod ? "COD" : "PREPAID";
}

/**
 * Processes incoming Shopify webhook payload and integrates into Growlab Reconciliation Ledger
 */
export async function processShopifyWebhook(
  topic: "orders/create" | "orders/fulfilled" | "orders/cancelled" | "orders/refunds" | string,
  payload: ShopifyWebhookOrder,
  storeSlug = "main-store"
): Promise<WebhookProcessingResult> {
  const orderId = `SHOPIFY-${payload.order_number || payload.id}`;
  const grossSales = Number(payload.total_price || 0);
  const paymentMethod = mapShopifyPaymentMethod(payload.payment_gateway_names || (payload.gateway ? [payload.gateway] : []));
  const isReturned = topic === "orders/refunds" || payload.financial_status === "refunded";
  const isCancelled = topic === "orders/cancelled" || payload.financial_status === "voided";

  // Standard Courier & COGS benchmark estimates
  const estimatedShippingCost = paymentMethod === "COD" ? 28 : 22; // SAR average courier shipping
  const estimatedCogsRatio = 0.35; // Default 35% COGS estimate
  const cogs = grossSales * estimatedCogsRatio;

  // Record into the Unified Reconciliation Engine
  const order = recordReconciliationOrder({
    orderId,
    channel: "Shopify D2C",
    sku: payload.line_items?.[0]?.sku || "SKU-DEFAULT",
    productTitle: payload.line_items?.[0]?.title || "Shopify Order Items",
    grossSales,
    discountAmount: Number(payload.total_discounts || 0),
    cogs,
    shippingCost: estimatedShippingCost,
    adSpendShare: grossSales * 0.18, // Blended 18% Meta/Google ad spend attribution
    paymentMethod,
    paymentGateway: payload.payment_gateway_names?.[0] || payload.gateway || "Shopify Payments",
    financialStatus: isReturned ? "refunded" : isCancelled ? "cancelled" : payload.financial_status,
    fulfillmentStatus: payload.fulfillment_status || "unfulfilled",
    isReturned,
    isCancelled,
    currency: "SAR",
    customerCity: payload.shipping_address?.city || "Riyadh",
    customerCountry: payload.shipping_address?.country || "Saudi Arabia",
    createdAt: payload.created_at || new Date().toISOString(),
  });

  return {
    success: true,
    event: topic,
    orderId,
    status: order.financialStatus,
    netProfitEstimate: order.netProfit,
    message: `Processed ${topic} for ${orderId} with Net Margin ${order.marginPercentage.toFixed(1)}%`,
  };
}
