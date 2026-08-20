"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import {
  Flame,
  ShieldAlert,
  AlertTriangle,
  FileQuestion,
  UserX,
  TrendingDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Store,
  Smartphone,
  BadgePercent,
  Sparkles,
  ArrowRight,
  Calculator,
  Scale,
  Receipt,
  Award,
} from "lucide-react";

interface TrustVsChaosSectionProps {
  onOpenOnboarding: () => void;
  onNavigateToMerchantPortal: () => void;
}

type Perspective = "merchant" | "creator";

export const TrustVsChaosSection: React.FC<TrustVsChaosSectionProps> = ({
  onOpenOnboarding,
  onNavigateToMerchantPortal,
}) => {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";

  const [activePerspective, setActivePerspective] = useState<Perspective>("merchant");
  const [selectedProofIndex, setSelectedProofIndex] = useState<number>(0);

  // Content Matrix Data
  const merchantContent = {
    title: isAr ? "منظومة الأمان للتاجر والمورد" : "Security Framework for Merchants & Brands",
    subtitle: isAr ? "تخلص نهائياً من نزيف الميزانيات الإعلانية ومخاطر التسويق الفوضوي" : "Eliminate ad budget waste and chaotic influencer outreach risks completely",
    oldWay: {
      tag: isAr ? "الطريقة العشوائية القديمة (مخاطر وخسارة)" : "Legacy Chaotic Outreach (High Risk & Waste)",
      summary: isAr ? "دفع مسبق، وعينات مهدرة، ونزاعات تتبع مستمرة دون ضمان أي بيعة حقيقية." : "Upfront fees, wasted product samples, and zero guarantee of verified sales.",
      points: [
        {
          id: "m-old-1",
          icon: Flame,
          title: isAr ? "حرق الميزانيات الإعلانية" : "Wasted Ad Spend",
          desc: isAr ? "الدفع مقدماً لشركات الإعلانات (Meta / TikTok) بمبالغ طائلة دون أي ضمان لتحقيق مبيعات أو أرباح فعلية." : "Paying Meta/TikTok huge ad fees upfront with no sales guarantee.",
          badMetric: isAr ? "تكلفة اكتساب عميل غير متوقعة (CPA متذبذب)" : "Unpredictable CPA spike",
        },
        {
          id: "m-old-2",
          icon: UserX,
          title: isAr ? "مخاطرة النصب واختفاء العينات" : "Sample Theft & Ghosting",
          desc: isAr ? "إرسال منتجات غالية الثمن لأشخاص وهميين أو مؤثرين عشوائيين يختفون بعد الاستلام دون تصوير أو ترويج." : "Sending expensive items to random accounts who disappear after receiving.",
          badMetric: isAr ? "فقدان 40-60% من عينات المنتجات هباءً" : "40-60% product sample loss",
        },
        {
          id: "m-old-3",
          icon: ShieldAlert,
          title: isAr ? "ضياع الحقوق وانعدام التتبع" : "Untracked Conversions",
          desc: isAr ? "عدم القدرة على تتبع مصدر المبيعات بدقة بالروابط اليدوية، مما يؤدي لنزاعات مالية وفوضى في الحسابات." : "Inability to accurately trace sales via manual promo codes.",
          badMetric: isAr ? "إسناد مبيعات عشوائي ونزاعات مستمرة" : "Untracked conversions & disputes",
        },
      ],
    },
    newWay: {
      tag: isAr ? "منظومة Growlab الموثوقة (أمان وأرباح مضمونة)" : "Growlab Ecosystem (Guaranteed Performance & Escrow)",
      summary: isAr ? "ادفع فقط بعد اكتمال البيع وتسليم المنتج للعميل بنظام إسناد آلي دقيق بالهللة." : "Pay commission strictly after order completion & customer delivery.",
      points: [
        {
          id: "m-new-1",
          icon: BadgePercent,
          title: isAr ? "الدفع مقابل النتيجة الفعلية فقط" : "Pay-For-Performance Only",
          desc: isAr ? "صفر تكاليف إعلانية مسبقة. التاجر يدفع حصة العمولة (15-20%) فقط بعد استلام العميل للطلب وتأكيد المبيعات المكتملة." : "$0 upfront ad fee. Merchants pay commission only when an order is delivered.",
          goodMetric: isAr ? "0 مخاطرة مالية • 100% مدفوع على الأداء" : "0% Financial Risk • 100% Performance-Based",
        },
        {
          id: "m-new-2",
          icon: ShieldCheck,
          title: isAr ? "صناع محتوى موثوقون ومدققون" : "Verified & Vetted Creators",
          desc: isAr ? "نظام تدقيق وخوارزميات تقييم تضمن أن كل صانع محتوى هو شخص حقيقي وجدي يمتلك سجلاً احترافياً موثقاً." : "Audit algorithms ensure creators have verified metrics and identity checks.",
          goodMetric: isAr ? "صناع محتوى معتمدون بهوية ونظام تقييم" : "ID Verified & Ranked Creators",
        },
        {
          id: "m-new-3",
          icon: Receipt,
          title: isAr ? "تتبع مالي وتقني دقيق بالهللة" : "Automated Financial Escrow",
          desc: isAr ? "صفحة متجر مركزية ورابط فريد لكل صانع تضمن إسناد كل طلب وتوزيع الأرباح آلياً عبر دفتر العمليات اللحظي دون أي تدخل بشري." : "Dedicated micro-store links attribute every sale & handle payouts instantly.",
          goodMetric: isAr ? "إسناد فوري مع تقرير أرباح لحظي" : "Instant Attribution & Real-time Ledger",
        },
      ],
    },
    cta: {
      merchantBtn: isAr ? "انضم كتاجر موثق - ابدأ بدون مخاطرة 🏢" : "Join as Verified Merchant - Start Risk-Free 🏢",
      subtext: isAr ? "سجل متجرك الآن • لا توجد أي رسوم اشتراك شهرية أو تكاليف مسبقة" : "Register your store • $0 subscription fees or upfront cost",
    },
  };

  const creatorContent = {
    title: isAr ? "بوابة الانطلاق لصانع المحتوى" : "Launchpad for Creators",
    subtitle: isAr ? "حول شغفك بهاتفك إلى مصدر دخل احترافي محمي بنظام عقود وأرباح آلية" : "Turn your phone content into steady earnings backed by financial escrow",
    oldWay: {
      tag: isAr ? "الطريقة العشوائية القديمة (تشتت واستغلال)" : "Legacy Manual Outreach (Exploitation & Chaos)",
      summary: isAr ? "محاولات فردية مرهقة، مماطلة في العمولات، وغياب أي غطاء قانوني أو تنظيمي." : "Unpaid promises, delayed commissions, and zero legal protection.",
      points: [
        {
          id: "c-old-1",
          icon: FileQuestion,
          title: isAr ? "انعدام المصداقية وصعوبة الوصول" : "Hard to Access Big Brands",
          desc: isAr ? "البراندات الكبرى والتجار الموثوقون يتجاهلون رسائل صناع المحتوى الهواة أو المبتدئين عند التواصل الفردي." : "Top brands ignore direct DMs from emerging creators.",
          badMetric: isAr ? "تجاهل 90% من طلبات التعاون الفردية" : "90% DM rejection rate",
        },
        {
          id: "c-old-2",
          icon: AlertTriangle,
          title: isAr ? "مماطلة وتهرب من دفع العمولات" : "Commission Delays & Non-Payment",
          desc: isAr ? "العمل الفردي ينتهي غالباً برفض التاجر دفع العمولة المتفق عليها بعد نجاح الفيديو وانتشاره دون أي حماية قانونية." : "Brands dodging commission payouts after content goes viral.",
          badMetric: isAr ? "ضياع الأرباح بعد بذل الجهد وصناعة الفيديو" : "Unpaid commission losses",
        },
        {
          id: "c-old-3",
          icon: TrendingDown,
          title: isAr ? "تشتت في اللوجستيات والعقود" : "Logistical Overhead",
          desc: isAr ? "الاضطرار لبناء متاجر، صياغة اتفاقيات، متابعة الشحن والتوصيل، وإدارة الاسترجاع بشكل يدوي ومربك." : "Wasting time setting up stores, contracts, & shipping tracking.",
          badMetric: isAr ? "إهدار 80% من الوقت في أمور غير إبداعية" : "80% time lost on admin tasks",
        },
      ],
    },
    newWay: {
      tag: isAr ? "منظومة Growlab الموثوقة (حماية وتمكين فوري)" : "Growlab Ecosystem (Instant Enablement & Escrow)",
      summary: isAr ? "متجر شخصي جاهز فوراً، وصول لبراندات مرخصة، وحماية أرباحك بنظام مالي لحظي." : "Turnkey micro-store, licensed products, & guaranteed payout escrow.",
      points: [
        {
          id: "c-new-1",
          icon: Award,
          title: isAr ? "الغطاء والمصداقية الفورية" : "Instant Brand Partnerships",
          desc: isAr ? "تواصل فوري مع كتالوج ضخم من المنتجات الأصلية لتجار مرخصين وموثوقين بضغطة زر واحدة دون الحاجة لمراسلات فردية." : "One-click access to thousands of verified brand items.",
          goodMetric: isAr ? "شراكة فورية مع أكبر الموردين المرخصين" : "Instant partnership with licensed suppliers",
        },
        {
          id: "c-new-2",
          icon: Lock,
          title: isAr ? "حماية حقوقك المالية (Automated Ledger)" : "Automated Financial Escrow",
          desc: isAr ? "نظام إسناد وتقسيم أرباح آلي يضمن نزول عمولتك من كل عملية شراء في محفظتك دون تدخل أو تلاعب من التاجر." : "Commission split is guaranteed & deposited straight to your wallet.",
          goodMetric: isAr ? "توزيع فوري ومحفظة محمية بنظام الضمان" : "Real-time payout & protected wallet",
        },
        {
          id: "c-new-3",
          icon: Smartphone,
          title: isAr ? "جاهزية تامة: متجرك بلمسة زر" : "Turnkey Micro-Store in Seconds",
          desc: isAr ? "احصل على متجر مصغر متكامل باسمك ورابطك فوراً؛ فقط صور بهاتفك وشارك الرابط لتبدأ جني الأرباح بلا أي تعقيد لوجستي." : "Get your turnkey storefront link in 60 seconds. Zero shipping or storage hassle.",
          goodMetric: isAr ? "جاهز خلال 60 ثانية • لا شحن ولا تخزين" : "Live Storefront in 60 Seconds",
        },
      ],
    },
    cta: {
      creatorBtn: isAr ? "انضم كصانع محتوى - ابدأ الربح الآن 📱" : "Join as Creator - Start Earning Now 📱",
      subtext: isAr ? "أول حملة 0% رسوم منصة • متجر مجاني متكامل فور إتمام التسجيل" : "$0 platform fee on 1st campaign • Free turnkey store upon registration",
    },
  };

  const current = activePerspective === "merchant" ? merchantContent : creatorContent;

  return (
    <section id="trust-vs-chaos" className="relative space-y-8 my-12" dir={dir}>
      {/* 1. Header & Persuasion Framing */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-growlab-gold/15 text-growlab-gold border border-growlab-gold/30 text-xs font-bold shadow-sm">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-growlab-gold" />
          <span>{isAr ? "معمارية الثقة والقيمة • The Trust & Value Architecture" : "The Trust & Value Architecture"}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight leading-snug">
          {isAr ? (
            <>
              لماذا تعد منظومتنا الخيار{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-growlab-gold via-amber-300 to-growlab-goldLight">
                الأكثر أماناً
              </span>{" "}
              و
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-growlab-emerald via-emerald-300 to-teal-300">
                الأعلى ربحية؟
              </span>
            </>
          ) : (
            <>
              Why Our Ecosystem is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-growlab-gold via-amber-300 to-growlab-goldLight">
                The Safest
              </span>{" "}
              &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-growlab-emerald via-emerald-300 to-teal-300">
                Most Profitable
              </span>
            </>
          )}
        </h2>

        <p className="text-xs sm:text-sm text-onDarkSoft leading-relaxed max-w-2xl mx-auto">
          {isAr
            ? "مقارنة واقعية بين التسويق الفوضوي التقليدي عبر وسائل التواصل، وبين منظومة التجارة القائمة على الأداء المضمون في Growlab."
            : "A realistic comparison between chaotic legacy social marketing vs Growlab's performance-based escrow ecosystem."}
        </p>
      </div>

      {/* 2. Perspective Segmented Switcher (Framer Motion) */}
      <div className="flex justify-center">
        <div className="relative p-1.5 rounded-2xl bg-growlab-bgDark border border-growlab-border shadow-xl inline-flex items-center gap-1.5 max-w-md w-full">
          {/* Merchant Toggle */}
          <button
            id="toggle-merchant-perspective"
            type="button"
            onClick={() => setActivePerspective("merchant")}
            className={`relative flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer z-10 ${
              activePerspective === "merchant"
                ? "text-growlab-bgDark"
                : "text-muted hover:text-white"
            }`}
          >
            <Store className={`h-4 w-4 ${activePerspective === "merchant" ? "text-growlab-bgDark" : "text-amber-400"}`} />
            <span>{isAr ? "منظور التاجر والمورد 🏢" : "Merchant & Brand View 🏢"}</span>
            {activePerspective === "merchant" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-growlab-gold to-amber-300 rounded-xl -z-10 shadow-md"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>

          {/* Creator Toggle */}
          <button
            id="toggle-creator-perspective"
            type="button"
            onClick={() => setActivePerspective("creator")}
            className={`relative flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer z-10 ${
              activePerspective === "creator"
                ? "text-growlab-bgDark"
                : "text-muted hover:text-white"
            }`}
          >
            <Smartphone className={`h-4 w-4 ${activePerspective === "creator" ? "text-growlab-bgDark" : "text-growlab-emerald"}`} />
            <span>{isAr ? "منظور صانع المحتوى 📱" : "Creator View 📱"}</span>
            {activePerspective === "creator" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-growlab-emerald to-teal-300 rounded-xl -z-10 shadow-md"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* 3. Interactive Comparison Matrix */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePerspective}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Column A: The Old Chaotic Way (Problem) */}
          <div className="rounded-3xl bg-rose-950/20 border border-rose-900/40 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-rose-900/40 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    ✕
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-400 tracking-wider">
                      {current.oldWay.tag}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      مخاطر التسويق العشوائي والفردي
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  خسارة محتملة
                </span>
              </div>

              <p className="text-xs text-rose-200/80 leading-relaxed">
                {current.oldWay.summary}
              </p>

              {/* 3 Pain Points */}
              <div className="space-y-3.5 pt-2">
                {current.oldWay.points.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div
                      key={point.id}
                      className="p-4 rounded-2xl bg-growlab-bgDark/80 border border-rose-900/30 hover:border-rose-700/50 transition-colors space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 shrink-0 mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                            <span>{point.title}</span>
                          </h4>
                          <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
                            {point.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-rose-950/80 flex items-center gap-1.5 text-[10px] text-rose-400 font-mono">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>{point.badMetric}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Old Way Verdict Box */}
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-900/50 text-center text-xs text-rose-300 flex items-center justify-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                <strong>النتيجة التقليدية:</strong> إهدار الميزانيات، وفقدان الثقة، وصعوبة قياس العائد الفعلي على الاستثمار.
              </span>
            </div>
          </div>

          {/* Column B: The Platform Ecosystem (Solution) */}
          <div className="rounded-3xl bg-emerald-950/20 border border-emerald-500/40 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-emerald-900/50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-growlab-emerald flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-growlab-emerald tracking-wider">
                      {current.newWay.tag}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      التجارة القائمة على الأداء المضمون
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-growlab-emerald border border-emerald-500/40 font-bold">
                  أمان 100%
                </span>
              </div>

              <p className="text-xs text-emerald-200/90 leading-relaxed">
                {current.newWay.summary}
              </p>

              {/* 3 Solution Points */}
              <div className="space-y-3.5 pt-2">
                {current.newWay.points.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div
                      key={point.id}
                      className="p-4 rounded-2xl bg-growlab-bgDark/90 border border-emerald-900/40 hover:border-emerald-500/50 transition-colors space-y-2 shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/15 text-growlab-emerald shrink-0 mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                            <span>{point.title}</span>
                          </h4>
                          <p className="text-[11px] sm:text-xs text-onDarkSoft leading-relaxed">
                            {point.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald-950/80 flex items-center gap-1.5 text-[10px] text-growlab-emerald font-mono font-bold">
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-growlab-emerald" />
                        <span>{point.goodMetric}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* New Way Guarantee Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center text-xs text-emerald-200 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-growlab-emerald" />
              <span>
                <strong>معيار الأمان:</strong> توزيع الأموال يتم آلياً بنظام الضمان، ولا يدفع التاجر إلا على المبيعات المكتملة.
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 4. Live Proof / Escrow Transparency Visual Pill */}
      <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 text-center sm:text-right">
          <div className="w-10 h-10 rounded-xl bg-growlab-gold/20 text-growlab-gold flex items-center justify-center shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">
              معادلة التقسيم المالي التلقائي (Automated Escrow & Ledger)
            </div>
            <div className="text-muted text-[11px] mt-0.5">
              إيداع آلي لحصة التاجر (75-80%) وعمولة الصانع (15-20%) فور تأكيد الطلب دون أي تدخل بشري.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-growlab-bgDark border border-growlab-border text-white">
            تاجر: 80%
          </span>
          <span className="text-muted">+</span>
          <span className="px-2.5 py-1 rounded-lg bg-growlab-emerald/20 border border-growlab-emerald/40 text-growlab-emerald font-bold">
            صانع: 20%
          </span>
          <span className="text-muted">=</span>
          <span className="px-2.5 py-1 rounded-lg bg-growlab-gold/20 border border-growlab-gold/40 text-growlab-gold font-bold">
            100% أداء مضمون
          </span>
        </div>
      </div>

      {/* 5. High-Converting Dual Action CTAs */}
      <div className="pt-2">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-growlab-bgCard via-growlab-bgDark to-growlab-bgCard border border-growlab-border text-center space-y-4 shadow-2xl">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold font-display text-white">
              جاهز لتجربة التجارة الأكثر أماناً وربحية في الخليج؟
            </h3>
            <p className="text-xs text-muted max-w-xl mx-auto">
              سواء كنت تاجراً يبحث عن مبيعات حقيقية بدون مخاطرة إعلانية، أو صانع محتوى يريد ربحاً عادلاً ومحمياً.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {/* Merchant CTA */}
            <button
              id="cta-join-merchant"
              type="button"
              onClick={onNavigateToMerchantPortal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-growlab-bgSurface border border-growlab-border hover:border-amber-400 text-white font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Store className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>انضم كتاجر موثق - ابدأ بدون مخاطرة 🏢</span>
            </button>

            {/* Creator CTA */}
            <button
              id="cta-join-creator"
              type="button"
              onClick={onOpenOnboarding}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Zap className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>انضم كصانع محتوى - ابدأ الربح الآن 📱</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted pt-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-growlab-emerald" />
              بدون أي رسوم اشتراك مسبقة للتجار
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-growlab-emerald" />
              أول حملة 0% رسوم منصة للصناع
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-growlab-emerald" />
              تتبع مالي آلي محمي بالكامل
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Also export alias as requested in blueprint
export const WhyUsInteractiveGrid = TrustVsChaosSection;
