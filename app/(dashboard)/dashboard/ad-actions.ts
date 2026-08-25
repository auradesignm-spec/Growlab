"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { analyzeAdCreative, type AdAnalysisResult, type AdPerformanceContext } from "@/lib/meta/adAgent";
import { publicMetaClientConfig } from "@/lib/meta/config";
import {
  decryptAdsToken,
  launchCtwaAdvantageCampaign,
  listAdAccounts,
  listManagedPages,
  metaAdsDryRun,
  setMetaObjectStatus,
} from "@/lib/meta/marketing";

async function requireVerifiedMerchant() {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a verified merchant can use Ad Coach.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new Error("Verify your merchant account first.");
  }
  return viewer.merchantProfile;
}

export type AdDraftView = {
  id: string;
  status: string;
  locale: string;
  originalHook: string;
  originalCaption: string;
  originalScript: string;
  originalVisualHook: string;
  suggestedHook: string;
  suggestedCaption: string;
  suggestedScript: string;
  suggestedVisualHook: string;
  suggestedCta: string;
  rationale: string;
  analysis: AdAnalysisResult | null;
  createdAt: string;
};

export type AdAccountView = {
  connected: boolean;
  adAccountId: string;
  adAccountName: string;
  currency: string;
  pageId: string;
  status: string;
  dryRun: boolean;
  appId: string;
};

export type AdLaunchView = {
  id: string;
  draftId: string | null;
  status: string;
  dailyBudgetOmr: number;
  currency: string;
  metaCampaignId: string;
  metaAdId: string;
  imageUrl: string;
  headline: string;
  dryRun: boolean;
  lastError: string;
  launchedAt: string | null;
  pausedAt: string | null;
  createdAt: string;
};

async function buildPerformanceContext(
  merchantId: string,
  productId?: string,
): Promise<AdPerformanceContext> {
  const [leads, connection, product] = await Promise.all([
    prisma.interestLead.findMany({
      where: { merchantId },
      select: { status: true, ctwaClid: true },
      take: 500,
    }),
    prisma.metaConnection.findUnique({
      where: { merchantId },
      select: { status: true },
    }),
    productId
      ? prisma.product.findFirst({
          where: { id: productId, merchantId },
          select: { title: true, basePrice: true },
        })
      : Promise.resolve(null),
  ]);

  return {
    leadsTotal: leads.length,
    leadsFromAd: leads.filter((l) => Boolean(l.ctwaClid)).length,
    leadsOrganic: leads.filter((l) => !l.ctwaClid).length,
    chatting: leads.filter((l) => l.status === "chatting").length,
    interested: leads.filter((l) => l.status === "interested").length,
    rejected: leads.filter((l) => l.status === "rejected").length,
    whatsappConnected: connection?.status === "active",
    productTitle: product?.title,
    productPrice: product?.basePrice,
  };
}

function toView(row: {
  id: string;
  status: string;
  locale: string;
  originalHook: string;
  originalCaption: string;
  originalScript: string;
  originalVisualHook: string;
  suggestedHook: string;
  suggestedCaption: string;
  suggestedScript: string;
  suggestedVisualHook: string;
  suggestedCta: string;
  rationale: string;
  analysisJson: string;
  createdAt: Date;
}): AdDraftView {
  let analysis: AdAnalysisResult | null = null;
  try {
    analysis = JSON.parse(row.analysisJson) as AdAnalysisResult;
  } catch {
    analysis = null;
  }
  return {
    id: row.id,
    status: row.status,
    locale: row.locale,
    originalHook: row.originalHook,
    originalCaption: row.originalCaption,
    originalScript: row.originalScript,
    originalVisualHook: row.originalVisualHook,
    suggestedHook: row.suggestedHook,
    suggestedCaption: row.suggestedCaption,
    suggestedScript: row.suggestedScript,
    suggestedVisualHook: row.suggestedVisualHook,
    suggestedCta: row.suggestedCta,
    rationale: row.rationale,
    analysis,
    createdAt: row.createdAt.toISOString(),
  };
}

