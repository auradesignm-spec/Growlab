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
    <div className="space-y-8 text-white">
      {/* Top Bar / Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {isEn ? "True Net Profit & Financial Reconciliation" : "محرك الربح الصافي وتدقيق المبيعات والتكاليف"}
              </h2>
              <p className="text-xs text-slate-400">
                {isEn
                  ? "Unified single source of truth across Shopify, Meta/Google Ads, Couriers, and Returns"
                  : "المصدر الموحد الشامل لمبيعات المتاجر، إنفاق الإعلانات، فواتير الشحن، ومرتجعات الدفع عند الاستلام"}
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
            {(["TODAY", "7D", "30D", "YTD"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  timeframe === tf
                    ? "bg-white text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
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
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-95 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-white" : "text-white"}`} />
            {isSyncing ? (isEn ? "Syncing..." : "جاري المطابقة...") : isEn ? "Reconcile Now" : "مطابقة فورية"}
          </button>
        </div>
      </div>

      {/* Brandstack Main KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Gross Sales */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
          <p className="text-[11px] font-medium text-slate-400">{isEn ? "Gross Sales" : "إجمالي المبيعات"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-white sm:text-2xl">
            {metrics.grossSales.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ر.س</span>
          </p>
          <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">↑ +14.2%</span> {isEn ? "vs prev period" : "عن الفترة السابقة"}
          </p>
        </div>

        {/* Net Sales */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
          <p className="text-[11px] font-medium text-slate-400">{isEn ? "Net Sales (Excl. Returns)" : "صافي المبيعات"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-white sm:text-2xl">
            {metrics.netSales.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ر.س</span>
          </p>
          <p className="mt-2 text-[10px] text-slate-400 font-mono">
            {metrics.totalOrders} {isEn ? "orders" : "طلب مؤكد"}
          </p>
        </div>

        {/* AOV */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
          <p className="text-[11px] font-medium text-slate-400">{isEn ? "Avg Order Value (AOV)" : "متوسط قيمة الطلب (AOV)"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-white sm:text-2xl">
            {metrics.averageOrderValue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ر.س</span>
          </p>
          <p className="mt-2 text-[10px] text-emerald-400 font-semibold">
            {isEn ? "Strong Cart Size" : "سلة شرائية ممتازة"}
          </p>
        </div>

        {/* MER */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-400">{isEn ? "Marketing Eff. (MER)" : "كفاءة التسويق (MER)"}</p>
            <span className="rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-400">Revenue/Spend</span>
          </div>
          <p className="mt-1 text-xl font-bold font-mono text-amber-400 sm:text-2xl">
            {metrics.mer}x
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            {isEn ? "Target: >3.5x" : "المعدل المستهدف: > 3.5x"}
          </p>
        </div>

        {/* Blended CAC */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
          <p className="text-[11px] font-medium text-slate-400">{isEn ? "Blended CAC" : "كلفة اكتساب العميل (CAC)"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-white sm:text-2xl">
            {metrics.blendedCac} <span className="text-xs text-slate-400 font-normal">ر.س</span>
          </p>
          <p className="mt-2 text-[10px] text-emerald-400">
            {isEn ? "Meta + Google + TikTok" : "شامل الإعلانات المدمجة"}
          </p>
        </div>

        {/* True Net Profit & Margin */}
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 shadow-xl ring-1 ring-emerald-500/30">
          <p className="text-[11px] font-bold text-emerald-400">{isEn ? "True Net Profit" : "صافي الربح الحقيقي"}</p>
          <p className="mt-1 text-xl font-bold font-mono text-emerald-300 sm:text-2xl">
            +{metrics.trueNetProfit.toLocaleString()} <span className="text-xs text-emerald-400 font-normal">ر.س</span>
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{isEn ? "Net Margin" : "الهامش الصافي"}:</span>
            <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 font-bold font-mono text-emerald-300">
              {metrics.netMarginPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Deduction Waterfall & Profitability Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {isEn ? "Where Did Every Riyal Go? (Deductions Waterfall)" : "أين يذهب كل ريال من مبيعاتك؟ (تفكيك التكاليف الحقيقية)"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEn ? "Reconciling Gross Sales into True Net Profit after all hidden expenses" : "تحويل إجمالي المبيعات إلى صافي الربح الفعلي بعد استقطاع كل التكاليف المخفية"}
            </p>
          </div>
          <span className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-300">
            {isEn ? "Gross" : "الإجمالي"}: {metrics.grossSales.toLocaleString()} ر.س
          </span>
        </div>

        {/* Visual Deductions Strip */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* COGS */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <p className="text-xs text-slate-400">{isEn ? "1. Cost of Goods (COGS)" : "1. كلفة المنتجات (COGS)"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-rose-400">
              -{metrics.totalCogs.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{((metrics.totalCogs / (metrics.grossSales || 1)) * 100).toFixed(1)}% من المبيعات</p>
          </div>

          {/* Ad Spend */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <p className="text-xs text-slate-400">{isEn ? "2. Total Ad Spend" : "2. الإنفاق الإعلاني (Ads)"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-rose-400">
              -{metrics.totalAdSpend.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{((metrics.totalAdSpend / (metrics.grossSales || 1)) * 100).toFixed(1)}% من المبيعات</p>
          </div>

          {/* Shipping & Couriers */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <p className="text-xs text-slate-400">{isEn ? "3. Courier Shipping" : "3. الشحن والتوصيل"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-rose-400">
              -{metrics.totalShippingCosts.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{((metrics.totalShippingCosts / (metrics.grossSales || 1)) * 100).toFixed(1)}% من المبيعات</p>
          </div>

          {/* RTO / Returns */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <p className="text-xs text-slate-400">{isEn ? "4. RTO & Returns Loss" : "4. خسائر المرتجع (RTO)"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-rose-400">
              -{metrics.totalRefundsAndRto.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{((metrics.totalRefundsAndRto / (metrics.grossSales || 1)) * 100).toFixed(1)}% من المبيعات</p>
          </div>

          {/* Net Profit Cash In Pocket */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5">
            <p className="text-xs font-bold text-emerald-400">{isEn ? "5. True Net Profit" : "5. صافي الربح في الجيب"}</p>
            <p className="mt-1.5 text-lg font-bold font-mono text-emerald-300">
              +{metrics.trueNetProfit.toLocaleString()} ر.س
            </p>
            <p className="mt-1 text-[10px] text-emerald-400 font-bold">{metrics.netMarginPercentage}% صافي ربح فعلي</p>
          </div>
        </div>
      </div>

      {/* Recharts Graphical Trends */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {isEn ? "Sales vs Net Profit Daily Trend" : "حركة المبيعات وصافي الأرباح اليومية"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEn ? "Visualizing the gap between Gross Vanity and Net Reality" : "تتبع الفارق بين حجم المبيعات الظاهري وصافي الأرباح الفعلي"}
            </p>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area
                type="monotone"
                dataKey="gross"
                name={isEn ? "Gross Sales (SAR)" : "إجمالي المبيعات (ر.س)"}
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#grossGradient)"
              />
              <Area
                type="monotone"
                dataKey="trueProfit"
                name={isEn ? "True Net Profit (SAR)" : "صافي الربح الحقيقي (ر.س)"}
                stroke="#10b981"
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn ? "Unified Orders Reconciliation Log" : "سجل تسوية الطلبات الموحد (Live Audit)"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEn ? "SKU-level profitability calculation per transaction" : "احتساب هامش الربح الصافي لكل منتج وبوليصة في الوقت الفعلي"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 rtl:text-right">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase text-slate-400">
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
            <tbody className="divide-y divide-slate-800/70">
              {recentOrders.map((o) => {
                const isLoss = o.netProfit < 0;
                return (
                  <tr key={o.id} className={`hover:bg-slate-800/40 ${isLoss ? "bg-rose-950/20" : ""}`}>
                    <td className="px-4 py-3 font-mono font-bold text-white">{o.orderId}</td>
                    <td className="px-4 py-3">{o.channel}</td>
                    <td className="px-4 py-3 max-w-[220px] truncate" title={o.productTitle}>
                      <span className="font-semibold text-slate-200">{o.productTitle}</span>
                      <span className="block text-[10px] font-mono text-slate-500">{o.sku}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px]">
                      <span className={`font-semibold ${o.paymentMethod === "COD" ? "text-amber-400" : "text-emerald-400"}`}>
                        {o.paymentMethod}
                      </span>
                      <span className="block text-slate-400">{o.courierName} ({o.courierStatus})</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{o.grossSales} ر.س</td>
                    <td className="px-4 py-3 font-mono text-rose-400 text-[11px]">
                      -{(o.cogs + o.adSpendShare + o.shippingCost + (o.rtoLoss || 0)).toFixed(1)} ر.س
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      <span className={isLoss ? "text-rose-400" : "text-emerald-400"}>
                        {o.netProfit > 0 ? `+${o.netProfit}` : o.netProfit} ر.س
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          isLoss
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
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
