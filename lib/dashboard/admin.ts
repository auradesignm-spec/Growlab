import { prisma } from "@/lib/db";
import { computeSimpleSplit } from "@/lib/domain/commission";
import { getWalletSnapshot } from "@/lib/ledger/wallet";
import { storeQualityFromOrders, type StoreQualityRow } from "@/lib/shop/storeQuality";

export interface AdminKycDoc {
  id: string;
  kind: string;
}

export interface AdminMerchantRow {
  id: string;
  userId: string;
  businessName: string;
  commercialRegNo: string;
  ownerFullName: string;
  city: string;
  verificationStatus: string;
  kycReviewNote: string | null;
  kycSubmittedAt: string | null;
  accountStatus: string;
  banReason: string | null;
  inviteEmail: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  productsCount: number;
  walletBalance: number;
  walletReserved: number;
  walletAvailable: number;
  documents: AdminKycDoc[];
}

export interface AdminCreatorRow {
  id: string;
  userId: string;
  username: string;
  legalName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  tier: string;
  verificationStatus: string;
  kycReviewNote: string | null;
  kycSubmittedAt: string | null;
  accountStatus: string;
  banReason: string | null;
  dealsCount: number;
  documents: AdminKycDoc[];
}

export interface AdminProductRow {
  id: string;
  title: string;
  merchantBusinessName: string;
  basePrice: number;
  currency: string;
  costPrice: number;
  commissionType: string;
  commissionValue: number;
  marketerCommission: number;
  platformFee: number;
  merchantNet: number;
  active: boolean;
}

export interface AdminOrderStatusRow {
  status: string;
  count: number;
}

export interface AdminOrderRow {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  buyerAddress: string;
  productTitle: string;
  merchantBusinessName: string;
  creatorUsername: string;
  quantity: number;
  unitPriceCharged: number;
  currency: string;
  status: string;
  escrowStatus: string;
  createdAt: string;
  attributedGmv: number | null;
  creatorShare: number | null;
}

export interface AdminSampleRow {
  id: string;
  productTitle: string;
  merchantBusinessName: string;
  creatorUsername: string;
  status: string;
  ugcStatus: string;
  depositAmount: number | null;
  shippingRef: string | null;
  createdAt: string;
}

