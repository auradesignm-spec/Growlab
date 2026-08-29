"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { serializeList } from "@/lib/catalog-db";
import { COMMISSION_TYPES, type CommissionType } from "@/lib/domain/enums";
import { clampDeliveryDays, DEFAULT_DELIVERY_DAYS_MAX } from "@/lib/domain/deliveryHold";
import { clampShippingFee, DEFAULT_SHIPPING_FEE } from "@/lib/domain/shipping";
import { assertPublishableProduct } from "@/lib/domain/commission";
import { CONTACT_LEAK_WARNING_AR, scanForContactLeak } from "@/lib/security/antiLeak";
import { sanitizeSafeHtml, sanitizePlainText, sanitizeUrl } from "@/lib/security/inputSanitizer";
import { slugifyProductTitle } from "@/lib/merchant-store/slugs";
import { canAddProduct, PRODUCT_LIMIT_AR } from "@/lib/billing/entitlements";

const MAX_TITLE_LENGTH = 120;
const MAX_CATEGORY_LENGTH = 60;
const MAX_TAG_COUNT = 8;
const MAX_VARIANT_COUNT = 8;
const MAX_SHORT_DESC = 280;
const MAX_DESC_HTML = 12000;
const MAX_URL_LENGTH = 500;

function isPlausibleUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//") && value.length > 1) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export interface ProductFormInput {
  title: string;
  category: string;
  tags: string[];
  variants: string[];
  basePrice: number;
  costPrice: number;
  commissionType: string;
  commissionValue: number;
  coverImageUrl?: string;
  coverVideoUrl?: string;
  slug?: string;
  shortDescription?: string;
  descriptionHtml?: string;
  deliveryDaysMax?: number;
  shippingFee?: number;
}

function sanitizeAndValidate(input: ProductFormInput) {
  const title = sanitizePlainText(input.title, MAX_TITLE_LENGTH);
  const category = sanitizePlainText(input.category, MAX_CATEGORY_LENGTH);
  if (!title) throw new Error("Title is required.");
  if (!category) throw new Error("Category is required.");

  for (const field of [title, category, ...input.tags, ...input.variants, input.shortDescription ?? "", input.descriptionHtml ?? ""]) {
    if (scanForContactLeak(field).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);
  }

  const basePrice = Number(input.basePrice);
  const costPrice = Number(input.costPrice);
  if (!Number.isFinite(basePrice) || basePrice <= 0) throw new Error("Retail price must be a positive number.");
  if (!Number.isFinite(costPrice) || costPrice < 0) throw new Error("Cost price must be zero or a positive number.");
  if (costPrice > basePrice) throw new Error("Cost price can't exceed the retail price.");

  if (!COMMISSION_TYPES.includes(input.commissionType as CommissionType)) {
    throw new Error("Invalid commission type.");
  }
  const commissionValue = Number(input.commissionValue);
  if (!Number.isFinite(commissionValue) || commissionValue <= 0) {
    throw new Error("Commission value must be a positive number.");
  }
  if (input.commissionType === "pct" && commissionValue > 1) {
    throw new Error("Percentage commission must be between 0 and 1 (e.g. 0.2 for 20%).");
  }
  if (input.commissionType === "fixed" && commissionValue > basePrice) {
    throw new Error("A fixed commission can't exceed the retail price.");
  }

  assertPublishableProduct({
    retailPrice: basePrice,
    costPrice,
    commissionType: input.commissionType,
    commissionValue,
    settlementChannel: "cod",
  });

  return {
    title,
    category,
    tags: serializeList(input.tags.map((t) => sanitizePlainText(t, 40)).slice(0, MAX_TAG_COUNT)),
    variants: serializeList(input.variants.map((v) => sanitizePlainText(v, 40)).slice(0, MAX_VARIANT_COUNT)),
    slug: (input.slug?.trim() || slugifyProductTitle(title)).slice(0, 64),
    shortDescription: sanitizePlainText(input.shortDescription ?? "", MAX_SHORT_DESC),
    descriptionHtml: sanitizeSafeHtml(input.descriptionHtml ?? "", MAX_DESC_HTML),
    basePrice,
    costPrice,
    // The waterfall engine (lib/ledger/waterfall.ts) consumes cogsPct, never
    // an absolute cost — derive it here so costPrice stays the single
    // merchant-facing source of truth and the ledger math needs no changes.
    cogsPct: basePrice > 0 ? costPrice / basePrice : 0,
    commissionType: input.commissionType,
    commissionValue,
    deliveryDaysMax: clampDeliveryDays(Number(input.deliveryDaysMax ?? DEFAULT_DELIVERY_DAYS_MAX)),
    shippingFee: clampShippingFee(Number(input.shippingFee ?? DEFAULT_SHIPPING_FEE)),
  };
}

