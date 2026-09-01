"use client";

import { useLocale } from "next-intl";
import {
  Flame,
  ShieldAlert,
  Layers,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Clock,
  Truck,
  Sparkles,
  AlertTriangle,
  Play,
  TrendingUp,
  Tag,
  CheckCircle2,
} from "lucide-react";
import type { CompetitorData } from "@/lib/radar/types";

export default function CompetitorCard({
  competitor,
  onInspect,
}: {
  competitor: any;
  onInspect: (competitor: any) => void;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const threat = competitor.threatScore || 50;
  const threatTone =
    threat >= 80
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : threat >= 65
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const tierLabel =
    competitor.tier === "direct"
      ? isAr ? "منافس مباشر رئيسي" : "Direct Rival"
      : competitor.tier === "potential"
        ? isAr ? "منافس محتمل" : "Potential Rival"
        : isAr ? "منافس غير مباشر" : "Indirect Rival";

  const topAd = competitor.ads?.[0];
  const topWeakness = competitor.weaknesses?.[0];

  return (
    <div className="group rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Card Header: Brand + Threat Score Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-line text-slate-800 font-bold text-sm">
              {competitor.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {competitor.name}
                </h3>
                {competitor.domain && (
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {competitor.domain}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5">
                  {tierLabel}
                </span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {competitor.activeAdsCount || competitor.ads?.length || 1}{" "}
                  {isAr ? "إعلانات نشطة" : "Active Ads"}
                </span>
              </div>
            </div>
          </div>

          <div className={`flex flex-col items-end rounded-2xl border px-3 py-1.5 ${threatTone}`}>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
              {isAr ? "مؤشر التهديد" : "Threat Score"}
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-extrabold">{threat}</span>
              <span className="text-[10px] opacity-70">/100</span>
            </div>
          </div>
        </div>

        {/* Breakdown Metric Bars */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-line text-center text-xs">
          <div className="rounded-xl bg-slate-50 p-2">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isAr ? "الصلة" : "Relevance"}
            </span>
            <span className="font-bold text-slate-800">{competitor.relevanceScore || 70}%</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isAr ? "النشاط" : "Activity"}
            </span>
            <span className="font-bold text-slate-800">{competitor.activityScore || 65}%</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isAr ? "الإبداع" : "Creative"}
            </span>
            <span className="font-bold text-slate-800">{competitor.creativeScore || 60}%</span>
          </div>
        </div>

        {/* Primary Offer & Value Proposition */}
        <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 uppercase">
            <Tag className="h-3 w-3 text-indigo-600" />
            <span>{isAr ? "العرض التسويقي الرئيسي:" : "Primary Offer:"}</span>
          </div>
          <p className="text-xs font-semibold text-slate-800 leading-snug">
            {competitor.primaryOffer || (isAr ? "خصم ترويجي مع شحن قياسي" : "Standard promotional discount")}
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 pt-1">
            {competitor.shippingOffer && (
              <span className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-slate-400" />
                {competitor.shippingOffer}
              </span>
            )}
          </div>
        </div>

        {/* Top Active Ad Creative Hook Preview */}
        {topAd && (
          <div className="rounded-2xl border border-line bg-slate-50/60 p-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <Play className="h-3 w-3 text-rose-500 fill-rose-500" />
                {isAr ? "أقوى خطاف إعلاني شغال:" : "Winning Ad Hook:"}
              </span>
              <span className="text-[10px] font-mono bg-white border px-1.5 py-0.5 rounded text-slate-600">
                {topAd.daysActive} {isAr ? "يوم صامد" : "days active"}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-900 italic line-clamp-2">
              &ldquo;{topAd.hook || topAd.headline}&rdquo;
            </p>
          </div>
        )}

        {/* Top Weakness Found */}
        {topWeakness && (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>{isAr ? "نقطة ضعف مرصودة:" : "Detected Weakness:"}</span>
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-snug">
              {topWeakness.title}
            </p>
          </div>
        )}
      </div>

      {/* Footer Action Button */}
      <div className="mt-5 pt-3 border-t border-line flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          {isAr ? "الثقة التحليلية:" : "Confidence:"}{" "}
          <strong className="text-slate-800 font-semibold">{competitor.confidenceScore || 85}%</strong>
        </span>

        <button
          type="button"
          onClick={() => onInspect(competitor)}
          className="gl-btn-secondary !py-1.5 !px-3.5 !text-xs flex items-center gap-1.5 font-bold !bg-indigo-50 !border-indigo-200 !text-indigo-900 hover:!bg-indigo-100 transition"
        >
          <span>{isAr ? "تفكيك المنافس" : "Deep Inspect"}</span>
          <ArrowIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
