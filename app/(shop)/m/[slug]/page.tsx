import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MerchantStoreChrome from "@/components/merchant/MerchantStoreChrome";
import MerchantStorefront from "@/components/merchant/MerchantStorefront";
import { getMerchantStoreBySlug } from "@/lib/merchant-store/load";
import { trackMerchantStorePageView } from "@/lib/merchant-store/visits";
import { merchantCartItemCount, readMerchantCartCookie } from "@/lib/shop/merchantCart";

export default async function MerchantStorePage({ params }: { params: { slug: string } }) {
  const t = await getTranslations("merchantStore");
  const store = await getMerchantStoreBySlug(params.slug);
  if (!store) notFound();

  const featured = store.heroProduct ?? store.products[0] ?? null;
  if (featured) {
    await trackMerchantStorePageView({
      storeSlug: store.slug,
      productId: featured.id,
      dealId: featured.storeDealId,
    });
  }

  const cartCount = merchantCartItemCount(readMerchantCartCookie());

  return (
    <MerchantStoreChrome
      storeSlug={store.slug}
      businessName={store.businessName}
      accent={store.theme.accent}
      cartCount={cartCount}
      homeLabel={t("home")}
      cartLabel={t("cart")}
    >
      <MerchantStorefront
        store={store}
        productsHeading={t("productsHeading")}
        contactHeading={t("contactHeading")}
        contactLede={t("contactLede")}
      />
    </MerchantStoreChrome>
  );
}
