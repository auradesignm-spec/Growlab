"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { MEDIA_ASSET_TYPES, type MediaAssetType } from "@/lib/domain/enums";
import { planLimits } from "@/lib/billing/entitlements";
import {
  ProductMediaStorageError,
  saveProductMediaFile,
  storagePathFromPublicUrl,
  removeProductMediaFile,
} from "@/lib/product-media/storage";

const MAX_URL_LENGTH = 500;
const MAX_CAPTION_LENGTH = 140;

function isPlausibleUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//") && value.length > 1) return true;
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
    throw new Error("Only the owning merchant can manage a product's media.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new Error("Your business must be verified before you can upload product media.");
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
  const maxAssets = planLimits(viewer.merchantProfile).maxMediaPerProduct;
  if (Number.isFinite(maxAssets) && count >= maxAssets) {
    throw new Error(`A product can have at most ${maxAssets} media assets on the Free plan. Upgrade to Pro for unlimited media.`);
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
    throw new Error("Only the owning merchant can manage a product's media.");
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId }, include: { product: true } });
  if (!asset || asset.product.merchantId !== viewer.merchantProfile.id) {
    throw new Error("Not your media asset.");
  }

  await prisma.mediaAsset.delete({ where: { id: assetId } });
  const localPath = storagePathFromPublicUrl(asset.url);
  if (localPath) await removeProductMediaFile(localPath);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}

/** Upload image/video from device or phone camera — returns a public media URL. */
export async function uploadProductMedia(formData: FormData): Promise<{ url: string; kind: "image" | "video" }> {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can upload product media.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new Error("Your business must be verified before you can upload product media.");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a photo or video first.");
  }

  const mimeType = file.type || "image/jpeg";
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const saved = await saveProductMediaFile({
      merchantId: viewer.merchantProfile.id,
      bytes,
      mimeType,
    });
    return { url: saved.publicUrl, kind: saved.kind };
  } catch (e) {
    if (e instanceof ProductMediaStorageError) throw e;
    throw new Error("Upload failed. Try a smaller file.");
  }
}
