import { prisma } from "@/lib/db";
import { productTags, productVariants } from "@/lib/catalog-db";
import { suggestCreatorsForProduct, type CreatorMatchSuggestion } from "@/lib/matching/suggest";
import type { OrderLedgerRow } from "@/lib/dashboard/types";
import { effectiveUgcStatus } from "@/lib/domain/ugc";
import { computeSimpleSplit, type SimpleSplitResult } from "@/lib/domain/commission";

export interface MerchantMediaAssetRow {
  id: string;
  type: string;
  url: string;
  caption: string | null;
}

export interface MerchantProductRow {
  id: string;
  title: string;
  category: string;
  tags: string[];
  variants: string[];
  basePrice: number;
  currency: string;
  cogsPct: number;
  // Secret — merchant-only. Never expose this row shape to creator-facing loaders.
  costPrice: number;
  commissionType: string;
  commissionValue: number;
  active: boolean;
  activeDealsCount: number;
  mediaAssets: MerchantMediaAssetRow[];
  /** Pre-sale estimate only — see lib/domain/commission.ts#computeSimpleSplit. */
  simpleSplit: SimpleSplitResult;
}

export interface AssignedCreatorRow {
  creatorId: string;
  username: string;
  tier: string;
  dealsCount: number;
  ordersCount: number;
  netSales: number;
}

export interface UnassignedProductSuggestion {
  productId: string;
  title: string;
  suggestions: CreatorMatchSuggestion[];
}

export interface MerchantAdWalletRow {
  walletId: string;
  dealId: string;
  productTitle: string;
  creatorUsername: string;
  status: string;
  availableBalance: number;
  dailyCap: number;
  dealCap: number;
  lifetimeSpent: number;
  merKillThreshold: number;
  autoPauseFlag: boolean;
  autoPauseReason: string | null;
  latestMer: number | null;
  spendHistory: Array<{ id: string; amount: number; spentAt: string; source: string }>;
}

export interface MerchantSampleRequestRow {
  id: string;
  productTitle: string;
  creatorUsername: string;
  note: string | null;
  status: string;
  createdAt: string;
  shippingRef: string | null;
  depositAmount: number | null;
  depositCurrency: string | null;
  ugcStatus: string;
  ugcDeadline: string | null;
  ugcVideoUrl: string | null;
}

export interface MerchantDashboardData {
  merchant: { id: string; businessName: string; verificationStatus: string };
  products: MerchantProductRow[];
  assignedCreators: AssignedCreatorRow[];
  unassignedProductSuggestions: UnassignedProductSuggestion[];
  ordersLedger: OrderLedgerRow[];
  adWallets: MerchantAdWalletRow[];
  sampleRequests: MerchantSampleRequestRow[];
}

