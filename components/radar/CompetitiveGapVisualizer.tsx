"use client";

import { useLocale } from "next-intl";
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  Play,
  Tag,
  Zap,
} from "lucide-react";

export default function CompetitiveGapVisualizer({
  competitors,
}: {
  competitors: any[];
}) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const metrics = [
    {
      title: isAr ? "سرعة التوصيل والتنفيذ" : "Shipping & Fulfillment Speed",
      competitorBenchmark: isAr ? "4 - 6 أيام عمل مع رسوم شحن إضافية" : "4-6 business days with extra shipping fees",
      yourAdvantage: isAr ? "24 - 48 ساعة مع شحن مجاني للطلبات الكبيرة" : "24-48 hours with free express shipping",
      impact: isAr ? "+28% في معدل التحويل عند إتمام الطلب" : "+28% checkout conversion rate",
      icon: Truck,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: isAr ? "ضمان التجربة وكسر التردد" : "Risk-Free Trial & Guarantee",
      competitorBenchmark: isAr ? "سياسات استرجاع مقيدة (3 أيام وبدون عينات)" : "Strict 3-day policy with no samples",
      yourAdvantage: isAr ? "ضمان التجربة الذهبي 14 يوماً مع عينة مجانية خارجية" : "14-day Golden Guarantee with free external tester",
      impact: isAr ? "إزالة حاجز الخوف لدى 80% من المشترين الجدد" : "Eliminates buyer hesitation for 80% of new traffic",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: isAr ? "تنوع المحتوى والفيديو الإعلاني" : "Creative Diversity (UGC vs Static)",
      competitorBenchmark: isAr ? "إعلانات صور تقليدية مكررة تعاني من الإجهاد الإعلاني" : "Static stock images with high ad fatigue",
      yourAdvantage: isAr ? "مقاطع فيديو UGC عفوية وسريعة الإيقاع لفتح الصندوق" : "Dynamic, high-converting UGC unboxing reels",
      impact: isAr ? "انخفاض تكلفة النقر (CPC) بنسبة 35%" : "35% lower cost per click and higher CTR",
      icon: Play,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      title: isAr ? "هندسة العروض وسلة المشتريات" : "Offer Architecture & AOV",
      competitorBenchmark: isAr ? "خصومات نسبية فردية دون باقات هدايا" : "Standard single-item discounts",
      yourAdvantage: isAr ? "باقات هدايا ثلاثية + خيار الإهداء المباشر" : "Curated bundles + gift-ready delivery",
      impact: isAr ? "رفع متوسط قيمة السلة (AOV) بنسبة 40%" : "+40% Average Order Value boost",
      icon: Tag,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div>
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600" />
          <span>{isAr ? "مقارنة الفجوة التنافسية (Your Store vs Competitor Average):" : "Competitive Gap Analysis:"}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {isAr
            ? "كيف يمكنك الاستفادة من نقاط ضعف المنافسين للتميز واكتساب العملاء بأقل تكلفة."
            : "Strategic matrix showing how to beat competitor averages and capture higher profit margins."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl border border-line bg-white p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${m.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {m.title}
                </h4>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Competitor Average */}
                <div className="rounded-2xl bg-rose-50/60 border border-rose-100 p-3 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">
                      {isAr ? "متوسط المنافسين في السوق:" : "Competitor Average:"}
                    </span>
                    <p className="text-slate-700 font-medium mt-0.5">
                      {m.competitorBenchmark}
                    </p>
                  </div>
                </div>

                {/* Your Winning Move */}
                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-3 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      {isAr ? "استراتيجية تفوقك الموصى بها:" : "Your Advantage Strategy:"}
                    </span>
                    <p className="text-emerald-950 font-bold mt-0.5">
                      {m.yourAdvantage}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-line text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>{isAr ? "الأثر المالي المتوقع:" : "Expected Impact:"}</span>
                <span className="text-indigo-600 font-bold">{m.impact}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
