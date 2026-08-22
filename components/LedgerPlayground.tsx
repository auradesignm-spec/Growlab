"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CARD_PAYMENT_FEE_PCT,
  COMMISSION_QUICK_PICKS,
  HIGH_MARGIN_COMMISSION_PCT,
  PLATFORM_FEE_PCT,
  computeSimpleSplit,
  isHighMarginProduct,
} from "@/lib/domain/commission";

const PRICE_MIN = 10;
const PRICE_MAX = 80;
const PRICE_STEP = 1;
const DEFAULT_PRICE = 28;
const DEFAULT_PRODUCT_COST = 12;
const DEFAULT_SHIPPING_COST = 1.5;
const COMMISSIONS = [...COMMISSION_QUICK_PICKS, HIGH_MARGIN_COMMISSION_PCT] as const;

function money(value: number, currency: string): string {
  return `${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function pctOf(part: number, total: number): string {
  if (total <= 0) return "0";
  return ((part / total) * 100).toFixed(1);
}

export default function LedgerPlayground() {
  const t = useTranslations("marketing.ledger");
  const locale = useLocale();
  const currency = t("currency");
  const pctMark = locale === "ar" ? "٪" : "%";
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [commission, setCommission] = useState(0.15);
  const [productCost, setProductCost] = useState(DEFAULT_PRODUCT_COST);
  const [shippingCost, setShippingCost] = useState(DEFAULT_SHIPPING_COST);

  const costPrice = Math.max(0, productCost) + Math.max(0, shippingCost);
  const marginPct = price > 0 ? ((price - costPrice) / price) * 100 : 0;
  const highMargin = isHighMarginProduct(price, costPrice);
  const activeCommission = highMargin ? commission : Math.min(commission, 0.2);

  const split = useMemo(
    () =>
      computeSimpleSplit({
        retailPrice: price,
        commissionType: "pct",
        commissionValue: activeCommission,
        costPrice,
        settlementChannel: "card",
      }),
    [activeCommission, costPrice, price]
  );

  const platformTake = split.platformFee + split.paymentFee;
  const platformPct = (PLATFORM_FEE_PCT + CARD_PAYMENT_FEE_PCT) * 100;
  const rows = [
    {
      key: "marketer",
      label: t("marketerShare"),
      hint: t("marketerHint", { pct: Math.round(activeCommission * 100) }),
      value: split.marketerCommission,
      tone: "#1F6FEB",
    },
    {
      key: "merchant",
      label: t("merchantShare"),
      hint: t("merchantProfit", { amount: money(split.merchantNetAfterCogs, currency) }),
      value: split.merchantNet,
      tone: "var(--ink)",
    },
    {
      key: "platform",
      label: t("platformShare"),
      hint: t("platformAllInHint", {
        total: platformPct.toFixed(1),
        platform: Math.round(PLATFORM_FEE_PCT * 100),
        gateway: (CARD_PAYMENT_FEE_PCT * 100).toFixed(1),
      }),
      value: platformTake,
      tone: "rgba(17, 19, 24, 0.28)",
    },
  ] as const;

  const status = t("resultStatus", {
    price: money(price, currency),
    marketer: money(split.marketerCommission, currency),
    merchant: money(split.merchantNet, currency),
    platform: money(platformTake, currency),
  });

  function pickCommission(next: number) {
    if (next >= HIGH_MARGIN_COMMISSION_PCT && !highMargin) return;
    setCommission(next);
  }

  function parseMoney(raw: string): number {
    const next = Number(raw);
    return Number.isFinite(next) ? Math.max(0, next) : 0;
  }

  return (
    <div className="gl-stage p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="space-y-5">
          <div>
            <label htmlFor="ledger-price" className="text-[11px] text-frost-faint">
              {t("sale")}
            </label>
            <p className="mt-1 font-mono text-[32px] font-medium leading-none text-frost sm:text-[40px]">
              {money(price, currency)}
            </p>
            <p className="mt-2 text-[13px] text-frost-dim">{t("productA")}</p>
            <input
              id="ledger-price"
              className="gl-range mt-3"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              aria-valuemin={PRICE_MIN}
              aria-valuemax={PRICE_MAX}
              aria-valuenow={price}
              aria-valuetext={money(price, currency)}
            />
            <div className="mt-1 flex justify-between font-mono text-[11px] text-frost-faint">
              <span>{money(PRICE_MIN, currency)}</span>
              <span>{money(PRICE_MAX, currency)}</span>
            </div>
          </div>

          <fieldset>
            <legend className="text-[11px] text-frost-faint">{t("commissionLabel")}</legend>
            <div className="gl-seg mt-2 w-full">
              {COMMISSIONS.map((pct) => {
                const locked = pct >= HIGH_MARGIN_COMMISSION_PCT && !highMargin;
                return (
                  <button
                    key={pct}
                    type="button"
                    disabled={locked}
                    aria-pressed={activeCommission === pct}
                    onClick={() => pickCommission(pct)}
                    className="gl-seg-btn min-h-11 min-w-0 flex-1 whitespace-nowrap"
                  >
                    {Math.round(pct * 100)}
                    {pctMark}
                  </button>
                );
              })}
            </div>
            {!highMargin ? <p className="mt-2 text-[12px] text-frost-faint">{t("commissionLocked")}</p> : null}
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] text-frost-faint">{t("productCostLabel")}</span>
              <input
                className="gl-input mt-1.5 font-mono"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={Number.isInteger(productCost) ? productCost : productCost.toFixed(1)}
                onChange={(event) => setProductCost(parseMoney(event.target.value))}
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-frost-faint">{t("shippingCostLabel")}</span>
              <input
                className="gl-input mt-1.5 font-mono"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={Number.isInteger(shippingCost) ? shippingCost : shippingCost.toFixed(1)}
                onChange={(event) => setShippingCost(parseMoney(event.target.value))}
              />
            </label>
          </div>
          <div className="rounded-2xl border border-line px-4 py-3">
            <p className="text-[11px] text-frost-faint">{t("marginAutoLabel")}</p>
            <p className="mt-1 font-mono text-[22px] tabular-nums text-frost">
              {marginPct.toFixed(1)}
              {pctMark}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-frost-faint">
              {t("marginAutoHint", { amount: money(costPrice, currency) })}
            </p>
          </div>

        </div>

        <div>
          <p className="sr-only" role="status" aria-atomic="true">
            {status}
          </p>
          <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-night" aria-hidden="true">
            {rows.map((row) => (
              <span
                key={row.key}
                className="h-full"
                style={{ width: `${(row.value / price) * 100}%`, background: row.tone }}
              />
            ))}
          </div>

          <ul className="mt-4 grid grid-cols-1 gap-2">
            {rows.map((row) => (
              <li key={row.key} className="rounded-2xl border border-line px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="inline-flex items-center gap-1.5 text-[12px] text-frost-dim">
                    <span className="size-1.5 rounded-sm" style={{ background: row.tone }} aria-hidden="true" />
                    {row.label}
                  </p>
                  <p className="font-mono text-[12px] tabular-nums text-frost-faint">
                    {row.key === "platform" ? platformPct.toFixed(1) : pctOf(row.value, price)}
                    {pctMark}
                  </p>
                </div>
                <p className="mt-1 font-mono text-[18px] tabular-nums text-frost">{money(row.value, currency)}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-frost-faint">{row.hint}</p>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[13px] leading-relaxed text-frost-dim">{t("sameBooks")}</p>
          <p className="mt-2 text-[12px] text-frost-faint">{t("disclaimer")}</p>
        </div>
      </div>
    </div>
  );
}
