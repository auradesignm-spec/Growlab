"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";

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
  readonly value: number;
  readonly kind: "base" | "neg" | "subtotal";
}

export default function LedgerPreview() {
  const t = useTranslations("marketing.ledger");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const scenario = SCENARIOS[scenarioIndex];
  const ledger = computeLedger(scenario);
  const money = (value: number) => formatOMR(value, t("currency"));

  const steps: readonly StepDef[] = [
    { key: "gmv", label: t("gmv"), value: ledger.gmv, kind: "base" },
    { key: "returns", label: t("returns"), value: -ledger.returnsReserve, kind: "neg" },
    { key: "net", label: t("net"), value: ledger.netAttributedSales, kind: "subtotal" },
    { key: "fees", label: t("fees"), value: -ledger.paymentFee, kind: "neg" },
    { key: "cogs", label: t("cogs"), value: -ledger.cogs, kind: "neg" },
    { key: "ads", label: t("ads"), value: -ledger.adSpend, kind: "neg" },
    { key: "pool", label: t("pool"), value: ledger.contributionPool, kind: "subtotal" },
  ];

  const splits = [
    {
      key: "creator",
      label: t("creatorShare"),
      value: ledger.creatorShare,
      barClass: "bg-frost",
      detail: ledger.usedFloor ? t("creatorFloorDetail") : t("creatorPoolDetail"),
    },
    {
      key: "merchant",
      label: t("merchantShare"),
      value: ledger.merchantShare,
      barClass: "bg-frost/55",
      detail: t("merchantDetail"),
    },
    {
      key: "platform",
      label: t("platformShare"),
      value: ledger.platformShare,
      barClass: "bg-frost/30",
      detail: t("platformDetail"),
    },
  ] as const;

  const maxStepValue = Math.max(...steps.map((s) => Math.abs(s.value)));
  const maxSplitValue = Math.max(ledger.creatorShare, ledger.merchantShare, ledger.platformShare, 1);

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
          <div className="mt-8 flex flex-wrap gap-2" role="radiogroup" aria-label={t("pickDeal")}>
            {SCENARIOS.map((item, index) => {
              const selected = index === scenarioIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setScenarioIndex(index)}
                  className={`rounded-lg border px-4 py-2 text-[14px] font-medium transition-colors duration-150 ease-out ${
                    selected
                      ? "border-signal/40 bg-night-soft text-frost"
                      : "border-white/10 bg-transparent text-frost-dim hover:border-white/20 hover:text-frost"
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal>
          <div className="gl-glass mt-8 p-6 sm:p-8">
            <p className="text-[12px] text-frost-faint">
              {t("waterfall")} {t(scenario.labelKey)}
            </p>

            <div className="mt-8 flex items-end gap-3 overflow-x-auto pb-2 sm:gap-4">
              {steps.map((step) => {
                const isNeg = step.kind === "neg";
                const heightPct = Math.max(10, (Math.abs(step.value) / maxStepValue) * 100);
                const isOpen = activeKey === step.key;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onMouseEnter={() => setActiveKey(step.key)}
                    onMouseLeave={() => setActiveKey((k) => (k === step.key ? null : k))}
                    onFocus={() => setActiveKey(step.key)}
                    onBlur={() => setActiveKey((k) => (k === step.key ? null : k))}
                    onClick={() => setActiveKey((k) => (k === step.key ? null : step.key))}
                    aria-expanded={isOpen}
                    className="relative flex min-w-[64px] flex-1 flex-col items-center gap-3"
                  >
                    {isOpen && (
                      <div
                        role="tooltip"
                        className="absolute -top-2 left-1/2 z-20 w-max -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-night-raised px-3 py-2 text-center shadow-overlay"
                      >
                        <p className="text-[12px] font-medium text-frost">{step.label}</p>
                        <p className="font-mono text-[12px] text-frost-dim">
                          {step.value < 0 ? "−" : ""}
                          {money(Math.abs(step.value))}
                        </p>
                      </div>
                    )}

                    <div className="flex h-[180px] w-full items-end justify-center">
                      <div
                        className={`w-full rounded-t ${
                          isNeg
                            ? "border border-danger/30 bg-danger/15"
                            : step.kind === "subtotal"
                              ? "bg-frost/80"
                              : "bg-frost/40"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>

                    <p className="text-center text-[12px] leading-tight text-frost-faint">
                      {step.label}
                    </p>
                    <p className={`font-mono text-[12px] font-medium ${isNeg ? "text-danger" : "text-frost"}`}>
                      {isNeg ? "−" : ""}
                      {money(Math.abs(step.value))}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="text-[12px] text-frost-faint">{t("splitCaption")}</p>

              <div className="mt-5 flex h-3 w-full overflow-hidden rounded-lg bg-white/[0.04]">
                {splits.map((split) => (
                  <button
                    key={split.key}
                    type="button"
                    onMouseEnter={() => setActiveKey(split.key)}
                    onMouseLeave={() => setActiveKey((k) => (k === split.key ? null : k))}
                    onFocus={() => setActiveKey(split.key)}
                    onBlur={() => setActiveKey((k) => (k === split.key ? null : k))}
                    onClick={() => setActiveKey((k) => (k === split.key ? null : split.key))}
                    aria-label={`${split.label}: ${money(split.value)}`}
                    className={`relative h-full ${split.barClass} transition-opacity duration-150 ease-out hover:opacity-90`}
                    style={{ width: `${Math.max(6, (split.value / maxSplitValue) * (100 / 1.15))}%` }}
                  />
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {splits.map((split) => {
                  const isOpen = activeKey === split.key;
                  return (
                    <button
                      key={split.key}
                      type="button"
                      onMouseEnter={() => setActiveKey(split.key)}
                      onMouseLeave={() => setActiveKey((k) => (k === split.key ? null : k))}
                      onFocus={() => setActiveKey(split.key)}
                      onBlur={() => setActiveKey((k) => (k === split.key ? null : k))}
                      onClick={() => setActiveKey((k) => (k === split.key ? null : split.key))}
                      aria-expanded={isOpen}
                      className={`rounded-lg border p-4 text-start transition-colors duration-150 ease-out ${
                        isOpen
                          ? "border-white/25 bg-white/[0.04]"
                          : "border-white/10 bg-transparent hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-sm ${split.barClass}`} aria-hidden="true" />
                        <p className="text-[14px] font-medium text-frost">{split.label}</p>
                      </div>
                      <p className="mt-2 font-mono text-xl font-medium text-frost">
                        {money(split.value)}
                      </p>
                      {isOpen && (
                        <p className="mt-2 text-[13px] leading-relaxed text-frost-dim">{split.detail}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
