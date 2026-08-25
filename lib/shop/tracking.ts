import { prisma } from "@/lib/db";
import { productVariants } from "@/lib/catalog-db";
import { effectiveShareStatus } from "@/lib/domain/share";
import { commissionPayState, type CommissionPayState } from "@/lib/shop/commissionPayState";
import { canBuyerRequestRefund } from "@/lib/domain/deliveryHold";
import { settleDueCardHolds } from "@/lib/shop/settleCardHold";
import { settleSilentReceiveAcks } from "@/lib/shop/settleReceiveAck";

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
  attributionReceiptCode: string | null;
  attributionTipHash: string | null;
  shippingFeeCharged?: number;
}

export interface ShareLinkInfo {
  claimToken: string;
  status: string;
  storeUrl: string | null;
  refUsername: string | null;
  productTitle: string;
}

export interface TrackedCheckout {
  trackingToken: string;
  buyerName: string;
  storeUsername: string;
  storeName: string;
  storeLabel: string;
  storeHref: string;
  lines: TrackedOrderLine[];
  share: ShareLinkInfo | null;
  payState: CommissionPayState;
  creatorShare: number | null;
  settlementChannel: string;
  holdDueAt: string | null;
  canRequestHoldRefund: boolean;
}

export async function getCheckoutByToken(tokenRaw: string): Promise<TrackedCheckout | null> {
  const trackingToken = tokenRaw.trim();
  if (!trackingToken) return null;

  await settleDueCardHolds();
  await settleSilentReceiveAcks();

  const orders = await prisma.order.findMany({
    where: { trackingToken },
    include: {
      deal: {
        include: {
          product: { include: { merchant: { include: { store: true, user: true } } } },
          creator: { include: { user: true } },
        },
      },
      shareEntitlement: { include: { creator: true } },
      attributionChain: { select: { receiptCode: true, tipHash: true } },
      ledgerEntry: { select: { creatorShare: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  if (orders.length === 0) return null;

  const first = orders[0];
  const merchantStore = first.deal.product.merchant.store;
  const isMerchantStore = first.deal.dealChannel === "merchant_store";

  const storeUsername = first.deal.creator.username;
  const storeName = isMerchantStore
    ? first.deal.product.merchant.businessName
    : first.deal.creator.user.name;
  const storeLabel = isMerchantStore && merchantStore?.published ? merchantStore.slug : storeUsername;
  const storeHref =
    isMerchantStore && merchantStore?.published
      ? `/m/${merchantStore.slug}`
      : `/creator/${storeUsername}`;

  let share: ShareLinkInfo | null = null;
  const entitlement = first.shareEntitlement;
  if (entitlement) {
    const status = effectiveShareStatus(entitlement);
    const base = isMerchantStore && merchantStore?.published ? `/m/${merchantStore.slug}` : storeHref;
    const ref = entitlement.creator?.username;
    share = {
      claimToken: entitlement.claimToken,
      status,
      storeUrl: base,
      refUsername: ref ?? null,
      productTitle: first.deal.product.title,
    };
  }

  const now = new Date();
  const canRequestHoldRefund = orders.some((order) =>
    canBuyerRequestRefund({
      settlementChannel: order.settlementChannel,
      escrowStatus: order.escrowStatus,
      orderStatus: order.status,
      paidAt: order.paidAt,
      deliveryDueAt: order.deliveryDueAt,
      buyerRefundRequestedAt: order.buyerRefundRequestedAt,
      now,
    }),
  );
  const due = orders.map((o) => o.deliveryDueAt).find((d) => d);

  return {
    trackingToken,
    buyerName: first.buyerName,
    storeUsername,
    storeName,
    storeLabel,
    storeHref,
    share,
    payState: commissionPayState(orders.map((order) => order.status)),
    creatorShare: orders.reduce((sum, order) => sum + (order.ledgerEntry?.creatorShare ?? 0), 0) || null,
    settlementChannel: first.settlementChannel,
    holdDueAt: due ? due.toISOString() : null,
    canRequestHoldRefund,
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
      attributionReceiptCode: order.attributionChain?.receiptCode ?? null,
      attributionTipHash: order.attributionChain?.tipHash ?? null,
      shippingFeeCharged: Number((order as { shippingFeeCharged?: number }).shippingFeeCharged ?? 0),
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
        shippingFeeOmr: Number((deal.product as { shippingFee?: number }).shippingFee ?? 1.5),
        variants: productVariants(deal.product),
        username: deal.creator.username,
      },
    ];
  });
}

export async function getShareEntitlementByToken(tokenRaw: string) {
  const claimToken = tokenRaw.trim();
  if (!claimToken) return null;

  const row = await prisma.shareEntitlement.findUnique({
    where: { claimToken },
    include: {
      product: { include: { merchant: { include: { store: true } } } },
      creator: true,
      order: { select: { status: true, buyerName: true } },
    },
  });
  if (!row) return null;

  const store = row.product.merchant.store;
  const storeUrl = store?.published ? `/m/${store.slug}` : null;
  const shareUrl =
    storeUrl && row.creator
      ? `${storeUrl}?ref=${encodeURIComponent(row.creator.username)}`
      : storeUrl;

  let reelStatus: string | null = null;
  let reelUrl: string | null = null;
  if (row.creatorId) {
    const reel = await prisma.contentAsset.findFirst({
      where: {
        productId: row.productId,
        originCreatorId: row.creatorId,
        status: { in: ["pending", "approved"] },
      },
      orderBy: { createdAt: "desc" },
      select: { status: true, socialPostUrl: true },
    });
    reelStatus = reel?.status ?? null;
    reelUrl = reel?.socialPostUrl ?? null;
  }

  return {
    claimToken: row.claimToken,
    status: effectiveShareStatus(row),
    productId: row.productId,
    productTitle: row.product.title,
    storeName: row.product.merchant.businessName,
    storeUrl,
    shareUrl,
    creatorUsername: row.creator?.username ?? null,
    orderStatus: row.order.status,
    buyerName: row.buyerName,
    reelStatus,
    reelUrl,
  };
}
