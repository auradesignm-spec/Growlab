"use client";

import React, { useState } from "react";
import { type ChannelProfitability } from "@/lib/reconciliationEngine";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Sliders,
} from "lucide-react";

interface Props {
  scorecard: ChannelProfitability[];
  locale?: string;
}

export default function ChannelScorecard({ scorecard, locale = "ar" }: Props) {
  const [filter, setFilter] = useState<"ALL" | "WINNERS" | "LOSERS">("ALL");

  const filteredData = scorecard.filter((item) => {
    if (filter === "WINNERS") return item.isProfitable && item.marginPercentage > 20;
    if (filter === "LOSERS") return !item.isProfitable || item.marginPercentage <= 15;
    return true;
  });

  const losingCount = scorecard.filter((s) => !s.isProfitable).length;
  const topChannel = scorecard[0];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
              <ShoppingBag className="h-4 w-4 text-white" />
            </span>
            <h3 className="text-base font-bold text-white sm:text-lg">
              {locale === "en" ? "Channel Profitability Scorecard" : "بطاقة أداء وربحية القنوات والمتاجر"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {locale === "en"
              ? "Reconciled ranking of sales channels by Net Sales, Share %, and True Net Margin %"
              : "ترتيب تدقيق القنوات حسب صافي المبيعات، الحصة السوقية، وهامش الربح الحقيقي الصافي بعد كل الخصومات"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "ALL"
                ? "bg-slate-700 text-white border border-slate-600"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            {locale === "en" ? "All Channels" : "كل القنوات"} ({scorecard.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("WINNERS")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "WINNERS"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            {locale === "en" ? "Winning (High Margin)" : "قنوات رابحة"}
          </button>
          {losingCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter("LOSERS")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                filter === "LOSERS"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-slate-800/60 text-rose-400 hover:text-rose-300"
              }`}
            >
              <AlertTriangle className="h-3 w-3 text-white" />
              {locale === "en" ? "Losing Channels" : "قنوات خاسرة"} ({losingCount})
            </button>
          )}
        </div>
      </div>

      {/* Top Banner Insight */}
      {topChannel && topChannel.isProfitable && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-white" />
            <span>
              <strong>{topChannel.channel}</strong> {locale === "en" ? "is your #1 cash cow with" : "هي القناة الأعلى ربحية بهامش صافٍ"} <strong>{topChannel.marginPercentage}%</strong> ({topChannel.netProfit.toLocaleString()} ر.س صافي ربح).
            </span>
          </div>
          <span className="shrink-0 font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            {locale === "en" ? "Scale Budget" : "موصى بالتوسيع"}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 rtl:text-right">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">{locale === "en" ? "Channel" : "القناة / المنصة"}</th>
              <th className="px-4 py-3">{locale === "en" ? "Net Sales" : "صافي المبيعات"}</th>
              <th className="px-4 py-3">{locale === "en" ? "Orders" : "الطلبات"}</th>
              <th className="px-4 py-3">{locale === "en" ? "Share %" : "الحصة %"}</th>
              <th className="px-4 py-3">{locale === "en" ? "Ad Spend" : "الإنفاق الإعلاني"}</th>
              <th className="px-4 py-3">{locale === "en" ? "RTO / Returns" : "نسبة المرتجع RTO"}</th>
              <th className="px-4 py-3">{locale === "en" ? "True Net Profit" : "الربح الصافي الحقيقي"}</th>
              <th className="px-4 py-3">{locale === "en" ? "Net Margin %" : "هامش الربح %"}</th>
              <th className="px-4 py-3">{locale === "en" ? "Recommended Action" : "الإجراء المقترح"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {filteredData.map((ch, idx) => {
              const isNegative = ch.netProfit < 0 || ch.marginPercentage < 0;
              const isHigh = ch.marginPercentage >= 40;

              return (
                <tr
                  key={ch.channel}
                  className={`transition hover:bg-slate-800/40 ${
                    isNegative ? "bg-rose-950/20" : ""
                  }`}
                >
                  <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-400">
                      {idx + 1}
                    </span>
                    {ch.channel}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-white">
                    {ch.netSales.toLocaleString()} ر.س
                  </td>
                  <td className="px-4 py-3.5 font-mono">{ch.ordersCount}</td>
                  <td className="px-4 py-3.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${Math.min(100, ch.orderSharePercentage)}%` }}
                        />
                      </div>
                      <span>{ch.orderSharePercentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">
                    {ch.adSpend.toLocaleString()} ر.س
                  </td>
                  <td className="px-4 py-3.5 font-mono">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        ch.rtoRate > 20
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {ch.rtoRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold">
                    <span
                      className={`inline-flex items-center gap-1 text-sm ${
                        isNegative ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {isNegative ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <TrendingUp className="h-4 w-4" />
                      )}
                      {ch.netProfit > 0 ? `+${ch.netProfit.toLocaleString()}` : ch.netProfit.toLocaleString()} ر.س
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                        isNegative
                          ? "border border-rose-500/40 bg-rose-950/60 text-rose-300 animate-pulse"
                          : isHigh
                            ? "border border-emerald-500/40 bg-emerald-950/50 text-emerald-300"
                            : "border border-slate-700 bg-slate-800 text-slate-300"
                      }`}
                    >
                      {ch.marginPercentage > 0 ? `+${ch.marginPercentage}%` : `${ch.marginPercentage}%`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1.5 ${
                        isNegative ? "font-semibold text-rose-300" : "text-slate-400"
                      }`}
                    >
                      {ch.recommendedAction}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
