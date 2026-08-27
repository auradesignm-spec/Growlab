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
    titleAr: "مرحباً بك في جولة Growlab التفاعلية",
    titleEn: "Welcome to Growlab Interactive Tour",
    explanationAr:
      "أنت الآن في البيئة الاستكشافية لمنصة Growlab. نوجهك خطوة بخطوة لاستعراض إمكانيات المنصة واللوحة التشغيلية:",
    explanationEn:
      "You are now in the live interactive sandbox of Growlab. We guide you step-by-step on where to click to test every feature:",
    badgeAr: "بداية الجولة",
    badgeEn: "Start Tour",
    options: [
      {
        labelAr: "1. محاكي المبيعات اللحظية واحتساب صافي الربح",
        labelEn: "1. Live Sales Stream & Net Profit Simulator",
        descAr: "تجربة إدخال طلبات حية ومحاكاة التحصيل بعد خصم الإعلانات وتكلفة البضاعة.",
        descEn: "Simulate live orders and see real profit calculation after ads and COGS.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=simulator",
      },
      {
        labelAr: "2. محرر المتجر — بناء الواجهة بالبلوكات",
        labelEn: "2. Visual Storefront Block Builder",
        descAr: "تخصيص واجهة متجرك بالبلوكات وصور المنتجات بلمسة واحدة.",
        descEn: "Test visual block customization and instant storefront generation.",
        actionType: "navigate",
        targetUrl: "/dashboard/store/edit?fresh=1",
      },
      {
        labelAr: "3. تجربة الشراء كزبون بالدفع عند الاستلام",
        labelEn: "3. Buyer Experience — COD Checkout",
        descAr: "تجربة صفحة الطلب السريعة، ودفع الشحن مسبقاً لمنع الإلغاءات.",
        descEn: "Experience fast checkout with prepaid shipping to stop cancellations.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
      {
        labelAr: "4. مسار التوثيق والتحقق (سجل تجاري أو مشاريع منزلية)",
        labelEn: "4. KYC & Verification (CR vs Home Business)",
        descAr: "معاينة متطلبات التوثيق، مسح الهوية والوجه، وشارة التوثيق الرسمية.",
        descEn: "Preview identity verification, face scan, and verified badge.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification",
      },
      {
        labelAr: "5. بوابة صناع المحتوى والمسوّقين وروابط الإسناد",
        labelEn: "5. Creator Affiliate Hub & Attribution Links",
        descAr: "تصفح كتالوج العينات المجانية وتوليد روابط الإسناد وكسب العمولات.",
        descEn: "Browse products, request samples, and generate tracked affiliate links.",
        actionType: "navigate",
        targetUrl: "/dashboard/browse",
      },
      {
        labelAr: "6. الضمان المالي والمحفظة والسحب الفوري",
        labelEn: "6. Financial Escrow, Wallet & Payout",
        descAr: "فحص دفتر الحسابات، تحصيل المبالغ النقدية، وتحويل الأرباح لحسابك البنكي.",
        descEn: "Inspect financial escrow ledger, cash collection, and payout.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=command",
      },
    ],
  },

  brandstack_tour: {
    id: "brandstack_tour",
    titleAr: "مركز قيادة الأرباح الصافية",
    titleEn: "True Net Margin Hub",
    explanationAr:
      "رؤية صافي الأرباح الحقيقية بعد خصم تكلفة البضاعة (COGS)، مصاريف إعلانات المنصات، ورسوم الشحن المرتجع. اختر القسم للاستعراض:",
    explanationEn:
      "View true net profits after COGS, ad spend, and RTO losses. Choose below to navigate:",
    badgeAr: "محرك الربحية",
    badgeEn: "Profit Engine",
    options: [
      {
        labelAr: "تجربة محاكي المبيعات وتدفق الطلبات الحية",
        labelEn: "Test Live Order Stream Simulator",
        descAr: "شاهد كيف يتم تسجيل طلبات جديدة وتحديث الأرباح فوراً.",
        descEn: "See incoming simulated orders update profit metrics in real-time.",
        actionType: "tab_switch",
        targetTab: "simulator",
      },
      {
        labelAr: "التحدث مع المستشار المالي والتشغيلي",
        labelEn: "Financial & Operational Copilot",
        descAr: "استفسر عن حملاتك الإعلانية أو كيفية خفض المرتجعات.",
        descEn: "Ask real-time questions about ad campaigns or RTO reduction.",
        actionType: "tab_switch",
        targetTab: "ai",
      },
      {
        labelAr: "فحص توصيات إعلانات ميتا (تحسين الصرف)",
        labelEn: "Inspect Meta Ads Guard",
        descAr: "اكتشف كيف تمنع المنصة هدر الميزانية وتوجه الصرف للحملات الرابحة.",
        descEn: "See automated decisions preventing budget waste on low-ROAS campaigns.",
        actionType: "tab_switch",
        targetTab: "ads",
      },
      {
        labelAr: "فحص تنبيهات المخزون الراكد ومنع النفاد",
        labelEn: "Review Automated Inventory Alerts",
        descAr: "متابعة المنتجات التي توشك على النفاد والمنتجات الراكدة.",
        descEn: "Inspect velocity alerts and dead-stock clearance suggestions.",
        actionType: "tab_switch",
        targetTab: "inventory",
      },
      {
        labelAr: "معاينة متجر التاجر كعميل متسوق",
        labelEn: "View Storefront as Buyer",
        descAr: "تجربة واجهة المتجر السريعة والمحسنة للهاتف.",
        descEn: "Experience the customer-facing mobile-optimized shopping storefront.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
    ],
  },

  store_builder_tour: {
    id: "store_builder_tour",
    titleAr: "محرر المتجر الذكي — بناء الواجهة",
    titleEn: "Smart Store Builder & Block Editor",
    explanationAr:
      "إنشاء متجر كامل متوافق مع الهواتف دون الحاجة لأي برمجة. يمكنك تعديل البلوكات وإطلاق الحملة فوراً.",
    explanationEn:
      "Build high-converting storefronts with visual blocks. What would you like to explore next?",
    badgeAr: "محرر المتاجر",
    badgeEn: "Store Builder",
    options: [
      {
        labelAr: "تجربة طلب منتج كعميل (COD Checkout)",
        labelEn: "Make a Test COD Order as a Buyer",
        descAr: "وضع طلب تجريبي وملاحظة سرعة تسجيل الطلب في لوحة التاجر.",
        descEn: "Place a simulated order and watch it reflect live in the portal.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
      {
        labelAr: "الانتقال إلى لوحة قيادة التاجر الرئيسية",
        labelEn: "Go to Merchant Financial Dashboard",
        descAr: "استعراض إدارة الطلبات وأداء المبيعات ومحفظة الضمان المالي.",
        descEn: "View order management, financial escrow, and sales metrics.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=command",
      },
      {
        labelAr: "الانتقال إلى مركز التوثيق والشارة الزرقاء",
        labelEn: "Go to Verification Center",
        descAr: "اطلع على مسار التوثيق المخصص لمشروعك.",
        descEn: "Check identity verification tracks tailored for your business.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification",
      },
    ],
  },

  storefront_buyer_tour: {
    id: "storefront_buyer_tour",
    titleAr: "واجهة متجر المشتري — طلب بالدفع عند الاستلام",
    titleEn: "Buyer Storefront — COD Checkout",
    explanationAr:
      "الصفحة السريعة التي يراها زبائنك من الإعلانات. تطلب الاسم، الهاتف، والعنوان فقط. جرب إتمام طلب ثم انتقل للخطوة التالية:",
    explanationEn:
      "This is what customers see from your ads. Fast one-click COD checkout with zero friction. Place an order then choose next step:",
    badgeAr: "تجربة المشتري",
    badgeEn: "Buyer Experience",
    options: [
      {
        labelAr: "العودة لمركز قيادة التاجر ورؤية انعكاس المبيعات",
        labelEn: "Return to Merchant Command Center",
        descAr: "متابعة تحديث صافي الأرباح والإحصائيات اللحظية.",
        descEn: "See your metrics and net profits update in real-time.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=brandstack",
      },
      {
        labelAr: "استكشاف بوابة المسوّقين وصناع المحتوى",
        labelEn: "Explore Creator & Marketer Portal",
        descAr: "مشاهدة كيفية مشاركة صناع المحتوى روابط المنتجات.",
        descEn: "See how creators earn by promoting products.",
        actionType: "navigate",
        targetUrl: "/dashboard/browse",
      },
      {
        labelAr: "الانتقال إلى مركز توثيق الحساب (KYC)",
        labelEn: "Go to Account KYC Verification",
        descAr: "استعراض خطوات توثيق الهوية والسجل التجاري.",
        descEn: "See ID & Commercial Register or Freelance verification flow.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification",
      },
    ],
  },

  verification_tour: {
    id: "verification_tour",
    titleAr: "مركز التوثيق والتحقق — KYC",
    titleEn: "Identity Verification Center",
    explanationAr:
      "نظام التحقق للحصول على شارة التوثيق الرسمية. مخصص لمسار السجل التجاري أو مسار المشاريع المنزلية.",
    explanationEn:
      "Get your verified badge. Tailored for both registered entities (CR) and home/freelance brands.",
    badgeAr: "التوثيق المعتمد",
    badgeEn: "KYC Center",
    options: [
      {
        labelAr: "مسار المنشآت بالسجل التجاري الرسمي (CR)",
        labelEn: "Commercial Registration (CR) Track",
        descAr: "رفع وثيقة السجل التجاري ورقم المنشأة.",
        descEn: "Upload CR certificate for corporate validation.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification?tab=cr",
      },
      {
        labelAr: "مسار المشاريع المنزلية والعمل الحر",
        labelEn: "Home Business Track",
        descAr: "رفع البطاقة الشخصية والتحقق البيومتري.",
        descEn: "Upload National ID and face verification.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification?tab=home_business",
      },
      {
        labelAr: "العودة لمركز قيادة التاجر ومحاكي المبيعات",
        labelEn: "Return to Merchant Dashboard & Simulator",
        descAr: "متابعة المبيعات والأرباح والمخزون.",
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

