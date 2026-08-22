"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { MEDIA_ASSET_TYPES, type MediaAssetType } from "@/lib/domain/enums";

const MAX_ASSETS_PER_PRODUCT = 8;
const MAX_URL_LENGTH = 500;
const MAX_CAPTION_LENGTH = 140;

function isPlausibleUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/** Merchant attaches a ready-made promo image/video to a product so creators
 * can promote it instantly via the "media kit" apply path — no sample needed. */
export async function addMediaAsset(productId: string, type: string, url: string, caption: string) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only the owning merchant can manage a product's media kit.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new Error("Your business must be verified before you can upload a media kit.");
  }

  if (!MEDIA_ASSET_TYPES.includes(type as MediaAssetType)) {
    throw new Error("Invalid media type.");
  }

  const trimmedUrl = url.trim().slice(0, MAX_URL_LENGTH);
  if (!isPlausibleUrl(trimmedUrl)) {
    throw new Error("Enter a valid http(s) URL.");
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.merchantId !== viewer.merchantProfile.id) {
    throw new Error("Not your product.");
  }

  const count = await prisma.mediaAsset.count({ where: { productId } });
  if (count >= MAX_ASSETS_PER_PRODUCT) {
    throw new Error(`A product can have at most ${MAX_ASSETS_PER_PRODUCT} media kit assets.`);
  }

  await prisma.mediaAsset.create({
    data: {
      productId,
      type,
      url: trimmedUrl,
      caption: caption.trim().slice(0, MAX_CAPTION_LENGTH) || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}

export async function removeMediaAsset(assetId: string) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only the owning merchant can manage a product's media kit.");
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId }, include: { product: true } });
  if (!asset || asset.product.merchantId !== viewer.merchantProfile.id) {
    throw new Error("Not your media asset.");
  }

  await prisma.mediaAsset.delete({ where: { id: assetId } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}
