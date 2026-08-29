"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { CONTACT_LEAK_WARNING_AR, scanForContactLeak } from "@/lib/security/antiLeak";
import { sanitizeSafeHtml, sanitizePlainText } from "@/lib/security/inputSanitizer";
import { parseThemeJson, serializeTheme, type MerchantStoreTheme } from "@/lib/merchant-store/theme";
import { isReservedStoreSlug, slugifyStoreName, uniqueProductSlug } from "@/lib/merchant-store/slugs";
import { generateStoreSuggestion } from "@/lib/merchant-store/ai";
import { ensureMerchantStoreDeal } from "@/lib/merchant-store/deals";
import { slugifyProductTitle } from "@/lib/merchant-store/slugs";
import { assertProFeature, planLimits, PRO_REQUIRED_AR } from "@/lib/billing/entitlements";
import {
  parsePromoJson,
  promoFromStoreFields,
  serializePromo,
  type StorePromo,
} from "@/lib/merchant-store/promo";

export interface MerchantStoreDraft {
  slug: string;
  tagline: string;
  aboutHtml: string;
  theme: MerchantStoreTheme;
  offerHeadline: string;
  offerBody: string;
  offerActive: boolean;
  promo?: StorePromo;
  heroProductId: string | null;
  published: boolean;
}

function assertMerchant(requireVerified = false) {
  return getCurrentUser().then((viewer) => {
    if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
      throw new Error("Only a merchant can manage a store.");
    }
    if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
    if (requireVerified && viewer.merchantProfile.verificationStatus !== "verified") {
      throw new Error("يلزم توثيق السجل التجاري وهوية المالك لنشر المتجر رسمياً واستقبال الطلبات.");
    }
    return viewer.merchantProfile;
  });
}

function sanitizeDraft(input: MerchantStoreDraft) {
  const slug = slugifyStoreName(input.slug || "");
  if (!slug || isReservedStoreSlug(slug)) throw new Error("Pick a valid store URL.");

  const nextPromo = parsePromoJson(
    serializePromo({
      ...(input.promo ?? DEFAULT_FROM_LEGACY(input)),
      headline: (input.offerHeadline || input.promo?.headline || "").trim(),
      body: (input.offerBody || input.promo?.body || "").trim(),
      active: Boolean(input.offerActive),
    })
  );

  for (const field of [input.tagline, input.aboutHtml, nextPromo.headline, nextPromo.body]) {
    if (scanForContactLeak(field).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);
  }

  let offerEndsAt: Date | null = null;
  if (nextPromo.endsAt) {
    const end = new Date(nextPromo.endsAt);
    if (!Number.isFinite(end.getTime())) throw new Error("Invalid offer end date.");
    offerEndsAt = end;
  }

  return {
    slug,
    tagline: sanitizePlainText(input.tagline, 160),
    aboutHtml: sanitizeSafeHtml(input.aboutHtml, 12000),
    themeJson: serializeTheme(parseThemeJson(JSON.stringify(input.theme))),
    offerHeadline: sanitizePlainText(nextPromo.headline, 120),
    offerBody: sanitizePlainText(nextPromo.body, 500),
    offerActive: Boolean(nextPromo.active),
    promoJson: serializePromo(nextPromo),
    offerEndsAt,
    heroProductId: input.heroProductId || null,
    published: Boolean(input.published),
  };
}

function DEFAULT_FROM_LEGACY(input: MerchantStoreDraft): StorePromo {
  return parsePromoJson(undefined, {
    headline: input.offerHeadline,
    body: input.offerBody,
    active: input.offerActive,
  });
}

