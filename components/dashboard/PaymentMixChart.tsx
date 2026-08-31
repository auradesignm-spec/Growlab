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
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-line">
              <Banknote className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEn ? "Payment Mix & RTO Risk Breakdown" : "مزيج الدفع ومخاطر مرتجعات الدفع عند الاستلام (COD)"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? "Cash on Delivery vs Prepaid impact on Net Margin" : "أثر الدفع المسبق مقابل الدفع عند الاستلام على الربحية"}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Dual Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
              {isEn ? "Prepaid / Apple Pay" : "دفع إلكتروني مسبق"} ({prepaidPct}%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-800">
              <Banknote className="h-3.5 w-3.5 text-amber-600" />
              {isEn ? "Cash on Delivery (COD)" : "الدفع عند الاستلام (COD)"} ({codPct}%)
            </span>
          </div>

          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${prepaidPct}%` }}
              title={`Prepaid: ${prepaidPct}%`}
            />
            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${codPct}%` }}
              title={`COD: ${codPct}%`}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="text-[11px] text-emerald-900 font-semibold">مبيعات الدفع المسبق (المؤكدة)</div>
              <div className="mt-1 text-lg font-bold font-mono text-emerald-700">
                {prepaidOrders} <span className="text-xs font-normal text-slate-500">طلب</span>
              </div>
              <div className="text-[10px] text-emerald-800 mt-1">✓ نسبة تسليم 99.1% وبدون مخاطر RTO</div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
              <div className="text-[11px] text-amber-900 font-semibold">مبيعات الدفع عند الاستلام (COD)</div>
              <div className="mt-1 text-lg font-bold font-mono text-amber-700">
                {codOrders} <span className="text-xs font-normal text-slate-500">طلب</span>
              </div>
              <div className="text-[10px] text-amber-800 mt-1">⚠ معدل إرجاع 12.4% يستوجب تأكيد واتساب</div>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Performance & Hidden Loss Audit */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-line">
              <Truck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEn ? "Courier Reconciliation & Delivery Rates" : "تدقيق أداء شركات الشحن ونسب التسليم"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? "Detecting overcharged shipping and high-return couriers" : "اكتشاف فروقات الفواتير والشركات ذات معدل المرتجع المرتفع"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-line text-xs">
          {couriers.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div>
                <div className="font-bold text-slate-900">{c.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">متوسط الكلفة: {c.avgCost}</div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[11px] text-slate-500 block">نسبة التسليم</span>
                  <span className="font-mono font-bold text-emerald-700">{c.delivered}%</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">نسبة الـ RTO</span>
                  <span className={`font-mono font-bold ${c.rtoRate > 15 ? "text-rose-600" : "text-slate-700"}`}>
                    {c.rtoRate}%
                  </span>
                </div>

                <span
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                    c.rtoRate > 15
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
