"use client";

import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { OrderLedgerRow } from "@/lib/dashboard/types";

/**
 * Every order's split, line by line: sale, commission, platform, merchant.
 * Returns reserve is a delay on the marketer share only. Gateway appears only on card.
 */
export default function WaterfallBreakdown({ row }: { row: OrderLedgerRow }) {
  const t = useTranslations("dashboardApp.waterfall");
  const ledger = row.ledger;

  if (!ledger) {
    return <p className="font-serif text-sm italic text-frost-dim">{t("pending")}</p>;
  }

  const lines: Array<{ label: string; value: number; emphasis?: boolean; negative?: boolean }> = [
    { label: t("attributedGmv"), value: ledger.attributedGmv },
    { label: t("creatorShare"), value: -ledger.creatorShare, negative: true },
    { label: t("platformShare"), value: -ledger.platformShare, negative: true },
    ...(ledger.paymentFee > 0
      ? [{ label: t("paymentFee"), value: -ledger.paymentFee, negative: true }]
      : []),
    { label: t("merchantShare"), value: ledger.merchantShare, emphasis: true },
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
