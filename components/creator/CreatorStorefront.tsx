"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import AddToCartForm from "@/components/shop/AddToCartForm";
import StorefrontChrome from "@/components/shop/StorefrontChrome";

export interface StorefrontHeroProduct {
  readonly dealId: string;
  readonly slug: string;
  readonly title: string;
  readonly note: string;
  readonly priceOmr: number;
  readonly currency: string;
  readonly sizes: readonly string[];
}

export interface StorefrontOtherDeal {
  readonly dealId: string;
  readonly slug: string;
  readonly title: string;
  readonly priceOmr: number;
  readonly currency: string;
  readonly sizes: readonly string[];
}

export interface CreatorStorefrontProps {
  readonly username: string;
  readonly name: string;
  readonly role: string;
  readonly initial: string;
  readonly heroProduct: StorefrontHeroProduct;
  readonly otherDeals: readonly StorefrontOtherDeal[];
  readonly cartCount: number;
}

export default function CreatorStorefront({
  username,
  name,
  role,
  initial,
  heroProduct,
  otherDeals,
  cartCount,
}: CreatorStorefrontProps) {
  const t = useTranslations("creator");
  const shop = useTranslations("shop");
  const catalog = useMemo(() => [heroProduct, ...otherDeals], [heroProduct, otherDeals]);
  const priceLabel = `${heroProduct.priceOmr} ${t("omr")}`;

  return (
    <StorefrontChrome username={username} cartCount={cartCount} homeLabel={t("home")} cartLabel={shop("cart")}>
      <div className="mx-auto grid max-w-wrap grid-cols-1 lg:grid-cols-12">
        <aside className="border-b border-line p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-e">
          <p className="font-mono text-[14px] text-frost-faint">{initial}</p>
          <h1 className="mt-6 text-display-md font-semibold">{name}</h1>
          <p className="mt-2 text-[14px] text-frost-dim">{role}</p>
        </aside>

        <section className="px-5 py-10 sm:px-8 lg:col-span-7">
          <div className="gl-stage max-w-xl p-6 sm:p-8">
            <p className="gl-eyebrow">{t("featured")}</p>
            <h2 className="mt-2 text-display-lg font-semibold">
              <Link href={`/creator/${username}/${heroProduct.slug}`}>{heroProduct.title}</Link>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-frost-dim">{heroProduct.note}</p>
            <p className="mt-8 font-mono text-[32px] font-medium">{priceLabel}</p>
            <AddToCartForm username={username} dealId={heroProduct.dealId} sizes={heroProduct.sizes} />

            {catalog.length > 1 && (
              <div className="mt-12 max-w-md border-t border-line pt-6">
                <p className="text-[12px] text-frost-faint">{t("moreFrom", { name })}</p>
                <ul className="mt-4 space-y-2">
                  {otherDeals.map((deal) => (
                    <li key={deal.dealId}>
                      <Link
                        href={`/creator/${username}/${deal.slug}`}
                        className="gl-tile gl-tile-hover flex w-full items-baseline justify-between gap-4 px-4 py-3 text-start"
                      >
                        <span className="text-[15px]">{deal.title}</span>
                        <span className="font-mono text-[14px]">
                          {deal.priceOmr} {t("omr")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </StorefrontChrome>
  );
}
