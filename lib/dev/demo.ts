import { prisma } from "@/lib/db";

export const DEMO_MERCHANT_EMAIL = "attar@growlab.local";
export const DEMO_BUYER_EMAIL = "demo-buyer@growlab.local";
export const DEMO_STORE_SLUG = "muttrah-attars";
export const DEMO_ORDER_TOKEN = "demo-buyer-order";

export interface DemoPersonas {
  merchantUserId: string | null;
  buyerUserId: string | null;
  storeSlug: string;
  orderToken: string;
  shareClaimToken: string | null;
}

export async function resolveDemoPersonas(): Promise<DemoPersonas> {
  const [merchant, buyer, entitlement] = await Promise.all([
    prisma.user.findFirst({
      where: { email: DEMO_MERCHANT_EMAIL },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { email: DEMO_BUYER_EMAIL },
      select: { id: true },
    }),
    prisma.shareEntitlement.findFirst({
      where: { order: { trackingToken: DEMO_ORDER_TOKEN } },
      select: { claimToken: true },
    }),
  ]);

  return {
    merchantUserId: merchant?.id ?? null,
    buyerUserId: buyer?.id ?? null,
    storeSlug: DEMO_STORE_SLUG,
    orderToken: DEMO_ORDER_TOKEN,
    shareClaimToken: entitlement?.claimToken ?? null,
  };
}

export function demoHomeForRole(role: "merchant" | "buyer"): string {
  // Merchant demo opens the store wizard, not the dashboard home.
  return role === "merchant" ? "/dashboard/store/edit?fresh=1" : "/dashboard/browse";
}
