"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  Sparkles,
  Zap,
  Target,
  Copy,
  Check,
  Play,
  ShieldCheck,
  TrendingUp,
  Tag,
  ArrowRight,
  ArrowLeft,
  Layout,
  CheckCircle2,
} from "lucide-react";
import type { CounterStrategyBattleplan } from "@/lib/radar/types";

export default function CounterStrategyBattleplanView({
  battleplan,
  productKeyword,
}: {
  battleplan: CounterStrategyBattleplan;
  productKeyword: string;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
              <Zap className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                  {isAr ? "خطة الهجوم المضاد الموجهة" : "Actionable Counter Battleplan"}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {productKeyword}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {isAr ? "كيف تتفوق على جميع المنافسين دون حرق الأسعار؟" : "Outmaneuver Competitors Without Price Wars"}
              </h2>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          {isAr
            ? "استراتيجية تفوق مخصصة مبنية على تحليل ثغرات المنافسين في سرعة الشحن، سياسات الضمان، وتنوع المحتوى الإعلاني لتحقيق أعلى عائد على الإنفاق الإعلاني (ROAS)."
            : "Strategic action plan leveraging discovered competitor vulnerabilities in shipping speed, guarantee policies, and creative formats to maximize your conversion rate and ROAS."}
        </p>

        {/* 3 Main Strategy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-indigo-100">
          <div className="rounded-2xl bg-white border border-line p-4 space-y-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-indigo-600 uppercase flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              {isAr ? "استراتيجية التموضع:" : "Positioning:"}
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {battleplan.positioningStrategy}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-line p-4 space-y-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {isAr ? "استراتيجية العرض والسلة:" : "Offer & AOV:"}
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {battleplan.offerStrategy}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-line p-4 space-y-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-rose-600 uppercase flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5" />
              {isAr ? "استراتيجية الإعلانات والمحتوى:" : "Creative Pacing:"}
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {battleplan.creativeStrategy}
            </p>
          </div>
        </div>
      </div>

      {/* TOP 3 ACTIONABLE STEPS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            <span>{isAr ? "الخطوات الثلاث الأهم للتنفيذ الفوري:" : "Top 3 Immediate Actions:"}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {battleplan.top3Actions.map((action, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-line bg-white p-6 space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                    0{idx + 1}
                  </span>
                  <span className="text-[11px] font-bold uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                    {isAr ? "مستوى الثقة:" : "Confidence:"} {action.confidence}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {action.description}
                </p>

                <div className="rounded-xl bg-slate-50 border border-line p-3 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    {isAr ? "لماذا ستنجح؟ (Why it works):" : "Why:"}
                  </span>
                  <p className="text-slate-800">{action.why}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-line space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-[11px]">{isAr ? "النتيجة المتوقعة:" : "Outcome:"}</span>
                  <span className="font-bold text-slate-900">{action.expectedOutcome}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 HIGH-CONVERTING HOOKS */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span>{isAr ? "أقوى الخطافات الإعلانية المقترحة (Hooks for Ads & Reels):" : "Winning Ad Hooks:"}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {battleplan.hooks.map((hook, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-line bg-white p-5 space-y-3 shadow-2xs relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Hook #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(hook, `hook_${idx}`)}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
                >
                  {copiedId === `hook_${idx}` ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">{isAr ? "تم النسخ" : "Copied"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{isAr ? "نسخ الخطاف" : "Copy"}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-bold text-slate-900 italic leading-relaxed">
                &ldquo;{hook}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 VIDEO AD CONCEPTS */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Play className="h-5 w-5 text-rose-500" />
          <span>{isAr ? "أفكار مقاطع الفيديو الإعلانية المقترحة (UGC & Reels):" : "Video Ad Concepts:"}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {battleplan.adConcepts.map((ad, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-line bg-white p-6 space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 uppercase border border-rose-100">
                    {ad.format}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {isAr ? "خطاف البداية:" : "Hook:"}
                  </span>
                  <p className="text-xs font-bold text-slate-900 italic">
                    &ldquo;{ad.hook}&rdquo;
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {isAr ? "زاوية السيناريو والتصوير:" : "Angle & Script:"}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ad.angle}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-line text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                <span>CTA: {ad.cta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LANDING PAGE CONVERSION RECOMMENDATIONS */}
      {battleplan.landingPageRecommendations && (
        <div className="rounded-3xl border border-line bg-slate-50/80 p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Layout className="h-5 w-5 text-indigo-600" />
            <span>{isAr ? "تعديلات صفحة المنتج لرفع التحويل (Landing Page CRO):" : "Product Page CRO Fixes:"}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {battleplan.landingPageRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-line p-4 flex items-start gap-3 shadow-2xs"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-slate-800 leading-relaxed">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
