"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { MarketingFeedMock } from "@/components/marketing/ProductFeedPost";

const FACETS = [
  { id: "store", titleKey: "storeTitle", captionKey: "storeCaption", visual: "store" as const },
  { id: "link", titleKey: "linkTitle", captionKey: "linkCaption", visual: "link" as const },
  { id: "ledger", titleKey: "ledgerTitle", captionKey: "ledgerCaption", visual: "ledger" as const },
] as const;

const WEEK_BARS = [
  { visits: 42, sales: 18 },
  { visits: 58, sales: 28 },
  { visits: 50, sales: 22 },
  { visits: 86, sales: 64 },
  { visits: 70, sales: 40 },
  { visits: 96, sales: 78 },
  { visits: 80, sales: 52 },
] as const;

const WEEK_DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;

export default function Gallery() {
  const t = useTranslations("marketing.gallery");

  return (
    <section id="gallery" className="relative scroll-mt-24 pb-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <div className="gl-stage p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-stretch">
            {FACETS.map((facet, index) => (
              <Reveal key={facet.id} className="h-full" delay={index * 70}>
                <article className="gl-bento flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-colors duration-150 ease-out hover:bg-night">
                  <div className="flex h-[28rem] shrink-0 items-stretch justify-center bg-night p-4">
                    <BentoVisual kind={facet.visual} />
                  </div>
                  <div className="flex flex-1 flex-col px-6 pb-7 pt-5">
                    <h3 className="min-h-[3.25rem] text-[20px] font-semibold leading-snug text-frost">
                      {t(facet.titleKey)}
                    </h3>
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
      <MockFrame>
        <LedgerMock />
      </MockFrame>
    );
  }

  if (kind === "link") {
    return (
      <MockFrame>
        <LinkMock />
      </MockFrame>
    );
  }

  return (
    <MockFrame>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <MarketingFeedMock compact />
        </div>
        <MockNote>{t("feedNote")}</MockNote>
      </div>
    </MockFrame>
  );
}

function MockFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full max-w-[320px] flex-col overflow-hidden rounded-2xl border border-line bg-white p-4">
      {children}
    </div>
  );
}

function MockKicker({ children }: { children: ReactNode }) {
  return <p className="text-[11px] leading-4 text-frost-faint">{children}</p>;
}

function MockTitle({ children }: { children: ReactNode }) {
  return <p className="mt-0.5 text-[14px] font-medium leading-5 text-frost">{children}</p>;
}

function MockNote({ children, live = false }: { children: ReactNode; live?: boolean }) {
  return (
    <p
      className="mt-auto pt-3 text-[12px] leading-relaxed text-frost-dim"
      {...(live ? { "aria-live": "polite" as const } : {})}
    >
      {children}
    </p>
  );
}

