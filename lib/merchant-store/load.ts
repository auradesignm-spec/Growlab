import { prisma } from "@/lib/db";
import {
  parseList,
  productAttributes,
  productFeatures,
  liveProductPromo,
  attributeOptionGroups,
} from "@/lib/catalog-db";
import { parseThemeJson, type MerchantStoreTheme } from "@/lib/merchant-store/theme";
import { promoFromStoreFields, isPromoLive, type StorePromo } from "@/lib/merchant-store/promo";
import { ensureMerchantStoreDeal } from "@/lib/merchant-store/deals";
import { slugifyProductTitle } from "@/lib/merchant-store/slugs";

export interface MerchantStoreProduct {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  descriptionHtml: string;
  category: string;
  tags: string[];
  variants: string[];
  price: number;
  currency: string;
  coverUrl: string | null;
  storeDealId: string;
  features: string[];
  attributeGroups: Array<{ key: string; label: string; values: string[] }>;
  promo: import("@/lib/merchant-store/promo").StorePromo | null;
  deliveryDaysMax: number;
  shippingFee: number;
}

export interface MerchantStoreData {
  slug: string;
  businessName: string;
  city: string;
  tagline: string;
  aboutHtml: string;
  theme: MerchantStoreTheme;
  offerHeadline: string;
  offerBody: string;
  offerActive: boolean;
  promo: StorePromo;
  heroProduct: MerchantStoreProduct | null;
  products: MerchantStoreProduct[];
}

async function toStoreProduct(
  product: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    descriptionHtml: string;
    category: string;
    tags: string;
    variants: string;
    basePrice: number;
    currency: string;
    cogsPct: number;
    commissionType: string;
    commissionValue: number;
    deliveryDaysMax?: number;
    shippingFee?: number;
    mediaAssets: { url: string; type: string }[];
  },
): Promise<MerchantStoreProduct> {
  const dealId = await ensureMerchantStoreDeal({
    id: product.id,
    basePrice: product.basePrice,
    cogsPct: product.cogsPct,
    commissionType: product.commissionType,
    commissionValue: product.commissionValue,
  });
  const attrs = productAttributes(product as { attributesJson?: string | null; variants?: string | null });
  const features = productFeatures(product as { featuresJson?: string | null });
  const promo = liveProductPromo(product as { id: string; promoJson?: string | null; promoEndsAt?: Date | string | null });
  const slug = product.slug || slugifyProductTitle(product.title);
  return {
    id: product.id,
    slug,
    title: product.title,
    shortDescription: product.shortDescription,
    descriptionHtml: product.descriptionHtml,
    category: product.category,
    tags: parseList(product.tags),
    variants: attrs.size.length ? attrs.size : parseList((product as { variants?: string }).variants ?? ""),
    price: product.basePrice,
    currency: product.currency,
    coverUrl: product.mediaAssets.find((a) => a.type === "image")?.url ?? null,
    storeDealId: dealId,
    features,
    attributeGroups: attributeOptionGroups(attrs),
    promo,
    deliveryDaysMax: product.deliveryDaysMax ?? 4,
    shippingFee: product.shippingFee ?? 1.5,
  };
}

export async function getMerchantStoreBySlug(slugRaw: string): Promise<MerchantStoreData | null> {
  const slug = slugRaw.trim().toLowerCase();
  if (!slug) return null;

  const store = await prisma.merchantStore.findFirst({
    where: { slug, published: true },
    include: {
      merchant: {
        include: {
          products: {
            where: { active: true },
            include: { mediaAssets: { orderBy: { createdAt: "asc" }, take: 4 } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!store || store.merchant.verificationStatus !== "verified") return null;

  const products = await Promise.all(store.merchant.products.map((p) => toStoreProduct(p)));
  const byId = new Map(products.map((p) => [p.id, p]));
  const heroProduct = (store.heroProductId && byId.get(store.heroProductId)) || products[0] || null;
  const others = products.filter((p) => p.id !== heroProduct?.id);

  return {
    slug: store.slug,
    businessName: store.merchant.businessName,
    city: store.merchant.city,
    tagline: store.tagline,
    aboutHtml: store.aboutHtml,
    theme: parseThemeJson(store.themeJson),
    offerHeadline: store.offerHeadline,
    offerBody: store.offerBody,
    offerActive: store.offerActive,
    promo: (() => {
      const promo = promoFromStoreFields({
        promoJson: (store as { promoJson?: string }).promoJson,
        offerHeadline: store.offerHeadline,
        offerBody: store.offerBody,
        offerActive: store.offerActive,
        offerEndsAt: (store as { offerEndsAt?: Date | null }).offerEndsAt,
      });
      // Expire silently for storefront display
      if (promo.active && !isPromoLive(promo)) {
        return { ...promo, active: false };
      }
      return promo;
    })(),
    heroProduct,
    products: others,
  };
}

export async function getMerchantStoreProduct(
  storeSlug: string,
  productSlug: string,
): Promise<{ store: MerchantStoreData; product: MerchantStoreProduct } | null> {
  const store = await getMerchantStoreBySlug(storeSlug);
  if (!store) return null;

  const all = [store.heroProduct, ...store.products].filter(Boolean) as MerchantStoreProduct[];
  const product = all.find((p) => p.slug.toLowerCase() === productSlug.toLowerCase());
  if (!product) return null;

  return { store, product };
}

export async function getMerchantStoreForEditor(merchantId: string) {
  return prisma.merchantStore.findUnique({ where: { merchantId } });
}
