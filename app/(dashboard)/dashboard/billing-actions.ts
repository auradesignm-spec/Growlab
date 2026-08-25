"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  effectivePlan,
  isPro,
  planLimits,
  PRO_PRICE_OMR,
} from "@/lib/billing/entitlements";
import type { MerchantPlanId } from "@/lib/domain/enums";

export interface MerchantBillingState {
  effectivePlan: MerchantPlanId;
  plan: string;
  planSource: string;
  planExpiresAt: string | null;
  proPrice: number;
  stripeEnabled: boolean;
  limits: ReturnType<typeof planLimits>;
}

function stripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRO_PRICE_ID &&
      process.env.NEXT_PUBLIC_APP_URL,
  );
}

export async function loadMerchantBilling(): Promise<MerchantBillingState> {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can view billing.");
  }

  const profile = viewer.merchantProfile;
  const eff = effectivePlan(profile);

  return {
    effectivePlan: eff,
    plan: profile.plan,
    planSource: profile.planSource,
    planExpiresAt: profile.planExpiresAt?.toISOString() ?? null,
    proPrice: PRO_PRICE_OMR,
    stripeEnabled: stripeConfigured(),
    limits: planLimits(profile),
  };
}

export async function createProCheckoutSession(): Promise<{ url: string }> {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can subscribe.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (isPro(viewer.merchantProfile)) {
    throw new Error("You already have an active Pro plan.");
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!secret || !priceId || !appUrl) {
    throw new Error("Online checkout is not configured yet. Contact Growlab admin to upgrade.");
  }

  const merchant = viewer.merchantProfile;
  let customerId = merchant.stripeCustomerId;

  if (!customerId) {
    const customerRes = await fetch("https://api.stripe.com/v1/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: viewer.email ?? "",
        name: merchant.businessName,
        "metadata[merchantProfileId]": merchant.id,
      }),
    });
    const customer = (await customerRes.json()) as { id?: string; error?: { message?: string } };
    if (!customerRes.ok || !customer.id) {
      throw new Error(customer.error?.message ?? "Could not create Stripe customer.");
    }
    customerId = customer.id;
    await prisma.merchantProfile.update({
      where: { id: merchant.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      mode: "subscription",
      customer: customerId,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${appUrl}/dashboard?tab=billing&checkout=success`,
      cancel_url: `${appUrl}/dashboard?tab=billing&checkout=cancel`,
      "metadata[merchantProfileId]": merchant.id,
      "subscription_data[metadata][merchantProfileId]": merchant.id,
    }),
  });

  const session = (await sessionRes.json()) as { url?: string; error?: { message?: string } };
  if (!sessionRes.ok || !session.url) {
    throw new Error(session.error?.message ?? "Could not start checkout.");
  }

  return { url: session.url };
}

export async function createBillingPortalSession(): Promise<{ url: string }> {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can manage billing.");
  }
  const secret = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const customerId = viewer.merchantProfile.stripeCustomerId;
  if (!secret || !appUrl || !customerId) {
    throw new Error("Billing portal is not available yet.");
  }

  const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      customer: customerId,
      return_url: `${appUrl}/dashboard?tab=billing`,
    }),
  });
  const session = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !session.url) {
    throw new Error(session.error?.message ?? "Could not open billing portal.");
  }
  return { url: session.url };
}

export async function activateProFromStripe(
  merchantProfileId: string,
  subscriptionId: string,
  expiresAt: Date | null,
) {
  await prisma.merchantProfile.update({
    where: { id: merchantProfileId },
    data: {
      plan: "pro",
      planSource: "stripe",
      stripeSubscriptionId: subscriptionId,
      planExpiresAt: expiresAt,
    },
  });
  revalidatePath("/dashboard");
}

export async function deactivateProFromStripe(merchantProfileId: string) {
  await prisma.merchantProfile.update({
    where: { id: merchantProfileId },
    data: {
      plan: "free",
      planSource: "default",
      planExpiresAt: null,
      stripeSubscriptionId: null,
    },
  });
  revalidatePath("/dashboard");
}