export async function createProduct(input: ProductFormInput) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can create a product.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new Error("Your business must be verified before you can list products.");
  }

  const productCount = await prisma.product.count({ where: { merchantId: viewer.merchantProfile.id } });
  if (!canAddProduct(viewer.merchantProfile, productCount)) {
    throw new Error(PRODUCT_LIMIT_AR);
  }

  const data = sanitizeAndValidate(input);
  const cover = input.coverImageUrl?.trim().slice(0, MAX_URL_LENGTH) ?? "";
  const coverVideo = input.coverVideoUrl?.trim().slice(0, MAX_URL_LENGTH) ?? "";
  if (cover && !isPlausibleUrl(cover)) throw new Error("Enter a valid image URL.");
  if (coverVideo && !isPlausibleUrl(coverVideo)) throw new Error("Enter a valid video URL.");

  const product = await prisma.product.create({
    data: { ...data, merchantId: viewer.merchantProfile.id, active: true },
  });

  if (cover) {
    await prisma.mediaAsset.create({
      data: { productId: product.id, type: "image", url: cover },
    });
  }
  if (coverVideo) {
    await prisma.mediaAsset.create({
      data: { productId: product.id, type: "video", url: coverVideo },
    });
  }

  // Auto-draft performance campaign so onboarding can reach the campaign step.
  const existingCampaign = await prisma.performanceCampaign.findUnique({
    where: { productId: product.id },
  });
  if (!existingCampaign) {
    await prisma.performanceCampaign.create({
      data: {
        productId: product.id,
        merchantId: viewer.merchantProfile.id,
        status: "draft",
        budgetCap: 50,
        visitRateSharer: 0,
        visitRateOrigin: 0,
        visitRateClipper: 0,
        purchasePctSharer: 0.05,
        purchasePctOrigin: 0.08,
        purchasePctClipper: 0,
        viewCpmOrigin: 0.5,
        viewCpmClipper: 0,
        ugcBrief: "",
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");

  return { productId: product.id };
}

export async function updateProduct(productId: string, input: ProductFormInput) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only the owning merchant can edit a product.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new Error("Your business must be verified before you can edit products.");
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.merchantId !== viewer.merchantProfile.id) {
    throw new Error("Not your product.");
  }

  const data = sanitizeAndValidate(input);

  await prisma.product.update({ where: { id: productId }, data });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}

/** Products can't be deactivated today — this is the missing toggle. Existing
 * deals/orders are untouched; an inactive product just stops appearing in the
 * public shop / creator feed (see lib/catalog-db.ts#isProductPubliclyVisible). */
export async function toggleProductActive(productId: string) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only the owning merchant can change a product's status.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new Error("Your business must be verified before you can change a product's status.");
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.merchantId !== viewer.merchantProfile.id) {
    throw new Error("Not your product.");
  }

  await prisma.product.update({ where: { id: productId }, data: { active: !existing.active } });

  // Pausing a product also pauses its performance campaign.
  if (existing.active) {
    await prisma.performanceCampaign.updateMany({
      where: { productId, merchantId: viewer.merchantProfile.id, status: "active" },
      data: { status: "paused" },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}

export interface ProductStudioInput {
  title: string;
  category: string;
  tags: string[];
  shortDescription: string;
  descriptionHtml: string;
  basePrice: number;
  costPrice: number;
  commissionType: string;
  commissionValue: number;
  attributes: {
    size: string[];
    color: string[];
    material: string[];
    custom: Array<{ name: string; values: string[] }>;
  };
  features: string[];
  promo: {
    kind: string;
    headline: string;
    body: string;
    active: boolean;
    endsAt: string | null;
    buyQty: number;
    getQty: number;
    percentOff: number;
  };
  deliveryDaysMax?: number;
  shippingFee?: number;
  coverImageUrl?: string;
  sourceUrl?: string;
  active?: boolean;
}

export async function previewImportProductUrl(url: string) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can import products.");
  }
  const { fetchProductFromUrl } = await import("@/lib/merchant-store/import-product");
  return fetchProductFromUrl(url);
}

