"use client";

import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { OrderLedgerRow } from "@/lib/dashboard/types";

/**
 * The trust feature — every order's ledger shown line by line, in the fixed
 * waterfall order, never collapsed into a single "net" number. Used by both
 * the merchant Orders & Ledger tab and the creator Earnings tab.
 */
export default function WaterfallBreakdown({ row }: { row: OrderLedgerRow }) {
  const t = useTranslations("dashboardApp.waterfall");
  const ledger = row.ledger;

  if (!ledger) {
    return <p className="font-serif text-sm italic text-frost-dim">{t("pending")}</p>;
  }

  const lines: Array<{ label: string; value: number; emphasis?: boolean; negative?: boolean }> = [
    { label: t("attributedGmv"), value: ledger.attributedGmv },
    { label: t("returnsReserve"), value: -ledger.returnsReserve, negative: true },
    { label: t("netAttributedSales"), value: ledger.netAttributedSales, emphasis: true },
    { label: t("paymentFee"), value: -ledger.paymentFee, negative: true },
    { label: t("cogs"), value: -ledger.cogs, negative: true },
    { label: t("adSpend"), value: -ledger.adSpendAllocated, negative: true },
    { label: t("contributionPool"), value: ledger.contributionPool, emphasis: true },
  ];

  return (
    <div className="border border-white/10 bg-white/[0.03]">
      <ul>
        {lines.map((line) => (
          <li
            key={line.label}
            className={`flex items-baseline justify-between gap-4 border-b border-white/10 px-4 py-2 ${
              line.emphasis ? "bg-white/[0.03]" : ""
            }`}
          >
            <span className="font-west text-[10px] uppercase tracking-[0.18em] text-frost-dim">
              {line.label}
            </span>
            <span
              className={`font-mono text-[13px] ${line.negative ? "text-danger" : "text-frost"} ${
                line.emphasis ? "font-bold" : ""
              }`}
            >
              {line.negative ? "−" : ""}
              {formatMoney(Math.abs(line.value), row.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
        <ShareCell label={t("creatorShare")} value={ledger.creatorShare} currency={row.currency} />
        <ShareCell label={t("merchantShare")} value={ledger.merchantShare} currency={row.currency} />
        <ShareCell label={t("platformShare")} value={ledger.platformShare} currency={row.currency} />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-white/10 px-4 py-3">
        <span className="font-serif text-xs italic text-frost-dim">
          {ledger.creatorProfitShare > ledger.creatorFloorAmount
            ? t("floorNote.pool", { pct: formatMoney(ledger.creatorProfitShare, row.currency) })
            : t("floorNote.floor", { amount: formatMoney(ledger.creatorFloorAmount, row.currency) })}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="font-west text-[10px] uppercase tracking-[0.18em] text-frost-dim">
          {t("holdback", { days: ledger.holdbackDays })}
        </span>
        <span className="font-mono text-[13px] text-frost">
          {formatMoney(ledger.holdbackAmount, row.currency)}
        </span>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 px-4 py-3">
        <span className="font-west text-[10px] uppercase tracking-[0.18em] text-frost-dim">
          {t("available")}
        </span>
        <span className="font-mono text-[13px] font-bold text-frost">
          {formatMoney(ledger.availableAmount, row.currency)}
        </span>
      </div>
    </div>
  );
}

function ShareCell({ label, value, currency }: { label: string; value: number; currency: string }) {
  return (
    <div className="px-4 py-3">
      <p className="font-west text-[9px] uppercase tracking-[0.16em] text-frost-dim">{label}</p>
      <p className="mt-1 font-mono text-[14px] font-bold text-frost">{formatMoney(value, currency)}</p>
    </div>
  );
}
