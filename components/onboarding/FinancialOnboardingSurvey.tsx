"use client";

import React, { useState } from "react";
import Link from "next/link";
import CasaMoneyRain from "@/components/effects/CasaMoneyRain";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingDown,
  ShoppingBag,
  Target,
  Truck,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";

interface SurveyState {
  platform: string;
  adChannel: string;
  trackingMethod: string;
  painPoint: string;
}

export default function FinancialOnboardingSurvey({ locale = "ar" }: { locale?: string }) {
  const isEn = locale === "en";
  const [step, setStep] = useState(1);
  const [survey, setSurvey] = useState<SurveyState>({
    platform: "Shopify",
    adChannel: "Meta",
    trackingMethod: "Spreadsheets",
    painPoint: "High RTO & Hidden Fees",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const selectAndAdvance = (update: Partial<SurveyState>, nextStep: number) => {
    setSurvey((prev) => ({ ...prev, ...update }));
    if (nextStep <= 4) {
      setTimeout(() => {
        setStep(nextStep);
      }, 200);
    } else {
      setTimeout(() => {
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          setIsCompleted(true);
        }, 1200);
      }, 200);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsCompleted(true);
      }, 1200);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // AI leak calculation based on answers
  const getAiDiagnosis = () => {
    let leakTitle = "تسريب مالي في مرتجعات الدفع عند الاستلام (COD) وفواتير الشحن";
    let leakEstimated = "18,400 - 24,000 ر.س شهرياً";
    let action = "تفعيل رسائل تأكيد الواتساب وتدقيق فواتير الشاحنين فورياً";

    if (survey.painPoint === "Fake ROAS & High Ad Spend") {
      leakTitle = "تضارب أرقام العائد الإعلاني (Fake ROAS) واستنزاف الميزانية في حملات غير رابحة";
      leakEstimated = "14,500 - 32,000 ر.س شهرياً";
      action = "ربط Meta و Google لحساب الـ MER الحقيقي والهامش الصافي لكل SKU";
    } else if (survey.trackingMethod === "Spreadsheets") {
      leakTitle = "تشتت البيانات بين الإكسيل وبوابات الدفع يخفي الخسائر التشغيلية الحقيقية";
      leakEstimated = "9,800 - 15,000 ر.س شهرياً";
      action = "استبدال الجداول اليدوية بمحرك المطابقة الموحد (Brandstack Engine)";
    }

    return { leakTitle, leakEstimated, action };
  };

  const diagnosis = getAiDiagnosis();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-white">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-3.5 py-1 text-xs font-bold text-amber-400">
          <Sparkles className="h-3.5 w-3.5" />
          {isEn ? "AI Financial Audit & Setup" : "التدقيق المالي بالذكاء الاصطناعي وإعداد لوحة التحكم"}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {isEn ? "Discover Your Store's Hidden Profit Leaks" : "اكتشف التسريبات المالية الخفية في متجرك الإلكتروني"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {isEn
            ? "4 quick questions to customize your financial reconciliation engine and calculate your true net margins."
            : "4 أسئلة سريعة لتخصيص محرك المطابقة المالي واكتشاف أين يضيع صافي ربحك."}
        </p>
      </div>

      {!isCompleted ? (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
              <span>{isEn ? `Step ${step} of 4` : `الخطوة ${step} من 4`}</span>
              <span>{step * 25}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${step * 25}%` }}
              />
            </div>
          </div>

          {/* Step 1: E-Commerce Platform */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">
                {isEn ? "1. What is your primary e-commerce platform?" : "1. ما هي المنصة الأساسية لمتجرك الإلكتروني؟"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "Shopify", name: "Shopify D2C", desc: "متجر شوبيفاي مع بوابات دفع عالمية/محلية" },
                  { id: "Salla", name: "منصة سلة (Salla)", desc: "سلة للتجارة الإلكترونية في السعودية" },
                  { id: "Zid", name: "منصة زد (Zid)", desc: "حلول تجارة التجزئة والمتاجر المتكاملة" },
                  { id: "WooCommerce", name: "WooCommerce / Custom", desc: "ووردبريس أو منصة مخصصة خاصة" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectAndAdvance({ platform: p.id }, 2)}
                    className={`rounded-xl border p-4 text-right transition ${
                      survey.platform === p.id
                        ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Acquisition Channels */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">
                {isEn ? "2. What is your primary paid advertising channel?" : "2. ما هي المنصة الإعلانية التي تنفق عليها الحصة الأكبر؟"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "Meta", name: "Meta Ads (Instagram & Facebook)", desc: "إعلانات انستغرام وفيسبوك وحملات Advantage+" },
                  { id: "TikTok", name: "TikTok Spark Ads & Creator UGC", desc: "إعلانات تيك توك ومحتوى المؤثرين الممول" },
                  { id: "Google", name: "Google Ads & Performance Max", desc: "إعلانات البحث والتسوق PMax على جوجل" },
                  { id: "Snapchat", name: "Snapchat Story Ads", desc: "إعلانات سناب شات وحملات الخليج" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectAndAdvance({ adChannel: c.id }, 3)}
                    className={`rounded-xl border p-4 text-right transition ${
                      survey.adChannel === c.id
                        ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-bold text-white">{c.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Logistics & Returns */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">
                {isEn ? "3. How do you track courier payouts and return losses?" : "3. كيف تتابع تسويات شركات الشحن ومرتجعات الدفع عند الاستلام حالياً؟"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "Spreadsheets", name: "جداول إكسيل / Google Sheets يدوياً", desc: "نجمع البيانات يدوياً نهاية الشهر" },
                  { id: "ERP", name: "نظام ERP / محاسبي مخصص", desc: "نظام مالي مرتبط جزئياً" },
                  { id: "CarrierPortal", name: "متابعة من بوابة كل شركة شحن منفصلة", desc: "الدخول لبوابة سمسا وأرامكس كل أسبوع" },
                  { id: "DontTrack", name: "لا نتابعها بدقة وتكلفنا وقتاً طويلاً", desc: "نعتمد على التقديرات التقريبية" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => selectAndAdvance({ trackingMethod: m.id }, 4)}
                    className={`rounded-xl border p-4 text-right transition ${
                      survey.trackingMethod === m.id
                        ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-bold text-white">{m.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Operational Pain Points */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">
                {isEn ? "4. What is your biggest operational pain point?" : "4. ما هو أكبر تحدٍ يهدد أرباح متجرك الآن؟"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "High RTO & Hidden Fees", name: "ارتفاع نسبة المرتجعات (RTO) وتكاليف الشحن المخفية", desc: "الطلبات غير المستلمة تأكل أرباح الطلبات الناجحة" },
                  { id: "Fake ROAS & High Ad Spend", name: "أرقام ROAS وهمية بالإعلانات مع انخفاض صافي الكاش", desc: "لوحات الإعلانات تظهر أرباحاً بينما الحساب البنكي ينقص" },
                  { id: "Fragmented Data", name: "تشتت البيانات بين شوبيفاي والإعلانات والشركات", desc: "عدم وجود مصدر موحد للحقيقة (Single Source of Truth)" },
                  { id: "SKU Profitability Mystery", name: "عدم معرفة ربحية كل منتج بدقة (SKU-level)", desc: "صعوبة معرفة أي المنتجات تخسر فعلياً" },
                ].map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => selectAndAdvance({ painPoint: pt.id }, 5)}
                    className={`rounded-xl border p-4 text-right transition ${
                      survey.painPoint === pt.id
                        ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-bold text-white">{pt.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{pt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition ${
                step === 1 ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <ArrowRight className="h-4 w-4" />
              {isEn ? "Back" : "السابق"}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isAnalyzing}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition"
            >
              {isAnalyzing ? (
                <span>{isEn ? "Analyzing Financial Leaks..." : "جاري تحليل التسريبات المالية..."}</span>
              ) : step === 4 ? (
                <>
                  <span>{isEn ? "Generate AI Diagnosis" : "استخراج التقرير والتشخيص المالي"}</span>
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>{isEn ? "Next" : "التالي"}</span>
                  <ArrowLeft className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Diagnosis & Personalized Dashboard Setup Screen */
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-md sm:p-8 space-y-6 relative">
          {/* La Casa de Papel Style Continuous Money Rain Effect */}
          <CasaMoneyRain count={45} initialBurst={true} opacity={0.84} zIndex={60} />
          
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-emerald-300 relative z-10">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">{isEn ? "AI Financial Diagnosis Ready" : "اكتمل تشخيص التسريبات المالية وتخصيص لوحتك"}</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isEn
                  ? `Customized for ${survey.platform} + ${survey.adChannel} ad attribution.`
                  : `تمت تهيئة لوحة التحكم خصيصاً لمتجر ${survey.platform} مع ربط إعلانات ${survey.adChannel}.`}
              </p>
            </div>
          </div>

          {/* The Core Detected Leak */}
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                {isEn ? "Detected Financial Leak #1" : "أكبر تسريب مالي تم اكتشافه"}
              </span>
              <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30">
                {isEn ? "Estimated Leak" : "الخسارة المقدرة"}: {diagnosis.leakEstimated}
              </span>
            </div>

            <p className="text-base font-bold text-white">{diagnosis.leakTitle}</p>
            
            <div className="rounded-xl bg-slate-950/60 p-3 text-xs text-slate-300">
              <strong className="text-amber-400">{isEn ? "Immediate Action:" : "الإجراء الفوري المقترح:"} </strong>
              {diagnosis.action}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Link
              href="/dashboard?tab=financial_analytics"
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition"
            >
              <span>{isEn ? "Open True Net Reconciliation Dashboard" : "فتح لوحة تدقيق صافي الأرباح (Live)"}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard?tab=integrations"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <span>{isEn ? "Configure Store & Ad Integrations" : "إعداد الربط التقني ومصادر البيانات"}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
