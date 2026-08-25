import type { MerchantStoreTheme } from "@/lib/merchant-store/theme";
import { defaultStoreLayout } from "@/lib/merchant-store/layout";

export const ODOO_PURPLE = "#714B67";
export const ODOO_TEAL = "#017E84";

export interface BusinessType {
  id: string;
  labelAr: string;
  labelEn: string;
  accent: string;
  keywords: string[];
}

export interface ValueProp {
  id: string;
  labelAr: string;
  labelEn: string;
}

/** Omani-first business types for the mad-lib configurator. */
export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: "attar",
    labelAr: "متجر عطور وعطور طبيعية",
    labelEn: "Attar & fragrance shop",
    accent: "#B45309",
    keywords: ["عطر", "attar", "oud", "عود"],
  },
  {
    id: "clothing",
    labelAr: "متجر ملابس",
    labelEn: "Clothing store",
    accent: "#BE185D",
    keywords: ["ملابس", "fashion", "clothing"],
  },
  {
    id: "electronics",
    labelAr: "متجر إلكترونيات",
    labelEn: "Electronics store",
    accent: "#1F6FEB",
    keywords: ["إلكترونيات", "electronics", "gadget"],
  },
  {
    id: "dates",
    labelAr: "متجر تمور وهدايا",
    labelEn: "Dates & gifts",
    accent: "#92400E",
    keywords: ["تمر", "dates", "ramadan"],
  },
  {
    id: "restaurant",
    labelAr: "مطعم / مأكولات",
    labelEn: "Restaurant / food",
    accent: "#C2410C",
    keywords: ["مطعم", "food", "restaurant"],
  },
  {
    id: "home",
    labelAr: "منزل وديكور",
    labelEn: "Home & decor",
    accent: "#1B7A4E",
    keywords: ["منزل", "home", "decor", "pottery"],
  },
  {
    id: "ecommerce",
    labelAr: "متجر إلكتروني عام",
    labelEn: "General online store",
    accent: "#714B67",
    keywords: ["متجر", "store", "shop"],
  },
];

/** Collage images for the Odoo-style configurator (left panel). */
export const BUSINESS_COLLAGE: Record<string, string[]> = {
  attar: ["/feed/attar-night.png", "/feed/attar-rose.png", "/feed/attar-amber.png"],
  clothing: ["/feed/attar-rose.png", "/feed/attar-amber.png", "/feed/attar-night.png"],
  electronics: ["/feed/flashlight.png", "/feed/shaver.png", "/feed/car-charger.png"],
  dates: ["/feed/dates-khalas.png", "/feed/dates-truffle.png", "/feed/attar-amber.png"],
  restaurant: ["/feed/dates-truffle.png", "/feed/dates-khalas.png", "/feed/attar-rose.png"],
  home: ["/feed/attar-amber.png", "/feed/dates-khalas.png", "/feed/flashlight.png"],
  ecommerce: ["/feed/attar-night.png", "/feed/flashlight.png", "/feed/dates-truffle.png"],
};

export function collageForType(typeId: string): string[] {
  return BUSINESS_COLLAGE[typeId] ?? BUSINESS_COLLAGE.ecommerce;
}

