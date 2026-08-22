"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { joinDeal } from "@/app/(dashboard)/dashboard/deals-actions";
import { requestSample } from "@/app/(dashboard)/dashboard/sample-actions";
import type { CampaignApplyPath } from "@/lib/domain/enums";

export interface ApplyToCampaignResult {
  readonly dealId: string;
  readonly referralLink: string;
  readonly path: CampaignApplyPath;
}

/**
 * Single entry point for the feed's "apply" flow. Whichever path the
 * creator picks — reuse the merchant's ready-made media kit, or request a
 * physical sample to film original UGC — the product is added to their
 * storefront immediately and a tracked referral link is handed back so they
 * can start earning right away. See lib/domain/ugc.ts for the sample path's
 * deposit/deadline policy.
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

  if (path === "media_kit") {
    const assetCount = await prisma.mediaAsset.count({ where: { productId } });
    if (assetCount === 0) {
      throw new Error("This merchant hasn't uploaded a media kit for this product yet.");
    }
  }

  const { dealId } = await joinDeal(productId);

  if (path === "sample_ugc") {
    await requestSample(productId, note);
  }

  return {
    dealId,
    referralLink: `/creator/${viewer.creatorProfile.username}#deal-${dealId}`,
    path,
  };
}
