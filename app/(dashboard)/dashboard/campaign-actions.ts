"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { joinDeal } from "@/app/(dashboard)/dashboard/deals-actions";
import { requestSample } from "@/app/(dashboard)/dashboard/sample-actions";
import type { CampaignApplyPath } from "@/lib/domain/enums";
import { samplePolicyForTier } from "@/lib/domain/ugc";
import { creatorProductPath, getCreatorDealSlugs, productSlug } from "@/lib/storefront";

export interface ApplyToCampaignResult {
  readonly dealId: string;
  readonly referralLink: string;
  readonly path: CampaignApplyPath;
  readonly status: string;
}

/**
 * Single entry point for the feed's "apply" flow. The deal stays pending until
 * the merchant accepts. After accept, the kit and tracked link land on the
 * storefront. See lib/domain/ugc.ts for the sample path's deposit/deadline policy.
 */
export async function applyToCampaign(
  productId: string,
  path: CampaignApplyPath,
  note: string
): Promise<ApplyToCampaignResult> {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "creator" || !viewer.creatorProfile) {
    throw new Error("Only a creator can apply to a campaign.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.creatorProfile.verificationStatus !== "verified") {
    throw new Error("Complete identity verification before promoting products.");
  }

  if (path === "sample_ugc" && !samplePolicyForTier(viewer.creatorProfile.tier).allowed) {
    throw new Error("المسوّق الجديد يروّج من المحتوى الجاهز. العينة تنفتح بعد أول مبيعات.");
  }

  if (path === "media_kit") {
    const assetCount = await prisma.mediaAsset.count({ where: { productId } });
    if (assetCount === 0) {
      throw new Error("This merchant hasn't uploaded product media for this product yet.");
    }
  }

  const { dealId, status } = await joinDeal(productId);

  if (path === "sample_ugc") {
    await requestSample(productId, note);
  }

  const slugs = await getCreatorDealSlugs(viewer.creatorProfile.username);
  const slug = slugs?.get(dealId);
  const fallbackTitle = (await prisma.product.findUnique({ where: { id: productId }, select: { title: true } }))
    ?.title;
  const referralSlug = slug ?? productSlug(fallbackTitle ?? dealId);

  return {
    dealId,
    referralLink: creatorProductPath(viewer.creatorProfile.username, referralSlug),
    path,
    status,
  };
}
