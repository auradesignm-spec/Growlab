import { prisma } from "@/lib/db";
import { productAttributes, productFeatures, productPromo, productTags, productVariants } from "@/lib/catalog-db";
import { suggestCreatorsForProduct, type CreatorMatchSuggestion } from "@/lib/matching/suggest";
import type { OrderLedgerRow } from "@/lib/dashboard/types";
import { effectiveUgcStatus } from "@/lib/domain/ugc";
import { computeSimpleSplit, type SimpleSplitResult } from "@/lib/domain/commission";
import { getWalletSnapshot, type WalletSnapshot } from "@/lib/ledger/wallet";
import { countVisitsByDealIds } from "@/lib/shop/visits";
import { loadMerchantCampaigns } from "@/app/(dashboard)/dashboard/performance-actions";
import { loadWalletTopupRequests } from "@/app/(dashboard)/dashboard/wallet-actions";
import { loadMerchantBuyerReels } from "@/app/(dashboard)/dashboard/content-actions";
import { effectivePlan, planLimits } from "@/lib/billing/entitlements";
import type { MerchantPlanId } from "@/lib/domain/enums";
import {
  merchantOnboardingProgress,
  type MerchantOnboardingProgress,
} from "@/lib/domain/merchantOnboarding";
import type { CampaignRow, BuyerReelRow } from "@/components/dashboard/PerformanceCampaignPanel";
import type { TopupRow } from "@/components/dashboard/WalletTopupPanel";

export interface MerchantMediaAssetRow {
  id: string;
  type: string;
  url: string;
  caption: string | null;
}

export interface MerchantProductRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  variants: string[];
  shortDescription: string;
  descriptionHtml: string;
  attributes: import("@/lib/catalog-db").ProductAttributes;
  features: string[];
  promo: import("@/lib/merchant-store/promo").StorePromo;
  sourceUrl: string;
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
  visitCount: number;
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

export interface MerchantPendingApplication {
  dealId: string;
  productId: string;
  productTitle: string;
  creatorId: string;
  creatorUsername: string;
  creatorTier: string;
  creatorOrders: number;
  creatorNetSales: number;
  createdAt: string;
}

export interface MerchantStoreSummary {
  slug: string;
  published: boolean;
  tagline: string;
}

export interface MerchantDashboardData {
  merchant: {
    id: string;
    businessName: string;
    verificationStatus: string;
    effectivePlan: MerchantPlanId;
    planSource: string;
    planExpiresAt: string | null;
    limits: ReturnType<typeof planLimits>;
  };
  store: MerchantStoreSummary | null;
  onboarding: MerchantOnboardingProgress;
  wallet: WalletSnapshot;
  products: MerchantProductRow[];
  campaigns: CampaignRow[];
  buyerReels: BuyerReelRow[];
  topupRequests: TopupRow[];
  assignedCreators: AssignedCreatorRow[];
  unassignedProductSuggestions: UnassignedProductSuggestion[];
  ordersLedger: OrderLedgerRow[];
  sampleRequests: MerchantSampleRequestRow[];
  pendingApplications: MerchantPendingApplication[];
}