export async function loadMerchantDashboardData(merchantId: string): Promise<MerchantDashboardData> {
  const merchant = await prisma.merchantProfile.findUniqueOrThrow({
    where: { id: merchantId },
    include: {
      products: { include: { deals: true, mediaAssets: { orderBy: { createdAt: "asc" } } } },
      sampleRequests: {
        include: { product: true, creator: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const products: MerchantProductRow[] = merchant.products.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    tags: productTags(p),
    variants: productVariants(p),
    basePrice: p.basePrice,
    currency: p.currency,
    cogsPct: p.cogsPct,
    costPrice: p.costPrice,
    commissionType: p.commissionType,
    commissionValue: p.commissionValue,
    active: p.active,
    activeDealsCount: p.deals.filter((d) => d.status === "active").length,
    mediaAssets: p.mediaAssets.map((a) => ({ id: a.id, type: a.type, url: a.url, caption: a.caption })),
    simpleSplit: computeSimpleSplit({
      retailPrice: p.basePrice,
      commissionType: p.commissionType,
      commissionValue: p.commissionValue,
    }),
  }));

  const productIds = merchant.products.map((p) => p.id);

  const deals = await prisma.creatorDeal.findMany({
    where: { productId: { in: productIds } },
    include: {
      creator: true,
      product: true,
      orders: { include: { ledgerEntry: true } },
      adWallet: { include: { spendEntries: { orderBy: { spentAt: "desc" } }, merDays: { orderBy: { date: "desc" }, take: 1 } } },
    },
  });

  const creatorMap = new Map<string, AssignedCreatorRow>();
  for (const deal of deals) {
    const existing = creatorMap.get(deal.creatorId);
    const netSales = deal.orders.reduce((sum, o) => sum + (o.ledgerEntry?.netAttributedSales ?? 0), 0);
    if (existing) {
      existing.dealsCount += 1;
      existing.ordersCount += deal.orders.length;
      existing.netSales += netSales;
    } else {
      creatorMap.set(deal.creatorId, {
        creatorId: deal.creatorId,
        username: deal.creator.username,
        tier: deal.creator.tier,
        dealsCount: 1,
        ordersCount: deal.orders.length,
        netSales,
      });
    }
  }
  const assignedCreators = [...creatorMap.values()].sort((a, b) => b.netSales - a.netSales);

  const unassignedProducts = merchant.products.filter(
    (p) => !p.deals.some((d) => d.status === "active")
  );
  const unassignedProductSuggestions: UnassignedProductSuggestion[] = await Promise.all(
    unassignedProducts.map(async (p) => ({
      productId: p.id,
      title: p.title,
      suggestions: await suggestCreatorsForProduct(p.id),
    }))
  );

  const ordersLedger: OrderLedgerRow[] = deals
    .flatMap((deal) =>
      deal.orders.map((order) => ({
        orderId: order.id,
        dealId: deal.id,
        productTitle: deal.product.title,
        creatorUsername: deal.creator.username,
        merchantBusinessName: merchant.businessName,
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
        buyerAddress: order.buyerAddress,
        buyerCity: order.buyerCity,
        escrowStatus: order.escrowStatus,
        quantity: order.quantity,
        unitPriceCharged: order.unitPriceCharged,
        currency: order.currency,
        attributionSource: order.attributionSource,
        status: order.status,
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

  const adWallets: MerchantAdWalletRow[] = deals
    .filter((deal) => deal.adWallet)
    .map((deal) => {
      const wallet = deal.adWallet!;
      return {
        walletId: wallet.id,
        dealId: deal.id,
        productTitle: deal.product.title,
        creatorUsername: deal.creator.username,
        status: wallet.status,
        availableBalance: wallet.availableBalance,
        dailyCap: wallet.dailyCap,
        dealCap: wallet.dealCap,
        lifetimeSpent: wallet.lifetimeSpent,
        merKillThreshold: wallet.merKillThreshold,
        autoPauseFlag: wallet.autoPauseFlag,
        autoPauseReason: wallet.autoPauseReason,
        latestMer: wallet.merDays[0]?.mer ?? null,
        spendHistory: wallet.spendEntries.map((s) => ({
          id: s.id,
          amount: s.amount,
          spentAt: s.spentAt.toISOString(),
          source: s.source,
        })),
      };
    });

  return {
    merchant: {
      id: merchant.id,
      businessName: merchant.businessName,
      verificationStatus: merchant.verificationStatus,
    },
    products,
    assignedCreators,
    unassignedProductSuggestions,
    ordersLedger,
    adWallets,
    sampleRequests: merchant.sampleRequests.map((s) => ({
      id: s.id,
      productTitle: s.product.title,
      creatorUsername: s.creator.username,
      note: s.note,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      shippingRef: s.shippingRef,
      depositAmount: s.depositAmount,
      depositCurrency: s.depositCurrency,
      ugcStatus: effectiveUgcStatus(s),
      ugcDeadline: s.ugcDeadline ? s.ugcDeadline.toISOString() : null,
      ugcVideoUrl: s.ugcVideoUrl,
    })),
  };
}
