"use client";

import { useState } from "react";
import { CompanyAccount, Order, Campaign } from "./types";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  CheckCircle2,
  Download,
  CreditCard,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Percent,
} from "lucide-react";

interface RevenueAnalyticsProps {
  company: CompanyAccount;
  orders: Order[];
  campaigns: Campaign[];
}

export default function RevenueAnalytics({
  company,
  orders,
  campaigns,
}: RevenueAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("month");

  const totalSales = orders.reduce((acc, o) => (o.status !== "cancelled" ? acc + o.totalAmount : acc), 0);
  const totalOrdersCount = orders.filter((o) => o.status !== "cancelled").length;
  const avgOrderValue = totalOrdersCount > 0 ? (totalSales / totalOrdersCount).toFixed(1) : "0";

  const totalAdSpend = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalAdRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const roas = totalAdSpend > 0 ? (totalAdRevenue / totalAdSpend).toFixed(2) : "4.8";

  // Growlab monetization calculations
  const platformCommissionRate = company.commissionRate; // e.g. 5%
  const growlabCommissionEarned = (totalSales * (platformCommissionRate / 100)).toFixed(2);
  const netCompanyProfit = (totalSales - totalAdSpend - Number(growlabCommissionEarned)).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black text-ink">
            الأرباح والتحليلات المالية ونموذج الشراكة
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            شفافية كاملة في احتساب المبيعات، الصرف الإعلاني، وعائد الاستثمار مع تفاصيل عمولة Growlab.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["week", "month", "all"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                selectedPeriod === period
                  ? "bg-ink text-onDark shadow-xs"
                  : "bg-paper text-muted hover:bg-paper-alt"
              }`}
            >
              {period === "week" ? "آخر 7 أيام" : period === "month" ? "هذا الشهر" : "كافة الفترات"}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <span className="block font-mono text-xs text-muted mb-1">إجمالي مبيعات المتجر</span>
          <span className="font-mono text-3xl font-black text-ink">${totalSales.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-[11px] text-teal font-mono mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>+28.4% نمو عن الشهر السابق</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <span className="block font-mono text-xs text-muted mb-1">متوسط قيمة السلة (AOV)</span>
          <span className="font-mono text-3xl font-black text-ink">${avgOrderValue}</span>
          <span className="block font-mono text-[11px] text-muted mt-1">بفضل عروض الوكيل الذكي</span>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <span className="block font-mono text-xs text-muted mb-1">عائد الإعلانات (ROAS)</span>
          <span className="font-mono text-3xl font-black text-gold">{roas}x</span>
          <span className="block font-mono text-[11px] text-teal font-mono mt-1">أعلى من متوسط السوق</span>
        </div>

        <div className="rounded-2xl border border-teal/40 bg-teal/5 p-5 shadow-xs">
          <span className="block font-mono text-xs text-teal mb-1">صافي أرباح المتجر التقديرية</span>
          <span className="font-mono text-3xl font-black text-teal">${netCompanyProfit}</span>
          <span className="block font-mono text-[11px] text-muted mt-1">بعد خصم الإعلانات والعمولة</span>
        </div>
      </div>

      {/* Partnership Model & Billing Breakdown Box */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-line bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-gold" />
              <h3 className="font-display text-lg font-bold text-ink">
                تفاصيل اشتراك وخطة {company.name}
              </h3>
            </div>
            <span className="rounded-full bg-gold/15 px-3 py-1 font-mono text-xs font-bold text-[#AD7A2A]">
              باقة الشريك الذكي (Partner Plan)
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            تعتمد منصة Growlab على نموذج تقاسم النجاح (Revenue Share & SaaS): لا نربح إلا عندما تحقق مبيعات فعلية مغلقة عبر وكيل الذكاء الاصطناعي وإعلانات ميتا.
          </p>

          <div className="space-y-3 rounded-xl bg-paper p-4 text-xs font-mono border border-line">
            <div className="flex justify-between">
              <span className="text-muted">الاشتراك الأساسي (استضافة الوكيل وربط واتساب):</span>
              <span className="font-bold text-ink">$49 / شهرياً</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">نسبة الأداء على المبيعات المغلقة ({platformCommissionRate}%):</span>
              <span className="font-bold text-teal">${growlabCommissionEarned}</span>
            </div>
            <div className="flex justify-between border-t border-line/80 pt-2 text-sm">
              <span className="text-ink font-bold">إجمالي مستحقات الشراكة الحالية:</span>
              <span className="font-bold text-ink">${(49 + Number(growlabCommissionEarned)).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-onDark hover:bg-ink-2 transition-all">
              <Download className="h-4 w-4" />
              <span>تحميل كشف الفواتير والعمولات (PDF)</span>
            </button>
          </div>
        </div>

        {/* Growth Tips & Forecast */}
        <div className="lg:col-span-5 rounded-2xl border border-gold/40 bg-ink p-6 text-onDark shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-gold-soft font-mono text-xs">
            <Zap className="h-4 w-4 text-gold" />
            <span>توصيات الذكاء الاصطناعي لمضاعفة الأرباح:</span>
          </div>

          <h4 className="font-display text-base font-bold text-onDark">
            فرصة لزيادة المبيعات بنسبة +35% خلال الأسبوعين القادمين
          </h4>

          <div className="space-y-2.5 text-xs text-onDarkSoft leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-teal">✓</span>
              <span>رفع ميزانية حملة ريلز «عطر ميسان» بمقدار $10 يومياً بسبب ارتفاع الـ ROAS لـ 4.8x.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-teal">✓</span>
              <span>إضافة كود خصم للبخور «باقة قطعتين» لتحفيز متوسط السلة.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-teal">✓</span>
              <span>تفعيل إعادة استهداف العملاء المترددين على واتساب بعد 48 ساعة.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