function toLaunchView(row: {
  id: string;
  draftId: string | null;
  status: string;
  dailyBudgetOmr: number;
  currency: string;
  metaCampaignId: string;
  metaAdId: string;
  imageUrl: string;
  headline: string;
  dryRun: boolean;
  lastError: string;
  launchedAt: Date | null;
  pausedAt: Date | null;
  createdAt: Date;
}): AdLaunchView {
  return {
    id: row.id,
    draftId: row.draftId,
    status: row.status,
    dailyBudgetOmr: row.dailyBudgetOmr,
    currency: row.currency,
    metaCampaignId: row.metaCampaignId,
    metaAdId: row.metaAdId,
    imageUrl: row.imageUrl,
    headline: row.headline,
    dryRun: row.dryRun,
    lastError: row.lastError,
    launchedAt: row.launchedAt?.toISOString() ?? null,
    pausedAt: row.pausedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export type AdProductOption = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  images: string[];
};

export async function loadAdCoachState(): Promise<{
  drafts: AdDraftView[];
  products: AdProductOption[];
  context: AdPerformanceContext;
  adAccount: AdAccountView;
  launches: AdLaunchView[];
  whatsappPhone: string;
  whatsappConnected: boolean;
}> {
  const merchant = await requireVerifiedMerchant();
  const pub = publicMetaClientConfig();
  const [drafts, products, context, adAccount, launches, wa] = await Promise.all([
    prisma.adCreativeDraft.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.product.findMany({
      where: { merchantId: merchant.id, active: true },
      select: {
        id: true,
        title: true,
        basePrice: true,
        mediaAssets: {
          where: { type: "image" },
          select: { url: true },
          orderBy: { createdAt: "asc" },
          take: 8,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    buildPerformanceContext(merchant.id),
    prisma.metaAdAccount.findUnique({ where: { merchantId: merchant.id } }),
    prisma.metaAdLaunch.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.metaConnection.findUnique({
      where: { merchantId: merchant.id },
      select: { displayPhone: true, status: true, pageId: true },
    }),
  ]);

  return {
    drafts: drafts.map(toView),
    products: products.map((p) => {
      const images = p.mediaAssets.map((m) => m.url).filter((u) => u.startsWith("http"));
      return {
        id: p.id,
        title: p.title,
        price: p.basePrice,
        imageUrl: images[0] ?? "",
        images,
      };
    }),
    context,
    adAccount: {
      connected: Boolean(adAccount && adAccount.status === "active"),
      adAccountId: adAccount?.adAccountId ?? "",
      adAccountName: adAccount?.adAccountName ?? "",
      currency: adAccount?.currency ?? "OMR",
      pageId: adAccount?.pageId || wa?.pageId || "",
      status: adAccount?.status ?? "disconnected",
      dryRun: pub.adsDryRun || metaAdsDryRun(),
      appId: pub.appId,
    },
    launches: launches.map(toLaunchView),
    whatsappPhone: wa?.displayPhone ?? "",
    whatsappConnected: wa?.status === "active",
  };
}

export async function analyzeMerchantAdCreative(input: {
  locale?: "ar" | "en";
  productId?: string;
  hook: string;
  caption: string;
  script: string;
  visualHook: string;
}): Promise<AdDraftView> {
  const merchant = await requireVerifiedMerchant();
  const locale = input.locale === "en" ? "en" : "ar";
  const productId = input.productId?.trim() || undefined;

  if (productId) {
    const owned = await prisma.product.findFirst({
      where: { id: productId, merchantId: merchant.id },
      select: { id: true },
    });
    if (!owned) throw new Error("Product not found.");
  }

  const context = await buildPerformanceContext(merchant.id, productId);
  const analysis = await analyzeAdCreative({
    locale,
    hook: input.hook,
    caption: input.caption,
    script: input.script,
    visualHook: input.visualHook,
    context,
  });

  const row = await prisma.adCreativeDraft.create({
    data: {
      merchantId: merchant.id,
      productId: productId ?? null,
      locale,
      originalHook: input.hook.trim().slice(0, 300),
      originalCaption: input.caption.trim().slice(0, 2200),
      originalScript: input.script.trim().slice(0, 2200),
      originalVisualHook: input.visualHook.trim().slice(0, 400),
      analysisJson: JSON.stringify(analysis),
      suggestedHook: analysis.suggestedHook,
      suggestedCaption: analysis.suggestedCaption,
      suggestedScript: analysis.suggestedScript,
      suggestedVisualHook: analysis.suggestedVisualHook,
      suggestedCta: analysis.suggestedCta,
      rationale: analysis.rationale,
      status: "analyzed",
    },
  });

  revalidatePath("/dashboard/ads");
  return toView(row);
}

export async function setAdDraftStatus(
  draftId: string,
  status: "approved" | "rejected" | "exported",
): Promise<{ ok: true }> {
  const merchant = await requireVerifiedMerchant();
  const draft = await prisma.adCreativeDraft.findFirst({
    where: { id: draftId, merchantId: merchant.id },
  });
  if (!draft) throw new Error("Draft not found.");
  if (status === "exported") {
    throw new Error("Use applyApprovedSuggestions to export — approval gate required.");
  }
  if (status === "approved" && draft.status !== "analyzed") {
    throw new Error("Only analyzed drafts can be approved.");
  }
  if (status === "rejected" && draft.status !== "analyzed" && draft.status !== "approved") {
    throw new Error("Nothing to reject.");
  }

  await prisma.adCreativeDraft.update({
    where: { id: draft.id },
    data: { status },
  });
  revalidatePath("/dashboard/ads");
  return { ok: true };
}

/** Apply suggested fields onto originals (still no Meta spend). */
export async function applyApprovedSuggestions(draftId: string): Promise<AdDraftView> {
  const merchant = await requireVerifiedMerchant();
  const draft = await prisma.adCreativeDraft.findFirst({
    where: { id: draftId, merchantId: merchant.id },
  });
  if (!draft) throw new Error("Draft not found.");
  if (draft.status !== "approved") {
    throw new Error("Approve suggestions before applying.");
  }

  const row = await prisma.adCreativeDraft.update({
    where: { id: draft.id },
    data: {
      originalHook: draft.suggestedHook,
      originalCaption: draft.suggestedCaption,
      originalScript: draft.suggestedScript,
      originalVisualHook: draft.suggestedVisualHook,
      status: "exported",
    },
  });
  revalidatePath("/dashboard/ads");
  return toView(row);
}

export async function disconnectMetaAdAccount(): Promise<{ ok: true }> {
  const merchant = await requireVerifiedMerchant();
  await prisma.metaAdAccount.deleteMany({ where: { merchantId: merchant.id } });
  revalidatePath("/dashboard/ads");
  return { ok: true };
}

export type MetaAdOptionLists = {
  accounts: Array<{ id: string; name: string; currency: string; currencyOffset: number }>;
  pages: Array<{ id: string; name: string }>;
};

/** Re-list ad accounts + pages with the stored long-lived token. */
export async function refreshMetaAdOptions(): Promise<MetaAdOptionLists> {
  const merchant = await requireVerifiedMerchant();
  const row = await prisma.metaAdAccount.findUnique({ where: { merchantId: merchant.id } });
  if (!row || row.status !== "active") throw new Error("Connect an Ad Account first.");

  if (metaAdsDryRun() || row.adAccountId === "dry_account") {
    return {
      accounts: [
        {
          id: row.adAccountId,
          name: row.adAccountName || "Dry-run Ad Account",
          currency: row.currency,
          currencyOffset: row.currencyOffset,
        },
      ],
      pages: [{ id: row.pageId || "dry_page", name: "Dry-run Page" }],
    };
  }

  const token = decryptAdsToken(row.accessTokenEnc);
  const [accounts, pages] = await Promise.all([listAdAccounts(token), listManagedPages(token)]);
  const active = accounts.filter((a) => a.accountStatus === 1);
  const pool = active.length ? active : accounts;
  return {
    accounts: pool.map((a) => ({
      id: a.id,
      name: a.name,
      currency: a.currency,
      currencyOffset: a.currencyOffset,
    })),
    pages,
  };
}

/** Switch which ad account / Page will pay and host the CTWA ad. */
export async function selectMetaAdTargets(input: {
  adAccountId: string;
  pageId: string;
}): Promise<AdAccountView> {
  const merchant = await requireVerifiedMerchant();
  const row = await prisma.metaAdAccount.findUnique({ where: { merchantId: merchant.id } });
  if (!row || row.status !== "active") throw new Error("Connect an Ad Account first.");

  const adAccountId = input.adAccountId.replace(/^act_/, "").trim();
  const pageId = input.pageId.trim();
  if (!adAccountId || !pageId) throw new Error("Pick both an ad account and a Facebook Page.");

  const pub = publicMetaClientConfig();

  if (metaAdsDryRun() || row.adAccountId === "dry_account") {
    const updated = await prisma.metaAdAccount.update({
      where: { id: row.id },
      data: { adAccountId, pageId, lastError: "" },
    });
    return {
      connected: true,
      adAccountId: updated.adAccountId,
      adAccountName: updated.adAccountName,
      currency: updated.currency,
      pageId: updated.pageId,
      status: updated.status,
      dryRun: true,
      appId: pub.appId,
    };
  }

  const token = decryptAdsToken(row.accessTokenEnc);
  const [accounts, pages] = await Promise.all([listAdAccounts(token), listManagedPages(token)]);
  const chosen = accounts.find((a) => a.id === adAccountId);
  if (!chosen) throw new Error("That ad account is not available for this Meta login.");
  const pageOk = pages.some((p) => p.id === pageId) || pageId === row.pageId;
  if (!pageOk) throw new Error("That Facebook Page is not available for this Meta login.");

  const updated = await prisma.metaAdAccount.update({
    where: { id: row.id },
    data: {
      adAccountId: chosen.id,
      adAccountName: chosen.name,
      currency: chosen.currency,
      currencyOffset: chosen.currencyOffset,
      pageId,
      lastError: "",
    },
  });

  revalidatePath("/dashboard/ads");
  return {
    connected: true,
    adAccountId: updated.adAccountId,
    adAccountName: updated.adAccountName,
    currency: updated.currency,
    pageId: updated.pageId,
    status: updated.status,
    dryRun: false,
    appId: pub.appId,
  };
}

/**
 * Launch CTWA Advantage+ campaign from an approved/exported draft.
 * Merchant must confirm daily budget — this is the spend gate.
 */
export async function launchApprovedAdCampaign(input: {
  draftId: string;
  dailyBudgetOmr: number;
  imageUrl: string;
  countries?: string[];
  confirmSpend: boolean;
}): Promise<AdLaunchView> {
  const merchant = await requireVerifiedMerchant();
  if (!input.confirmSpend) {
    throw new Error("Confirm that you authorize Meta ad spend from your ad account.");
  }

  const budget = Number(input.dailyBudgetOmr);
  if (!Number.isFinite(budget) || budget < 1) {
    throw new Error("Daily budget must be at least 1 OMR (or account currency unit).");
  }
  if (budget > 500) {
    throw new Error("Daily budget cap for safety is 500. Raise later if needed.");
  }

  const imageUrl = input.imageUrl.trim();
  if (!imageUrl.startsWith("http")) {
    throw new Error("Provide a public https image URL for the ad.");
  }

  const draft = await prisma.adCreativeDraft.findFirst({
    where: { id: input.draftId, merchantId: merchant.id },
  });
  if (!draft) throw new Error("Draft not found.");
  if (draft.status !== "approved" && draft.status !== "exported") {
    throw new Error("Approve the creative before launching.");
  }

  const [adAccount, wa] = await Promise.all([
    prisma.metaAdAccount.findUnique({ where: { merchantId: merchant.id } }),
    prisma.metaConnection.findUnique({ where: { merchantId: merchant.id } }),
  ]);
  if (!adAccount || adAccount.status !== "active") {
    throw new Error("Connect a Meta Ad Account first.");
  }
  if (!wa || wa.status !== "active") {
    throw new Error("Connect WhatsApp on Channels before launching CTWA ads.");
  }

  const pageId = adAccount.pageId.trim() || wa.pageId.trim();
  if (!pageId && !metaAdsDryRun()) {
    throw new Error("Facebook Page ID missing — reconnect Ads or WhatsApp with a Page.");
  }

  const headline = (draft.suggestedHook || draft.originalHook || "عرض").slice(0, 255);
  const primaryText = (draft.suggestedCaption || draft.originalCaption || headline).slice(0, 2000);
  const countries = (input.countries?.length ? input.countries : ["OM"]).map((c) => c.toUpperCase());

  const placeholder = await prisma.metaAdLaunch.create({
    data: {
      merchantId: merchant.id,
      draftId: draft.id,
      productId: draft.productId,
      dailyBudgetOmr: budget,
      dailyBudgetMinor: 0,
      currency: adAccount.currency || "OMR",
      countries: countries.join(","),
      imageUrl,
      primaryText,
      headline,
      status: "creating",
      dryRun: metaAdsDryRun(),
    },
  });

  try {
    const accessToken = decryptAdsToken(adAccount.accessTokenEnc);
    const result = await launchCtwaAdvantageCampaign({
      accessToken,
      adAccountId: adAccount.adAccountId,
      currencyOffset: adAccount.currencyOffset || 1000,
      pageId: pageId || "dry_page",
      whatsappDisplayPhone: wa.displayPhone,
      dailyBudgetOmr: budget,
      countries,
      headline,
      primaryText,
      imageUrl,
      campaignName: `Growlab CTWA · ${headline}`.slice(0, 120),
    });

    const row = await prisma.metaAdLaunch.update({
      where: { id: placeholder.id },
      data: {
        metaCampaignId: result.campaignId,
        metaAdsetId: result.adsetId,
        metaAdId: result.adId,
        metaCreativeId: result.creativeId,
        imageHash: result.imageHash,
        dailyBudgetMinor: result.dailyBudgetMinor,
        status: result.dryRun ? "dry_run" : "active",
        dryRun: result.dryRun,
        launchedAt: new Date(),
        lastError: "",
      },
    });

    await prisma.adCreativeDraft.update({
      where: { id: draft.id },
      data: { status: "launched" },
    });

    revalidatePath("/dashboard/ads");
    return toLaunchView(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Launch failed";
    await prisma.metaAdLaunch.update({
      where: { id: placeholder.id },
      data: { status: "error", lastError: message.slice(0, 1000) },
    });
    revalidatePath("/dashboard/ads");
    throw new Error(message);
  }
}

export async function setAdLaunchPaused(launchId: string, paused: boolean): Promise<AdLaunchView> {
  const merchant = await requireVerifiedMerchant();
  const launch = await prisma.metaAdLaunch.findFirst({
    where: { id: launchId, merchantId: merchant.id },
  });
  if (!launch) throw new Error("Launch not found.");
  if (!["active", "paused", "dry_run"].includes(launch.status)) {
    throw new Error("This launch cannot be paused/resumed.");
  }

  const adAccount = await prisma.metaAdAccount.findUnique({ where: { merchantId: merchant.id } });
  if (!adAccount) throw new Error("Ad account disconnected.");

  const token = decryptAdsToken(adAccount.accessTokenEnc);
  const status = paused ? "PAUSED" : "ACTIVE";
  await Promise.all([
    launch.metaAdId ? setMetaObjectStatus(launch.metaAdId, token, status) : Promise.resolve(),
    launch.metaAdsetId ? setMetaObjectStatus(launch.metaAdsetId, token, status) : Promise.resolve(),
    launch.metaCampaignId ? setMetaObjectStatus(launch.metaCampaignId, token, status) : Promise.resolve(),
  ]);

  const row = await prisma.metaAdLaunch.update({
    where: { id: launch.id },
    data: {
      status: paused ? "paused" : launch.dryRun ? "dry_run" : "active",
      pausedAt: paused ? new Date() : null,
      lastError: "",
    },
  });
  revalidatePath("/dashboard/ads");
  return toLaunchView(row);
}
