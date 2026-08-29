import crypto from "crypto";
import { NextResponse } from "next/server";
import { activateProFromStripe, deactivateProFromStripe } from "@/app/(dashboard)/dashboard/billing-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function stripeGet(path: string) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripe not configured");
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  return res.json() as Promise<Record<string, unknown>>;
}

function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  const parts = header.split(",").reduce<Record<string, string>>((acc, part) => {
    const eq = part.indexOf("=");
    if (eq > 0) acc[part.slice(0, eq)] = part.slice(eq + 1);
    return acc;
  }, {});
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const signed = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !verifyStripeSignature(body, sig, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const obj = event.data.object;

  if (event.type === "checkout.session.completed") {
    const metadata = obj.metadata as Record<string, string> | undefined;
    const merchantProfileId = metadata?.merchantProfileId ?? "";
    const subscriptionId = String(obj.subscription ?? "");
    if (merchantProfileId && subscriptionId) {
      const sub = await stripeGet(`subscriptions/${subscriptionId}`);
      const periodEnd = sub.current_period_end as number | undefined;
      await activateProFromStripe(
        merchantProfileId,
        subscriptionId,
        periodEnd ? new Date(periodEnd * 1000) : null,
      );
    }
  }

  if (event.type === "customer.subscription.updated") {
    const metadata = obj.metadata as Record<string, string> | undefined;
    const merchantProfileId = metadata?.merchantProfileId ?? "";
    const status = String(obj.status ?? "");
    const subscriptionId = String(obj.id ?? "");
    if (merchantProfileId) {
      if (status === "active" || status === "trialing") {
        const periodEnd = obj.current_period_end as number | undefined;
        await activateProFromStripe(
          merchantProfileId,
          subscriptionId,
          periodEnd ? new Date(periodEnd * 1000) : null,
        );
      } else if (status === "canceled" || status === "unpaid") {
        await deactivateProFromStripe(merchantProfileId);
      } else if (status === "past_due") {
        // 3-day grace: keep Pro until period end + 3 days, then webhook/deleted handles drop.
        const periodEnd = obj.current_period_end as number | undefined;
        const graceMs = 3 * 24 * 60 * 60 * 1000;
        const expiresAt = periodEnd
          ? new Date(periodEnd * 1000 + graceMs)
          : new Date(Date.now() + graceMs);
        await activateProFromStripe(merchantProfileId, subscriptionId, expiresAt);
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const metadata = obj.metadata as Record<string, string> | undefined;
    const merchantProfileId = metadata?.merchantProfileId ?? "";
    if (merchantProfileId) await deactivateProFromStripe(merchantProfileId);
  }

  return NextResponse.json({ received: true });
}