export interface AdminPayoutRow {
  id: string;
  creatorUsername: string;
  type: string;
  amount: number;
  feeAmount: number;
  status: string;
  requestedAt: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface AdminDashboardData {
  totals: {
    merchants: number;
    verifiedMerchants: number;
    pendingMerchants: number;
    pendingCreators: number;
    creators: number;
    bannedAccounts: number;
    orders: number;
    attributedGmv: number;
    creatorShare: number;
    merchantShare: number;
    platformShare: number;
    pendingSampleRequests: number;
    pendingPayouts: number;
    escrowHeld: number;
    escrowReleased: number;
    escrowRefunded: number;
    flaggedStores: number;
  };
  merchants: AdminMerchantRow[];
  creators: AdminCreatorRow[];
  ordersByStatus: AdminOrderStatusRow[];
  products: AdminProductRow[];
  orders: AdminOrderRow[];
  samples: AdminSampleRow[];
  payouts: AdminPayoutRow[];
  storeQuality: StoreQualityRow[];
}

const OPS_ROW_LIMIT = 100;

export async function loadAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    merchants,
    creators,
    ledgerEntries,
    orderStatuses,
    recentOrders,
    samples,
    payouts,
    pendingSampleRequests,
    pendingPayouts,
    bannedAccounts,
  ] = await Promise.all([
      prisma.merchantProfile.findMany({
        include: { products: true, wallet: true, user: { include: { kycDocuments: true } } },
      }),
      prisma.creatorProfile.findMany({
        include: { deals: true, user: { include: { kycDocuments: true } } },
      }),
      prisma.ledgerEntry.findMany(),
      prisma.order.findMany({ select: { status: true, escrowStatus: true, deal: { select: { creator: { select: { username: true } } } } } }),
      prisma.order.findMany({
        take: OPS_ROW_LIMIT,
        orderBy: { createdAt: "desc" },
        include: {
          ledgerEntry: true,
          deal: { include: { creator: true, product: { include: { merchant: true } } } },
        },
      }),
      prisma.sampleRequest.findMany({
        take: OPS_ROW_LIMIT,
        orderBy: { createdAt: "desc" },
        include: { product: true, merchant: true, creator: true },
      }),
      prisma.payoutRequest.findMany({
        take: OPS_ROW_LIMIT,
        orderBy: { requestedAt: "desc" },
        include: { creator: true },
      }),
      prisma.sampleRequest.count({ where: { status: "pending" } }),
      prisma.payoutRequest.count({ where: { status: "requested" } }),
      prisma.user.count({ where: { accountStatus: "banned" } }),
    ]);

  const attributedGmv = sum(ledgerEntries.map((l) => l.attributedGmv));
  const creatorShare = sum(ledgerEntries.map((l) => l.creatorShare));
  const merchantShare = sum(ledgerEntries.map((l) => l.merchantShare));
  const platformShare = sum(ledgerEntries.map((l) => l.platformShare));

  const ordersByStatusMap = new Map<string, number>();
  const escrowCounts = { held: 0, released: 0, refunded: 0 };
  for (const o of orderStatuses) {
    ordersByStatusMap.set(o.status, (ordersByStatusMap.get(o.status) ?? 0) + 1);
    if (o.escrowStatus === "released") escrowCounts.released += 1;
    else if (o.escrowStatus === "refunded") escrowCounts.refunded += 1;
    else escrowCounts.held += 1;
  }

  const storeQuality = storeQualityFromOrders(
    orderStatuses.map((o) => ({ username: o.deal.creator.username, status: o.status })),
  );
  const flaggedStores = storeQuality.filter((row) => row.flag).length;

  return {
    totals: {
      merchants: merchants.length,
      verifiedMerchants: merchants.filter((m) => m.verificationStatus === "verified").length,
      pendingMerchants: merchants.filter((m) => m.verificationStatus === "pending").length,
      pendingCreators: creators.filter((c) => c.verificationStatus === "pending").length,
      creators: creators.length,
      bannedAccounts,
      orders: orderStatuses.length,
      attributedGmv: round2(attributedGmv),
      creatorShare: round2(creatorShare),
      merchantShare: round2(merchantShare),
      platformShare: round2(platformShare),
      pendingSampleRequests,
      pendingPayouts,
      escrowHeld: escrowCounts.held,
      escrowReleased: escrowCounts.released,
      escrowRefunded: escrowCounts.refunded,
      flaggedStores,
    },
    merchants: (
      await Promise.all(
        merchants.map(async (m) => {
          const wallet = await getWalletSnapshot(m.id);
          return {
            id: m.id,
            userId: m.userId,
            businessName: m.businessName,
            commercialRegNo: m.commercialRegNo,
            ownerFullName: m.ownerFullName,
            city: m.city,
            verificationStatus: m.verificationStatus,
            kycReviewNote: m.kycReviewNote,
            kycSubmittedAt: m.kycSubmittedAt?.toISOString() ?? null,
            accountStatus: m.user.accountStatus,
            banReason: m.user.banReason,
            inviteEmail: m.user.inviteEmail,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            phone: m.user.phone,
            email: m.user.email,
            productsCount: m.products.length,
            walletBalance: wallet.balance,
            walletReserved: wallet.reserved,
            walletAvailable: wallet.available,
            documents: m.user.kycDocuments.map((d) => ({ id: d.id, kind: d.kind })),
          };
        })
      )
    ).sort((a, b) => a.businessName.localeCompare(b.businessName)),
    creators: creators
      .map((c) => ({
        id: c.id,
        userId: c.userId,
        username: c.username,
        legalName: c.legalName,
        firstName: c.user.firstName,
        lastName: c.user.lastName,
        phone: c.user.phone,
        email: c.user.email,
        tier: c.tier,
        verificationStatus: c.verificationStatus,
        kycReviewNote: c.kycReviewNote,
        kycSubmittedAt: c.kycSubmittedAt?.toISOString() ?? null,
        accountStatus: c.user.accountStatus,
        banReason: c.user.banReason,
        dealsCount: c.deals.length,
        documents: c.user.kycDocuments.map((d) => ({ id: d.id, kind: d.kind })),
      }))
      .sort((a, b) => a.username.localeCompare(b.username)),
    ordersByStatus: [...ordersByStatusMap.entries()].map(([status, count]) => ({ status, count })),
    products: merchants
      .flatMap((m) =>
        m.products.map((p) => {
          const split = computeSimpleSplit({
            retailPrice: p.basePrice,
            commissionType: p.commissionType,
            commissionValue: p.commissionValue,
          });
          return {
            id: p.id,
            title: p.title,
            merchantBusinessName: m.businessName,
            basePrice: p.basePrice,
            currency: p.currency,
            costPrice: p.costPrice,
            commissionType: p.commissionType,
            commissionValue: p.commissionValue,
            marketerCommission: split.marketerCommission,
            platformFee: split.platformFee,
            merchantNet: split.merchantNet,
            active: p.active,
          };
        })
      )
      .sort((a, b) => a.title.localeCompare(b.title)),
    orders: recentOrders.map((o) => ({
      id: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      buyerCity: o.buyerCity,
      buyerAddress: o.buyerAddress,
      productTitle: o.deal.product.title,
      merchantBusinessName: o.deal.product.merchant.businessName,
      creatorUsername: o.deal.creator.username,
      quantity: o.quantity,
      unitPriceCharged: o.unitPriceCharged,
      currency: o.currency,
      status: o.status,
      escrowStatus: o.escrowStatus,
      createdAt: o.createdAt.toISOString(),
      attributedGmv: o.ledgerEntry ? round2(o.ledgerEntry.attributedGmv) : null,
      creatorShare: o.ledgerEntry ? round2(o.ledgerEntry.creatorShare) : null,
    })),
    samples: samples.map((s) => ({
      id: s.id,
      productTitle: s.product.title,
      merchantBusinessName: s.merchant.businessName,
      creatorUsername: s.creator.username,
      status: s.status,
      ugcStatus: s.ugcStatus,
      depositAmount: s.depositAmount,
      shippingRef: s.shippingRef,
      createdAt: s.createdAt.toISOString(),
    })),
    payouts: payouts
      .map((p) => ({
        id: p.id,
        creatorUsername: p.creator.username,
        type: p.type,
        amount: p.amount,
        feeAmount: p.feeAmount,
        status: p.status,
        requestedAt: p.requestedAt.toISOString(),
        bankName: p.creator.bankName,
        accountName: p.creator.accountName,
        accountNumber: p.creator.accountNumber,
      }))
      .sort((a, b) => Number(b.status === "requested") - Number(a.status === "requested")),
    storeQuality,
  };
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
