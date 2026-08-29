/**
 * Ad Platforms Integration Service (Meta Marketing API & Google Ads)
 * Fetches and maps multi-channel ad spend to SKUs, campaigns, and true net margins.
 */

export interface AdSpendRecord {
  id: string;
  platform: "META" | "GOOGLE" | "TIKTOK" | "SNAPCHAT";
  campaignId: string;
  campaignName: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  purchases: number;
  revenue: number;
  roas: number;
  cpc: number;
  cpa: number;
  targetSku?: string;
  targetChannel: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
}

export interface AdPlatformSyncStatus {
  platform: "META" | "GOOGLE" | "TIKTOK" | "SNAPCHAT";
  connected: boolean;
  accountName: string;
  accountId: string;
  lastSyncAt: string;
  currency: string;
  todaySpend: number;
  sevenDaysSpend: number;
  blendedRoas: number;
  activeCampaignsCount: number;
}

// In-memory synced ad spend dataset for high-performance dashboard calculations
let syncedAdRecords: AdSpendRecord[] = [
  {
    id: "ad-meta-01",
    platform: "META",
    campaignId: "cmp-meta-scale-01",
    campaignName: "Meta Advantage+ Summer Sale [KSA / UAE]",
    date: new Date().toISOString().slice(0, 10),
    spend: 3420,
    impressions: 148500,
    clicks: 4120,
    purchases: 86,
    revenue: 16850,
    roas: 4.92,
    cpc: 0.83,
    cpa: 39.76,
    targetSku: "GROW-SKU-01",
    targetChannel: "Shopify D2C",
    status: "ACTIVE",
  },
  {
    id: "ad-meta-02",
    platform: "META",
    campaignId: "cmp-meta-retarget-02",
    campaignName: "Meta DABA Catalog Retargeting (High Intent)",
    date: new Date().toISOString().slice(0, 10),
    spend: 1250,
    impressions: 42000,
    clicks: 1980,
    purchases: 45,
    revenue: 7800,
    roas: 6.24,
    cpc: 0.63,
    cpa: 27.77,
    targetSku: "GROW-SKU-02",
    targetChannel: "Shopify D2C",
    status: "ACTIVE",
  },
  {
    id: "ad-google-01",
    platform: "GOOGLE",
    campaignId: "cmp-google-pmax-01",
    campaignName: "Google Performance Max - Shopping Top Movers",
    date: new Date().toISOString().slice(0, 10),
    spend: 2150,
    impressions: 96000,
    clicks: 3200,
    purchases: 52,
    revenue: 9450,
    roas: 4.39,
    cpc: 0.67,
    cpa: 41.34,
    targetSku: "GROW-SKU-03",
    targetChannel: "Amazon / Direct",
    status: "ACTIVE",
  },
  {
    id: "ad-tiktok-01",
    platform: "TIKTOK",
    campaignId: "cmp-tt-ugc-01",
    campaignName: "TikTok Spark Ads - Creator UGC Viral Hook",
    date: new Date().toISOString().slice(0, 10),
    spend: 1890,
    impressions: 230000,
    clicks: 5800,
    purchases: 64,
    revenue: 8900,
    roas: 4.71,
    cpc: 0.32,
    cpa: 29.53,
    targetSku: "GROW-SKU-01",
    targetChannel: "TikTok Shop",
    status: "ACTIVE",
  },
  {
    id: "ad-snap-01",
    platform: "SNAPCHAT",
    campaignId: "cmp-snap-story-01",
    campaignName: "Snapchat Dynamic Story Ads KSA",
    date: new Date().toISOString().slice(0, 10),
    spend: 850,
    impressions: 110000,
    clicks: 2100,
    purchases: 18,
    revenue: 2900,
    roas: 3.41,
    cpc: 0.40,
    cpa: 47.22,
    targetSku: "GROW-SKU-04",
    targetChannel: "Shopify D2C",
    status: "ACTIVE",
  },
];

/**
 * Get aggregated ad spend summary for calculation of MER & Blended CAC
 */
export function getAggregatedAdSpend() {
  const totalSpend = syncedAdRecords.reduce((sum, r) => sum + r.spend, 0);
  const totalRevenue = syncedAdRecords.reduce((sum, r) => sum + r.revenue, 0);
  const totalPurchases = syncedAdRecords.reduce((sum, r) => sum + r.purchases, 0);
  const blendedRoas = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;
  const blendedCac = totalPurchases > 0 ? Number((totalSpend / totalPurchases).toFixed(2)) : 0;

  return {
    totalSpend,
    totalRevenue,
    totalPurchases,
    blendedRoas,
    blendedCac,
    recordsCount: syncedAdRecords.length,
  };
}

/**
 * Get all sync records
 */
export function getAdSpendRecords(): AdSpendRecord[] {
  return [...syncedAdRecords];
}

/**
 * Fetch connected ad platform statuses
 */
export function getAdPlatformStatuses(): AdPlatformSyncStatus[] {
  return [
    {
      platform: "META",
      connected: true,
      accountName: "Growlab Meta Ads Manager (KSA/GCC)",
      accountId: "act_694829104820",
      lastSyncAt: "منذ 4 دقائق",
      currency: "SAR",
      todaySpend: 4670,
      sevenDaysSpend: 32690,
      blendedRoas: 5.28,
      activeCampaignsCount: 6,
    },
    {
      platform: "GOOGLE",
      connected: true,
      accountName: "Growlab Google PMax Ads",
      accountId: "982-419-7721",
      lastSyncAt: "منذ 12 دقيقة",
      currency: "SAR",
      todaySpend: 2150,
      sevenDaysSpend: 15050,
      blendedRoas: 4.39,
      activeCampaignsCount: 3,
    },
    {
      platform: "TIKTOK",
      connected: true,
      accountName: "Growlab TikTok Business Center",
      accountId: "tt_7109283401928",
      lastSyncAt: "منذ 8 دقائق",
      currency: "SAR",
      todaySpend: 1890,
      sevenDaysSpend: 13230,
      blendedRoas: 4.71,
      activeCampaignsCount: 4,
    },
    {
      platform: "SNAPCHAT",
      connected: false,
      accountName: "Snap Ads Account",
      accountId: "snap_pending",
      lastSyncAt: "غير متصل",
      currency: "SAR",
      todaySpend: 0,
      sevenDaysSpend: 0,
      blendedRoas: 0,
      activeCampaignsCount: 0,
    },
  ];
}

/**
 * Simulate live sync from ad platform
 */
export async function syncPlatformAdSpend(platform: "META" | "GOOGLE" | "TIKTOK" | "SNAPCHAT") {
  // Simulates instant synchronization with live Graph API
  return {
    success: true,
    platform,
    syncedAt: new Date().toISOString(),
    newRecordsCount: 2,
    message: `تمت مزامنة بيانات الإنفاق الإعلاني وحسابات العائد لـ ${platform} بنجاح.`,
  };
}
