import { serializeTheme, type MerchantStoreTheme } from "@/lib/merchant-store/theme";
import { defaultStoreLayout } from "@/lib/merchant-store/layout";

export const BRIEF_CATEGORIES = [
  { id: "electronics", labelAr: "إلكترونيات", labelEn: "Electronics", accent: "#1F6FEB", productAr: "إلكترونيات", productEn: "Electronics" },
  { id: "beauty", labelAr: "مستحضرات تجميل وعناية", labelEn: "Beauty & cosmetics", accent: "#BE185D", productAr: "تجميل", productEn: "Beauty" },
  { id: "clothing", labelAr: "ملابس وأزياء", labelEn: "Clothing", accent: "#9D174D", productAr: "ملابس", productEn: "Clothing" },
  { id: "attar", labelAr: "عطور وعود", labelEn: "Fragrance & oud", accent: "#B45309", productAr: "عطور", productEn: "Fragrance" },
  { id: "home", labelAr: "منزل وديكور", labelEn: "Home & decor", accent: "#1B7A4E", productAr: "منزل", productEn: "Home" },
  { id: "dates", labelAr: "تمور وهدايا", labelEn: "Dates & gifts", accent: "#92400E", productAr: "تمور", productEn: "Dates" },
  { id: "food", labelAr: "مأكولات", labelEn: "Food", accent: "#C2410C", productAr: "مأكولات", productEn: "Food" },
  { id: "other", labelAr: "فئة أخرى", labelEn: "Other", accent: "#714B67", productAr: "منتجات", productEn: "Goods" },
] as const;

export const BRIEF_AUDIENCES = [
  { id: "all", ar: "عملاء في عُمان ودول الخليج يبحثون عن تسوق موثوق وتوصيل سريع", en: "Shoppers in Oman & GCC seeking reliable fast delivery" },
  { id: "women", ar: "النساء والمهتمات بمنتجات الجمال، العناية، والأزياء الراقية", en: "Women interested in beauty, self-care & fashion" },
  { id: "youth", ar: "الشباب ومحبو أحدث صيحات التقنية والترندات الحديثة", en: "Youth & Gen-Z seeking trending gadgets & lifestyle" },
  { id: "families", ar: "العائلات والمنازل الباحثة عن مستلزمات وأجهزة معيشية", en: "Families & modern households seeking everyday goods" },
  { id: "gifts", ar: "محبو الهدايا الفاخرة، العطور، والتغليف المميز للمناسبات", en: "Luxury gift shoppers seeking perfume & gift sets" },
  { id: "men", ar: "الرجال الباحثون عن منتجات عملية، أجهزة وإكسسوارات موثوقة", en: "Men looking for practical gear, tools & accessories" },
] as const;

export type BriefCategoryId = (typeof BRIEF_CATEGORIES)[number]["id"];
export type BriefAudienceId = (typeof BRIEF_AUDIENCES)[number]["id"];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function briefCategory(id: string) {
  return BRIEF_CATEGORIES.find((row) => row.id === id) ?? BRIEF_CATEGORIES[BRIEF_CATEGORIES.length - 1];
}

export function briefAudience(id: string) {
  return BRIEF_AUDIENCES.find((row) => row.id === id) ?? BRIEF_AUDIENCES[BRIEF_AUDIENCES.length - 1];
}

export function storeSeedFromBrief(input: {
  locale: "ar" | "en";
  businessName: string;
  slogan: string;
  audienceId: string;
  categoryId: string;
}): {
  tagline: string;
  aboutHtml: string;
  offerHeadline: string;
  offerBody: string;
  theme: MerchantStoreTheme;
  productTitle: string;
  productCategory: string;
} {
  const ar = input.locale === "ar";
  const cat = briefCategory(input.categoryId);
  const audience = briefAudience(input.audienceId);
  const slogan = input.slogan.trim();
  const name = input.businessName.trim();
  const who = ar ? audience.ar : audience.en;
  const catLabel = ar ? cat.labelAr : cat.labelEn;

  return {
    tagline: slogan.slice(0, 160),
    aboutHtml: ar
      ? `<p>${escapeHtml(slogan)}</p><p>نستهدف ${escapeHtml(who)}.</p><p>الفئة: ${escapeHtml(catLabel)}. الشحن يُدفع مع الطلب. ثمن السلعة عند الاستلام إن اختار المشتري ذلك.</p>`
      : `<p>${escapeHtml(slogan)}</p><p>We serve ${escapeHtml(who)}.</p><p>Category: ${escapeHtml(catLabel)}. Shipping is paid with the order. Goods on delivery if the buyer chooses that.</p>`,
    offerHeadline: ar ? "اطلب الآن — شحن مسبقاً" : "Order now — shipping prepaid",
    offerBody: ar
      ? `${who}. ادفع الشحن الآن والسلعة عند الاستلام إن اخترت ذلك.`
      : `${who}. Pay shipping now; goods on delivery if you choose that.`,
    theme: {
      accent: cat.accent,
      heroStyle: "split",
      fontTone: ar ? "classic" : "modern",
      layout: defaultStoreLayout(),
    },
    productTitle: ar ? `${name} — أول منتج` : `${name} — first product`,
    productCategory: ar ? cat.productAr : cat.productEn,
  };
}

export function themeJsonFromBrief(theme: MerchantStoreTheme): string {
  return serializeTheme(theme);
}
