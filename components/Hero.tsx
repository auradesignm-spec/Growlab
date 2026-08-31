"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Coins,
  DollarSign,
  Users,
  Check,
  TrendingUp,
  Package,
  Play,
  Layers,
  BarChart3,
  Truck,
  CheckCircle2,
  Zap,
  MousePointerClick,
  RefreshCw,
  Plus,
} from "lucide-react";
import { enterHref, SIGN_IN_HREF } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";
import TourStartLink from "@/components/TourStartLink";

export default function Hero() {
  const t = useTranslations("marketing.hero");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [orderPulse, setOrderPulse] = useState(18.5);
  const [profitProgress, setProfitProgress] = useState(88);
  const [catalogItems, setCatalogItems] = useState([
    { id: 1, color: "bg-amber-400/90", active: true },
    { id: 2, color: "bg-amber-500/80", active: false },
    { id: 3, color: "bg-amber-600/90", active: true },
  ]);
  const [affiliateRate, setAffiliateRate] = useState(15);
  const [badgeTrigger, setBadgeTrigger] = useState(false);

  const [tasks, setTasks] = useState([
    { id: 1, text: isAr ? "مراجعة طلب صلالة COD (18.5 ر.ع)" : "Salalah COD order verified (18.5 OMR)", done: true },
    { id: 2, text: isAr ? "تسوية نقد مسقط مع شركة الشحن" : "Muscat cash courier handover confirmed", done: true },
    { id: 3, text: isAr ? "تفعيل عمولة المسوق لعطر اللبان" : "Frankincense creator link live (15%)", done: true },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
    setBadgeTrigger(true);
    setTimeout(() => setBadgeTrigger(false), 1200);
  };

  // Micro-interactions when clicking cards
  const handleCardClick = (cardIndex: number) => {
    setActiveCard(cardIndex);
    if (cardIndex === 1) {
      // Refresh order amount
      setOrderPulse((prev) => +(prev + 4.2).toFixed(1));
    } else if (cardIndex === 2) {
      // Toggle catalog item
      setCatalogItems((prev) =>
        prev.map((item, idx) => ({ ...item, active: idx === Math.floor(Math.random() * prev.length) }))
      );
    } else if (cardIndex === 3) {
      // Boost margin
      setProfitProgress((prev) => (prev >= 98 ? 72 : prev + 6));
    } else if (cardIndex === 4) {
      // Change affiliate tier
      setAffiliateRate((prev) => (prev === 15 ? 20 : prev === 20 ? 25 : 15));
    }
  };

  return (
    <section id="manifesto" className="relative overflow-x-clip scroll-mt-24 pb-14 pt-28 sm:pb-24 sm:pt-36">
      {/* Subtle Background Floating Dollar & Currency Elements */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden select-none" aria-hidden="true">
        {/* Floating Dollar Icon 1 - Top Left */}
        <div
          className="gl-hero-bg-dollar-1 absolute top-[14%] left-[5%] sm:left-[8%] flex items-center justify-center rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15 p-2.5 sm:p-3 text-emerald-600/50 shadow-sm backdrop-blur-[1px]"
          style={{ "--base-op": "0.45", animationDelay: "0s" } as React.CSSProperties}
        >
          <DollarSign className="size-4 sm:size-5" strokeWidth={2.4} />
        </div>

        {/* Floating Dollar Icon 2 - Top Right */}
        <div
          className="gl-hero-bg-dollar-2 absolute top-[16%] right-[6%] sm:right-[10%] flex items-center justify-center rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15 p-2 sm:p-2.5 text-emerald-600/45 shadow-sm backdrop-blur-[1px]"
          style={{ "--base-op": "0.4", animationDelay: "1.2s" } as React.CSSProperties}
        >
          <DollarSign className="size-3.5 sm:size-4" strokeWidth={2.2} />
        </div>

        {/* Floating Dollar Icon 3 - Mid Right behind visual */}
        <div
          className="gl-hero-bg-dollar-3 absolute top-[52%] right-[3%] sm:right-[5%] flex items-center justify-center rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/20 p-3 sm:p-3.5 text-emerald-600/50 shadow-sm backdrop-blur-[1px]"
          style={{ "--base-op": "0.45", animationDelay: "2.5s" } as React.CSSProperties}
        >
          <DollarSign className="size-5 sm:size-6" strokeWidth={2.4} />
        </div>

        {/* Floating Dollar Icon 4 - Bottom Left */}
        <div
          className="gl-hero-bg-dollar-1 absolute bottom-[12%] left-[6%] sm:left-[12%] flex items-center justify-center rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 p-2 text-emerald-600/35 shadow-sm"
          style={{ "--base-op": "0.35", animationDelay: "3.5s" } as React.CSSProperties}
        >
          <DollarSign className="size-3.5 sm:size-4" strokeWidth={2} />
        </div>

        {/* Floating Dollar Icon 5 - Center Top Subtle Drift */}
        <div
          className="gl-hero-bg-dollar-3 absolute top-[8%] left-[45%] sm:left-[48%] flex items-center justify-center rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 p-2 text-emerald-600/30 shadow-sm"
          style={{ "--base-op": "0.3", animationDelay: "0.8s" } as React.CSSProperties}
        >
          <DollarSign className="size-3 sm:size-3.5" strokeWidth={2} />
        </div>

        {/* Floating Dollar Icon 6 - Bottom Center-Right */}
        <div
          className="gl-hero-bg-dollar-2 absolute bottom-[8%] right-[16%] sm:right-[20%] flex items-center justify-center rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15 p-2.5 text-emerald-600/40 shadow-sm"
          style={{ "--base-op": "0.4", animationDelay: "4.2s" } as React.CSSProperties}
        >
          <DollarSign className="size-4 sm:size-4.5" strokeWidth={2.2} />
        </div>
      </div>

      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* RIGHT COLUMN IN RTL (Text & Actions) */}
          <div className="lg:col-span-6 flex flex-col items-start text-start">
            
            {/* Main Headline */}
            <h1 className="gl-hero-title text-start font-bold text-frost leading-tight">
              {isAr ? (
                <>
                  <span className="block text-emerald-600 mb-1">
                    <span className="gl-word">
                      <span className="gl-word-inner">أوقف نزيف الكاش الضائع..</span>
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-1.5 text-slate-900">
                    <span className="gl-word">
                      <span className="gl-word-inner">واعرف أرباحكـ الصافية بدقة تامة وضاعفها</span>
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-emerald-600 mb-1">
                    <span className="gl-word">
                      <span className="gl-word-inner">Stop The &apos;Lost Cash&apos; Leak..</span>
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-1.5 text-slate-900">
                    <span className="gl-word">
                      <span className="gl-word-inner">Know Your True Net Profits &amp; Multiply Them</span>
                    </span>
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle / Lede */}
            <p className="gl-enter-2 mt-4 max-w-xl text-[16.5px] sm:text-[18px] leading-relaxed text-slate-600">
              {isAr
                ? "منظومة Growlab الذكية تحول بيانات مبيعاتك المتناثرة إلى رؤية مالية واضحة، لترفع كفاءة تشغيلك وتضاعف صافي أرباحك."
                : "Growlab's intelligent system turns your scattered sales and delivery data into crystal-clear financial clarity, boosting operational efficiency and scaling your true net profits."}
            </p>

            {/* CTA Buttons in Theme Style */}
            <div className="gl-enter-3 mt-7 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TourStartLink
                href={enterHref("merchant")}
                guide="open-account"
                source="hero-merchant"
                className="gl-iridescent-secondary-btn group min-h-12 w-full sm:w-auto px-7 rounded-full inline-flex items-center justify-center gap-2 font-semibold text-frost text-[15px] !border-frost/25 !bg-white/95"
              >
                <span>{t("ctaMerchant")}</span>
                {isAr ? (
                  <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                )}
              </TourStartLink>

              <a
                href="/demo"
                className="gl-iridescent-secondary-btn group min-h-12 w-full sm:w-auto px-6 rounded-full inline-flex items-center justify-center gap-2.5 font-medium text-frost text-[15px]"
                onClick={() => track("Demo Clicked", { source: "hero-demo" })}
              >
                <Play className="size-3.5 fill-frost/80 text-frost/80 transition-transform duration-200 group-hover:scale-110" />
                <span>{isAr ? "ديمو تفاعلي فوري" : "Interactive Demo"}</span>
              </a>

              <a
                href="/onboarding/survey"
                className="gl-iridescent-secondary-btn group min-h-12 w-full sm:w-auto px-6 rounded-full inline-flex items-center justify-center gap-2 font-medium text-frost text-[14px]"
              >
                <Sparkles className="size-4 text-frost transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span>{isAr ? "فحص التسريبات المالية" : "AI Profit Leak Audit"}</span>
              </a>
            </div>

            {/* Trust Footer */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-frost-dim">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {isAr ? "بدون بطاقة ائتمان" : "No credit card required"}
              </span>
              <span className="text-frost-faint">•</span>
              <span>{isAr ? "إعداد فوري في 60 ثانية" : "Instant 60s setup"}</span>
              <span className="text-frost-faint">•</span>
              <a href={SIGN_IN_HREF} className="font-medium text-frost underline-offset-2 hover:underline">
                {t("signIn")}
              </a>
            </div>
          </div>

          {/* LEFT COLUMN IN RTL (Platform Showcase Device) */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center pt-2 sm:pt-0">
            
            {/* Main Showcase Container */}
            <div className="relative w-full max-w-[480px] rounded-[28px] border border-frost/15 bg-white/95 p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              
              {/* Window Header */}
              <div className="flex flex-col gap-2 border-b border-frost/10 pb-3.5 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-frost-dim">
                      Growlab Commerce • {isAr ? "لوحة التاجر" : "Merchant Hub"}
                    </div>
                    <h3 className="text-[17px] font-bold text-frost mt-0.5">
                      {isAr ? "أدوات متجرك وأرباحك" : "Merchant Toolkit"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11.5px] font-bold">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isAr ? "مباشر" : "Live"}</span>
                  </div>
                </div>

                {/* Financial KPI Tags */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px]">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>{isAr ? "تحصيل مؤكد: 10,000 ريال" : "Verified Cash: 10,000 OMR"}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[11px]">
                    <span>{isAr ? "فرق COD: 0 ريال" : "COD Discrepancy: 0 OMR"}</span>
                  </div>
                </div>
              </div>

              {/* 2x2 Feature Grid matching the sketch layout tailored strictly for Growlab */}
              <div className="grid grid-cols-2 gap-3.5">
                
                {/* 1. SKY BLUE CARD: الطلبات والتوصيل COD */}
                <div className="flex flex-col justify-between rounded-[20px] bg-[#e0f2fe]/90 border border-sky-200/60 p-3.5 text-center min-h-[142px]">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-200/80 text-sky-700 mb-1.5 shadow-2xs">
                      <Truck className="size-4 text-sky-700" />
                    </div>
                    <div className="text-[13px] font-bold text-slate-900">
                      {isAr ? "الطلبات والتوصيل" : "Orders & COD"}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      {isAr ? "متابعة الشحن والدفع عند الاستلام" : "Courier handover tracking"}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-center">
                    <div className="w-20 h-7 rounded-md bg-sky-200/70 p-1 flex items-center justify-between px-2">
                      <div className="h-1.5 w-8 rounded-full bg-sky-500/80" />
                      <span className="text-[9px] font-bold text-sky-800">18.5 ر.ع</span>
                    </div>
                  </div>
                </div>

                {/* 2. WARM SAND CARD: المتجر والمنتجات */}
                <div className="flex flex-col justify-between rounded-[20px] bg-[#fef3c7]/90 border border-amber-200/60 p-3.5 text-center min-h-[142px]">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-200/80 text-amber-800 mb-1.5 shadow-2xs">
                      <ShoppingBag className="size-4 text-amber-800" />
                    </div>
                    <div className="text-[13px] font-bold text-slate-900">
                      {isAr ? "المتجر والكتالوج" : "Store & Catalog"}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      {isAr ? "إدارة المنتجات والمخزون" : "Products & storefront"}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-center">
                    <div className="w-20 h-7 rounded-md bg-amber-200/70 p-1 grid grid-cols-3 gap-1 items-center px-1.5">
                      <div className="h-4 rounded-xs bg-amber-400/60" />
                      <div className="h-4 rounded-xs bg-amber-400/40" />
                      <div className="h-4 rounded-xs bg-amber-400/80" />
                    </div>
                  </div>
                </div>

                {/* 3. SOFT ROSE CARD: صافي الأرباح والتسوية */}
                <div className="flex flex-col justify-between rounded-[20px] bg-[#ffe4e6]/90 border border-rose-200/60 p-3.5 text-center min-h-[142px]">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-200/80 text-rose-700 mb-1.5 shadow-2xs">
                      <Coins className="size-4 text-rose-700" />
                    </div>
                    <div className="text-[13px] font-bold text-slate-900">
                      {isAr ? "صافي الأرباح" : "Net Margin"}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      {isAr ? "حساب هوامش الربح بدقة" : "Real profit calculation"}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-center">
                    <div className="w-20 h-7 rounded-md bg-rose-200/70 p-1 flex items-end justify-between px-2 pb-0.5">
                      <div className="w-2.5 h-2.5 rounded-t-xs bg-rose-400/50" />
                      <div className="w-2.5 h-4 rounded-t-xs bg-rose-400/70" />
                      <div className="w-2.5 h-5.5 rounded-t-xs bg-rose-500/90" />
                    </div>
                  </div>
                </div>

                {/* 4. SOFT MINT CARD: شبكة المسوقين والعمولات */}
                <div className="flex flex-col justify-between rounded-[20px] bg-[#dcfce7]/90 border border-emerald-200/60 p-3.5 text-center min-h-[142px]">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-200/80 text-emerald-800 mb-1.5 shadow-2xs">
                      <Users className="size-4 text-emerald-800" />
                    </div>
                    <div className="text-[13px] font-bold text-slate-900">
                      {isAr ? "شبكة المسوقين" : "Creator Network"}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      {isAr ? "روابط تتبع العمولات الذكية" : "Affiliate track links"}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-center">
                    <div className="w-20 h-7 rounded-md bg-emerald-200/70 p-1 flex items-center justify-center gap-1.5">
                      <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-bold text-white">
                        %
                      </div>
                      <div className="w-7 h-1.5 rounded-full bg-emerald-500/60" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Today's Tasks Widget (Matching reference image precisely) */}
              <div className="absolute -bottom-6 -left-3 sm:-bottom-8 sm:-left-6 z-30 w-[220px] sm:w-[245px] rounded-[22px] border border-slate-200/80 bg-white/95 p-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.10)] backdrop-blur-md">
                <div className="text-[13px] font-bold text-slate-900 mb-2.5 text-start">
                  {isAr ? "مهام اليوم" : "Today's Tasks"}
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center justify-between gap-2.5 cursor-pointer text-start transition-opacity hover:opacity-80 select-none"
                    >
                      <span
                        className={`text-[11.5px] leading-snug ${
                          task.done ? "line-through text-slate-600" : "text-slate-900 font-medium"
                        }`}
                      >
                        {task.text}
                      </span>
                      <div className="shrink-0 flex items-center justify-center">
                        <CheckCircle2
                          className={`size-4 transition-colors ${
                            task.done ? "text-slate-900" : "text-slate-300"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}


