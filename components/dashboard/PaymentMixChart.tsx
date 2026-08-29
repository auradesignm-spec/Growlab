"use client";

import React from "react";
import { CreditCard, Banknote, ShieldAlert, Truck, RefreshCcw, CheckCircle2, TrendingDown } from "lucide-react";
import { type FinancialSummaryMetrics } from "@/lib/reconciliationEngine";

interface Props {
  metrics: FinancialSummaryMetrics;
  locale?: string;
}

export default function PaymentMixChart({ metrics, locale = "ar" }: Props) {
  const isEn = locale === "en";

  const codOrders = metrics.codOrdersCount;
  const prepaidOrders = metrics.prepaidOrdersCount;
  const total = metrics.totalOrders || 1;

  const codPct = metrics.codSharePercentage;
  const prepaidPct = Number((100 - codPct).toFixed(1));

  // Courier Breakdown data
  const couriers = [
    { name: "SMSA Express", delivered: 94.2, rtoRate: 5.8, avgCost: "24 ر.س", status: "ممتاز" },
    { name: "Aramex", delivered: 88.5, rtoRate: 11.5, avgCost: "28 ر.س", status: "جيد" },
    { name: "J&T Express", delivered: 76.4, rtoRate: 23.6, avgCost: "22 ر.س", status: "مرتفع المرتجع" },
    { name: "SPL (البريد السعودي)", delivered: 91.0, rtoRate: 9.0, avgCost: "26 ر.س", status: "جيد جداً" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Payment Mix (COD vs Prepaid) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Banknote className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn ? "Payment Mix & RTO Risk Breakdown" : "مزيج الدفع ومخاطر مرتجعات الدفع عند الاستلام (COD)"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEn ? "Cash on Delivery vs Prepaid impact on Net Margin" : "أثر الدفع المسبق مقابل الدفع عند الاستلام على الربحية"}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Dual Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CreditCard className="h-3.5 w-3.5" />
              {isEn ? "Prepaid / Apple Pay" : "دفع إلكتروني مسبق"} ({prepaidPct}%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Banknote className="h-3.5 w-3.5" />
              {isEn ? "Cash on Delivery (COD)" : "الدفع عند الاستلام (COD)"} ({codPct}%)
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${prepaidPct}%` }}
              title={`Prepaid: ${prepaidPct}%`}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${codPct}%` }}
              title={`COD: ${codPct}%`}
            />
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* Prepaid Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">{isEn ? "Prepaid Orders" : "طلبات الدفع المسبق"}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-xl font-bold font-mono text-white">{prepaidOrders} <span className="text-xs font-normal text-slate-400">{isEn ? "orders" : "طلب"}</span></p>
            <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{isEn ? "RTO Rate" : "نسبة المرتجع"}:</span>
              <span className="font-bold text-emerald-300 font-mono">{metrics.prepaidRtoRatePercentage}%</span>
            </div>
          </div>

          {/* COD Card */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400">{isEn ? "COD Orders" : "طلبات الدفع عند الاستلام"}</span>
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-2 text-xl font-bold font-mono text-white">{codOrders} <span className="text-xs font-normal text-slate-400">{isEn ? "orders" : "طلب"}</span></p>
            <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{isEn ? "RTO Rate" : "نسبة المرتجع"}:</span>
              <span className="font-bold text-rose-400 font-mono">{metrics.codRtoRatePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Warning insight */}
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-start gap-2.5">
          <TrendingDown className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <p>
            {isEn
              ? `Estimated RTO Loss from uncollected COD orders: ${metrics.totalRtoLoss} SAR (Courier return fees + damaged packaging).`
              : `خسائر مرتجعات الدفع عند الاستلام (RTO) المسجلة: ${metrics.totalRtoLoss.toLocaleString()} ر.س (تكاليف الشحن العكسي وضياع كلفة التغليف).`}
          </p>
        </div>
      </div>

      {/* Courier Settlement & Delivery Scorecard */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Truck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn ? "Courier Settlement & Delivery Performance" : "تسوية شركات الشحن ومعدلات تسليم الطرود"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEn ? "Reconciling actual shipping invoices vs courier performance" : "مطابقة فواتير شركات الشحن الحقيقية مع نسب تسليم الشحنات"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {couriers.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs"
            >
              <div>
                <p className="font-bold text-white text-sm">{c.name}</p>
                <div className="mt-1 flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>{isEn ? "Avg Shipping" : "متوسط الشحنة"}: <strong className="text-slate-200">{c.avgCost}</strong></span>
                  <span>•</span>
                  <span>{isEn ? "RTO Rate" : "نسبة المرتجع"}: <strong className={c.rtoRate > 15 ? "text-rose-400" : "text-emerald-400"}>{c.rtoRate}%</strong></span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-emerald-400 text-sm">{c.delivered}%</span>
                <p className="text-[10px] text-slate-500">{isEn ? "Delivered" : "تم التسليم"}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs text-cyan-300">
          <span>{isEn ? "Automated courier COD remittance reconciliation is active" : "مطابقة تحصيلات الدفع عند الاستلام مع بوليصات الشحن مفعلة"}</span>
          <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 font-bold text-cyan-300 border border-cyan-500/30">
            {isEn ? "Reconciled" : "مطابق 100%"}
          </span>
        </div>
      </div>
    </div>
  );
}
