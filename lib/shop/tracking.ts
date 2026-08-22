import { prisma } from "@/lib/db";
import { productVariants } from "@/lib/catalog-db";

export interface TrackedOrderLine {
  id: string;
  productTitle: string;
  quantity: number;
  size: string;
  unitPriceCharged: number;
  currency: string;
  status: string;
  escrowStatus: string;
  shippingRef: string | null;
  createdAt: string;
}

export interface TrackedCheckout {
  trackingToken: string;
  buyerName: string;
  storeUsername: string;
  storeName: string;
  lines: TrackedOrderLine[];
}

export async function getCheckoutByToken(tokenRaw: string): Promise<TrackedCheckout | null> {
  const trackingToken = tokenRaw.trim();
  if (!trackingToken) return null;

  const orders = await prisma.order.findMany({
    where: { trackingToken },
    include: {
      deal: { include: { product: true, creator: { include: { user: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });
  if (orders.length === 0) return null;

  const first = orders[0];
  return {
    trackingToken,
    buyerName: first.buyerName,
    storeUsername: first.deal.creator.username,
    storeName: first.deal.creator.user.name,
    lines: orders.map((order) => ({
      id: order.id,
      productTitle: order.deal.product.title,
      quantity: order.quantity,
      size: order.variantLabel,
      unitPriceCharged: order.unitPriceCharged,
      currency: order.currency,
      status: order.status,
      escrowStatus: order.escrowStatus,
      shippingRef: order.shippingRef,
      createdAt: order.createdAt.toISOString(),
    })),
  };
}

export async function hydrateCartDeals(items: { dealId: string; quantity: number; size: string }[]) {
  const deals = await prisma.creatorDeal.findMany({
    where: { id: { in: items.map((item) => item.dealId) } },
    include: { product: true, creator: true },
  });
  const byId = new Map(deals.map((deal) => [deal.id, deal]));
  return items.flatMap((item) => {
    const deal = byId.get(item.dealId);
    if (!deal) return [];
    return [
      {
        dealId: deal.id,
        title: deal.product.title,
        priceOmr: deal.lockedUnitPrice,
        currency: deal.product.currency,
        quantity: item.quantity,
        size: item.size,
        variants: productVariants(deal.product),
        username: deal.creator.username,
      },
    ];
  });
}
