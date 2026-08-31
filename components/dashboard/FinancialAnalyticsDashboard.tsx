"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Percent,
  BarChart3,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  getFinancialSummaryMetrics,
  getChannelProfitabilityScorecard,
  getFinancialTimeSeriesData,
  getUnifiedOrders,
  type FinancialSummaryMetrics,
} from "@/lib/reconciliationEngine";
import ChannelScorecard from "./ChannelScorecard";
import PaymentMixChart from "./PaymentMixChart";

interface Props {
  locale?: string;
}

export default function FinancialAnalyticsDashboard({ locale = "ar" }: Props) {
  const isEn = locale === "en";
  const [timeframe, setTimeframe] = useState<"TODAY" | "7D" | "30D" | "YTD">("7D");
  const [isSyncing, setIsSyncing] = useState(false);

  const metrics: FinancialSummaryMetrics = getFinancialSummaryMetrics();
  const scorecard = getChannelProfitabilityScorecard();
  const timeSeries = getFinancialTimeSeriesData();
  const recentOrders = getUnifiedOrders();

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 900);
  };

  return (
    <div className="space-y-8 text-slate-900">
      {/* Top Bar / Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {isEn ? "True Net Profit & Financial Reconciliation" : "محرك الربح الصافي وتدقيق المبيعات والتكاليف"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn
                  ? "Unified single source of truth across Shopify, Meta/Google Ads, Couriers, and Returns"
                  : "المصدر الموحد الشامل لمبيعات المتاجر، إنفاق الإعلانات، فواتير الشحن، ومرتجعات الدفع عند الاستلام"}
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl border border-line bg-slate-50 p-1">
            {(["TODAY", "7D", "30D", "YTD"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  timeframe === tf
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tf === "TODAY"
                  ? isEn ? "Today" : "اليوم"
                  : tf === "7D"
                    ? isEn ? "Last 7D" : "آخر 7 أيام"
                    : tf === "30D"
                      ? isEn ? "Last 30D" : "آخر 30 يوم"
                      : isEn ? "YTD" : "هذا العام"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 active:scale-95 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-emerald-400" : "text-emerald-400"}`} />
            {isSyncing ? (isEn ? "Syncing..." : "جاري المطابقة...") : isEn ? "Reconcile Now" : "مطابقة فورية"}
          </button>
        </div>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Gross Sales */}
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">{isEn ? "Gross Sales" : "إجمالي المبيعات"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-slate-900 sm:text-2xl">
            {metrics.grossSales.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ر.س</span>
          </p>
          <p className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">↑ +14.2%</span> {isEn ? "vs prev period" : "عن الفترة السابقة"}
          </p>
        </div>

        {/* Net Sales */}
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">{isEn ? "Net Sales (Excl. Returns)" : "صافي المبيعات"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-slate-900 sm:text-2xl">
            {metrics.netSales.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ر.س</span>
          </p>
          <p className="mt-2 text-[10px] text-slate-500 font-mono">
            {metrics.totalOrders} {isEn ? "orders" : "طلب مؤكد"}
          </p>
        </div>

        {/* AOV */}
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">{isEn ? "Avg Order Value (AOV)" : "متوسط قيمة الطلب (AOV)"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-slate-900 sm:text-2xl">
            {metrics.averageOrderValue.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ر.س</span>
          </p>
          <p className="mt-2 text-[10px] text-emerald-700 font-semibold">
            {isEn ? "Strong Cart Size" : "سلة شرائية ممتازة"}
          </p>
        </div>

        {/* MER */}
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-500">{isEn ? "Marketing Eff. (MER)" : "كفاءة التسويق (MER)"}</p>
            <span className="rounded bg-amber-50 border border-amber-200 px-1 text-[9px] font-bold text-amber-700">Rev/Spend</span>
          </div>
          <p className="mt-1 text-xl font-bold font-mono text-amber-600 sm:text-2xl">
            {metrics.mer}x
          </p>
          <p className="mt-2 text-[10px] text-slate-500">
            {isEn ? "Target: >3.5x" : "المعدل المستهدف: > 3.5x"}
          </p>
        </div>

        {/* Blended CAC */}
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">{isEn ? "Blended CAC" : "كلفة اكتساب العميل (CAC)"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-slate-900 sm:text-2xl">
            {metrics.blendedCac} <span className="text-xs text-slate-500 font-normal">ر.س</span>
          </p>
          <p className="mt-2 text-[10px] text-emerald-700">
            {isEn ? "Meta + Google + TikTok" : "شامل الإعلانات المدمجة"}
          </p>
        </div>

        {/* True Net Profit & Margin */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-800">{isEn ? "True Net Profit" : "صافي الربح الحقيقي"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-emerald-700 sm:text-2xl">
            +{metrics.trueNetProfit.toLocaleString()} <span className="text-xs text-emerald-700 font-normal">ر.س</span>
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">{isEn ? "Net Margin" : "الهامش الصافي"}:</span>
            <span className="rounded-md bg-emerald-600 text-white px-1.5 py-0.5 font-bold font-mono text-[10px]">
              {metrics.netMarginPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Deduction Waterfall & Profitability Breakdown */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEn ? "Where Did Every Riyal Go? (Deductions Waterfall)" : "أين يذهب كل ريال من مبيعاتك؟ (تفكيك التكاليف الحقيقية)"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEn ? "Reconciling Gross Sales into True Net Profit after all hidden expenses" : "تحويل إجمالي المبيعات إلى صافي الربح الفعلي بعد استقطاع كل التكاليف المخفية"}
            </p>
          </div>
          <span className="rounded-lg border border-line bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-700">
            {isEn ? "Gross" : "الإجمالي"}: {metrics.grossSales.toLocaleString()} ر.س
          </span>
        </div>

        {/* Visual Deductions Strip */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* COGS */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
            <p className="text-xs text-slate-600">{isEn ? "1. Cost of Goods (COGS)" : "1. كلفة المنتجات (COGS)"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-rose-600">
              -{metrics.totalCogs.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{((metrics.totalCogs / (metrics.grossSales || 1)) * 100).toFixed(1)}% من المبيعات</p>
          </div>

          {/* Ad Spend */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
            <p className="text-xs text-slate-600">{isEn ? "2. Total Ad Spend" : "2. الإنفاق الإعلاني (Ads)"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-rose-600">
              -{metrics.totalAdSpend.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{((metrics.totalAdSpend / (metrics.grossSales || 1)) * 100).toFixed(1)}% من المبيعات</p>
          </div>

          {/* Shipping & Couriers */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
            <p className="text-xs text-slate-600">{isEn ? "3. Courier Shipping" : "3. الشحن والتوصيل"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-rose-600">
              -{metrics.totalShippingCosts.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{((metrics.totalShippingCosts / (metrics.grossSales || 1)) * 100).toFixed(1)}% من المبيعات</p>
          </div>

          {/* RTO / Returns */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
            <p className="text-xs text-slate-600">{isEn ? "4. RTO & Returns Loss" : "4. خسائر المرتجع (RTO)"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-rose-600">
              -{metrics.totalRefundsAndRto.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{((metrics.totalRefundsAndRto / (metrics.grossSales || 1)) * 100).toFixed(1)}% من المبيعات</p>
          </div>

          {/* Net Profit Cash In Pocket */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
            <p className="text-xs font-bold text-emerald-800">{isEn ? "5. True Net Profit" : "5. صافي الربح في الجيب"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-emerald-700">
              +{metrics.trueNetProfit.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-emerald-800 font-bold">{metrics.netMarginPercentage}% صافي ربح فعلي</p>
          </div>
        </div>
      </div>

      {/* Recharts Graphical Trends */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEn ? "Sales vs Net Profit Daily Trend" : "حركة المبيعات وصافي الأرباح اليومية"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEn ? "Visualizing the gap between Gross Vanity and Net Reality" : "تتبع الفارق بين حجم المبيعات الظاهري وصافي الأرباح الفعلي"}
            </p>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "0.75rem",
                  color: "#0f172a",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area
                type="monotone"
                dataKey="gross"
                name={isEn ? "Gross Sales (SAR)" : "إجمالي المبيعات (ر.س)"}
                stroke="#d97706"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#grossGradient)"
              />
              <Area
                type="monotone"
                dataKey="trueProfit"
                name={isEn ? "True Net Profit (SAR)" : "صافي الربح الحقيقي (ر.س)"}
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Scorecard */}
      <ChannelScorecard scorecard={scorecard} locale={locale} />

      {/* Payment Mix & Operations */}
      <PaymentMixChart metrics={metrics} locale={locale} />

      {/* Recent Reconciled Orders Table */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-line">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEn ? "Unified Orders Reconciliation Log" : "سجل تسوية الطلبات الموحد (Live Audit)"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? "SKU-level profitability calculation per transaction" : "احتساب هامش الربح الصافي لكل منتج وبوليصة في الوقت الفعلي"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 rtl:text-right">
            <thead className="border-b border-line bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{isEn ? "Order ID" : "رقم الطلب"}</th>
                <th className="px-4 py-3">{isEn ? "Channel" : "القناة"}</th>
                <th className="px-4 py-3">{isEn ? "Product / SKU" : "المنتج / الرمز"}</th>
                <th className="px-4 py-3">{isEn ? "Payment & Courier" : "طريقة الدفع والشاحن"}</th>
                <th className="px-4 py-3">{isEn ? "Gross" : "الإجمالي"}</th>
                <th className="px-4 py-3">{isEn ? "COGS + Ads + Ship" : "الخصومات"}</th>
                <th className="px-4 py-3">{isEn ? "Net Profit" : "صافي الربح"}</th>
                <th className="px-4 py-3">{isEn ? "Net Margin" : "الهامش"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentOrders.map((o) => {
                const isLoss = o.netProfit < 0;
                return (
                  <tr key={o.id} className={`hover:bg-slate-50/70 transition-colors ${isLoss ? "bg-rose-50/40" : ""}`}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{o.orderId}</td>
                    <td className="px-4 py-3">{o.channel}</td>
                    <td className="px-4 py-3 max-w-[220px] truncate" title={o.productTitle}>
                      <span className="font-semibold text-slate-900">{o.productTitle}</span>
                      <span className="block text-[10px] font-mono text-slate-500">{o.sku}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px]">
                      <span className={`font-semibold ${o.paymentMethod === "COD" ? "text-amber-700" : "text-emerald-700"}`}>
                        {o.paymentMethod}
                      </span>
                      <span className="block text-slate-500">{o.courierName} ({o.courierStatus})</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{o.grossSales} ر.س</td>
                    <td className="px-4 py-3 font-mono text-rose-600 text-[11px]">
                      -{(o.cogs + o.adSpendShare + o.shippingCost + (o.rtoLoss || 0)).toFixed(1)} ر.س
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      <span className={isLoss ? "text-rose-600" : "text-emerald-700"}>
                        {o.netProfit > 0 ? `+${o.netProfit}` : o.netProfit} ر.س
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          isLoss
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {o.marginPercentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
