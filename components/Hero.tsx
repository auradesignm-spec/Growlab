"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Bell,
  LayoutDashboard,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const locale = useLocale();
  const isAr = locale !== "en";

  // Interactive micro-state for visual simulation matching the mockup
  const [selectedSector, setSelectedSector] = useState<"retail" | "contracting" | "services">("retail");
  const [staffCount, setStaffCount] = useState<number>(50);
  const [omaniCount, setOmaniCount] = useState<number>(12);

  const sectorRates = {
    retail: { name: isAr ? "التجزئة" : "Retail", target: 35 },
    contracting: { name: isAr ? "المقاولات" : "Contracting", target: 20 },
    services: { name: isAr ? "الخدمات" : "Services", target: 30 },
  };

  const currentRate = staffCount > 0 ? Math.round((omaniCount / staffCount) * 100) : 0;
  const targetRate = sectorRates[selectedSector].target;
  const isCompliant = currentRate >= targetRate;
  const missingOmanis = Math.max(0, Math.ceil((targetRate / 100) * staffCount) - omaniCount);

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent("open-compliance-quiz"));
  };

  // Words for word-by-word rising animation
  const titleWords = isAr
    ? [
        { text: "احمِ", highlight: false },
        { text: "تجارتك", highlight: false },
        { text: "من", highlight: false },
        { text: "الغرامات", highlight: false },
        { text: "التنظيمية", highlight: false },
        { text: "بذكاء", highlight: true },
      ]
    : [
        { text: "Protect", highlight: false },
        { text: "Your", highlight: false },
        { text: "Business", highlight: false },
        { text: "From", highlight: false },
        { text: "Fines", highlight: false },
        { text: "With", highlight: true },
        { text: "Intelligence", highlight: true },
      ];

  // Animation variants
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { y: "100%", opacity: 0, filter: "blur(4px)" },
    visible: {
      y: "0%",
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const itemFadeUpVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section
      id="manifesto"
      className="relative overflow-x-clip scroll-mt-24 min-h-[calc(100svh-4rem)] lg:min-h-screen flex flex-col justify-center pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28 bg-[#fafcf9]"
    >
      {/* Subtle Light-to-Yellow-to-Green Ambient Gradient Background */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden select-none" aria-hidden="true">
        {/* Soft yellow-to-green radial aura */}
        <div
          className="absolute -top-32 start-1/4 h-[550px] w-[550px] rounded-full blur-[120px] opacity-40 bg-gradient-to-br from-amber-100/70 via-emerald-100/50 to-transparent"
        />
        <div
          className="absolute top-1/3 -end-24 h-[600px] w-[600px] rounded-full blur-[140px] opacity-35 bg-gradient-to-bl from-emerald-100/60 via-lime-100/40 to-transparent"
        />
        <div className="gl-mesh pointer-events-none absolute inset-0 opacity-30" aria-hidden>
          <span className="gl-mesh-orb gl-mesh-lime" />
          <span className="gl-mesh-orb gl-mesh-cyan" />
          <span className="gl-mesh-orb gl-mesh-sun" />
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 sm:px-8 lg:px-12 relative z-10 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">
          
          {/* Main Text Content (Hero Content - Right column in RTL, Left in LTR) */}
          <motion.div
            className="lg:col-span-7 space-y-6 sm:space-y-8 text-start"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.05,
                },
              },
            }}
          >
            {/* Omani SME Badge */}
            <motion.div variants={itemFadeUpVariants}>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-900 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? "الإصدار التجريبي الذكي" : "Smart Beta Edition"}</span>
              </div>
            </motion.div>

            {/* Word-by-Word Rising Title Animation (انيميشن الظهور كلمة كلمة تصعد) */}
            <motion.h1
              variants={titleContainerVariants}
              className="font-heading text-4xl sm:text-5xl lg:text-[52px] xl:text-[60px] font-black tracking-tight text-[#0e1726] leading-[1.18] sm:leading-[1.16]"
            >
              <span className="sr-only">
                {isAr ? "احمِ تجارتك من الغرامات التنظيمية بذكاء" : "Protect Your Business From Fines With Intelligence"}
              </span>
              <span aria-hidden="true" className="inline-flex flex-wrap gap-x-3 gap-y-1">
                {titleWords.map((item, index) => (
                  <span key={index} className="inline-block overflow-hidden pb-1">
                    <motion.span
                      variants={wordVariants}
                      className={`inline-block ${
                        item.highlight ? "text-[#10b981]" : "text-[#0e1726]"
                      }`}
                    >
                      {item.text}
                    </motion.span>
                  </span>
                ))}
              </span>
            </motion.h1>

            {/* Clear, Actionable Subtitle with Generous Line Spacing & Balanced Weight */}
            <motion.p
              variants={itemFadeUpVariants}
              className="font-body text-base sm:text-lg lg:text-[19px] text-[#3c4a42] font-normal leading-[1.8] max-w-xl"
            >
              {isAr
                ? "تقنين هو مساعدك الذكي للامتثال. تتبع التراخيص، نسب التعمين، والمواعيد الضريبية بشكل استباقي قبل وقوع المخالفة."
                : "Your smart compliance assistant. Track commercial permits, Omanisation quotas, and tax obligations proactively before penalties occur."}
            </motion.p>

            {/* Call-to-Action Buttons (Green Primary & Dark Secondary) */}
            <motion.div
              variants={itemFadeUpVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 sm:pt-4"
            >
              {/* Primary Green CTA */}
              <button
                type="button"
                onClick={openQuiz}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-sm sm:text-base text-white bg-[#10b981] hover:bg-[#006c49] shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <span>{isAr ? "ابدأ الفحص المجاني الآن" : "Start Free Audit Now"}</span>
                {isAr ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
              </button>

              {/* Dark Secondary CTA */}
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm sm:text-base text-white bg-[#0e1726] hover:bg-[#1a293f] border border-[#1a293f] shadow-md shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                <LayoutDashboard className="h-5 w-5 text-slate-300" />
                <span>{isAr ? "تجربة لوحة التحكم" : "Explore Dashboard"}</span>
              </Link>
            </motion.div>

            {/* Micro Social Proof Under CTA adhering strictly to 8-pt Grid System */}
            <motion.div
              variants={itemFadeUpVariants}
              className="flex flex-wrap items-center gap-6 sm:gap-8 pt-2 text-xs sm:text-sm text-[#4b5860] font-medium"
            >
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#10b981] stroke-[2.5]" />
                {isAr ? "فحص خلال ٦٠ ثانية" : "60-second check"}
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#10b981] stroke-[2.5]" />
                {isAr ? "بدون بطاقة ائتمان" : "No credit card needed"}
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#10b981] stroke-[2.5]" />
                {isAr ? "نتيجة فورية" : "Instant results"}
              </span>
            </motion.div>
          </motion.div>

          {/* Interactive Compliance Radar Visual Card (Left column in RTL, Right in LTR) */}
          <motion.div
            className="lg:col-span-5 relative mt-8 lg:mt-0 max-w-[480px] mx-auto lg:max-w-none w-full"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            
            {/* Floating WhatsApp Alert Notification Bubble with Crisp Typography */}
            <motion.div
              className="absolute -top-6 start-4 sm:start-6 z-20 flex items-center gap-3.5 rounded-2xl bg-white border border-emerald-500/25 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.08)] max-w-sm"
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-[#10b981] border border-emerald-200/80 shrink-0">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div className="text-start leading-tight">
                <span className="text-xs sm:text-[13px] font-bold text-[#0e1726] block">
                  {isAr ? "تنبيه استباقي (واتساب)" : "Proactive WhatsApp Alert"}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {isAr ? "فندق التاج: ترخيص البلدية ينتهي بعد 15 يوم." : "Hotel: Municipal permit expires in 15 days."}
                </span>
              </div>
            </motion.div>

            {/* Main Interactive Card with Generous 8-pt Grid Spacing */}
            <div className="relative rounded-[32px] p-6 sm:p-8 lg:p-9 border border-slate-200/80 bg-white/95 shadow-[0_24px_50px_-12px_rgba(16,185,129,0.08),0_12px_32px_-8px_rgba(18,28,42,0.06)] backdrop-blur-xl text-slate-900 space-y-6 sm:space-y-7">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#10b981] shadow-xs shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0e1726] leading-tight">
                      {isAr ? "رادار الامتثال" : "Compliance Radar"}
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-[#50616b] mt-0.5 font-medium">
                      {isAr ? "حاسبة التعمين التفاعلية" : "Interactive Omanisation Calculator"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Segmentation Pills (الخدمات, المقاولات, التجزئة) - Perfectly Aligned & Larger */}
              <div className="space-y-3 text-start">
                <span className="text-xs sm:text-sm font-bold text-[#0e1726] block tracking-wide">
                  {isAr ? "القطاع" : "Sector"}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {(["retail", "contracting", "services"] as const).map((sec) => {
                    const isSelected = selectedSector === sec;
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedSector(sec)}
                        className={`rounded-full px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
                          isSelected
                            ? "border-2 border-[#10b981] bg-emerald-50 text-[#006c49] shadow-xs"
                            : "border border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {sectorRates[sec].name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Sliders with Generous Breathing Room and Distinct Containers */}
              <div className="space-y-5 sm:space-y-6 text-start">
                {/* Total Employees Box */}
                <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-800">
                    <span className="font-bold text-sm sm:text-base text-[#0e1726]">
                      {isAr ? "إجمالي الموظفين" : "Total Employees"}
                    </span>
                    <span className="font-mono font-bold text-[#10b981] bg-white px-3 py-1 rounded-xl border border-emerald-200/80 shadow-xs text-sm sm:text-base">
                      {staffCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={staffCount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStaffCount(val);
                      if (omaniCount > val) setOmaniCount(val);
                    }}
                    className="w-full accent-[#10b981] cursor-pointer h-2 bg-slate-200 rounded-full"
                  />
                </div>

                {/* Current Omani Employees Box */}
                <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-800">
                    <span className="font-bold text-sm sm:text-base text-[#0e1726]">
                      {isAr ? "الموظفين الحاليين (العُمانيين)" : "Current Omani Staff"}
                    </span>
                    <span className="font-mono font-bold text-[#10b981] bg-white px-3 py-1 rounded-xl border border-emerald-200/80 shadow-xs text-sm sm:text-base">
                      {omaniCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={staffCount}
                    value={omaniCount}
                    onChange={(e) => setOmaniCount(Number(e.target.value))}
                    className="w-full accent-[#10b981] cursor-pointer h-2 bg-slate-200 rounded-full"
                  />
                </div>
              </div>

              {/* Real-time Calculation Gauges */}
              <div className="space-y-3 text-start pt-2 border-t border-slate-100">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs sm:text-sm text-slate-500 font-medium block mb-1">
                      {isAr ? "نسبة التعمين الحالية" : "Current Rate"}
                    </span>
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#0e1726] leading-none">
                      {currentRate}%
                    </span>
                  </div>
                  <div className="text-end">
                    <span className="text-xs sm:text-sm text-slate-500 font-medium block mb-1">
                      {isAr ? "النسبة المطلوبة" : "Required Target"}
                    </span>
                    <span className="inline-block rounded-full bg-slate-100 border border-slate-200/70 px-3.5 py-1 font-mono text-xs sm:text-sm font-bold text-[#0e1726]">
                      {targetRate}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompliant ? "bg-[#10b981]" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, currentRate)}%` }}
                  />
                </div>
              </div>

              {/* Status Warning Card */}
              <div
                className={`rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all duration-300 ${
                  isCompliant
                    ? "bg-emerald-50 border border-emerald-200/80 text-emerald-900"
                    : "bg-rose-50 border border-rose-200/80 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompliant ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#10b981] shrink-0" />
                      <span className="text-sm sm:text-base font-bold text-emerald-900">
                        {isAr ? "ممتثل للأنظمة" : "Fully Compliant"}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600 shrink-0" />
                      <span className="text-sm sm:text-base font-bold text-rose-800">
                        {isAr ? "غير ممتثل" : "Non-Compliant"}
                      </span>
                    </>
                  )}
                </div>

                <div className="text-end">
                  <span className={`text-xs block ${isCompliant ? "text-emerald-800/80" : "text-rose-700/80"}`}>
                    {isAr ? "غرامة متوقعة" : "Expected fine"}
                  </span>
                  <span className={`font-mono font-bold text-sm sm:text-base ${isCompliant ? "text-emerald-800" : "text-rose-700"}`}>
                    {isCompliant
                      ? isAr ? "٠ ر.ع (آمن)" : "0 OMR (Safe)"
                      : isAr ? "٥٠٠ - ١,٥٠٠ ر.ع" : "500 - 1,500 OMR"}
                  </span>
                </div>
              </div>

              {/* Significantly More Breathing Room Between Status Box and Primary Button */}
              <div className="pt-4 sm:pt-6">
                {/* Centered Primary Green Button */}
                <button
                  type="button"
                  onClick={openQuiz}
                  className="w-full py-4 px-6 sm:px-8 rounded-full bg-[#10b981] hover:bg-[#006c49] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 text-center"
                >
                  <Sparkles className="h-5 w-5 shrink-0" />
                  <span>{isAr ? "احسب امتثالك التلقائي بالكامل مجاناً" : "Calculate Full Compliance Free"}</span>
                </button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

