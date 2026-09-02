"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Users,
  Building2,
  Calendar,
  Receipt,
  CheckCircle2,
  BellRing,
  Zap,
  Play,
  TrendingDown,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const locale = useLocale();
  const isAr = locale !== "en";

  // Interactive micro-state for visual simulation
  const [selectedSector, setSelectedSector] = useState<"retail" | "contracting" | "services">("retail");
  const [staffCount, setStaffCount] = useState<number>(6);
  const [omaniCount, setOmaniCount] = useState<number>(2);

  const sectorRates = {
    retail: { name: isAr ? "تجارة وتجزئة" : "Retail", target: 35 },
    contracting: { name: isAr ? "مقاولات وبناء" : "Contracting", target: 20 },
    services: { name: isAr ? "خدمات واستشارات" : "Services", target: 30 },
  };

  const currentRate = Math.round((omaniCount / staffCount) * 100);
  const targetRate = sectorRates[selectedSector].target;
  const isCompliant = currentRate >= targetRate;
  const missingOmanis = Math.max(0, Math.ceil((targetRate / 100) * staffCount) - omaniCount);
  const estimatedFine = missingOmanis * 600 + (isCompliant ? 0 : 250);

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent("open-compliance-quiz"));
  };

  return (
    <section id="manifesto" className="relative overflow-x-clip scroll-mt-24 pb-14 pt-28 sm:pb-24 sm:pt-36">
      {/* Background Decorative Ambient Elements */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden select-none" aria-hidden="true">
        <div className="gl-mesh pointer-events-none absolute inset-0 opacity-60" aria-hidden>
          <span className="gl-mesh-orb gl-mesh-lime" />
          <span className="gl-mesh-orb gl-mesh-cyan" />
          <span className="gl-mesh-orb gl-mesh-sun" />
        </div>
      </div>

      <div className="mx-auto max-w-wrap px-5 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Main Text Content (Left / Right depending on RTL) */}
          <div className="lg:col-span-7 space-y-6 text-start">
            {/* Omani SME Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isAr ? "وكيل الذكاء الاصطناعي الأول للامتثال في سلطنة عُمان 🇴🇲" : "AI Compliance Agent for Oman SMEs 🇴🇲"}</span>
            </div>

            {/* Pain-focused Big Title */}
            <h1 className="gl-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-frost leading-[1.15]">
              {isAr ? "اعرف غرامتك المحتملة قبل أن تصلك" : "Know Your Potential Fine Before It Hits You"}
            </h1>

            {/* Clear, Actionable Subtitle */}
            <p className="gl-lede text-base sm:text-lg text-frost-dim leading-relaxed max-w-2xl">
              {isAr
                ? "وكيل ذكاء اصطناعي للمؤسسات الصغيرة والمتوسطة في سلطنة عُمان يراقب التراخيص، نسب التعمين، الضرائب، والتصاريح، وينبهك استباقياً قبل أي غرامة عبر واتساب ولوحة تحكم موحدة."
                : "An AI agent that monitors commercial licenses, Omanisation quotas, municipal permits, and VAT compliance for Omani SMEs—alerting you on WhatsApp before costly fines occur."}
            </p>

            {/* Key Value Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs sm:text-sm text-frost-dim">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{isAr ? "تتبع فوري لنسب التعمين وقرارات وزارة العمل" : "Real-time Omanisation tracking"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{isAr ? "تنبيهات تلقائية عبر واتساب قبل انتهاء التراخيص" : "WhatsApp alerts before permit expiry"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{isAr ? "فحص متطلبات الفوترة الإلكترونية وضريبة القيمة المضافة" : "VAT & e-invoicing audit"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{isAr ? "تقارير شهرية جاهزة للاستشارات ومكاتب سند" : "Ready monthly compliance reports"}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
              <button
                type="button"
                onClick={openQuiz}
                className="gl-btn-primary inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isAr ? "ابدأ الفحص المجاني الآن" : "Start Free Compliance Audit"}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>

              <Link
                href="/dashboard"
                className="gl-btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border border-line hover:border-frost-faint transition-all"
              >
                <span>{isAr ? "تجربة لوحة التحكم" : "Explore Dashboard Demo"}</span>
              </Link>
            </div>

            {/* Micro Social Proof Under CTA */}
            <div className="flex items-center gap-4 pt-2 text-xs text-frost-dim">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {isAr ? "فحص فوري خلال ٦٠ ثانية" : "60-second instant check"}
              </span>
              <span className="text-frost-faint">•</span>
              <span>{isAr ? "بدون بطاقة بنكية" : "No credit card required"}</span>
              <span className="text-frost-faint">•</span>
              <span>{isAr ? "متوافق مع أنظمة سلطنة عُمان" : "100% Oman regulation compliant"}</span>
            </div>
          </div>

          {/* Interactive Compliance Radar Visual Card (Right / Left) */}
          <div className="lg:col-span-5">
            <div className="gl-tile relative rounded-2xl p-5 sm:p-6 border border-line bg-[#0D121F]/90 shadow-2xl backdrop-blur-md text-white space-y-5">
              
              {/* Card Header & Simulated Live Status */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-white/50 block">
                      {isAr ? "محاكي رادار الامتثال" : "Compliance Radar"}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {isAr ? "مؤسسة تجارية (مسقط)" : "Commercial Entity (Muscat)"}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isCompliant ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {isCompliant ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isAr ? "امتثال آمن" : "Safe Zone"}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{isAr ? "خطر غرامة" : "Fine Risk"}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Sector Quick Toggle */}
              <div className="space-y-2">
                <span className="text-xs text-white/60 block">{isAr ? "اختر نوع النشاط:" : "Select Sector:"}</span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                  {(["retail", "contracting", "services"] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSector(sec)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        selectedSector === sec
                          ? "bg-emerald-500 text-black font-bold shadow-md"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {sectorRates[sec].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Staff Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                    <span>{isAr ? "إجمالي العمالة" : "Total Staff"}</span>
                    <span className="font-mono font-bold text-white">{staffCount}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={20}
                    value={staffCount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStaffCount(val);
                      if (omaniCount > val) setOmaniCount(val);
                    }}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                    <span>{isAr ? "الكوادر العُمانية" : "Omanis"}</span>
                    <span className="font-mono font-bold text-emerald-400">{omaniCount}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={staffCount}
                    value={omaniCount}
                    onChange={(e) => setOmaniCount(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                </div>
              </div>

              {/* Real-time Calculation Gauges */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">{isAr ? "نسبة التعمين المحققة:" : "Omanisation Rate:"}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-mono text-xl font-extrabold ${isCompliant ? "text-emerald-400" : "text-amber-400"}`}>
                      {currentRate}%
                    </span>
                    <span className="text-[11px] text-white/50">
                      ({isAr ? "المستهدف:" : "Target:"} {targetRate}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompliant ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                    style={{ width: `${Math.min(100, currentRate)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                  <span className="text-white/60">{isAr ? "تقدير الغرامات المحتملة:" : "Estimated Fine Risk:"}</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    {estimatedFine.toLocaleString()} {isAr ? "ر.ع" : "OMR"}
                  </span>
                </div>
              </div>

              {/* WhatsApp Notification Simulator Bubble */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-white">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{isAr ? "وكيل ريادة على واتساب" : "Riyada WhatsApp"}</span>
                    <span className="text-[10px] text-white/40">{isAr ? "الآن" : "Just now"}</span>
                  </div>
                  <p className="text-white/80 text-[11px] leading-relaxed">
                    {isAr
                      ? `⚠️ تنبيه: متبقي ${missingOmanis > 0 ? `تعيين ${missingOmanis} موظف عُماني لتفادي حظر المعاملات` : "18 يوماً لتجديد رخصة البلدية — تجنّب غرامة 100 ر.ع."}`
                      : "Regulatory alert received via WhatsApp."}
                  </p>
                </div>
              </div>

              {/* Card Action Button */}
              <button
                type="button"
                onClick={openQuiz}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAr ? "فحص شامل لكافة التراخيص والضرائب مجاناً" : "Audit All Permits & Taxes Free"}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