export const VALUE_PROPS: Record<string, ValueProp[]> = {
  attar: [
    { id: "authentic", labelAr: "عطور أصلية من مطرح", labelEn: "Authentic Muttrah attars" },
    { id: "gift", labelAr: "تغليف هدايا فاخر", labelEn: "Premium gift wrapping" },
    { id: "cod", labelAr: "دفع عند الاستلام", labelEn: "Cash on delivery" },
    { id: "fast", labelAr: "توصيل سريع لمسقط", labelEn: "Fast Muscat delivery" },
  ],
  clothing: [
    { id: "local", labelAr: "تصاميم محلية", labelEn: "Local designs" },
    { id: "sizes", labelAr: "مقاسات واضحة", labelEn: "Clear size guide" },
    { id: "cod", labelAr: "دفع عند الاستلام", labelEn: "Cash on delivery" },
    { id: "returns", labelAr: "استبدال سهل", labelEn: "Easy exchange" },
  ],
  electronics: [
    { id: "genuine", labelAr: "منتجات أصلية مضمونة", labelEn: "Genuine guaranteed products" },
    { id: "support", labelAr: "دعم فني سريع", labelEn: "Fast technical support" },
    { id: "cod", labelAr: "دفع عند الاستلام", labelEn: "Cash on delivery" },
    { id: "warranty", labelAr: "ضمان واضح", labelEn: "Clear warranty" },
  ],
  dates: [
    { id: "fresh", labelAr: "تمور طازجة من نزوى", labelEn: "Fresh Nizwa dates" },
    { id: "gift", labelAr: "سلال هدايا للمناسبات", labelEn: "Gift baskets for occasions" },
    { id: "cod", labelAr: "دفع عند الاستلام", labelEn: "Cash on delivery" },
    { id: "ramadan", labelAr: "عروض رمضان", labelEn: "Ramadan offers" },
  ],
  restaurant: [
    { id: "fresh", labelAr: "مكونات طازجة يومياً", labelEn: "Fresh daily ingredients" },
    { id: "fast", labelAr: "توصيل سريع", labelEn: "Fast delivery" },
    { id: "family", labelAr: "وجبات عائلية", labelEn: "Family meals" },
    { id: "cod", labelAr: "دفع عند الاستلام", labelEn: "Cash on delivery" },
  ],
  home: [
    { id: "handmade", labelAr: "صناعة يدوية عمانية", labelEn: "Omani handmade" },
    { id: "unique", labelAr: "قطع فريدة", labelEn: "Unique pieces" },
    { id: "cod", labelAr: "دفع عند الاستلام", labelEn: "Cash on delivery" },
    { id: "gift", labelAr: "مثالية للهدايا", labelEn: "Perfect for gifting" },
  ],
  ecommerce: [
    { id: "cod", labelAr: "دفع عند الاستلام", labelEn: "Cash on delivery" },
    { id: "fast", labelAr: "توصيل سريع لعُمان", labelEn: "Fast Oman delivery" },
    { id: "quality", labelAr: "جودة موثوقة", labelEn: "Trusted quality" },
    { id: "support", labelAr: "دعم عبر واتساب", labelEn: "WhatsApp support" },
  ],
};

export function filterBusinessTypes(query: string): BusinessType[] {
  const q = query.trim().toLowerCase();
  if (!q) return BUSINESS_TYPES;
  return BUSINESS_TYPES.filter(
    (b) =>
      b.labelAr.includes(query.trim()) ||
      b.labelEn.toLowerCase().includes(q) ||
      b.keywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()))
  );
}

export function inferBusinessTypeFromProducts(
  products: Array<{ title: string; category: string }>
): BusinessType {
  const blob = products.map((p) => `${p.title} ${p.category}`).join(" ").toLowerCase();
  const hit = BUSINESS_TYPES.find((b) => b.keywords.some((k) => blob.includes(k.toLowerCase())));
  return hit ?? BUSINESS_TYPES.find((b) => b.id === "ecommerce")!;
}

export function seedCopyFromConfig(input: {
  locale: "ar" | "en";
  businessName: string;
  city?: string;
  businessType: BusinessType;
  valueProp: ValueProp;
  businessDetail: string;
}): { tagline: string; aboutPlain: string; offerHeadline: string; offerBody: string; theme: MerchantStoreTheme } {
  const ar = input.locale === "ar";
  const detail = input.businessDetail.trim() || (ar ? input.businessType.labelAr : input.businessType.labelEn);
  const value = ar ? input.valueProp.labelAr : input.valueProp.labelEn;
  const city = input.city?.trim();

  const tagline = ar
    ? city
      ? `${detail} — ${value} · توصيل ${city}`
      : `${detail} — ${value}`
    : city
      ? `${detail} — ${value} · ${city} delivery`
      : `${detail} — ${value}`;

  const aboutPlain = ar
    ? `مرحباً بك في ${input.businessName}.\n\nنختار منتجاتنا بعناية لـ${detail}. ${value} — اطلب الآن وادفع عند الاستلام.`
    : `Welcome to ${input.businessName}.\n\nWe curate products for ${detail}. ${value} — order now and pay cash on delivery.`;

  const offerHeadline = ar ? "عرض افتتاح المتجر" : "Store launch offer";
  const offerBody = ar
    ? `${value}. توصيل داخل عُمان — ادفع نقداً عند الاستلام.`
    : `${value}. Delivery across Oman — pay cash on arrival.`;

  return {
    tagline,
    aboutPlain,
    offerHeadline,
    offerBody,
    theme: {
      accent: input.businessType.accent,
      heroStyle: "split",
      fontTone: ar ? "classic" : "modern",
      layout: defaultStoreLayout(),
    },
  };
}
