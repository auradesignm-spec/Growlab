"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

interface Scenario {
  readonly id: string;
  readonly labelKey: "small" | "medium" | "large";
  readonly gmv: number;
  readonly adSpend: number;
}

/**
 * Rates mirror the hybrid model already agreed in docs/prd-ad-budget.md
 * (§0.1 A12, §7.5): 8% returns reserve, 2.9% payment fee, 38% COGS, then a
 * 5% creator floor vs. 28% pool share (whichever is higher), and 62/38
 * merchant/platform split of the rest. Numbers below are illustrative
 * example deals, not real transactions.
 */
const SCENARIOS: readonly Scenario[] = [
  { id: "small", labelKey: "small", gmv: 1000, adSpend: 120 },
  { id: "medium", labelKey: "medium", gmv: 2500, adSpend: 300 },
  { id: "large", labelKey: "large", gmv: 6000, adSpend: 720 },
] as const;

const RATES = {
  returnsReserve: 0.08,
  paymentFee: 0.029,
  cogs: 0.38,
  creatorFloor: 0.05,
  creatorPool: 0.28,
  merchantRest: 0.62,
  platformRest: 0.38,
} as const;

function computeLedger(scenario: Scenario) {
  const { gmv, adSpend } = scenario;
  const returnsReserve = gmv * RATES.returnsReserve;
  const netAttributedSales = gmv - returnsReserve;
  const paymentFee = gmv * RATES.paymentFee;
  const cogs = gmv * RATES.cogs;
  const contributionPool = netAttributedSales - paymentFee - cogs - adSpend;
  const creatorFloorAmount = netAttributedSales * RATES.creatorFloor;
  const creatorProfitShare = contributionPool * RATES.creatorPool;
  const creatorShare = Math.max(creatorProfitShare, creatorFloorAmount);
  const rest = contributionPool - creatorShare;
  const merchantShare = rest * RATES.merchantRest;
  const platformShare = rest * RATES.platformRest;

  return {
    gmv,
    returnsReserve,
    netAttributedSales,
    paymentFee,
    cogs,
    adSpend,
    contributionPool,
    creatorShare,
    merchantShare,
    platformShare,
    usedFloor: creatorFloorAmount >= creatorProfitShare,
  };
}

function formatOMR(value: number, currency: string): string {
  return `${Math.round(value).toLocaleString("en-US")} ${currency}`;
}

interface StepDef {
  readonly key: string;
  readonly label: string;
  readonly why: string;
  readonly value: number;
  readonly remaining: number;
  readonly kind: "base" | "neg" | "subtotal";
}

