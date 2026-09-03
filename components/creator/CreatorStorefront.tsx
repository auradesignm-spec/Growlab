"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import AddToCartForm from "@/components/shop/AddToCartForm";
import StorefrontChrome from "@/components/shop/StorefrontChrome";
import VerifiedBadge from "@/components/dashboard/VerifiedBadge";

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
        <aside className="border-b border-line p-4 sm:p-6 md:p-8 lg:col-span-5 lg:border-b-0 lg:border-e">
          <p className="font-mono text-[12px] sm:text-[14px] text-frost-faint">{initial}</p>
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2">
            <h1 className="text-display-md font-semibold">{name}</h1>
            <VerifiedBadge size="sm" showLabel label="صانع موثق ✓" />
          </div>
          <p className="mt-2 text-[13px] sm:text-[14px] text-frost-dim">{role}</p>
        </aside>

        <section className="px-4 py-7 sm:px-6 sm:py-10 md:px-8 lg:col-span-7">
          <div className="gl-stage max-w-xl p-4 sm:p-6 md:p-8">
            <p className="gl-eyebrow">{t("featured")}</p>
            <h2 className="mt-2 text-display-lg font-semibold">
              <Link href={`/creator/${username}/${heroProduct.slug}`}>{heroProduct.title}</Link>
            </h2>
            <p className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] md:text-[16px] leading-relaxed text-frost-dim">{heroProduct.note}</p>
            <p className="mt-5 sm:mt-8 font-mono text-[26px] sm:text-[28px] md:text-[32px] font-medium">{priceLabel}</p>
            <AddToCartForm username={username} dealId={heroProduct.dealId} sizes={heroProduct.sizes} />

            {catalog.length > 1 && (
              <div className="mt-8 sm:mt-12 max-w-md border-t border-line pt-4 sm:pt-6">
                <p className="text-[11px] sm:text-[12px] text-frost-faint">{t("moreFrom", { name })}</p>
                <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                  {otherDeals.map((deal) => (
                    <li key={deal.dealId}>
                      <Link
                        href={`/creator/${username}/${deal.slug}`}
                        className="gl-tile gl-tile-hover gl-lift flex w-full items-baseline justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 text-start"
                      >
                        <span className="text-[13px] sm:text-[14px] md:text-[15px]">{deal.title}</span>
                        <span className="font-mono text-[12px] sm:text-[13px] md:text-[14px]">
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
