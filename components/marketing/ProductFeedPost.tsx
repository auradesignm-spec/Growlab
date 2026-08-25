"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type MediaKind = "image" | "video";

const FEED_ITEMS = [
  {
    nameKey: "productA",
    src: "/feed/attar-night.png",
    price: "28.00",
    budget: "500",
    media: "image" as const,
  },
  {
    nameKey: "productB",
    src: "/feed/flashlight.png",
    price: "12.50",
    budget: "300",
    media: "video" as const,
  },
  {
    nameKey: "productC",
    src: "/feed/shaver.png",
    price: "24.00",
    budget: "400",
    media: "image" as const,
  },
  {
    nameKey: "productD",
    src: "/feed/car-charger.png",
    price: "9.90",
    budget: "250",
    media: "image" as const,
  },
] as const;

export function ProductFeedPost({
  name,
  priceLabel,
  price,
  budgetLabel,
  budget,
  src,
  media,
  videoLabel,
  kicker,
  priority = false,
  compact = false,
}: {
  name: string;
  priceLabel: string;
  price: string;
  budgetLabel: string;
  budget: string;
  src?: string;
  media: MediaKind;
  videoLabel: string;
  kicker?: string;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <article
      className={
        compact
          ? "flex h-full min-h-0 flex-col"
          : "overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-line"
      }
    >
      {compact && kicker ? (
        <header className="shrink-0">
          <p className="text-[11px] leading-4 text-frost-faint">{kicker}</p>
          <p className="mt-0.5 text-[14px] font-medium leading-5 text-frost">{name}</p>
        </header>
      ) : null}
      <div className={compact ? "relative mt-4 min-h-[8.5rem] flex-1 overflow-hidden rounded-xl bg-night" : "relative aspect-[4/5] bg-night"}>
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 640px) 92vw, 360px"
            quality={70}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-x-[26%] top-[22%] bottom-[16%] rounded-[22px] bg-frost" aria-hidden="true" />
        )}
        {media === "video" ? (
          <span className="absolute start-3 top-3 rounded-md bg-white px-2 py-1 font-mono text-[11px] text-frost">
            {videoLabel}
          </span>
        ) : null}
      </div>
      <div className={compact ? "mt-3 shrink-0" : "px-4 py-3"}>
        {compact ? null : <p className="text-[16px] font-semibold leading-snug text-frost">{name}</p>}
        <dl className={compact ? "space-y-1.5" : "mt-2 space-y-1.5"}>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-frost-faint">{priceLabel}</dt>
            <dd className="font-mono text-[13px] tabular-nums text-frost">{price}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-frost-faint">{budgetLabel}</dt>
            <dd className="font-mono text-[13px] tabular-nums text-frost">{budget}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export function MarketingFeedMock({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("marketing.gallery");
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (paused || leaving !== null || reduceMotion) return;
    const timer = window.setInterval(() => {
      setLeaving(index);
      setIndex((current) => (current + 1) % FEED_ITEMS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [index, paused, leaving, reduceMotion]);

  useEffect(() => {
    if (!reduceMotion || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % FEED_ITEMS.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  const current = FEED_ITEMS[index];
  const outgoing = leaving !== null ? FEED_ITEMS[leaving] : null;

  return (
    <div
      className={compact ? "gl-feed-swap h-full min-h-0 w-full" : "gl-feed-phone gl-feed-swap mx-auto w-full max-w-[390px]"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {outgoing ? (
        <div
          key={`out-${outgoing.nameKey}`}
          className="gl-feed-swap-slide is-out"
          onAnimationEnd={() => setLeaving(null)}
        >
          <FeedSlide item={outgoing} t={t} compact={compact} />
        </div>
      ) : null}
      <div
          key={`in-${current.nameKey}`}
          className={outgoing && !reduceMotion ? "gl-feed-swap-slide is-in h-full" : compact ? "h-full" : undefined}
        >
        <FeedSlide item={current} t={t} priority compact={compact} />
      </div>
    </div>
  );
}

function FeedSlide({
  item,
  t,
  priority = false,
  compact = false,
}: {
  item: (typeof FEED_ITEMS)[number];
  t: ReturnType<typeof useTranslations>;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <ProductFeedPost
      name={t(item.nameKey)}
      src={item.src}
      priceLabel={t("priceLabel")}
      price={`${item.price} ${t("omr")}`}
      budgetLabel={t("budgetCap")}
      budget={`${item.budget} ${t("omr")}`}
      media={item.media}
      videoLabel={t("videoBadge")}
      kicker={compact ? t("feedKicker") : undefined}
      priority={priority}
      compact={compact}
    />
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}
