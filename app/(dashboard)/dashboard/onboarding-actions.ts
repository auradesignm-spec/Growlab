"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { CONTACT_LEAK_WARNING_AR, scanForContactLeak } from "@/lib/security/antiLeak";
import { slugifyStoreName, uniqueProductSlug } from "@/lib/merchant-store/slugs";
import { storeSeedFromBrief, themeJsonFromBrief } from "@/lib/merchant-store/brief";
import { DEFAULT_DELIVERY_DAYS_MAX } from "@/lib/domain/deliveryHold";
import { DEFAULT_SHIPPING_FEE } from "@/lib/domain/shipping";
import { DEFAULT_PROMO, serializePromo } from "@/lib/merchant-store/promo";

/**
 * First-run role claim — public registration is merchant-only.
 * Buyer marketers are provisioned via share claim after purchase.
 * Starts as unsubmitted so MerchantKycForm can collect documents.
 */
export async function claimRole(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("سجّل دخولك أولاً.");

  const role = String(formData.get("role") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (role !== "merchant") throw new Error("التسجيل متاح للتجار فقط.");
  if (!displayName) throw new Error("أدخل اسم المتجر أو النشاط.");

  let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkUserId: userId, name: displayName, role: "unassigned" },
    });
  }
  if (user.role !== "unassigned") throw new Error("هذا الحساب له دور مسبقاً.");

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { role: "merchant" } }),
    prisma.merchantProfile.create({
      data: {
        userId: user.id,
        businessName: displayName,
        verificationStatus: "unsubmitted",
        wallet: { create: { balance: 0, currency: "OMR" } },
      },
    }),
  ]);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function submitStoreBrief(input: {
  businessName: string;
  slogan: string;
  audienceId: string;
  categoryId: string;
}) {
  const businessName = input.businessName.trim().slice(0, 80);
  const slogan = input.slogan.trim().slice(0, 160);
  if (businessName.length < 2) throw new Error("أدخل اسم المشروع.");
  if (slogan.length < 4) throw new Error("أدخل شعار الشركة.");
  for (const field of [businessName, slogan]) {
    if (scanForContactLeak(field).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);
  }

  const viewer = await getCurrentUser();
  if (!viewer) throw new Error("سجّل دخولك أولاً.");

  let merchantId = viewer.merchantProfile?.id ?? "";

  if (!merchantId) {
    if (viewer.role !== "unassigned") throw new Error("هذا الحساب له دور مسبقاً.");
    await prisma.$transaction([
      prisma.user.update({ where: { id: viewer.id }, data: { role: "merchant", name: businessName } }),
      prisma.merchantProfile.create({
        data: {
          userId: viewer.id,
          businessName,
          verificationStatus: "unsubmitted",
          wallet: { create: { balance: 0, currency: "OMR" } },
        },
      }),
    ]);
    const created = await prisma.merchantProfile.findUnique({ where: { userId: viewer.id } });
    if (!created) throw new Error("تعذّر إنشاء ملف التاجر.");
    merchantId = created.id;
  } else {
    await prisma.merchantProfile.update({
      where: { id: merchantId },
      data: { businessName },
    });
  }

  const locale = viewer.locale === "en" ? "en" : "ar";
  const seed = storeSeedFromBrief({
    locale,
    businessName,
    slogan,
    audienceId: input.audienceId,
    categoryId: input.categoryId,
  });
  if (scanForContactLeak(`${seed.aboutHtml} ${seed.offerHeadline} ${seed.offerBody}`).flagged) {
    throw new Error(CONTACT_LEAK_WARNING_AR);
  }

  let slug = slugifyStoreName(businessName);
  const slugTaken = await prisma.merchantStore.findFirst({
    where: { slug, NOT: { merchantId } },
  });
  if (slugTaken) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const themeJson = themeJsonFromBrief(seed.theme);
  const promoJson = serializePromo({
    ...DEFAULT_PROMO,
    headline: seed.offerHeadline,
    body: seed.offerBody,
    active: false,
  });

  const store = await prisma.merchantStore.upsert({
    where: { merchantId },
    create: {
      merchantId,
      slug,
      tagline: seed.tagline,
      aboutHtml: seed.aboutHtml,
      themeJson,
      offerHeadline: seed.offerHeadline,
      offerBody: seed.offerBody,
      offerActive: false,
      promoJson,
      published: false,
    },
    update: {
      slug,
      tagline: seed.tagline,
      aboutHtml: seed.aboutHtml,
      themeJson,
      offerHeadline: seed.offerHeadline,
      offerBody: seed.offerBody,
      promoJson,
    },
  });

  const existingProduct = await prisma.product.findFirst({ where: { merchantId } });
  if (!existingProduct) {
    const product = await prisma.product.create({
      data: {
        merchantId,
        title: seed.productTitle.slice(0, 120),
        slug: uniqueProductSlug(seed.productTitle, new Set()),
        shortDescription: seed.tagline.slice(0, 280),
        descriptionHtml: seed.aboutHtml.slice(0, 12000),
        category: seed.productCategory.slice(0, 60),
        tags: "",
        variants: "",
        basePrice: 9.9,
        costPrice: 4,
        cogsPct: 4 / 9.9,
        commissionType: "pct",
        commissionValue: 0.15,
        deliveryDaysMax: DEFAULT_DELIVERY_DAYS_MAX,
        shippingFee: DEFAULT_SHIPPING_FEE,
        active: true,
      },
    });
    await prisma.merchantStore.update({
      where: { id: store.id },
      data: { heroProductId: product.id },
    });
    await prisma.performanceCampaign.create({
      data: {
        productId: product.id,
        merchantId,
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
  revalidatePath("/dashboard/store/edit");
  redirect("/dashboard");
}
