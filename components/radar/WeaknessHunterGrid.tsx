"use client";

import { useLocale } from "next-intl";
import {
  AlertTriangle,
  Zap,
  Truck,
  ShieldCheck,
  Play,
  Tag,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function WeaknessHunterGrid({
  competitors,
  onInspectCompetitor,
}: {
  competitors: any[];
  onInspectCompetitor: (competitor: any) => void;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";

  // Aggregate all weaknesses across all competitors
  const items = competitors.flatMap((c) =>
    (c.weaknesses || []).map((w: any) => ({
      ...w,
      competitor: c,
    }))
  );

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 text-center text-slate-500 text-sm">
        {isAr ? "لم يتم رصد نقاط ضعف حرجة حتى الآن." : "No critical weaknesses detected."}
      </div>
    );
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "shipping":
        return { label: isAr ? "ثغرة الشحن والتوصيل" : "Shipping Vulnerability", icon: Truck, color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "trust":
        return { label: isAr ? "ثغرة الضمان والتردد" : "Trust / Guarantee Gap", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "creative":
        return { label: isAr ? "إجهاد إعلاني وضعف محتوى" : "Creative Fatigue", icon: Play, color: "bg-rose-50 text-rose-700 border-rose-200" };
      case "offer":
        return { label: isAr ? "ضعف هيكلة العروض" : "Weak Offer Structure", icon: Tag, color: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { label: isAr ? "ثغرة تموضع تسويقي" : "Positioning Gap", icon: Target, color: "bg-purple-50 text-purple-700 border-purple-200" };
    }
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>{isAr ? "مصفوفة صيد نقاط الضعف عبر جميع المنافسين (Weakness Matrix):" : "Cross-Competitor Vulnerability Matrix:"}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? "تحليل مباشر للأخطاء وثغرات التسعير والضمانات التي يمكنك استغلالها لكسب العميل المتردد."
              : "Direct intelligence on competitor friction points and where you can win customers."}
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-xl self-start">
          {items.length} {isAr ? "ثغرات مرصودة" : "Detected Flaws"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const badge = getTypeBadge(item.type);
          const Icon = badge.icon;

          return (
            <div
              key={item.id || idx}
              className="rounded-3xl border border-line bg-white p-6 space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 ${badge.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{badge.label}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onInspectCompetitor(item.competitor)}
                    className="text-xs font-bold text-slate-700 hover:text-indigo-600 underline"
                  >
                    {item.competitor.name}
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {item.evidence && (
                  <div className="rounded-xl bg-slate-50 border border-line p-2.5 text-[11px] text-slate-600 font-mono">
                    <strong>{isAr ? "الدليل:" : "Evidence:"}</strong> {item.evidence}
                  </div>
                )}
              </div>

              {item.exploitationAngle && (
                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-3.5 space-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Zap className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{isAr ? "زاوية الاستغلال والتفوق المقترحة:" : "Exploitation Angle:"}</span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {item.exploitationAngle}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