export async function saveMerchantStore(input: MerchantStoreDraft) {
  const merchant = await assertMerchant(Boolean(input.published));
  const data = sanitizeDraft(input);

  const slugTaken = await prisma.merchantStore.findFirst({
    where: { slug: data.slug, NOT: { merchantId: merchant.id } },
  });
  if (slugTaken) throw new Error("This store URL is already taken.");

  if (data.heroProductId) {
    const hero = await prisma.product.findFirst({
      where: { id: data.heroProductId, merchantId: merchant.id, active: true },
    });
    if (!hero) throw new Error("Hero product not found.");
  }

  await prisma.merchantStore.upsert({
    where: { merchantId: merchant.id },
    // promoJson / offerEndsAt exist after migration; cast until prisma generate refreshes.
    create: { merchantId: merchant.id, ...data } as never,
    update: data as never,
  });

  if (data.published) {
    const products = await prisma.product.findMany({ where: { merchantId: merchant.id, active: true } });
    for (const product of products) {
      await ensureMerchantStoreDeal(product);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/m/${data.slug}`);
}

export async function suggestMerchantStoreWithAi(locale: "ar" | "en") {
  const merchant = await assertMerchant();
  assertProFeature(merchant, "aiStore", PRO_REQUIRED_AR);
  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id, active: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const suggestion = await generateStoreSuggestion({
    locale,
    businessName: merchant.businessName,
    city: merchant.city,
    products: products.map((p) => ({ title: p.title, category: p.category, price: p.basePrice })),
  });

  return suggestion;
}

export async function applyAiProductCopy(
  copies: Array<{ title: string; shortDescription: string; descriptionHtml: string }>,
) {
  const merchant = await assertMerchant();
  assertProFeature(merchant, "aiStore", PRO_REQUIRED_AR);
  const products = await prisma.product.findMany({ where: { merchantId: merchant.id, active: true } });
  const taken = new Set(products.map((p) => (p.slug || slugifyProductTitle(p.title)).toLowerCase()));

  for (const copy of copies) {
    const product = products.find((p) => p.title === copy.title);
    if (!product) continue;
    const slug = product.slug || uniqueProductSlug(product.title, taken);
    await prisma.product.update({
      where: { id: product.id },
      data: {
        slug,
        shortDescription: copy.shortDescription.slice(0, 280),
        descriptionHtml: copy.descriptionHtml.slice(0, 12000),
      },
    });
  }

  revalidatePath("/dashboard");
}

export async function bootstrapOdooStoreStart(input: {
  fullName: string;
  websiteName: string;
  email: string;
  phone: string;
  locale: "ar" | "en";
}) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can start a store.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");

  const fullName = input.fullName.trim().slice(0, 120);
  const websiteName = input.websiteName.trim().slice(0, 120);
  const email = input.email.trim().toLowerCase().slice(0, 160);
  const phone = input.phone.trim().slice(0, 40);
  if (!fullName || !websiteName) throw new Error("Name and website name are required.");
  if (scanForContactLeak(websiteName).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);

  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || firstName;
  const slug = slugifyStoreName(websiteName);

  await prisma.user.update({
    where: { id: viewer.id },
    data: {
      name: fullName,
      firstName,
      lastName,
      email: email || viewer.email,
      phone: phone || viewer.phone,
      locale: input.locale,
    },
  });

  await prisma.merchantProfile.update({
    where: { id: viewer.merchantProfile.id },
    data: {
      businessName: websiteName,
      ownerFullName: fullName,
    },
  });

  const existing = await prisma.merchantStore.findUnique({
    where: { merchantId: viewer.merchantProfile.id },
  });
  if (!existing) {
    const slugTaken = await prisma.merchantStore.findFirst({ where: { slug } });
    await prisma.merchantStore.create({
      data: {
        merchantId: viewer.merchantProfile.id,
        slug: slugTaken ? `${slug}-${Date.now().toString(36).slice(-4)}` : slug,
        published: false,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/store/edit");
  return { businessName: websiteName, slug: existing?.slug ?? slug };
}

export async function getMerchantStoreEditorData() {
  const merchant = await assertMerchant();
  const viewer = await getCurrentUser();
  const [storeRow, products] = await Promise.all([
    prisma.merchantStore.findUnique({ where: { merchantId: merchant.id } }),
    prisma.product.findMany({
      where: { merchantId: merchant.id, active: true },
      include: { mediaAssets: { where: { type: "image" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const defaultStore = {
    slug: slugifyStoreName(merchant.businessName),
    tagline: "",
    aboutHtml: "",
    theme: parseThemeJson("{}"),
    offerHeadline: "",
    offerBody: "",
    offerActive: false,
    promo: promoFromStoreFields({
      offerHeadline: "",
      offerBody: "",
      offerActive: false,
    }),
    heroProductId: products[0]?.id ?? null,
    published: false,
  };

  const store = storeRow
    ? {
        slug: storeRow.slug,
        tagline: storeRow.tagline,
        aboutHtml: storeRow.aboutHtml,
        theme: parseThemeJson(storeRow.themeJson),
        offerHeadline: storeRow.offerHeadline,
        offerBody: storeRow.offerBody,
        offerActive: storeRow.offerActive,
        promo: promoFromStoreFields({
          promoJson: (storeRow as { promoJson?: string }).promoJson,
          offerHeadline: storeRow.offerHeadline,
          offerBody: storeRow.offerBody,
          offerActive: storeRow.offerActive,
          offerEndsAt: (storeRow as { offerEndsAt?: Date | null }).offerEndsAt,
        }),
        heroProductId: storeRow.heroProductId,
        published: storeRow.published,
      }
    : defaultStore;

  return {
    businessName: merchant.businessName,
    city: merchant.city,
    isPro: planLimits(merchant).aiStore,
    ownerName: [viewer?.firstName, viewer?.lastName].filter(Boolean).join(" ") || viewer?.name || "",
    email: viewer?.email ?? "",
    phone: viewer?.phone || "+968",
    ...store,
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.basePrice,
      coverUrl: p.mediaAssets[0]?.url ?? null,
    })),
  };
}

export async function suggestStorePromo(input: { locale: "ar" | "en"; prompt: string }) {
  await assertMerchant();
  const { suggestPromoFromPrompt } = await import("@/lib/merchant-store/promo");
  return suggestPromoFromPrompt(input.prompt, input.locale);
}
