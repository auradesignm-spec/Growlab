"use client";

import { useLocale } from "next-intl";
import {
  Compass,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Gift,
  Briefcase,
  Layers,
} from "lucide-react";

export default function MarketOpportunitiesView({
  opportunities,
  productKeyword,
}: {
  opportunities: any[];
  productKeyword: string;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 text-center text-slate-500 text-sm">
        {isAr ? "لم يتم رصد فجوات سوقية بعد. أطلق فحصاً للمنافسين لبدء التحليل." : "No market gaps discovered yet."}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-600" />
            <span>{isAr ? "الفجوات والزوايا غير المخدومة في السوق (Market White Spaces):" : "Unserved Market White Spaces:"}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? `زوايا تسويقية وفرص باقات يتجاهلها المنافسون الحاليون لمنتج "${productKeyword}".`
              : `High-converting positioning angles and offer concepts overlooked by current market rivals.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {opportunities.map((opp, idx) => {
          let hooks: string[] = [];
          let offers: string[] = [];

          try {
            hooks = typeof opp.suggestedHooksJson === "string" ? JSON.parse(opp.suggestedHooksJson) : (opp.suggestedHooks || []);
            offers = typeof opp.suggestedOffersJson === "string" ? JSON.parse(opp.suggestedOffersJson) : (opp.suggestedOffers || []);
          } catch {
            hooks = [];
            offers = [];
          }

          return (
            <div
              key={opp.id || idx}
              className="rounded-3xl border border-indigo-100 bg-white p-6 space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-bold px-2.5 py-1 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{isAr ? "فرصة شاغرة" : "White Space"}</span>
                  </span>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {isAr ? "درجة الفرصة" : "Score"}
                    </span>
                    <span className="text-base font-black text-indigo-600">
                      {opp.opportunityScore || 90}/100
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {opp.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {opp.description}
                </p>

                <div className="rounded-2xl bg-slate-50 border border-line p-3 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isAr ? "الاتجاه الاستراتيجي الموصى به:" : "Recommended Direction:"}
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {opp.recommendedDirection}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-line">
                {hooks.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">
                      🎣 {isAr ? "خطافات مقترحة للحملة:" : "Suggested Hooks:"}
                    </span>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside italic">
                      {hooks.slice(0, 2).map((h, hIdx) => (
                        <li key={hIdx}>&ldquo;{h}&rdquo;</li>
                      ))}
                    </ul>
                  </div>
                )}

                {offers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">
                      🎁 {isAr ? "باقات العروض المقترحة:" : "Suggested Bundles:"}
                    </span>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                      {offers.slice(0, 1).map((o, oIdx) => (
                        <li key={oIdx}>{o}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
