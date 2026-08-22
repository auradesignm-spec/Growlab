"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type MediaKind = "image" | "video";

const FEED_ITEMS = [
  {
    nameKey: "productA",
    src: "/feed/attar-night.png",
    price: "28.00",
    commission: "5.60",
    media: "image" as const,
  },
  {
    nameKey: "productB",
    src: "/feed/flashlight.png",
    price: "12.50",
    commission: "2.50",
    media: "video" as const,
  },
  {
    nameKey: "productC",
    src: "/feed/shaver.png",
    price: "24.00",
    commission: "4.80",
    media: "image" as const,
  },
  {
    nameKey: "productD",
    src: "/feed/car-charger.png",
    price: "9.90",
    commission: "1.98",
    media: "image" as const,
  },
] as const;

export function ProductFeedPost({
  name,
  priceLabel,
  price,
  commissionLabel,
  commission,
  src,
  media,
  videoLabel,
}: {
  name: string;
  priceLabel: string;
  price: string;
  commissionLabel: string;
  commission: string;
  src?: string;
  media: MediaKind;
  videoLabel: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative aspect-[4/5] bg-night">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-x-[26%] top-[22%] bottom-[16%] rounded-[22px] bg-frost" aria-hidden="true" />
        )}
        {media === "video" ? (
          <span className="absolute start-3 top-3 rounded-md bg-white px-2 py-1 font-mono text-[11px] text-frost">
            {videoLabel}
          </span>
        ) : null}
      </div>
      <div className="px-4 py-3">
        <p className="text-[16px] font-semibold leading-snug text-frost">{name}</p>
        <dl className="mt-2 space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-frost-faint">{priceLabel}</dt>
            <dd className="font-mono text-[13px] text-frost">{price}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-frost-faint">{commissionLabel}</dt>
            <dd className="font-mono text-[13px] text-frost">{commission}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export function MarketingFeedMock() {
  const t = useTranslations("marketing.gallery");
  const slides = [...FEED_ITEMS, FEED_ITEMS[0]];
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const current = FEED_ITEMS[0];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return undefined;

    const tick = window.setInterval(() => {
      setAnimate(true);
      setIndex((value) => value + 1);
    }, 2800);

    return () => window.clearInterval(tick);
  }, []);

  function handleTransitionEnd() {
    if (index < FEED_ITEMS.length) return;
    setAnimate(false);
    setIndex(0);
  }

  function renderPost(item: (typeof FEED_ITEMS)[number]) {
    return (
      <ProductFeedPost
        name={t(item.nameKey)}
        src={item.src}
        priceLabel={t("priceLabel")}
        price={`${item.price} ${t("omr")}`}
        commissionLabel={t("yourCommission")}
        commission={`${item.commission} ${t("omr")}`}
        media={item.media}
        videoLabel={t("videoBadge")}
      />
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[240px]">
      <div className="invisible">
        {renderPost(current)}
        <div className="h-[72px]" />
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`flex flex-col ${animate ? "gl-feed-track-motion" : ""}`}
          style={{ transform: `translate3d(0, ${(-index / slides.length) * 100}%, 0)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((item, slideIndex) => (
            <div key={`${item.nameKey}-${slideIndex}`} className="pb-2.5">
              {renderPost(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
