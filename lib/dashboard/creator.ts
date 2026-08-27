import { prisma } from "@/lib/db";
import { tierProgress, type TierProgress } from "@/lib/ledger/tiers";
import { computeCreatorBalances, type CreatorBalances } from "@/lib/ledger/payouts";
import type { CreatorTierId } from "@/lib/domain/enums";
import type { OrderLedgerRow } from "@/lib/dashboard/types";
import { effectiveUgcStatus } from "@/lib/domain/ugc";
import { uniqueDealSlugs } from "@/lib/storefront";
import { countVisitsByDealIds, countVisitsForUsername } from "@/lib/shop/visits";
import { creatorHasPayoutAccount } from "@/lib/ledger/account";

export interface CreatorDealRow {
  dealId: string;
  slug: string;
  productTitle: string;
  merchantBusinessName: string;
  merchantVerificationStatus: string;
  category: string;
  lockedUnitPrice: number;
  lockedCommissionPct: number;
  lockedCogsPct: number;
  discountCapPct: number;
  status: string;
  featured: boolean;
  createdAt: string;
  orderCount: number;
  commissionEarned: number;
  coverUrl: string | null;
  username: string;
  visitCount: number;
}

export interface CreatorPayoutRow {
  id: string;
  type: string;
  amount: number;
  feeAmount: number;
  status: string;
  requestedAt: string;
  processedAt: string | null;
}

export interface CreatorSampleRequestRow {
  id: string;
  productTitle: string;
  merchantBusinessName: string;
  status: string;
  createdAt: string;
  shippingRef: string | null;
  depositAmount: number | null;
  depositCurrency: string | null;
  ugcStatus: string;
  ugcDeadline: string | null;
  ugcVideoUrl: string | null;
  ugcSubmittedAt: string | null;
}

export interface CreatorDashboardData {
  creator: {
    id: string;
    username: string;
    tier: CreatorTierId;
    bio: string | null;
    verificationStatus: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    hasPayoutAccount: boolean;
  };
  visitCount: number;
  tierProgress: TierProgress;
  totalNetSales: number;
  returnRatePct: number;
  deals: CreatorDealRow[];
  ordersLedger: OrderLedgerRow[];
  balances: CreatorBalances;
  payoutRequests: CreatorPayoutRow[];
  sampleRequests: CreatorSampleRequestRow[];
}

