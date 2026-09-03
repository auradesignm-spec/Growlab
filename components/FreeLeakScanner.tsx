"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  RefreshCw,
  Zap,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";
import { enterHref } from "@/lib/auth/paths";

export default function FreeLeakScanner() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Merchant inputs
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(4500); // 4,500 OMR / 45,000 SAR
  const [adSpend, setAdSpend] = useState<number>(1200); // 1,200 OMR
  const [cogsPercent, setCogsPercent] = useState<number>(32); // 32%
  const [rtoPercent, setRtoPercent] = useState<number>(18); // 18% return rate
  const [codSharePercent, setCodSharePercent] = useState<number>(65); // 65% Cash on Delivery
  const [selectedCurrency, setSelectedCurrency] = useState<"OMR" | "SAR" | "AED">("OMR");

  const currencySymbol = isAr
    ? selectedCurrency === "OMR"
      ? "ر.ع."
      : selectedCurrency === "SAR"
      ? "ر.س."
      : "د.إ."
    : selectedCurrency;

  // Real-time calculation of silent leaks and true profit
  const calculations = useMemo(() => {
    const revenue = Math.max(0, monthlyRevenue);
    const ads = Math.max(0, adSpend);
    const cogs = (revenue * cogsPercent) / 100;
    
    // Average orders estimation (avg basket ~25 OMR / 250 SAR)
    const avgBasket = selectedCurrency === "OMR" ? 22 : 220;
    const estimatedOrders = Math.max(1, Math.round(revenue / avgBasket));
    
    // Shipping base fees (~2 OMR / 22 SAR per delivery)
    const shippingUnitFee = selectedCurrency === "OMR" ? 2 : 22;
    const totalShippingSpent = estimatedOrders * shippingUnitFee;

    // 1. COD & Courier Remittance Slippage (Avg 4-7% of COD revenue is delayed, unremitted, or misbilled)
    const codRevenue = (revenue * codSharePercent) / 100;
    const codSlippageLeak = Math.round(codRevenue * 0.048);

    // 2. RTO (Return to Origin) Dead Waste (Courier charges round-trip + repackaging on returned items)
    const returnedOrders = Math.round((estimatedOrders * rtoPercent) / 100);
    const rtoCourierPenalty = returnedOrders * (shippingUnitFee * 1.5);
    const rtoPackagingLoss = returnedOrders * (selectedCurrency === "OMR" ? 0.8 : 8);
    const rtoDeadWasteLeak = Math.round(rtoCourierPenalty + rtoPackagingLoss);

    // 3. Bleeding Ad Spend (Spend on sub-optimal ads with ROAS below break-even, typically 15-25% of total budget)
    const bleedingAdsLeak = Math.round(ads * 0.22);

    // Total Detected Leaks
    const totalMonthlyLeak = codSlippageLeak + rtoDeadWasteLeak + bleedingAdsLeak;

    // Apparent Gross Profit (What ad dashboards and Shopify say)
    const apparentGrossProfit = revenue - cogs - ads;
    
    // True Net Profit in Pocket (Reality after all hidden friction)
    const trueNetProfit = revenue - cogs - ads - totalShippingSpent - (rtoDeadWasteLeak * 0.6) - codSlippageLeak;
    const trueNetMarginPercent = revenue > 0 ? ((trueNetProfit / revenue) * 100).toFixed(1) : "0";
    const apparentMarginPercent = revenue > 0 ? ((apparentGrossProfit / revenue) * 100).toFixed(1) : "0";

    // Recoverable with Growlab audit (approx 70-85% of total leak)
    const recoverablePotential = Math.round(totalMonthlyLeak * 0.78);

    return {
      revenue,
      cogs,
      ads,
      estimatedOrders,
      totalShippingSpent,
      codSlippageLeak,
      rtoDeadWasteLeak,
      bleedingAdsLeak,
      totalMonthlyLeak,
      apparentGrossProfit,
      trueNetProfit,
      trueNetMarginPercent,
      apparentMarginPercent,
      recoverablePotential,
    };
  }, [monthlyRevenue, adSpend, cogsPercent, rtoPercent, codSharePercent, selectedCurrency]);

  return (
    <div id="leak-scanner" className="w-full max-w-wrap mx-auto">
      <Reveal>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400 mb-3">
            <Zap className="h-3.5 w-3.5" />
            <span>{isAr ? "ماسح تسريبات الأرباح الفوري (مجاني)" : "Instant Free Profit Leak Scanner"}</span>
          </div>
          <h2 className="gl-heading text-display-md sm:text-display-lg max-w-3xl text-balance">
            {isAr
              ? "كم ريالاً يتسرّب بصمت من متجرك الإلكتروني شهرياً؟"
              : "How much profit is silently leaking from your e-commerce store?"}
          </h2>
          <p className="gl-lede mt-3 max-w-2xl text-balance">
            {isAr
              ? "حرّك المؤشرات التقديرية لمتجرك واكتشف الفارق الصادم بين أرباح لوحات الإعلانات الوهمية وصافي الربح الحقيقي في جيبك."
              : "Adjust your store parameters to expose the gap between Shopify vanity revenue and cash in your bank."}
          </p>
        </div>
      </Reveal>

      <StageGlow tone="dusk" className="w-full">
        <div className="gl-stage p-4 sm:p-7 rounded-3xl border border-line bg-surface/90 backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Interactive Inputs (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <span className="text-xs font-bold uppercase tracking-wider text-frost-dim">
                  {isAr ? "1. أدخل أرقام متجرك التقديرية" : "1. Your Store Estimates"}
                </span>
                {/* Currency selector */}
                <div className="flex items-center rounded-lg border border-line bg-surface-raised p-0.5 text-xs font-mono">
                  {(["OMR", "SAR", "AED"] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        setSelectedCurrency(curr);
                        if (curr === "OMR" && monthlyRevenue > 20000) {
                          setMonthlyRevenue(4500);
                          setAdSpend(1200);
                        } else if (curr !== "OMR" && monthlyRevenue < 10000) {
                          setMonthlyRevenue(45000);
                          setAdSpend(12000);
                        }
                      }}
                      className={`px-2 py-1 rounded transition ${
                        selectedCurrency === curr
                          ? "bg-signal text-white font-bold"
                          : "text-frost-dim hover:text-frost"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 1: Monthly Sales */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-frost font-medium">
                    {isAr ? "إجمالي المبيعات الشهرية" : "Monthly Gross Sales"}
                  </label>
                  <span className="font-mono font-bold text-signal">
                    {monthlyRevenue.toLocaleString()} {currencySymbol}
                  </span>
                </div>
                <input
                  type="range"
                  min={selectedCurrency === "OMR" ? 500 : 5000}
                  max={selectedCurrency === "OMR" ? 30000 : 300000}
                  step={selectedCurrency === "OMR" ? 250 : 2500}
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full accent-signal cursor-pointer"
                />
              </div>

              {/* Slider 2: Monthly Ad Spend */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-frost font-medium">
                    {isAr ? "الإنفاق الإعلاني الشهري (Meta/Snap/TikTok)" : "Monthly Ad Spend"}
                  </label>
                  <span className="font-mono font-bold text-amber-400">
                    {adSpend.toLocaleString()} {currencySymbol}
                  </span>
                </div>
                <input
                  type="range"
                  min={selectedCurrency === "OMR" ? 100 : 1000}
                  max={selectedCurrency === "OMR" ? 10000 : 100000}
                  step={selectedCurrency === "OMR" ? 100 : 1000}
                  value={adSpend}
                  onChange={(e) => setAdSpend(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Slider 3: COGS % */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-frost font-medium">
                    {isAr ? "متوسط كلفة شراء المنتجات (COGS %)" : "Cost of Goods Sold (COGS %)"}
                  </label>
                  <span className="font-mono font-bold text-frost">
                    {cogsPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={1}
                  value={cogsPercent}
                  onChange={(e) => setCogsPercent(Number(e.target.value))}
                  className="w-full accent-frost cursor-pointer"
                />
              </div>

              {/* Slider 4: Return Rate % */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-frost font-medium">
                    {isAr ? "نسبة المرتجع وعدم الاستلام (RTO %)" : "Return Rate (RTO %)"}
                  </label>
                  <span className="font-mono font-bold text-rose-400">
                    {rtoPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  step={1}
                  value={rtoPercent}
                  onChange={(e) => setRtoPercent(Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              {/* Slider 5: COD Share % */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-frost font-medium">
                    {isAr ? "نسبة الدفع عند الاستلام (COD %)" : "Cash on Delivery Share (COD %)"}
                  </label>
                  <span className="font-mono font-bold text-sky-400">
                    {codSharePercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={codSharePercent}
                  onChange={(e) => setCodSharePercent(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Right/Output Analysis (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="pb-3 border-b border-line flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-frost-dim">
                  {isAr ? "2. كشف التسريبات وصافي الربح في الجيب" : "2. Leak Audit & True Cash"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-400">
                  <ShieldAlert className="h-3 w-3" />
                  {isAr ? "تسريبات صامتة مرصودة" : "Silent Leaks Detected"}
                </span>
              </div>

              {/* Big Impact Leak Banner */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-rose-300">
                      {isAr ? "إجمالي الأرباح المتسربة شهرياً" : "Estimated Monthly Leaking Profit"}
                    </p>
                    <p className="mt-1 text-3xl sm:text-4xl font-extrabold font-mono text-rose-400 tracking-tight">
                      -{calculations.totalMonthlyLeak.toLocaleString()}{" "}
                      <span className="text-lg font-normal text-rose-300/80">{currencySymbol}</span>
                    </p>
                    <p className="mt-1 text-xs text-rose-300/70">
                      {isAr
                        ? `ما يعادل ${(
                            (calculations.totalMonthlyLeak / (calculations.revenue || 1)) *
                            100
                          ).toFixed(1)}% من إجمالي مبيعاتك تضيع دون أن تشعر!`
                        : `Equivalent to ${(
                            (calculations.totalMonthlyLeak / (calculations.revenue || 1)) *
                            100
                          ).toFixed(1)}% of your gross turnover lost!`}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-right rtl:text-left">
                    <p className="text-[11px] font-semibold text-emerald-400">
                      {isAr ? "قابلة للحماية فوراً" : "Recoverable with Riyada Assistant"}
                    </p>
                    <p className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
                      +{calculations.recoverablePotential.toLocaleString()} {currencySymbol}
                    </p>
                    <p className="text-[10px] text-emerald-400/80 mt-0.5">
                      {isAr ? "عبر المطابقة وضبط الحملات" : "Via COD reconciliation & smart limits"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Main Leak Culprits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. COD Slippage */}
                <div className="rounded-xl border border-line bg-surface-raised p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-frost-dim mb-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <span className="font-medium">{isAr ? "فروقات تسوية COD" : "COD Discrepancies"}</span>
                  </div>
                  <p className="text-lg font-bold font-mono text-amber-400">
                    -{calculations.codSlippageLeak.toLocaleString()} {currencySymbol}
                  </p>
                  <p className="text-[10px] text-frost-faint mt-1">
                    {isAr ? "تأخير وفروقات كشوفات شركات الشحن" : "Delayed or under-remitted courier cash"}
                  </p>
                </div>

                {/* 2. Dead RTO Returns */}
                <div className="rounded-xl border border-line bg-surface-raised p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-frost-dim mb-1">
                    <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                    <span className="font-medium">{isAr ? "استنزاف المرتجعات" : "Return Waste (RTO)"}</span>
                  </div>
                  <p className="text-lg font-bold font-mono text-rose-400">
                    -{calculations.rtoDeadWasteLeak.toLocaleString()} {currencySymbol}
                  </p>
                  <p className="text-[10px] text-frost-faint mt-1">
                    {isAr ? "كلفة شحن وتغليف الطلبات المرفوضة" : "Two-way courier fees & packing waste"}
                  </p>
                </div>

                {/* 3. Bleeding Ads */}
                <div className="rounded-xl border border-line bg-surface-raised p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-frost-dim mb-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                    <span className="font-medium">{isAr ? "إعلانات خاسرة" : "Bleeding Ad Spend"}</span>
                  </div>
                  <p className="text-lg font-bold font-mono text-indigo-400">
                    -{calculations.bleedingAdsLeak.toLocaleString()} {currencySymbol}
                  </p>
                  <p className="text-[10px] text-frost-faint mt-1">
                    {isAr ? "حملات تصرف دون تحقيق هامش ربح" : "Campaigns running below break-even ROAS"}
                  </p>
                </div>
              </div>

              {/* Vanity vs Reality Profit Comparison */}
              <div className="rounded-2xl border border-line bg-surface-raised p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-1/2 pr-0 sm:pr-4 border-b sm:border-b-0 sm:border-r border-line pb-3 sm:pb-0 rtl:sm:border-r-0 rtl:sm:border-l rtl:sm:pl-4">
                  <p className="text-[11px] text-frost-dim">{isAr ? "الربح الظاهري (في المنصات)" : "Vanity Dashboard Profit"}</p>
                  <p className="text-xl font-bold font-mono text-frost-dim mt-0.5 line-through opacity-70">
                    {calculations.apparentGrossProfit.toLocaleString()} {currencySymbol}
                  </p>
                  <p className="text-[10px] text-frost-faint">{isAr ? `هامش ${calculations.apparentMarginPercent}% قبل الخصومات المخفية` : `Before hidden costs (${calculations.apparentMarginPercent}%)`}</p>
                </div>

                <div className="w-full sm:w-1/2 pl-0 sm:pl-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-emerald-400">{isAr ? "صافي الربح الفعلي في جيبك" : "True Net Cash in Pocket"}</p>
                    <span className="rounded bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 text-[10px] font-mono">
                      {calculations.trueNetMarginPercent}% {isAr ? "هامش حقيقي" : "Net Margin"}
                    </span>
                  </div>
                  <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                    {calculations.trueNetProfit > 0 ? `+${calculations.trueNetProfit.toLocaleString()}` : calculations.trueNetProfit.toLocaleString()} {currencySymbol}
                  </p>
                </div>
              </div>

              {/* Call to Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-frost-dim">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>
                      {isAr
                        ? "تحقق من كشوفات الشحن وحملاتك خلال 60 ثانية بدون رسوم مسبقة"
                        : "Audit your courier statements & ad accounts in 60s with zero upfront fees"}
                    </span>
                  </p>
                </div>
                
                <Link
                  href={enterHref("merchant")}
                  className="gl-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold !py-2.5 !px-5 whitespace-nowrap"
                >
                  <span>{isAr ? "ابدأ التدقيق المجاني لمتجرك" : "Audit My Store For Free"}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </StageGlow>
    </div>
  );
}