export default function LedgerPreview() {
  const t = useTranslations("marketing.ledger");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const scenario = SCENARIOS[scenarioIndex];
  const ledger = computeLedger(scenario);
  const money = (value: number) => formatOMR(value, t("currency"));

  const steps: readonly StepDef[] = [
    { key: "gmv", label: t("gmv"), why: t("whyGmv"), value: ledger.gmv, remaining: ledger.gmv, kind: "base" },
    {
      key: "returns",
      label: t("returns"),
      why: t("whyReturns"),
      value: -ledger.returnsReserve,
      remaining: ledger.netAttributedSales,
      kind: "neg",
    },
    {
      key: "net",
      label: t("net"),
      why: t("whyNet"),
      value: ledger.netAttributedSales,
      remaining: ledger.netAttributedSales,
      kind: "subtotal",
    },
    {
      key: "fees",
      label: t("fees"),
      why: t("whyFees"),
      value: -ledger.paymentFee,
      remaining: ledger.netAttributedSales - ledger.paymentFee,
      kind: "neg",
    },
    {
      key: "cogs",
      label: t("cogs"),
      why: t("whyCogs"),
      value: -ledger.cogs,
      remaining: ledger.netAttributedSales - ledger.paymentFee - ledger.cogs,
      kind: "neg",
    },
    {
      key: "ads",
      label: t("ads"),
      why: t("whyAds"),
      value: -ledger.adSpend,
      remaining: ledger.contributionPool,
      kind: "neg",
    },
    {
      key: "pool",
      label: t("pool"),
      why: t("whyPool"),
      value: ledger.contributionPool,
      remaining: ledger.contributionPool,
      kind: "subtotal",
    },
  ];

  const active = steps[stepIndex] ?? steps[0];
  const remainPct = Math.max(4, (active.remaining / ledger.gmv) * 100);

  const splits = [
    {
      key: "creator",
      label: t("creatorShare"),
      value: ledger.creatorShare,
      detail: ledger.usedFloor ? t("creatorFloorDetail") : t("creatorPoolDetail"),
    },
    {
      key: "merchant",
      label: t("merchantShare"),
      value: ledger.merchantShare,
      detail: t("merchantDetail"),
    },
    {
      key: "platform",
      label: t("platformShare"),
      value: ledger.platformShare,
      detail: t("platformDetail"),
    },
  ] as const;

  function pickDeal(index: number) {
    setScenarioIndex(index);
    setStepIndex(0);
  }

  return (
    <section id="ledger" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-2xl text-balance text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
          <p className="mt-4 text-[13px] text-frost-faint">{t("disclaimer")}</p>
        </Reveal>

        <Reveal>
          <StageGlow className="mt-8" tone="sun" drift>
            <div className="gl-stage p-4 sm:p-6">
              <div className="gl-seg" role="radiogroup" aria-label={t("pickDeal")}>
                {SCENARIOS.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={scenarioIndex === index}
                    onClick={() => pickDeal(index)}
                    className="gl-seg-btn touch-manipulation"
                  >
                    <span className="block">{t(item.labelKey)}</span>
                    <span className="mt-0.5 block font-mono text-[11px] opacity-70">{money(item.gmv)}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-night px-5 py-5 sm:px-6">
                <p className="text-[12px] text-frost-faint">{t("remaining")}</p>
                <p className="mt-1 font-mono text-[32px] font-medium leading-none text-frost sm:text-[40px]">
                  {money(active.remaining)}
                </p>
                <p className="mt-2 text-[13px] text-frost-dim">
                  {t("fromSales")} · {money(ledger.gmv)}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <span
                    className="block h-full rounded-full bg-frost transition-[width] duration-300 ease-out motion-reduce:transition-none"
                    style={{ width: `${remainPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-4" role="listbox" aria-label={t("hint")}>
                {steps.map((step, index) => {
                  const selected = index === stepIndex;
                  const sign = step.kind === "neg" ? "−" : step.kind === "subtotal" ? "=" : "";
                  return (
                    <button
                      key={step.key}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setStepIndex(index)}
                      className={`flex min-h-11 w-full touch-manipulation items-center gap-3 rounded-2xl px-3 py-2.5 text-start transition-colors duration-150 ease-out ${
                        selected ? "bg-white" : "hover:bg-night"
                      }`}
                    >
                      <span className="w-4 shrink-0 font-mono text-[13px] text-frost-faint" aria-hidden="true">
                        {sign}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-medium text-frost">{step.label}</span>
                        <span className="block text-[11px] text-frost-faint">
                          {step.kind === "neg" ? t("deduct") : t("keep")}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[14px] text-frost">
                        {step.kind === "neg" ? "−" : ""}
                        {money(Math.abs(step.value))}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-2xl border border-line bg-white px-4 py-4">
                <p className="text-[12px] font-semibold text-frost">{active.label}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-frost-dim">{active.why}</p>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="gl-btn-ghost min-h-11 flex-1 touch-manipulation text-[13px] disabled:pointer-events-none disabled:opacity-40"
                  disabled={stepIndex === 0}
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                >
                  {t("prevStep")}
                </button>
                <button
                  type="button"
                  className="gl-btn-primary min-h-11 flex-1 touch-manipulation text-[13px] disabled:pointer-events-none disabled:opacity-40"
                  disabled={stepIndex === steps.length - 1}
                  onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                >
                  {t("nextStep")}
                </button>
              </div>

              <div className="mt-8 border-t border-line pt-6">
                <p className="text-[13px] text-frost-faint">{t("splitCaption")}</p>
                <p className="mt-1 font-mono text-[22px] font-medium text-frost">{money(ledger.contributionPool)}</p>

                <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-night">
                  {splits.map((split, index) => (
                    <span
                      key={split.key}
                      className={`h-full ${index === 0 ? "bg-frost" : index === 1 ? "bg-frost/55" : "bg-frost/25"}`}
                      style={{ width: `${(split.value / ledger.contributionPool) * 100}%` }}
                      title={`${split.label}: ${money(split.value)}`}
                    />
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {splits.map((split, index) => {
                    const pct = Math.round((split.value / ledger.contributionPool) * 100);
                    return (
                      <article key={split.key} className="gl-tile p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-sm ${
                              index === 0 ? "bg-frost" : index === 1 ? "bg-frost/55" : "bg-frost/25"
                            }`}
                            aria-hidden="true"
                          />
                          <h3 className="text-[14px] font-medium text-frost">{split.label}</h3>
                        </div>
                        <p className="mt-2 font-mono text-[22px] font-medium text-frost">{money(split.value)}</p>
                        <p className="font-mono text-[12px] text-frost-faint">
                          {pct}% {t("ofPool")}
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-frost-dim">{split.detail}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </StageGlow>
        </Reveal>
      </div>
    </section>
  );
}
