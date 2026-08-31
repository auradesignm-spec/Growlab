"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Coins,
  Users,
  Check,
  TrendingUp,
  Package,
  Play,
  Layers,
  BarChart3,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { enterHref, SIGN_IN_HREF } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";
import TourStartLink from "@/components/TourStartLink";

export default function Hero() {
  const t = useTranslations("marketing.hero");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [tasks, setTasks] = useState([
    { id: 1, text: isAr ? "مراجعة طلب صلالة COD (18.5 ر.ع)" : "Salalah COD order verified (18.5 OMR)", done: true },
    { id: 2, text: isAr ? "تسوية نقد مسقط مع شركة الشحن" : "Muscat cash courier handover confirmed", done: true },
    { id: 3, text: isAr ? "تفعيل عمولة المسوق لعطر اللبان" : "Frankincense creator link live (15%)", done: true },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <section id="manifesto" className="relative overflow-x-clip scroll-mt-24 pb-14 pt-28 sm:pb-24 sm:pt-36">
      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* RIGHT COLUMN IN RTL (Text & Actions) */}
          <div className="lg:col-span-6 flex flex-col items-start text-start">
            
            {/* Main Headline */}
            <h1 className="gl-hero-title text-start font-semibold text-frost">
              {isAr ? (
                <>
                  <span className="block">
                    <span className="gl-word">
                      <span className="gl-word-inner">مبيعاتك</span>
                    </span>{" "}
                    <span className="gl-word">
                      <span className="gl-word-inner">وأرباحك</span>
                    </span>{" "}
                    <span className="gl-word">
                      <span className="gl-word-inner">كلها</span>
                    </span>{" "}
                    <span className="gl-word-cash">
                      <span className="gl-word">
                        <span className="gl-word-inner">في</span>
                      </span>
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-2">
                    <span className="gl-word">
                      <span className="gl-word-inner">مكان</span>
                    </span>{" "}
                    <span className="gl-word">
                      <span className="gl-word-inner">واحد.</span>
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="block">
                    <span className="gl-word">
                      <span className="gl-word-inner">Your</span>
                    </span>{" "}
                    <span className="gl-word">
                      <span className="gl-word-inner">Sales</span>
                    </span>{" "}
                    <span className="gl-word">
                      <span className="gl-word-inner">&amp;</span>
                    </span>{" "}
                    <span className="gl-word-cash">
                      <span className="gl-word">
                        <span className="gl-word-inner">Profits</span>
                      </span>
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-2">
                    <span className="gl-word">
                      <span className="gl-word-inner">All</span>
                    </span>{" "}
                    <span className="gl-word">
                      <span className="gl-word-inner">In</span>
                    </span>{" "}
                    <span className="gl-word">
                      <span className="gl-word-inner">One</span>
                    </span>{" "}
                    <span className="gl-word">
                      <span className="gl-word-inner">Place.</span>
                    </span>
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle / Lede */}
            <p className="gl-enter-2 mt-4 max-w-xl text-[16.5px] sm:text-[18px] leading-relaxed text-frost-dim">
              {isAr
                ? "Growlab يجمع متجرك الإلكتروني، ومسوقيك، ومطابقة تحصيلات الدفع عند الاستلام COD وصافي أرباحك الحقيقية في منصة واحدة. بالعربية، بلا إعلانات مهدرة، وعلى متصفحك فوراً."
                : "Growlab brings your storefront, creator affiliate network, COD courier cash reconciliation, and real net margins into one unified platform. In Arabic, without ad waste, instantly on your browser."}
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
              <div className="flex items-center justify-between border-b border-frost/10 pb-3.5 mb-4">
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


