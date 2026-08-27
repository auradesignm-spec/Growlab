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
    explanationAr:
      "أنت الآن في البيئة الاستكشافية الشاملة لمنصة Growlab. نوجهك خطوة بخطوة ونوضح لك أين تضغط لتجربة كافة إمكانيات المنصة حتى آخر نقطة:",
    explanationEn:
      "You are now in the live interactive sandbox of Growlab. We guide you step-by-step on where to click to test every single feature:",
    badgeAr: "بداية الجولة",
    badgeEn: "Start Tour",
    options: [
      {
        labelAr: "⚡ 1. محاكي المبيعات اللحظية واحتساب صافي الربح الحقيقي",
        labelEn: "⚡ 1. Live Sales Stream & True Net Profit Simulator",
        descAr: "اضغط هنا لتجربة إدخال طلبات حية ومحاكاة التحصيل بعد خصم الإعلانات وتكلفة البضاعة.",
        descEn: "Click here to simulate live orders and see real profit calculation after ads and COGS.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=simulator",
      },
      {
        labelAr: "🎨 2. محرر المتجر الذكي — بناء الواجهة بالبلوكات المرئية",
        labelEn: "🎨 2. Smart Visual Storefront Block Builder",
        descAr: "اضغط هنا لتجربة تخصيص واجهة متجرك بالبلوكات وصور المنتجات بلمسة واحدة.",
        descEn: "Click here to test visual block customization and instant AI storefront generation.",
        actionType: "navigate",
        targetUrl: "/dashboard/store/edit?fresh=1",
      },
      {
        labelAr: "🛍️ 3. تجربة الشراء كزبون بالدفع عند الاستلام (COD)",
        labelEn: "🛍️ 3. Buyer Experience — One-Click COD Checkout",
        descAr: "اضغط هنا لتجربة صفحة الطلب السريعة بدون تعقيد، ودفع الشحن مسبقاً لمنع الإلغاءات.",
        descEn: "Click here to experience fast checkout with prepaid shipping to stop cancellations.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
      {
        labelAr: "🛡️ 4. مسار التوثيق والتحقق (سجل تجاري CR أو مشاريع منزلية)",
        labelEn: "🛡️ 4. KYC & Verification (CR vs Home Business Track)",
        descAr: "اضغط هنا لمعاينة متطلبات التوثيق، مسح الهوية والوجه، وشارة التوثيق الزرقاء خلال 24 ساعة.",
        descEn: "Click here to preview identity verification, face scan, and 24h verified blue badge.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification",
      },
      {
        labelAr: "🎬 5. بوابة صناع المحتوى والمسوّقين وروابط الإسناد",
        labelEn: "🎬 5. Creator Affiliate Hub & Attribution Links",
        descAr: "اضغط هنا لتصفح كتالوج العينات المجانية وتوليد روابط الإسناد وكسب العمولات.",
        descEn: "Click here to browse products, request samples, and generate tracked affiliate links.",
        actionType: "navigate",
        targetUrl: "/dashboard/browse",
      },
      {
        labelAr: "💳 6. الضمان المالي والمحفظة والسحب البنكي الفوري",
        labelEn: "💳 6. Financial Escrow, Wallet & Instant Bank Payout",
        descAr: "اضغط هنا لفحص دفتر الحسابات، تحصيل المبالغ النقدية، وتحويل الأرباح لحسابك البنكي.",
        descEn: "Click here to inspect financial escrow ledger, cash collection, and payout.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=command",
      },
    ],
  },

  brandstack_tour: {
    id: "brandstack_tour",
    titleAr: "مركز قيادة الأرباح الصافية — Brandstack AI Hub ⚡",
    titleEn: "True Net Margin Hub — Brandstack AI ⚡",
    explanationAr:
      "هنا يرى التاجر صافي أرباحه الحقيقية بعد خصم تكلفة البضاعة (COGS)، مصاريف إعلانات Meta و Google، ورسوم الشحن المرتجع (RTO). اضغط على الخيارات أدناه للتنقل:",
    explanationEn:
      "Here merchants see true net bank-collected profits after COGS, ad spend, and RTO losses. Click below to navigate:",
    badgeAr: "محرك الربحية",
    badgeEn: "Profit Engine",
    options: [
      {
        labelAr: "👉 اضغط هنا لتجربة محاكي المبيعات وتدفق الطلبات الحية",
        labelEn: "👉 Click here to test Live Order Stream Simulator",
        descAr: "شاهد كيف يتم تسجيل طلبات جديدة من مدن مختلفة وتحديث الأرباح فوراً.",
        descEn: "See incoming simulated orders update profit metrics in real-time.",
        actionType: "tab_switch",
        targetTab: "simulator",
      },
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
    explanationAr:
      "يقوم هذا المحرر بإنشاء متجر كامل متوافق مع الهواتف دون الحاجة لأي كتابة كود. يمكنك تعديل البلوكات، العناوين، وإطلاق الحملة فوراً. أين تريد الانتقال بعد ذلك؟",
    explanationEn:
      "Build high-converting storefronts with visual blocks. What would you like to explore next?",
    badgeAr: "محرر المتاجر",
    badgeEn: "Store Builder",
    options: [
      {
        labelAr: "👉 اضغط هنا لتجربة طلب منتج كعميل (COD Checkout)",
        labelEn: "👉 Make a Test COD Order as a Buyer",
        descAr: "قم بوضع طلب تجريبي ولاحظ سرعة تسجيل الطلب وإشعاره في لوحة التاجر.",
        descEn: "Place a simulated order and watch it reflect live in the portal.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
      {
        labelAr: "📊 الانتقال إلى لوحة قيادة التاجر الرئيسية",
        labelEn: "📊 Go to Merchant Financial Dashboard",
        descAr: "شاهد تفاصيل الطلبات، أداء المبيعات، ومحفظة الضمان المالي.",
        descEn: "View order management, financial escrow, and sales metrics.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=command",
      },
      {
        labelAr: "🛡️ الانتقال إلى مركز التوثيق والشارة الزرقاء",
        labelEn: "🛡️ Go to Verification & Blue Badge Center",
        descAr: "اطلع على مسار التوثيق المخصص لمشروعك (بسجل تجاري أو بدونه).",
        descEn: "Check identity verification tracks tailored for your business.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification",
      },
    ],
  },

  storefront_buyer_tour: {
    id: "storefront_buyer_tour",
    titleAr: "واجهة متجر المشتري — تسوق سلس بالدفع عند الاستلام 🛍️",
    titleEn: "Buyer Storefront — Frictionless COD Checkout 🛍️",
    explanationAr:
      "هذه هي الصفحة السريعة التي يراها زبائنك عند الضغط على إعلاناتك. تطلب فقط الاسم، الهاتف، والعنوان. جرب إتمام طلب الآن ثم اختر خطوتك التالية:",
    explanationEn:
      "This is what customers see from your ads. Fast one-click COD checkout with zero friction. Place an order then choose next step:",
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
      {
        labelAr: "🛡️ الانتقال إلى مركز توثيق الحساب (KYC)",
        labelEn: "🛡️ Go to Account KYC Verification",
        descAr: "شاهد خطوات توثيق الهوية والسجل التجاري أو مسار العمل الحر.",
        descEn: "See ID & Commercial Register or Freelance verification flow.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification",
      },
    ],
  },

  verification_tour: {
    id: "verification_tour",
    titleAr: "مركز التوثيق والتحقق الذكي — KYC & Blue Badge 🛡️",
    titleEn: "Smart KYC & Identity Verification Center 🛡️",
    explanationAr:
      "نظام التحقق يمنحك شارة التوثيق الزرقاء خلال 24 ساعة! مخصص لكلا المسارين: (1) مسار الشركات بالسجل التجاري الرسمي، أو (2) مسار المشاريع المنزلية بالبطاقة والوجه وحساب Instagram/TikTok.",
    explanationEn:
      "Get your verified blue badge in 24 hours! Tailored for both registered entities (CR) and home/freelance brands.",
    badgeAr: "التوثيق المعتمد",
    badgeEn: "KYC Center",
    options: [
      {
        labelAr: "🏢 مسار المنشآت بالسجل التجاري الرسمي (CR)",
        labelEn: "🏢 Commercial Registration (CR) Track",
        descAr: "رفع وثيقة السجل التجاري ورقم المنشأة للحصول على اعتماد الشركات.",
        descEn: "Upload CR certificate for corporate validation and official invoicing.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification?tab=cr",
      },
      {
        labelAr: "🎨 مسار المشاريع المنزلية والعمل الحر (بدون سجل تجاري)",
        labelEn: "🎨 Home Business Track (No CR Needed)",
        descAr: "رفع البطاقة الشخصية، المسح البيومتري للوجه، وربط حساب Instagram/TikTok.",
        descEn: "Upload National ID, 3D face scan, and connect Instagram/TikTok profile.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification?tab=home_business",
      },
      {
        labelAr: "⚡ العودة لمركز قيادة التاجر ومحاكي المبيعات",
        labelEn: "⚡ Return to Merchant Dashboard & Simulator",
        descAr: "استكمال فحص المبيعات والأرباح والمخزون.",
        descEn: "Continue monitoring sales, inventory, and net margins.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=simulator",
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
    if (pathname.includes("/verification")) {
      setCurrentStepId("verification_tour");
    } else if (pathname.includes("/store/edit")) {
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
      if (typeof window !== "undefined") {
        window.location.hash = `#${opt.targetTab}`;
        const tabBtn = document.querySelector(
          `button[data-tour-tab="${opt.targetTab}"]`
        ) as HTMLButtonElement;
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
              {isAr ? "👇 أين تريد الذهاب والتجربة الآن؟" : "👇 Where would you like to explore next?"}
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