export async function loadMerchantDashboardData(merchantId: string): Promise<MerchantDashboardData> {
  const merchant = await prisma.merchantProfile.findUniqueOrThrow({
    where: { id: merchantId },
    include: {
      store: true,
      products: { include: { deals: true, mediaAssets: { orderBy: { createdAt: "asc" } } } },
      sampleRequests: {
        include: { product: true, creator: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const productDealIds = merchant.products.flatMap((p) => p.deals.map((d) => d.id));
  const visitsByDeal = await countVisitsByDealIds(productDealIds);

  const products: MerchantProductRow[] = merchant.products.map((p) => {
    const row = p as typeof p & {
      slug?: string;
      shortDescription?: string;
      descriptionHtml?: string;
      attributesJson?: string | null;
      featuresJson?: string | null;
      promoJson?: string | null;
      promoEndsAt?: Date | null;
      sourceUrl?: string;
    };
    return {
      id: row.id,
      title: row.title,
      slug: row.slug || "",
      category: row.category,
      tags: productTags(row),
      variants: productVariants(row),
      shortDescription: row.shortDescription ?? "",
      descriptionHtml: row.descriptionHtml ?? "",
      attributes: productAttributes(row),
      features: productFeatures(row),
      promo: productPromo(row),
      sourceUrl: row.sourceUrl ?? "",
      basePrice: row.basePrice,
      currency: row.currency,
      cogsPct: row.cogsPct,
      costPrice: row.costPrice,
      commissionType: row.commissionType,
      commissionValue: row.commissionValue,
      active: row.active,
      activeDealsCount: row.deals.filter((d) => d.status === "active").length,
      mediaAssets: row.mediaAssets.map((a) => ({ id: a.id, type: a.type, url: a.url, caption: a.caption })),
      simpleSplit: computeSimpleSplit({
        retailPrice: row.basePrice,
        costPrice: row.costPrice,
        commissionType: row.commissionType,
        commissionValue: row.commissionValue,
        settlementChannel: "cod",
      }),
      visitCount: row.deals.reduce((sum, deal) => sum + (visitsByDeal.get(deal.id) ?? 0), 0),
    };
  });

  const productIds = merchant.products.map((p) => p.id);

  const deals = await prisma.creatorDeal.findMany({
    where: { productId: { in: productIds } },
    include: {
      creator: true,
      product: true,
      orders: { include: { ledgerEntry: true } },
    },
  });

  const creatorMap = new Map<string, AssignedCreatorRow>();
  for (const deal of deals) {
    if (deal.status !== "active") continue;
    const existing = creatorMap.get(deal.creatorId);
    const netSales = deal.orders.reduce((sum, o) => sum + (o.ledgerEntry?.attributedGmv ?? 0), 0);
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

  const pendingDeals = deals.filter((deal) => deal.status === "pending");
  const pendingCreatorIds = [...new Set(pendingDeals.map((deal) => deal.creatorId))];
  const pendingHistory =
    pendingCreatorIds.length === 0
      ? []
      : await prisma.creatorDeal.findMany({
          where: { creatorId: { in: pendingCreatorIds } },
          include: { orders: { include: { ledgerEntry: true } } },
        });
  const pulseByCreator = new Map<string, { orders: number; netSales: number }>();
  for (const deal of pendingHistory) {
    const netSales = deal.orders.reduce((sum, o) => sum + (o.ledgerEntry?.attributedGmv ?? 0), 0);
    const existing = pulseByCreator.get(deal.creatorId) ?? { orders: 0, netSales: 0 };
    existing.orders += deal.orders.length;
    existing.netSales += netSales;
    pulseByCreator.set(deal.creatorId, existing);
  }

  const pendingApplications: MerchantPendingApplication[] = pendingDeals
    .map((deal) => {
      const pulse = pulseByCreator.get(deal.creatorId);
      return {
        dealId: deal.id,
        productId: deal.productId,
        productTitle: deal.product.title,
        creatorId: deal.creatorId,
        creatorUsername: deal.creator.username,
        creatorTier: deal.creator.tier,
        creatorOrders: pulse?.orders ?? 0,
        creatorNetSales: pulse?.netSales ?? 0,
        createdAt: deal.createdAt.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  const wallet = await getWalletSnapshot(merchant.id);
  const [campaigns, topupRequests, buyerReels] = await Promise.all([
    loadMerchantCampaigns(merchant.id),
    loadWalletTopupRequests(merchant.id),
    loadMerchantBuyerReels(merchant.id),
  ]);

  const store: MerchantStoreSummary | null = merchant.store
    ? {
        slug: merchant.store.slug,
        published: merchant.store.published,
        tagline: merchant.store.tagline,
      }
    : null;

  const onboarding = merchantOnboardingProgress({
    verificationStatus: merchant.verificationStatus,
    hasStore: Boolean(merchant.store),
    storePublished: Boolean(merchant.store?.published),
    productCount: products.length,
    hasActiveOrDraftCampaign: campaigns.some((c) => c.status === "active" || c.status === "draft"),
  });

  return {
    merchant: {
      id: merchant.id,
      businessName: merchant.businessName,
      verificationStatus: merchant.verificationStatus,
      effectivePlan: effectivePlan(merchant),
      planSource: merchant.planSource,
      planExpiresAt: merchant.planExpiresAt?.toISOString() ?? null,
      limits: planLimits(merchant),
    },
    store,
    onboarding,
    wallet,
    products,
    campaigns,
    buyerReels,
    topupRequests,
    assignedCreators,
    unassignedProductSuggestions,
    ordersLedger,
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
    pendingApplications,
  };
}
