"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { MarketingFeedMock } from "@/components/marketing/ProductFeedPost";

const FACETS = [
  { id: "store", titleKey: "storeTitle", captionKey: "storeCaption", visual: "store" as const },
  { id: "link", titleKey: "linkTitle", captionKey: "linkCaption", visual: "link" as const },
  { id: "ledger", titleKey: "ledgerTitle", captionKey: "ledgerCaption", visual: "ledger" as const },
] as const;

const BARS = [40, 64, 48, 80, 56, 72, 44] as const;

export default function Gallery() {
  const t = useTranslations("marketing.gallery");

  return (
    <section id="gallery" className="relative scroll-mt-24 pb-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <div className="gl-stage p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {FACETS.map((facet, index) => (
              <Reveal key={facet.id} className="h-full" delay={index * 70}>
                <article className="gl-bento flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-colors duration-150 ease-out hover:bg-night">
                  <div
                    className={`flex items-center justify-center bg-night px-5 py-5 ${
                      facet.visual === "store" ? "min-h-[420px]" : "min-h-[200px] md:min-h-0 md:h-52"
                    }`}
                  >
                    <BentoVisual kind={facet.visual} />
                  </div>
                  <div className="flex flex-1 flex-col px-6 pb-7 pt-5">
                    <h3 className="text-[20px] font-semibold leading-snug text-frost">{t(facet.titleKey)}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{t(facet.captionKey)}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BentoVisual({ kind }: { kind: (typeof FACETS)[number]["visual"] }) {
  const t = useTranslations("marketing.gallery");

  if (kind === "ledger") {
    return (
      <div className="w-full max-w-[240px] rounded-2xl border border-line bg-white p-4">
        <p className="text-[11px] text-frost-faint">{t("todayOrder")}</p>
        <p className="mt-1 font-mono text-[16px] text-frost">128.40 {t("omr")}</p>
        <div className="mt-4 flex h-16 items-end gap-1.5">
          {BARS.map((h, i) => (
            <div
              key={i}
              className="gl-mock-bar flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                backgroundColor: i === 3 ? "#1F6FEB" : "var(--paper-sunk)",
                animationDelay: `${i * 24}ms`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (kind === "link") {
    return <LinkMock />;
  }

  return (
    <div className="w-full" aria-hidden="true">
      <MarketingFeedMock />
    </div>
  );
}

function LinkMock() {
  const t = useTranslations("marketing.gallery");
  const [copied, setCopied] = useState(false);
  const url = "growlab.om/marketeer";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="w-full max-w-[240px] rounded-2xl border border-line bg-white px-3 py-3">
      <p className="text-[11px] text-frost-faint">{t("creatorLink")}</p>
      <button
        type="button"
        onClick={copyLink}
        className="mt-2 flex w-full items-center gap-2 rounded-full border border-line px-3 py-2 text-start transition-colors duration-150 ease-out hover:border-[rgba(17,19,24,0.2)]"
        style={{ background: "var(--paper)" }}
        aria-label={copied ? t("copiedLink") : t("copyLink")}
      >
        <span className="h-2 w-2 shrink-0 rounded-sm bg-signal" aria-hidden="true" />
        <span className="truncate font-mono text-[12px] text-frost-dim">{url}</span>
      </button>
      <p className="relative mt-3 h-5 text-[12px]">
        <span
          className={`gl-mock-idle block text-frost-dim transition-opacity duration-150 ease-out ${copied ? "opacity-0" : ""}`}
        >
          {t("ordersFromLink")}
        </span>
        <span className={`absolute inset-0 text-frost-dim ${copied ? "opacity-100" : "gl-mock-order"}`} aria-live="polite">
          {copied ? t("copiedLink") : t("newOrder")}
        </span>
      </p>
    </div>
  );
}
