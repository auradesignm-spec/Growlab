import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import StorefrontChrome from "@/components/shop/StorefrontChrome";
import AddToCartForm from "@/components/shop/AddToCartForm";
import { getStorefrontDeal } from "@/lib/storefront";
import { cartItemCount, readCartCookie } from "@/lib/shop/cookies";

export default async function ProductPage({
  params,
}: {
  params: { username: string; dealId: string };
}) {
  const t = await getTranslations("shop");
  const creator = await getTranslations("creator");
  const data = await getStorefrontDeal(params.username, params.dealId);
  if (!data) notFound();

  const cartCount = cartItemCount(readCartCookie());
  const note = [data.deal.category, ...data.deal.tags].filter(Boolean).join(" · ");

  return (
    <StorefrontChrome
      username={data.username}
      cartCount={cartCount}
      homeLabel={creator("home")}
      cartLabel={t("cart")}
    >
      <div className="mx-auto max-w-wrap px-5 py-12 sm:px-8">
        <p className="gl-eyebrow">@{data.username}</p>
        <h1 className="mt-2 max-w-2xl text-display-lg font-semibold">{data.deal.productTitle}</h1>
        {note ? <p className="mt-4 max-w-lg text-[16px] text-frost-dim">{note}</p> : null}
        <p className="mt-8 font-mono text-[32px] font-medium">
          {data.deal.priceOmr} {data.deal.currency}
        </p>
        <AddToCartForm username={data.username} dealId={data.deal.dealId} sizes={data.deal.variants} />
      </div>
    </StorefrontChrome>
  );
}