export async function saveProductStudio(productId: string | null, input: ProductStudioInput) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can save products.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new Error("Your business must be verified before you can edit products.");
  }

  const { serializeAttributes, serializeFeatures, serializeProductPromo, parseAttributesJson } =
    await import("@/lib/catalog-db");
  const { parsePromoJson } = await import("@/lib/merchant-store/promo");

  const attrs = parseAttributesJson(JSON.stringify(input.attributes));
  const base = sanitizeAndValidate({
    title: input.title,
    category: input.category || "general",
    tags: input.tags,
    variants: attrs.size,
    basePrice: input.basePrice,
    costPrice: input.costPrice,
    commissionType: input.commissionType,
    commissionValue: input.commissionValue,
    shortDescription: input.shortDescription,
    descriptionHtml: input.descriptionHtml,
    deliveryDaysMax: input.deliveryDaysMax,
    shippingFee: input.shippingFee,
  });

  const promo = parsePromoJson(JSON.stringify({ ...input.promo, productIds: null }));
  let promoEndsAt: Date | null = null;
  if (promo.endsAt) {
    const end = new Date(promo.endsAt);
    if (!Number.isFinite(end.getTime())) throw new Error("Invalid promo end date.");
    promoEndsAt = end;
  }

  const cover = input.coverImageUrl?.trim().slice(0, MAX_URL_LENGTH) ?? "";
  if (cover && !isPlausibleUrl(cover)) throw new Error("Enter a valid image URL.");

  const sourceUrl = (input.sourceUrl ?? "").trim().slice(0, 500);
  if (sourceUrl) {
    try {
      const u = new URL(sourceUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("bad");
    } catch {
      throw new Error("Source URL must be http(s).");
    }
  }

  const studioData = {
    ...base,
    attributesJson: serializeAttributes(attrs),
    featuresJson: serializeFeatures(input.features),
    promoJson: serializeProductPromo(promo),
    promoEndsAt,
    sourceUrl,
    active: input.active !== false,
  };

  let id = productId;
  if (id) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.merchantId !== viewer.merchantProfile.id) {
      throw new Error("Not your product.");
    }
    await prisma.product.update({ where: { id }, data: studioData as never });
  } else {
    const productCount = await prisma.product.count({ where: { merchantId: viewer.merchantProfile.id } });
    if (!canAddProduct(viewer.merchantProfile, productCount)) {
      throw new Error(PRODUCT_LIMIT_AR);
    }
    const created = await prisma.product.create({
      data: Object.assign({}, studioData as object, {
        merchantId: viewer.merchantProfile.id,
      }) as never,
    });
    id = created.id;
    const existingCampaign = await prisma.performanceCampaign.findUnique({ where: { productId: id } });
    if (!existingCampaign) {
      await prisma.performanceCampaign.create({
        data: {
          productId: id,
          merchantId: viewer.merchantProfile.id,
          status: "draft",
          budgetCap: 50,
          visitRateSharer: 0,
          visitRateOrigin: 0,
          visitRateClipper: 0,
          purchasePctSharer: 0.05,
          purchasePctOrigin: 0.08,
          purchasePctClipper: 0,
          viewCpmOrigin: 0.5,
          viewCpmClipper: 0,
          ugcBrief: "",
        },
      });
    }
  }

  if (cover && id) {
    const existingCover = await prisma.mediaAsset.findFirst({
      where: { productId: id, type: "image" },
      orderBy: { createdAt: "asc" },
    });
    if (existingCover) {
      await prisma.mediaAsset.update({ where: { id: existingCover.id }, data: { url: cover } });
    } else {
      await prisma.mediaAsset.create({ data: { productId: id, type: "image", url: cover } });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
  return { productId: id! };
}
