import { prisma } from "@/lib/db";
import { tierProgress, type TierProgress } from "@/lib/ledger/tiers";
import { computeCreatorBalances, type CreatorBalances } from "@/lib/ledger/payouts";
import type { CreatorTierId } from "@/lib/domain/enums";
import type { OrderLedgerRow } from "@/lib/dashboard/types";
import { effectiveUgcStatus } from "@/lib/domain/ugc";

export interface CreatorDealRow {
  dealId: string;
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
  creator: { id: string; username: string; tier: CreatorTierId; bio: string | null };
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
          product: { include: { merchant: true } },
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
  const totalNetSales = allOrders.reduce((sum, o) => sum + (o.ledgerEntry?.netAttributedSales ?? 0), 0);
  const returnedCount = allOrders.filter((o) => o.status === "returned").length;
  const returnRatePct = allOrders.length > 0 ? returnedCount / allOrders.length : 0;

  const deals: CreatorDealRow[] = creator.deals.map((deal) => ({
    dealId: deal.id,
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
        createdAt: order.createdAt.toISOString(),
        ledger: order.ledgerEntry
          ? {
              attributedGmv: order.ledgerEntry.attributedGmv,
              returnsReserve: order.ledgerEntry.returnsReserve,
              netAttributedSales: order.ledgerEntry.netAttributedSales,
              paymentFee: order.ledgerEntry.paymentFee,
              cogs: order.ledgerEntry.cogs,
              adSpendAllocated: order.ledgerEntry.adSpendAllocated,
              contributionPool: order.ledgerEntry.contributionPool,
              creatorFloorAmount: order.ledgerEntry.creatorFloorAmount,
              creatorProfitShare: order.ledgerEntry.creatorProfitShare,
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

  const balances = computeCreatorBalances(
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

  return {
    creator: {
      id: creator.id,
      username: creator.username,
      tier: creator.tier as CreatorTierId,
      bio: creator.bio,
    },
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
