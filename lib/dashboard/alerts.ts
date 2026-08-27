import { prisma } from "@/lib/db";
import { creatorProductPath, uniqueDealSlugs } from "@/lib/storefront";
import { getNewOrderWhatsAppUrl } from "@/lib/shop/notify";
import { getWalletSnapshot } from "@/lib/ledger/wallet";

export type AppAlertKind =
  | "waiting_accept"
  | "deal_accepted"
  | "new_order"
  | "commission"
  | "new_application"
  | "low_wallet"
  | "out_of_stock"
  | "dead_stock";

export interface AppAlert {
  id: string;
  kind: AppAlertKind;
  productTitle: string;
  href: string;
  createdAt: string;
  sharePath?: string;
  amount?: number;
  creatorUsername?: string;
  dealId?: string;
  notifyWhatsAppUrl?: string;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

export async function loadCreatorAlerts(creatorId: string): Promise<AppAlert[]> {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorId },
    select: {
      username: true,
      deals: {
        include: {
          product: true,
          orders: { include: { ledgerEntry: true } },
        },
      },
    },
  });
  if (!creator) return [];

  const slugByDealId = uniqueDealSlugs(
    [...creator.deals]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((deal) => ({ dealId: deal.id, productTitle: deal.product.title }))
  );

  const now = Date.now();
  const alerts: AppAlert[] = [];

  for (const deal of creator.deals) {
    if (deal.status === "pending") {
      alerts.push({
        id: `waiting:${deal.id}`,
        kind: "waiting_accept",
        productTitle: deal.product.title,
        href: "/dashboard?tab=deals",
        createdAt: deal.createdAt.toISOString(),
        dealId: deal.id,
      });
    }

    const acceptedRecently =
      deal.status === "active" &&
      deal.updatedAt.getTime() - deal.createdAt.getTime() > 2000 &&
      now - deal.updatedAt.getTime() < WEEK_MS;
    if (acceptedRecently) {
      alerts.push({
        id: `accepted:${deal.id}`,
        kind: "deal_accepted",
        productTitle: deal.product.title,
        href: "/dashboard?tab=deals",
        createdAt: deal.updatedAt.toISOString(),
        sharePath: creatorProductPath(
          creator.username,
          slugByDealId.get(deal.id) ?? deal.product.title
        ),
        dealId: deal.id,
      });
    }

    for (const order of deal.orders) {
      if (now - order.createdAt.getTime() < TWO_DAYS_MS && order.status !== "cancelled") {
        alerts.push({
          id: `order:${order.id}`,
          kind: "new_order",
          productTitle: deal.product.title,
          href: "/dashboard?tab=earnings",
          createdAt: order.createdAt.toISOString(),
          amount: order.unitPriceCharged * order.quantity,
        });
      }
      const share = order.ledgerEntry?.creatorShare ?? 0;
      if (share > 0 && now - order.createdAt.getTime() < WEEK_MS) {
        alerts.push({
          id: `commission:${order.id}`,
          kind: "commission",
          productTitle: deal.product.title,
          href: "/dashboard?tab=payouts",
          createdAt: order.createdAt.toISOString(),
          amount: share,
        });
      }
    }
  }

  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12);
}

export async function loadMerchantAlerts(merchantId: string): Promise<AppAlert[]> {
  const products = await prisma.product.findMany({
    where: { merchantId },
    select: {
      id: true,
      title: true,
      active: true,
      basePrice: true,
      createdAt: true,
      attributesJson: true,
      deals: {
        select: {
          id: true,
          status: true,
          orders: {
            where: { status: { not: "cancelled" } },
            select: { id: true, createdAt: true },
          },
        },
      },
    },
  });
  const productIds = products.map((p) => p.id);

  const now = Date.now();
  const [pendingDeals, recentOrders, wallet] = await Promise.all([
    productIds.length === 0
      ? Promise.resolve([])
      : prisma.creatorDeal.findMany({
          where: { productId: { in: productIds }, status: "pending" },
          include: { product: true, creator: true },
          orderBy: { createdAt: "desc" },
        }),
    productIds.length === 0
      ? Promise.resolve([])
      : prisma.order.findMany({
          where: {
            deal: { productId: { in: productIds } },
            createdAt: { gte: new Date(now - TWO_DAYS_MS) },
            status: { not: "cancelled" },
          },
          include: { deal: { include: { product: true, creator: true } } },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
    getWalletSnapshot(merchantId),
  ]);

  const alerts: AppAlert[] = [];

  if (wallet.available < 5) {
    alerts.push({
      id: "wallet:low",
      kind: "low_wallet",
      productTitle: "",
      href: "/dashboard?tab=wallet",
      createdAt: new Date().toISOString(),
      amount: wallet.available,
    });
  }

  // Stock alerts: Out of stock or Dead stock
  for (const prod of products) {
    if (!prod.active) {
      alerts.push({
        id: `stock:out:${prod.id}`,
        kind: "out_of_stock",
        productTitle: prod.title,
        href: "/dashboard?tab=products",
        createdAt: prod.createdAt.toISOString(),
        amount: prod.basePrice,
      });
    } else {
      // Check for dead stock (no orders across deals or no active deals and older than 1 day)
      const totalOrders = prod.deals.reduce((sum, d) => sum + d.orders.length, 0);
      const activeDeals = prod.deals.filter((d) => d.status === "active").length;
      const isOlderThanDay = now - prod.createdAt.getTime() > 24 * 60 * 60 * 1000;
      if (isOlderThanDay && (totalOrders === 0 || activeDeals === 0)) {
        alerts.push({
          id: `stock:dead:${prod.id}`,
          kind: "dead_stock",
          productTitle: prod.title,
          href: "/dashboard?tab=campaign",
          createdAt: prod.createdAt.toISOString(),
          amount: prod.basePrice,
        });
      }
    }
  }

  for (const deal of pendingDeals) {
    alerts.push({
      id: `apply:${deal.id}`,
      kind: "new_application" as const,
      productTitle: deal.product.title,
      href: "/dashboard?tab=queue",
      createdAt: deal.createdAt.toISOString(),
      creatorUsername: deal.creator.username,
      dealId: deal.id,
    });
  }

  for (const order of recentOrders) {
    alerts.push({
      id: `order:${order.id}`,
      kind: "new_order",
      productTitle: order.deal.product.title,
      href: "/dashboard?tab=orders",
      createdAt: order.createdAt.toISOString(),
      amount: order.unitPriceCharged * order.quantity,
      creatorUsername: order.deal.creator.username,
      notifyWhatsAppUrl: getNewOrderWhatsAppUrl({
        productTitle: order.deal.product.title,
        buyerName: order.buyerName,
        buyerCity: order.buyerCity,
        quantity: order.quantity,
        creatorUsername: order.deal.creator.username,
      }),
    });
  }

  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 16);
}
