import { prisma } from "@/lib/db";
import { computeSimpleSplit } from "@/lib/domain/commission";
import { getWalletSnapshot } from "@/lib/ledger/wallet";
import { excerpt, scanModeration, type ModerationReason } from "@/lib/security/moderation";
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
  plan: string;
  planSource: string;
  planExpiresAt: string | null;
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

export interface AdminUserRow {
  id: string;
  name: string;
  role: string;
  accountStatus: string;
  banReason: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  createdAt: string;
  handle: string;
}

export interface AdminTrafficDay {
  date: string;
  visits: number;
}

export interface AdminTrafficStore {
  username: string;
  visits: number;
}

export interface AdminLeadRow {
  id: string;
  name: string;
  biz: string;
  phone: string;
  msg: string;
  createdAt: string;
}

export interface AdminFlagRow {
  id: string;
  kind: "product" | "bio" | "sample";
  title: string;
  owner: string;
  excerpt: string;
  reasons: ModerationReason[];
  productId?: string;
  userId?: string;
}

export interface AdminDashboardData {
  totals: {
    merchants: number;
    verifiedMerchants: number;
    pendingMerchants: number;
    pendingCreators: number;
    creators: number;
    bannedAccounts: number;
    suspendedAccounts: number;
    users: number;
    visits7d: number;
    visitsToday: number;
    walletCash: number;
    contactLeads: number;
    flaggedContent: number;
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
  trafficDays: AdminTrafficDay[];
  trafficStores: AdminTrafficStore[];
  users: AdminUserRow[];
  leads: AdminLeadRow[];
  flags: AdminFlagRow[];
  merchants: AdminMerchantRow[];
  creators: AdminCreatorRow[];
  ordersByStatus: AdminOrderStatusRow[];
  products: AdminProductRow[];
  orders: AdminOrderRow[];
  samples: AdminSampleRow[];
  payouts: AdminPayoutRow[];
  storeQuality: StoreQualityRow[];
  walletTopups: AdminWalletTopupRow[];
}

export interface AdminWalletTopupRow {
  id: string;
  merchantId: string;
  businessName: string;
  amount: number;
  currency: string;
  proofNote: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
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
    suspendedAccounts,
    users,
    visits,
    leads,
    walletSum,
    sampleNotes,
    walletTopups,
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
      prisma.user.count({ where: { accountStatus: "suspended" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: { merchantProfile: true, creatorProfile: true },
      }),
      prisma.storefrontVisit.findMany({
        where: { createdAt: { gte: daysAgo(7) } },
        select: { username: true, createdAt: true },
      }),
      prisma.contactLead.findMany({ take: 40, orderBy: { createdAt: "desc" } }),
      prisma.merchantWallet.aggregate({ _sum: { balance: true } }),
      prisma.sampleRequest.findMany({
        where: { note: { not: null } },
        select: {
          id: true,
          note: true,
          creator: { select: { username: true, userId: true } },
          product: { select: { title: true } },
        },
        take: 200,
      }),
      prisma.walletTopupRequest.findMany({
        take: OPS_ROW_LIMIT,
        orderBy: { createdAt: "desc" },
        include: { merchant: { select: { businessName: true } } },
      }),
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
  const traffic = bucketVisits(visits);
  const flags = collectFlags(merchants, creators, sampleNotes);

  return {
    trafficDays: traffic.days,
    trafficStores: traffic.stores,
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      accountStatus: user.accountStatus,
      banReason: user.banReason,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email || user.inviteEmail || "",
      createdAt: user.createdAt.toISOString(),
      handle: user.creatorProfile?.username || user.merchantProfile?.businessName || user.name,
    })),
    leads: leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      biz: lead.biz,
      phone: lead.phone,
      msg: lead.msg,
      createdAt: lead.createdAt.toISOString(),
    })),
    flags,
    totals: {
      merchants: merchants.length,
      verifiedMerchants: merchants.filter((m) => m.verificationStatus === "verified").length,
      pendingMerchants: merchants.filter((m) => m.verificationStatus === "pending").length,
      pendingCreators: creators.filter((c) => c.verificationStatus === "pending").length,
      creators: creators.length,
      bannedAccounts,
      suspendedAccounts,
      users: users.length,
      visits7d: visits.length,
      visitsToday: traffic.today,
      walletCash: round2(walletSum._sum.balance ?? 0),
      contactLeads: leads.length,
      flaggedContent: flags.length,
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
            plan: m.plan,
            planSource: m.planSource,
            planExpiresAt: m.planExpiresAt?.toISOString() ?? null,
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
    walletTopups: walletTopups.map((r) => ({
      id: r.id,
      merchantId: r.merchantId,
      businessName: r.merchant.businessName,
      amount: r.amount,
      currency: r.currency,
      proofNote: r.proofNote,
      status: r.status,
      adminNote: r.adminNote,
      createdAt: r.createdAt.toISOString(),
      processedAt: r.processedAt?.toISOString() ?? null,
    })),
  };
}

function daysAgo(n: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function bucketVisits(visits: { username: string; createdAt: Date }[]) {
  const todayKey = dayKey(new Date());
  const days: AdminTrafficDay[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = daysAgo(i);
    days.push({ date: dayKey(date), visits: 0 });
  }
  const byDay = new Map(days.map((row) => [row.date, row]));
  const byStore = new Map<string, number>();
  let today = 0;
  for (const visit of visits) {
    const key = dayKey(visit.createdAt);
    const day = byDay.get(key);
    if (day) day.visits += 1;
    if (key === todayKey) today += 1;
    byStore.set(visit.username, (byStore.get(visit.username) ?? 0) + 1);
  }
  const stores = [...byStore.entries()]
    .map(([username, count]) => ({ username, visits: count }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 8);
  return { days, stores, today };
}

function collectFlags(
  merchants: Array<{
    businessName: string;
    userId: string;
    products: Array<{ id: string; title: string; category: string; tags: string }>;
  }>,
  creators: Array<{ username: string; bio: string | null; userId: string }>,
  samples: Array<{
    id: string;
    note: string | null;
    creator: { username: string; userId: string };
    product: { title: string };
  }>
): AdminFlagRow[] {
  const flags: AdminFlagRow[] = [];

  for (const merchant of merchants) {
    for (const product of merchant.products) {
      const text = `${product.title} ${product.category} ${product.tags}`;
      const hit = scanModeration(text);
      if (!hit.flagged) continue;
      flags.push({
        id: `product:${product.id}`,
        kind: "product",
        title: product.title,
        owner: merchant.businessName,
        excerpt: excerpt(text),
        reasons: [...hit.reasons],
        productId: product.id,
      });
    }
  }

  for (const creator of creators) {
    if (!creator.bio) continue;
    const hit = scanModeration(creator.bio);
    if (!hit.flagged) continue;
    flags.push({
      id: `bio:${creator.userId}`,
      kind: "bio",
      title: `@${creator.username}`,
      owner: creator.username,
      excerpt: excerpt(creator.bio),
      reasons: [...hit.reasons],
      userId: creator.userId,
    });
  }

  for (const sample of samples) {
    if (!sample.note) continue;
    const hit = scanModeration(sample.note);
    if (!hit.flagged) continue;
    flags.push({
      id: `sample:${sample.id}`,
      kind: "sample",
      title: sample.product.title,
      owner: `@${sample.creator.username}`,
      excerpt: excerpt(sample.note),
      reasons: [...hit.reasons],
      userId: sample.creator.userId,
    });
  }

  return flags;
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