function MetricBars({
  rows,
}: {
  rows: Array<{ key: string; label: string; value: string; fill: string; width: string }>;
}) {
  return (
    <ul className="mt-2 space-y-2">
      {rows.map((row) => (
        <li key={row.key}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] text-frost-dim">{row.label}</span>
            <span className="font-mono text-[12px] tabular-nums text-frost">{row.value}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-night">
            <span className="block h-full rounded-full" style={{ width: row.width, background: row.fill }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function LedgerMock() {
  const t = useTranslations("marketing.gallery");
  const kpis = [
    { key: "visits" as const, value: "48" },
    { key: "sales" as const, value: "3" },
    { key: "profit" as const, value: `16.80 ${t("omr")}` },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0">
        <MockKicker>{t("dashLabel")}</MockKicker>
        <MockTitle>{t("productA")}</MockTitle>
      </header>

      <ul className="mt-4 grid grid-cols-3 gap-2">
        {kpis.map((kpi) => (
          <li key={kpi.key} className="rounded-xl border border-line px-2 py-2">
            <p className="text-[11px] leading-4 text-frost-faint">{t(`dashKpi.${kpi.key}` as "dashKpi.visits")}</p>
            <p className="mt-1 font-mono text-[12px] tabular-nums leading-tight text-frost">{kpi.value}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-4 text-frost-faint">{t("dashWeek")}</p>
      <div className="mt-2 flex min-h-[4.5rem] flex-1 items-end gap-1.5" aria-hidden="true">
        {WEEK_BARS.map((day, i) => (
          <div key={WEEK_DAYS[i]} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <div className="relative flex w-full min-h-0 flex-1 items-end justify-center">
              <div
                className="absolute bottom-0 w-[70%] rounded-sm"
                style={{ height: `${day.visits}%`, background: "var(--paper-sunk)" }}
              />
              <div
                className="gl-mock-bar relative w-[42%] rounded-sm"
                style={{
                  height: `${day.sales}%`,
                  backgroundColor: i === 5 ? "#1F6FEB" : "var(--ink)",
                  animationDelay: `${i * 24}ms`,
                }}
              />
            </div>
            <span className="text-[10px] leading-none text-frost-faint">
              {t(`dashDays.${WEEK_DAYS[i]}` as "dashDays.sat")}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-frost-faint">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-sm" style={{ background: "var(--paper-sunk)" }} />
          {t("dashKpi.visits")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-sm bg-frost" />
          {t("dashKpi.sales")}
        </span>
      </div>

      <p className="mt-4 text-[11px] leading-4 text-frost-faint">{t("todayOrder")}</p>
      <p className="mt-0.5 font-mono text-[16px] tabular-nums text-frost">128.40 {t("omr")}</p>
      <div
        className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-night"
        aria-hidden="true"
      >
        <span className="h-full" style={{ width: "87%", background: "var(--ink)" }} />
        <span className="h-full" style={{ width: "13%", background: "#1F6FEB" }} />
      </div>
      <ul className="mt-2 space-y-1">
        <li className="flex items-baseline justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-frost-dim">
            <span className="size-1.5 rounded-sm bg-frost" aria-hidden="true" />
            {t("dashSplit.merchant")}
          </span>
          <span className="font-mono text-[12px] tabular-nums text-frost">111.60 {t("omr")}</span>
        </li>
        <li className="flex items-baseline justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-frost-dim">
            <span className="size-1.5 rounded-sm" style={{ background: "#1F6FEB" }} aria-hidden="true" />
            {t("dashSplit.yours")}
          </span>
          <span className="font-mono text-[12px] tabular-nums text-frost">16.80 {t("omr")}</span>
        </li>
      </ul>
      <MockNote>{t("dashNote")}</MockNote>
    </div>
  );
}

function LinkMock() {
  const t = useTranslations("marketing.gallery");
  const [copied, setCopied] = useState(false);
  const url = `growlab.om/creator/layla/${t("productA").replace(/\s+/g, "-")}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const funnel = [
    { key: "opens" as const, value: "12", fill: "var(--ink)", width: "100%" },
    { key: "orders" as const, value: "3", fill: "#1F6FEB", width: "42%" },
    { key: "commission" as const, value: `5.60 ${t("omr")}`, fill: "var(--paper-sunk)", width: "28%" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0">
        <MockKicker>{t("linkProduct")}</MockKicker>
        <MockTitle>{t("productA")}</MockTitle>
      </header>

      <ol className="mt-3 space-y-2.5">
        <li>
          <p className="text-[11px] leading-4 text-frost-faint">{t("linkStepShare")}</p>
          <button
            type="button"
            onClick={copyLink}
            className="mt-1.5 flex w-full items-center gap-2 rounded-xl border border-line bg-night px-3 py-2 text-start transition-colors duration-150 ease-out hover:border-[rgba(17,19,24,0.2)]"
            aria-label={copied ? t("copiedLink") : t("copyLink")}
          >
            <span className="size-2 shrink-0 rounded-sm bg-signal" aria-hidden="true" />
            <span className="min-w-0 truncate font-mono text-[11px] text-frost-dim">{url}</span>
          </button>
        </li>
        <li>
          <p className="text-[11px] leading-4 text-frost-faint">{t("linkStepTap")}</p>
          <p className="mt-0.5 text-[13px] leading-5 text-frost">{t("linkGuest")}</p>
        </li>
        <li>
          <p className="text-[11px] leading-4 text-frost-faint">{t("linkStepOrder")}</p>
          <p className="mt-0.5 text-[13px] leading-5 text-frost">{t("linkCod")}</p>
        </li>
      </ol>

      <p className="mt-4 text-[11px] leading-4 text-frost-faint">{t("linkFunnelTitle")}</p>
      <MetricBars
        rows={funnel.map((row) => ({
          key: row.key,
          label: t(`linkFunnel.${row.key}` as "linkFunnel.opens"),
          value: row.value,
          fill: row.fill,
          width: row.width,
        }))}
      />
      <MockNote live>{copied ? t("copiedLink") : t("linkAttributed")}</MockNote>
    </div>
  );
}
