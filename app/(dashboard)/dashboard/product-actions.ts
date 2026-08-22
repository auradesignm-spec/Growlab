"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { serializeList } from "@/lib/catalog-db";
import { COMMISSION_TYPES, type CommissionType } from "@/lib/domain/enums";
import { CONTACT_LEAK_WARNING_AR, scanForContactLeak } from "@/lib/security/antiLeak";

const MAX_TITLE_LENGTH = 120;
const MAX_CATEGORY_LENGTH = 60;
const MAX_TAG_COUNT = 8;
const MAX_VARIANT_COUNT = 8;

export interface ProductFormInput {
  title: string;
  category: string;
  tags: string[];
  variants: string[];
  basePrice: number;
  costPrice: number;
  commissionType: string;
  commissionValue: number;
}

function sanitizeAndValidate(input: ProductFormInput) {
  const title = input.title.trim().slice(0, MAX_TITLE_LENGTH);
  const category = input.category.trim().slice(0, MAX_CATEGORY_LENGTH);
  if (!title) throw new Error("Title is required.");
  if (!category) throw new Error("Category is required.");

  for (const field of [title, category, ...input.tags, ...input.variants]) {
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

  return {
    title,
    category,
    tags: serializeList(input.tags.slice(0, MAX_TAG_COUNT)),
    variants: serializeList(input.variants.slice(0, MAX_VARIANT_COUNT)),
    basePrice,
    costPrice,
    // The waterfall engine (lib/ledger/waterfall.ts) consumes cogsPct, never
    // an absolute cost — derive it here so costPrice stays the single
    // merchant-facing source of truth and the ledger math needs no changes.
    cogsPct: basePrice > 0 ? costPrice / basePrice : 0,
    commissionType: input.commissionType,
    commissionValue,
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

  const data = sanitizeAndValidate(input);

  const product = await prisma.product.create({
    data: { ...data, merchantId: viewer.merchantProfile.id, active: true },
  });

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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");
}
