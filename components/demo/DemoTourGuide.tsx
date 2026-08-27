"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export interface InteractiveTourStep {
  id: string;
  titleAr: string;
  titleEn: string;
  explanationAr: string;
  explanationEn: string;
  badgeAr: string;
  badgeEn: string;
  options: Array<{
    labelAr: string;
    labelEn: string;
    descAr: string;
    descEn: string;
    actionType: "navigate" | "role_switch" | "tab_switch" | "finish";
    targetUrl?: string;
    targetTab?: string;
    targetRole?: "merchant" | "buyer";
  }>;
}

const TOUR_BRANCHES: Record<string, InteractiveTourStep> = {
  welcome: {
    id: "welcome",
    titleAr: "مرحباً بك في جولة Growlab الذكية التفاعلية 🌟",
    titleEn: "Welcome to Growlab Interactive Tour 🌟",
    explanationAr: "أنت الآن في البيئة الافتراضية الشاملة لمنصة Growlab. ما هو هدفك الرئيسي اليوم لنقوم بتوجيهك إلى المسار الأنسب لطموحك؟",
    explanationEn: "You are now in the live interactive sandbox of Growlab. What is your primary objective today?",
    badgeAr: "بداية الجولة",
    badgeEn: "Start Tour",
    options: [
      {
        labelAr: "⚡ محاكي المبيعات اللحظية وإدخال المنتجات المباشر (جديد)",
        labelEn: "⚡ Live Sales & Product Stream Simulator (Interactive)",
        descAr: "جرّب بنفسك إضافة منتج ومحاكاة وصول طلبات حية من دول الخليج مع احتساب صافي الأرباح فوراً.",
        descEn: "Simulate adding products and watch real-time incoming orders with true net margin calculation.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=simulator",
      },
      {
        labelAr: "1️⃣ أنا تاجر / صاحب علامة تجارية وأريد زيادة مبيعاتي وأرباحي",
        labelEn: "1️⃣ I am a Merchant / Brand Owner wanting to scale profit",
        descAr: "استكشف مركز قيادة Brandstack AI، حماية الأرباح الصافية، وتتبع الحملات الإعلانية اللحظية.",
        descEn: "Explore Brandstack AI command center, true net profit tracking, and Meta ads optimization.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=simulator",
      },
      {
        labelAr: "2️⃣ أريد بناء متجر إلكتروني ذكي لمنتجاتي وتخصيصه بالبلوكات",
        labelEn: "2️⃣ I want to build a smart e-commerce storefront with blocks",
        descAr: "شاهد كيف يبني نظام الذكاء الاصطناعي متجراً متكاملاً من جملة واحدة وصور المنتجات.",
        descEn: "See how our engine generates a full storefront from a single sentence.",
        actionType: "navigate",
        targetUrl: "/dashboard/store/edit?fresh=1",
      },
      {
        labelAr: "3️⃣ أريد تجربة الشراء كزبون والدفع عند الاستلام (COD) وتجربة التوصيل",
        labelEn: "3️⃣ I want to experience buying as a Customer via COD",
        descAr: "شاهد كيف تبدو صفحة الطلب السريعة بدون تعقيد، وتتبع الشحنة وعرض الكاش باك بعد الشراء.",
        descEn: "Experience the frictionless COD checkout and post-purchase sharing rewards.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
      {
        labelAr: "4️⃣ أريد استكشاف كيف يربح المسوّقون وصنّاع المحتوى من ترويج المنتجات",
        labelEn: "4️⃣ Explore Creator / Marketer affiliate monetization",
        descAr: "تصفح كتالوج العينات المجانية، توليد روابط الإسناد، ومتابعة العمولات المؤكدة بعد التحصيل.",
        descEn: "Browse free sample catalog, generate attribution links, and track paid commissions.",
        actionType: "navigate",
        targetUrl: "/dashboard/browse",
      },
    ],
  },

  brandstack_tour: {
    id: "brandstack_tour",
    titleAr: "مركز قيادة الأرباح الصافية — Brandstack AI Hub ⚡",
    titleEn: "True Net Margin Hub — Brandstack AI ⚡",
    explanationAr: "هنا يرى التاجر صافي أرباحه الحقيقية بعد خصم تكلفة البضاعة (COGS)، مصاريف إعلانات Meta و Google، ورسوم الشحن المرتجع (RTO). كيف تفضل استكمال جولتك؟",
    explanationEn: "Here merchants see true net bank-collected profits after COGS, ad spend, and RTO losses. Where to next?",
    badgeAr: "محرك الربحية",
    badgeEn: "Profit Engine",
    options: [
      {
        labelAr: "💬 التحدث مع المستشار المالي والتشغيلي الذكي (AI Copilot)",
        labelEn: "💬 Chat with Financial AI Copilot",
        descAr: "اسأله عن حملاتك الإعلانية، أو كيفية خفض المرتجعات في المدن المختلفة.",
        descEn: "Ask real-time questions about ad campaigns or RTO reduction.",
        actionType: "tab_switch",
        targetTab: "ai",
      },
      {
        labelAr: "🛑 فحص توصيات إعلانات ميتا (Scale vs Cut)",
        labelEn: "🛑 Inspect Meta Ads Guard (Scale vs Cut)",
        descAr: "اكتشف كيف تمنع المنصة هدر الميزانية وتوجه الصرف للحملات الرابحة فقط.",
        descEn: "See automated decisions preventing budget waste on low-ROAS campaigns.",
        actionType: "tab_switch",
        targetTab: "ads",
      },
      {
        labelAr: "📦 فحص تنبيهات المخزون التلقائية (Out of Stock / Dead Stock)",
        labelEn: "📦 Review Automated Inventory Health Alerts",
        descAr: "شاهد المنتجات التي توشك على النفاد والمنتجات الراكدة مع التوصيات الفورية.",
        descEn: "Inspect velocity alerts and dead-stock clearance suggestions.",
        actionType: "tab_switch",
        targetTab: "inventory",
      },
      {
        labelAr: "🛍️ الانتقال لمعاينة متجر التاجر كعميل متسوق",
        labelEn: "🛍️ View the Live Storefront as a Buyer",
        descAr: "شاهد كيف تبدو المنتجات للعملاء في واجهة المتجر السريعة والمحسنة للهاتف.",
        descEn: "Experience the customer-facing mobile-optimized shopping storefront.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
    ],
  },

  store_builder_tour: {
    id: "store_builder_tour",
    titleAr: "محرر المتجر الذكي — بناء الواجهة بالبلوكات 🎨",
    titleEn: "Smart Store Builder & Block Editor 🎨",
    explanationAr: "يقوم هذا المحرر بإنشاء متجر كامل متوافق مع الهواتف دون الحاجة لأي كتابة كود. يمكنك تعديل البلوكات، العناوين، وإطلاق الحملة فوراً.",
    explanationEn: "Build high-converting storefronts with visual blocks. What would you like to explore next?",
    badgeAr: "محرر المتاجر",
    badgeEn: "Store Builder",
    options: [
      {
        labelAr: "📊 الانتقال إلى لوحة قيادة التاجر الرئيسية",
        labelEn: "📊 Go to Merchant Financial Dashboard",
        descAr: "شاهد تفاصيل الطلبات، أداء المبيعات، ومحفظة الضمان المالي.",
        descEn: "View order management, financial escrow, and sales metrics.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=command",
      },
      {
        labelAr: "🛒 تجربة طلب منتج كعميل وتجربة الشراء بالدفع عند الاستلام",
        labelEn: "🛒 Make a Test COD Order as a Buyer",
        descAr: "قم بوضع طلب تجريبي ولاحظ سرعة تسجيل الطلب وإشعاره في لوحة التاجر.",
        descEn: "Place a simulated order and watch it reflect live in the portal.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
    ],
  },

  storefront_buyer_tour: {
    id: "storefront_buyer_tour",
    titleAr: "واجهة متجر المشتري — تسوق سلس بالدفع عند الاستلام 🛍️",
    titleEn: "Buyer Storefront — Frictionless COD Checkout 🛍️",
    explanationAr: "هذه هي الصفحة التي يراها زبائنك عند الضغط على إعلاناتك. تطلب فقط الاسم، الهاتف، والعنوان دون تعقيد بطاقات الائتمان.",
    explanationEn: "This is what customers see from your ads. Fast one-click COD checkout with zero friction.",
    badgeAr: "تجربة المشتري",
    badgeEn: "Buyer Experience",
    options: [
      {
        labelAr: "⚡ العودة لمركز قيادة التاجر ورؤية انعكاس المبيعات",
        labelEn: "⚡ Return to Merchant Command Center",
        descAr: "شاهد كيف تم تحديث صافي الأرباح والإحصائيات اللحظية.",
        descEn: "See your metrics and net profits update in real-time.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=brandstack",
      },
      {
        labelAr: "📱 استكشاف بوابة المسوّقين وصناع المحتوى",
        labelEn: "📱 Explore Creator & Marketer Portal",
        descAr: "شاهد كيف يشارك صناع المحتوى روابط المنتجات لجلب مبيعات إضافية.",
        descEn: "See how creators earn by promoting products.",
        actionType: "navigate",
        targetUrl: "/dashboard/browse",
      },
    ],
  },
};

export default function DemoTourGuide({ locale = "ar" }: { locale?: string }) {
  const isAr = locale !== "en";
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<string>("welcome");

  // Dynamically detect context to offer smart adaptive advice
  useEffect(() => {
    if (pathname.includes("/store/edit")) {
      setCurrentStepId("store_builder_tour");
    } else if (pathname.startsWith("/m/")) {
      setCurrentStepId("storefront_buyer_tour");
    } else if (pathname.includes("/dashboard") && !pathname.includes("/browse")) {
      setCurrentStepId("brandstack_tour");
    }
  }, [pathname]);

  const step = TOUR_BRANCHES[currentStepId] || TOUR_BRANCHES.welcome;

  const handleSelectOption = (opt: InteractiveTourStep["options"][0]) => {
    if (opt.actionType === "navigate" && opt.targetUrl) {
      router.push(opt.targetUrl);
    } else if (opt.actionType === "tab_switch") {
      // Broadcast event for tab switching or trigger hash
      if (typeof window !== "undefined") {
        window.location.hash = `#${opt.targetTab}`;
        const tabBtn = document.querySelector(`button[data-tour-tab="${opt.targetTab}"]`) as HTMLButtonElement;
        if (tabBtn) tabBtn.click();
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 end-5 z-50 flex items-center gap-2 rounded-full bg-[#111318] px-4 py-2.5 text-xs font-semibold text-white shadow-2xl transition-all hover:scale-105 border border-white/20 active:scale-95"
      >
        <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
        <span>{isAr ? "🧭 المساعد الذكي للجولة" : "🧭 Smart Tour Guide"}</span>
      </button>
    );
  }

  return (
    <aside
      role="complementary"
      aria-label={isAr ? "المرشد التفاعلي للجولة الافتراضية" : "Interactive Demo Tour Guide"}
      className={`fixed bottom-4 end-4 z-50 w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl border border-line bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 ${
        isMinimized ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            {isAr ? step.badgeAr : step.badgeEn}
          </span>
          <span className="text-xs font-semibold text-frost">
            {isAr ? "المرشد التفاعلي للجولة" : "Interactive Tour Guide"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex size-6 items-center justify-center rounded-lg text-frost-dim hover:bg-slate-100 text-xs font-bold"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? "▲" : "▼"}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="flex size-6 items-center justify-center rounded-lg text-frost-dim hover:bg-slate-100 text-xs"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="mt-4 space-y-4">
          <div>
            <h2 className="text-[15px] font-bold text-frost leading-snug">
              {isAr ? step.titleAr : step.titleEn}
            </h2>
            <p className="mt-1.5 text-[13px] text-frost-dim leading-relaxed">
              {isAr ? step.explanationAr : step.explanationEn}
            </p>
          </div>

          {/* Interactive branching choices */}
          <div className="space-y-2 pt-1 max-h-[320px] overflow-y-auto pe-1 scrollbar-thin">
            <p className="text-[11px] font-bold uppercase tracking-wider text-frost-faint">
              {isAr ? "اختر مسارك التالي:" : "Choose your next path:"}
            </p>
            {step.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="group w-full rounded-2xl border border-line bg-[#fbfcfd] p-3 text-start transition-all hover:border-emerald-500/40 hover:bg-white hover:shadow-md active:scale-[0.99]"
              >
                <p className="text-[13px] font-bold text-frost group-hover:text-emerald-700 transition-colors">
                  {isAr ? opt.labelAr : opt.labelEn}
                </p>
                <p className="mt-0.5 text-[11px] text-frost-dim leading-normal">
                  {isAr ? opt.descAr : opt.descEn}
                </p>
              </button>
            ))}
          </div>

          {/* Quick jump back to welcome index */}
          {currentStepId !== "welcome" && (
            <div className="pt-2 border-t border-line flex justify-between items-center text-[12px]">
              <button
                onClick={() => setCurrentStepId("welcome")}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                ← {isAr ? "الرجوع للخيارات الرئيسية للجولة" : "Back to Main Tour Options"}
              </button>
              <Link href="/demo" className="text-frost-dim hover:underline">
                {isAr ? "إعادة تعيين الديمو" : "Reset Demo"}
              </Link>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