export async function loadCreatorDashboardData(creatorId: string): Promise<CreatorDashboardData> {
  const creator = await prisma.creatorProfile.findUniqueOrThrow({
    where: { id: creatorId },
    include: {
      deals: {
        include: {
          product: { include: { merchant: true, mediaAssets: { orderBy: { createdAt: "asc" }, take: 1 } } },
          orders: { include: { ledgerEntry: true } },
        },
      },
      payoutRequests: { orderBy: { requestedAt: "desc" } },
      sampleRequests: {
        include: { product: true, merchant: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const allOrders = creator.deals.flatMap((deal) => deal.orders);
  const totalNetSales = allOrders.reduce((sum, o) => sum + (o.ledgerEntry?.attributedGmv ?? 0), 0);
  const returnedCount = allOrders.filter((o) => o.status === "returned").length;
  const returnRatePct = allOrders.length > 0 ? returnedCount / allOrders.length : 0;

  const [visitCount, visitsByDeal] = await Promise.all([
    countVisitsForUsername(creator.username),
    countVisitsByDealIds(creator.deals.map((deal) => deal.id)),
  ]);

  const slugByDealId = uniqueDealSlugs(
    [...creator.deals]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((deal) => ({ dealId: deal.id, productTitle: deal.product.title }))
  );

  const deals: CreatorDealRow[] = creator.deals.map((deal) => ({
    dealId: deal.id,
    slug: slugByDealId.get(deal.id) ?? deal.product.title,
    productTitle: deal.product.title,
    merchantBusinessName: deal.product.merchant.businessName,
    merchantVerificationStatus: deal.product.merchant.verificationStatus,
    category: deal.product.category,
    lockedUnitPrice: deal.lockedUnitPrice,
    lockedCommissionPct: deal.lockedCommissionPct,
    lockedCogsPct: deal.lockedCogsPct,
    discountCapPct: deal.discountCapPct,
    status: deal.status,
    featured: deal.featured,
    createdAt: deal.createdAt.toISOString(),
    orderCount: deal.orders.length,
    commissionEarned: deal.orders.reduce((sum, order) => sum + (order.ledgerEntry?.creatorShare ?? 0), 0),
    coverUrl: deal.product.mediaAssets[0]?.url ?? null,
    username: creator.username,
    visitCount: visitsByDeal.get(deal.id) ?? 0,
  }));

  const ordersLedger: OrderLedgerRow[] = creator.deals
    .flatMap((deal) =>
      deal.orders.map((order) => ({
        orderId: order.id,
        dealId: deal.id,
        productTitle: deal.product.title,
        creatorUsername: creator.username,
        merchantBusinessName: deal.product.merchant.businessName,
        buyerName: order.buyerName,
        quantity: order.quantity,
        unitPriceCharged: order.unitPriceCharged,
        currency: order.currency,
        attributionSource: order.attributionSource,
        status: order.status,
        escrowStatus: order.escrowStatus,
        shippingRef: order.shippingRef,
        createdAt: order.createdAt.toISOString(),
            ledger: order.ledgerEntry
          ? {
              attributedGmv: order.ledgerEntry.attributedGmv,
              paymentFee: order.ledgerEntry.paymentFee,
              creatorShare: order.ledgerEntry.creatorShare,
              merchantShare: order.ledgerEntry.merchantShare,
              platformShare: order.ledgerEntry.platformShare,
              holdbackAmount: order.ledgerEntry.holdbackAmount,
              availableAmount: order.ledgerEntry.availableAmount,
              holdbackDays: order.ledgerEntry.holdbackDays,
            }
          : null,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const baseBalances = computeCreatorBalances(
    allOrders
      .filter((o) => o.ledgerEntry)
      .map((o) => ({
        orderCreatedAt: o.createdAt,
        creatorShare: o.ledgerEntry!.creatorShare,
        holdbackAmount: o.ledgerEntry!.holdbackAmount,
        availableAmount: o.ledgerEntry!.availableAmount,
        holdbackDays: o.ledgerEntry!.holdbackDays,
        orderStatus: o.status,
        escrowStatus: o.escrowStatus,
        escrowReleasedAt: o.escrowReleasedAt,
      })),
    creator.payoutRequests.map((p) => ({ amount: p.amount, status: p.status }))
  );

  const performanceAgg = await prisma.performanceEarn.aggregate({
    where: { creatorId },
    _sum: { amount: true },
  });
  const performanceEarned = Math.round((performanceAgg._sum.amount ?? 0) * 100) / 100;
  const balances = {
    ...baseBalances,
    totalEarned: Math.round((baseBalances.totalEarned + performanceEarned) * 100) / 100,
    availableBalance: Math.round((baseBalances.availableBalance + performanceEarned) * 100) / 100,
  };

  return {
    creator: {
      id: creator.id,
      username: creator.username,
      tier: creator.tier as CreatorTierId,
      bio: creator.bio,
      verificationStatus: creator.verificationStatus,
      bankName: creator.bankName,
      accountName: creator.accountName,
      accountNumber: creator.accountNumber,
      hasPayoutAccount: creatorHasPayoutAccount(creator),
    },
    visitCount,
    tierProgress: tierProgress(creator.tier as CreatorTierId, totalNetSales),
    totalNetSales,
    returnRatePct,
    deals,
    ordersLedger,
    balances,
    payoutRequests: creator.payoutRequests.map((p) => ({
      id: p.id,
      type: p.type,
      amount: p.amount,
      feeAmount: p.feeAmount,
      status: p.status,
      requestedAt: p.requestedAt.toISOString(),
      processedAt: p.processedAt ? p.processedAt.toISOString() : null,
    })),
    sampleRequests: creator.sampleRequests.map((s) => ({
      id: s.id,
      productTitle: s.product.title,
      merchantBusinessName: s.merchant.businessName,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      shippingRef: s.shippingRef,
      depositAmount: s.depositAmount,
      depositCurrency: s.depositCurrency,
      ugcStatus: effectiveUgcStatus(s),
      ugcDeadline: s.ugcDeadline ? s.ugcDeadline.toISOString() : null,
      ugcVideoUrl: s.ugcVideoUrl,
      ugcSubmittedAt: s.ugcSubmittedAt ? s.ugcSubmittedAt.toISOString() : null,
    })),
  };
}
