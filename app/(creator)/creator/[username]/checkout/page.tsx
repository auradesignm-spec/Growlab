import Link from "next/link";
import { getTranslations } from "next-intl/server";
import StorefrontChrome from "@/components/shop/StorefrontChrome";
import CheckoutForm from "@/components/shop/CheckoutForm";
import { cartItemCount, readCartCookie } from "@/lib/shop/cookies";
import { hydrateCartDeals } from "@/lib/shop/tracking";

export default async function CheckoutPage({ params }: { params: { username: string } }) {
  const t = await getTranslations("shop");
  const creator = await getTranslations("creator");
  const username = decodeURIComponent(params.username).trim().toLowerCase();
  const cart = readCartCookie();
  const cartCount = cartItemCount(cart);
  const lines =
    cart && cart.username === username ? await hydrateCartDeals(cart.items) : [];

  return (
    <StorefrontChrome username={username} cartCount={cartCount} homeLabel={creator("home")} cartLabel={t("cart")}>
      {lines.length === 0 ? (
        <div className="mx-auto max-w-wrap px-5 py-16 text-center sm:px-8">
          <h1 className="text-display-lg font-semibold">{t("emptyCart")}</h1>
          <p className="gl-lede mx-auto mt-3">{t("emptyCartLede")}</p>
          <Link href={`/creator/${username}`} className="gl-btn-primary mt-8 inline-flex">
            {t("backToStore")}
          </Link>
        </div>
      ) : (
        <CheckoutForm username={username} lines={lines} />
      )}
    </StorefrontChrome>
  );
}
