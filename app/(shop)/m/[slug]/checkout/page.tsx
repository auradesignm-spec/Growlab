import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MerchantStoreChrome from "@/components/merchant/MerchantStoreChrome";
import MerchantCheckoutForm from "@/components/merchant/MerchantCheckoutForm";
import { getMerchantStoreBySlug } from "@/lib/merchant-store/load";
import {
  applyProductThenStorePromo,
  type PromoCartLine,
  type StorePromo,
} from "@/lib/merchant-store/promo";
import { liveProductPromo } from "@/lib/catalog-db";
import { prisma } from "@/lib/db";
import { merchantCartItemCount, readMerchantCartCookie } from "@/lib/shop/merchantCart";

export default async function MerchantCheckoutPage({ params }: { params: { slug: string } }) {
  const t = await getTranslations("merchantStore");
  const store = await getMerchantStoreBySlug(params.slug);
  if (!store) notFound();

  const cart = readMerchantCartCookie();
  if (!cart || cart.storeSlug !== store.slug || cart.items.length === 0) notFound();

  const deals = await prisma.creatorDeal.findMany({
    where: { id: { in: cart.items.map((i) => i.dealId) } },
    include: { product: true },
  });
  const byId = new Map(deals.map((d) => [d.id, d]));

  const cartLines: PromoCartLine[] = [];
  const productPromos = new Map<string, StorePromo | null>();
  for (const item of cart.items) {
    const deal = byId.get(item.dealId);
    if (!deal) continue;
    cartLines.push({
      dealId: item.dealId,
      size: item.size,
      title: deal.product.title,
      productId: deal.product.id,
      quantity: item.quantity,
      unitPrice: deal.lockedUnitPrice,
      currency: deal.product.currency,
    });
    if (!productPromos.has(deal.product.id)) {
      productPromos.set(deal.product.id, liveProductPromo(deal.product));
    }
  }

  const priced = applyProductThenStorePromo(cartLines, productPromos, store.promo);
  const lines = priced.lines.map((line) => ({
    dealId: line.dealId,
    title: line.title,
    priceOmr: line.unitPriceCharged,
    listPriceOmr: line.unitPrice,
    lineDiscount: line.lineDiscount,
    currency: line.currency,
    quantity: line.quantity,
    size: line.size,
    shippingFeeOmr: Number((byId.get(line.dealId)?.product as { shippingFee?: number } | undefined)?.shippingFee ?? 1.5),
  }));

  const cartCount = merchantCartItemCount(cart);

  return (
    <MerchantStoreChrome
      storeSlug={store.slug}
      businessName={store.businessName}
      accent={store.theme.accent}
      cartCount={cartCount}
      homeLabel={t("home")}
      cartLabel={t("cart")}
    >
      <MerchantCheckoutForm
        storeSlug={store.slug}
        lines={lines}
        discountTotal={priced.discountTotal}
        subtotal={priced.subtotal}
        promoLabel={priced.applied ? store.promo.headline : null}
      />
    </MerchantStoreChrome>
  );
}
