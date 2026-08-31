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
    <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-line">
              <ShoppingBag className="h-4 w-4 text-slate-700" />
            </span>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {locale === "en" ? "Channel Profitability Scorecard" : "بطاقة أداء وربحية القنوات والمتاجر"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
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
                ? "bg-slate-900 text-white shadow-2xs font-bold"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-line"
            }`}
          >
            {locale === "en" ? "All Channels" : "كل القنوات"} ({scorecard.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("WINNERS")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "WINNERS"
                ? "bg-emerald-700 text-white shadow-2xs font-bold"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-line"
            }`}
          >
            {locale === "en" ? "Winners (>20% Margin)" : "الرابحة (>20% هامش)"}
          </button>
          <button
            type="button"
            onClick={() => setFilter("LOSERS")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "LOSERS"
                ? "bg-rose-700 text-white shadow-2xs font-bold"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-line"
            }`}
          >
            {locale === "en" ? "Bleeding / At Risk" : "عالية المخاطر"} ({losingCount})
          </button>
        </div>
      </div>

      {/* Grid of Channels */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredData.map((ch) => {
          const isWinner = ch.isProfitable && ch.marginPercentage >= 20;
          const isLosing = !ch.isProfitable;

          return (
            <div
              key={ch.channelId}
              className={`flex flex-col justify-between rounded-2xl border p-4.5 transition-all ${
                isLosing
                  ? "border-rose-200 bg-rose-50/40"
                  : isWinner
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-line bg-slate-50/50"
              }`}
            >
              <div>
                {/* Top Channel Badge & Type */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {ch.channelName}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isLosing
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : isWinner
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {ch.isProfitable
                      ? `${ch.marginPercentage}% هامش صافي`
                      : "خسارة تشغيلية"}
                  </span>
                </div>

                {/* Main Metric */}
                <div className="mt-3">
                  <p className="text-[11px] text-slate-500">
                    {locale === "en" ? "Net Reconciled Sales" : "صافي المبيعات المدققة"}
                  </p>
                  <p className="text-xl font-black font-mono text-slate-900">
                    {ch.netSales.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ر.س</span>
                  </p>
                </div>

                {/* Submetrics Breakdown */}
                <div className="mt-3.5 space-y-1.5 border-t border-line/60 pt-3 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>{locale === "en" ? "Orders Delivered" : "الطلبات المستلمة"}:</span>
                    <span className="font-mono font-semibold text-slate-900">{ch.ordersCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{locale === "en" ? "Ad Spend / ROAS" : "الإنفاق الإعلاني"}:</span>
                    <span className="font-mono text-rose-600">-{ch.adSpend.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{locale === "en" ? "COGS & Couriers" : "البضاعة والشحن"}:</span>
                    <span className="font-mono text-rose-600">
                      -{(ch.cogs + ch.shippingCosts).toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{locale === "en" ? "COD Return Loss" : "خسارة المرتجعات"}:</span>
                    <span className="font-mono text-amber-700">-{ch.returnsLoss.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Summary */}
              <div className="mt-4 border-t border-line/60 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {locale === "en" ? "Net Cash Profit:" : "صافي الربح الفعلي:"}
                  </span>
                  <span
                    className={`font-mono text-sm font-extrabold ${
                      isLosing ? "text-rose-600" : "text-emerald-700"
                    }`}
                  >
                    {ch.netProfit > 0 ? `+${ch.netProfit.toLocaleString()}` : ch.netProfit.toLocaleString()} ر.س
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
