"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { canUpgradeToOrigin } from "@/lib/domain/share";
import { recordQualifiedReelViews } from "@/lib/performance/recordEarn";
import { CONTACT_LEAK_WARNING_AR, scanForContactLeak } from "@/lib/security/antiLeak";
import { STRICT_RULES_COPY_AR } from "@/lib/domain/performanceRules";

const MAX_URL = 500;
const MAX_CAPTION = 280;

function isSocialReelUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    return (
      host === "instagram.com" ||
      host === "instagr.am" ||
      host === "tiktok.com" ||
      host.endsWith(".tiktok.com") ||
      host === "vm.tiktok.com"
    );
  } catch {
    return false;
  }
}

/**
 * Buyer (claimed share entitlement) submits their product reel URL.
 * Earns nothing until merchant approves.
 */
export async function submitBuyerReel(input: {
  productId: string;
  socialPostUrl: string;
  videoUrl?: string;
  caption?: string;
}) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "creator" || !viewer.creatorProfile) {
    throw new Error("سجّل كمسوّق وقد فعّلت رابط المشاركة بعد الشراء.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");

  const socialPostUrl = input.socialPostUrl.trim().slice(0, MAX_URL);
  if (!isSocialReelUrl(socialPostUrl)) {
    throw new Error("ضع رابط ريل إنستغرام أو تيك توك عاماً (https).");
  }

  const caption = (input.caption ?? "").trim().slice(0, MAX_CAPTION);
  if (caption && scanForContactLeak(caption).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);

  const entitlement = await prisma.shareEntitlement.findFirst({
    where: {
      productId: input.productId,
      creatorId: viewer.creatorProfile.id,
      status: "claimed",
    },
    orderBy: { claimedAt: "desc" },
  });
  if (!entitlement) {
    throw new Error("فعّل رابط المشاركة من طلبك المحصّل أولاً — الريل للمشتري فقط.");
  }

  const campaign = await prisma.performanceCampaign.findUnique({
    where: { productId: input.productId },
  });

  const videoUrl = (input.videoUrl?.trim() || socialPostUrl).slice(0, MAX_URL);

  const existing = await prisma.contentAsset.findFirst({
    where: {
      productId: input.productId,
      originCreatorId: viewer.creatorProfile.id,
      status: { in: ["pending", "approved"] },
    },
  });

  if (existing?.status === "approved") {
    throw new Error("لديك ريل معتمد لهذا المنتج بالفعل.");
  }

  if (existing) {
    await prisma.contentAsset.update({
      where: { id: existing.id },
      data: {
        socialPostUrl,
        videoUrl,
        caption: caption || null,
        campaignId: campaign?.id ?? null,
        status: "pending",
        reviewedAt: null,
      },
    });
  } else {
    await prisma.contentAsset.create({
      data: {
        productId: input.productId,
        campaignId: campaign?.id ?? null,
        originCreatorId: viewer.creatorProfile.id,
        socialPostUrl,
        videoUrl,
        caption: caption || null,
        status: "pending",
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/share/${entitlement.claimToken}`);
}

export async function merchantReviewBuyerReel(contentAssetId: string, action: "approve" | "reject") {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only the owning merchant can review reels.");
  }

  const asset = await prisma.contentAsset.findUnique({
    where: { id: contentAssetId },
    include: { product: true },
  });
  if (!asset || asset.product.merchantId !== viewer.merchantProfile.id) {
    throw new Error("Not your content.");
  }
  if (asset.status !== "pending") throw new Error("This reel is already reviewed.");

  await prisma.$transaction(async (tx) => {
    await tx.contentAsset.update({
      where: { id: asset.id },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        reviewedAt: new Date(),
      },
    });

    if (action === "approve") {
      const entitlements = await tx.shareEntitlement.findMany({
        where: {
          productId: asset.productId,
          creatorId: asset.originCreatorId,
          status: "claimed",
        },
      });
      for (const row of entitlements) {
        if (canUpgradeToOrigin(row.role as "sharer" | "origin", true)) {
          await tx.shareEntitlement.update({
            where: { id: row.id },
            data: { role: "origin" },
          });
        }
      }
    }
  });

  revalidatePath("/dashboard");
}

/**
 * Merchant attests the current public view count on the approved reel.
 * Creators cannot call this — prevents fake self-reports.
 */
export async function merchantAttestReelViews(contentAssetId: string, attestedViewCount: number) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only the merchant can attest reel views.");
  }

  const count = Math.floor(Number(attestedViewCount));
  if (!Number.isFinite(count) || count < 0) throw new Error("Invalid view count.");

  const asset = await prisma.contentAsset.findUnique({
    where: { id: contentAssetId },
    include: { product: true },
  });
  if (!asset || asset.product.merchantId !== viewer.merchantProfile.id) {
    throw new Error("Not your content.");
  }
  if (asset.status !== "approved") throw new Error(STRICT_RULES_COPY_AR.needReel);

  const result = await recordQualifiedReelViews({
    contentAssetId,
    attestedViewCount: count,
    db: prisma,
  });

  if (!result.recorded) {
    const map: Record<string, string> = {
      view_delta_too_small: STRICT_RULES_COPY_AR.viewDelta,
      view_delta_too_large: "الزيادة في تقرير واحد أعلى من الحد المسموح — قسّم التقارير.",
      view_cooldown: "انتظر 24 ساعة بين تقارير المشاهدات لنفس الريل.",
      view_daily_cap: "حد أقصى تقريرين مشاهدات يومياً لكل ريل.",
      views_require_approved_reel: STRICT_RULES_COPY_AR.needReel,
      campaign_inactive: "الحملة غير نشطة أو نفد السقف.",
      budget_exhausted: "نفد سقف ميزانية الحملة.",
    };
    throw new Error(map[result.reason] ?? `تعذّر تسجيل المشاهدات (${result.reason}).`);
  }

  revalidatePath("/dashboard");
  return result;
}

export async function loadMerchantBuyerReels(merchantId: string) {
  const rows = await prisma.contentAsset.findMany({
    where: { product: { merchantId } },
    include: {
      product: { select: { id: true, title: true } },
      originCreator: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    productTitle: r.product.title,
    originUsername: r.originCreator.username,
    socialPostUrl: r.socialPostUrl,
    caption: r.caption,
    status: r.status,
    lastPaidViewCount: r.lastPaidViewCount,
    lastViewReportAt: r.lastViewReportAt,
    createdAt: r.createdAt,
  }));
}
