import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MerchantStoreChrome from "@/components/merchant/MerchantStoreChrome";
import MerchantAddToCartForm from "@/components/merchant/MerchantAddToCartForm";
import { getMerchantStoreProduct } from "@/lib/merchant-store/load";
import { merchantCartItemCount, readMerchantCartCookie } from "@/lib/shop/merchantCart";

export default async function MerchantProductPage({
  params,
}: {
  params: { slug: string; productSlug: string };
}) {
  const t = await getTranslations("merchantStore");
  const tShop = await getTranslations("shop");
  const data = await getMerchantStoreProduct(params.slug, params.productSlug);
  if (!data) notFound();

  const { store, product } = data;
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
      <div className="mx-auto max-w-wrap px-5 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-night">
            {product.coverUrl ? (
              <Image src={product.coverUrl} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority />
            ) : null}
          </div>
          <div>
            <p className="gl-eyebrow">{product.category}</p>
            <h1 className="mt-2 text-display-lg font-semibold">{product.title}</h1>
            {product.shortDescription ? (
              <p className="mt-4 text-[16px] text-frost-dim">{product.shortDescription}</p>
            ) : null}
            <p className="mt-8 font-mono text-[32px] font-medium" style={{ color: store.theme.accent }}>
              {product.price.toFixed(2)} {product.currency}
            </p>
            {product.promo?.active && product.promo.headline ? (
              <div className="mt-6 rounded-xl border border-line bg-white/60 px-4 py-3">
                <p className="text-[12px] text-frost-faint">{tShop("productOffer")}</p>
                <p className="mt-1 text-[15px] font-medium">{product.promo.headline}</p>
                {product.promo.body ? (
                  <p className="mt-1 text-[13px] text-frost-dim">{product.promo.body}</p>
                ) : null}
              </div>
            ) : null}
            {product.features.length > 0 ? (
              <ul className="mt-6 space-y-2">
                <li className="text-[12px] text-frost-faint">{tShop("features")}</li>
                {product.features.map((f) => (
                  <li key={f} className="text-[14px] text-frost-dim before:me-2 before:content-['•']">
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}
            <MerchantAddToCartForm
              storeSlug={store.slug}
              dealId={product.storeDealId}
              sizes={product.variants}
              attributeGroups={product.attributeGroups}
              accent={store.theme.accent}
            />
          </div>
        </div>

        {product.descriptionHtml ? (
          <article
            className="prose-store mt-12 max-w-3xl border-t border-line pt-10 text-[16px] leading-relaxed text-frost-dim"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : null}
      </div>
    </MerchantStoreChrome>
  );
}
