"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Sparkles,
  Layers,
  Truck,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

interface BenchmarkCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  storesAnalyzed: number;
  avgGrossRevenue: string;
  avgLeakDiscovered: string;
  avgLeakPercent: string;
  avgCodDiscrepancy: string;
  avgRtoRate: string;
  avgLosingAdRate: string;
  marginBefore: string;
  marginAfter: string;
  topRecoveryCaseAr: string;
  topRecoveryCaseEn: string;
}

const BENCHMARKS: BenchmarkCategory[] = [
  {
    id: "perfumes",
    nameAr: "عطور، لبان ودهن عود",
    nameEn: "Perfumes & Frankincense",
    storesAnalyzed: 48,
    avgGrossRevenue: "8,400 ر.ع. / شهر",
    avgLeakDiscovered: "1,180 ر.ع. / شهر",
    avgLeakPercent: "14.0%",
    avgCodDiscrepancy: "340 ر.ع.",
    avgRtoRate: "16.4%",
    avgLosingAdRate: "24.5%",
    marginBefore: "18.2%",
    marginAfter: "31.5%",
    topRecoveryCaseAr: "متجر #OM-318 (مسقط): استرداد 1,420 ر.ع. فروقات كشوفات شحن متأخرة وإيقاف 3 حملات خاسرة.",
    topRecoveryCaseEn: "Store #OM-318 (Muscat): Recovered 1,420 OMR in delayed courier remittances and killed 3 negative ROAS ad sets.",
  },
  {
    id: "fashion",
    nameAr: "عبايات وأزياء خليجية",
    nameEn: "Abayas & GCC Fashion",
    storesAnalyzed: 62,
    avgGrossRevenue: "12,600 ر.ع. / شهر",
    avgLeakDiscovered: "2,140 ر.ع. / شهر",
    avgLeakPercent: "17.0%",
    avgCodDiscrepancy: "610 ر.ع.",
    avgRtoRate: "21.8%",
    avgLosingAdRate: "28.0%",
    marginBefore: "14.5%",
    marginAfter: "29.8%",
    topRecoveryCaseAr: "علامة #OM-804 (صحار): خفض كلفة المرتجع بنسبة 40% وإعادة تسعير 6 منتجات ذات هامش سلبي.",
    topRecoveryCaseEn: "Brand #OM-804 (Sohar): Cut RTO waste by 40% and repriced 6 negative-margin custom pieces.",
  },
  {
    id: "beauty",
    nameAr: "عناية، تجميل ومكملات",
    nameEn: "Beauty & Personal Care",
    storesAnalyzed: 39,
    avgGrossRevenue: "6,900 ر.ع. / شهر",
    avgLeakDiscovered: "980 ر.ع. / شهر",
    avgLeakPercent: "14.2%",
    avgCodDiscrepancy: "290 ر.ع.",
    avgRtoRate: "12.5%",
    avgLosingAdRate: "19.0%",
    marginBefore: "22.0%",
    marginAfter: "36.2%",
    topRecoveryCaseAr: "متجر #OM-512 (صلالة): كشف تكرار رسوم الشحن على الشحنات المرتجعة من شركة التوصيل.",
    topRecoveryCaseEn: "Store #OM-512 (Salalah): Exposed duplicate courier return fees and reclaimed 680 OMR.",
  },
  {
    id: "electronics",
    nameAr: "إلكترونيات وقهوة مختصة",
    nameEn: "Gadgets & Specialty Coffee",
    storesAnalyzed: 31,
    avgGrossRevenue: "15,200 ر.ع. / شهر",
    avgLeakDiscovered: "1,890 ر.ع. / شهر",
    avgLeakPercent: "12.4%",
    avgCodDiscrepancy: "780 ر.ع.",
    avgRtoRate: "14.1%",
    avgLosingAdRate: "22.3%",
    marginBefore: "11.8%",
    marginAfter: "24.1%",
    topRecoveryCaseAr: "موزع #OM-902 (نزوى): ضبط تكلفة شحن الأوزان الثقيلة ومطابقة بوليصات الدفع عند الاستلام المعلقة.",
    topRecoveryCaseEn: "Distributor #OM-902 (Nizwa): Fixed heavy freight surcharge errors and matched 84 unsettled COD orders.",
  },
];

export default function AnonymizedBenchmark() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [selectedId, setSelectedId] = useState<string>("perfumes");

  const current = BENCHMARKS.find((b) => b.id === selectedId) || BENCHMARKS[0];

  return (
    <section id="benchmarks" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-signal mb-2">
            <Lock className="h-3.5 w-3.5" />
            <span>{isAr ? "بيانات حقيقية مجهولة الهوية" : "Anonymized Real Store Benchmarks"}</span>
          </div>
          <h2 className="gl-heading text-display-md sm:text-display-lg max-w-2xl text-balance">
            {isAr
              ? "مؤشرات السوق الحقيقية: أين تختفي أرباح المتاجر الشبيهة بمتجرك؟"
              : "Real Market Benchmarks: Where does profit vanish in stores like yours?"}
          </h2>
          <p className="gl-lede mt-3 max-w-2xl text-balance">
            {isAr
              ? "تحليل مالي تراكمي لأكثر من 180 متجراً إلكترونياً في سلطنة عُمان والخليج العربي، يكشف متوسط التسريبات وهوامش الربح الحقيقية قبل وبعد التدقيق."
              : "Aggregated financial audits across 180+ verified GCC e-commerce stores showing typical profit leaks before and after reconciliation."}
          </p>
        </Reveal>

        {/* Category Pill Selector */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {BENCHMARKS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedId(b.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                selectedId === b.id
                  ? "bg-signal text-white shadow-md shadow-signal/20 scale-[1.02]"
                  : "border border-line bg-surface hover:bg-surface-raised text-frost-dim hover:text-frost"
              }`}
            >
              {isAr ? b.nameAr : b.nameEn}
            </button>
          ))}
        </div>

        {/* Main Benchmark Display Board */}
        <StageGlow className="mt-6" tone="sky">
          <div className="gl-stage p-5 sm:p-8 rounded-3xl border border-line bg-surface/95 backdrop-blur-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Key Stats Breakdown (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-line">
                  <div>
                    <h3 className="text-lg font-bold text-frost">
                      {isAr ? current.nameAr : current.nameEn}
                    </h3>
                    <p className="text-xs text-frost-dim mt-0.5">
                      {isAr
                        ? `بناءً على تدقيق مالي لـ ${current.storesAnalyzed} متجراً نشطاً`
                        : `Based on verified audits across ${current.storesAnalyzed} active merchant stores`}
                    </p>
                  </div>
                  <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                    {isAr ? "بيانات موثقة" : "Verified GCC Data"}
                  </span>
                </div>

                {/* Metric Bento Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="gl-tile p-3.5">
                    <p className="text-[11px] text-frost-dim">{isAr ? "متوسط المبيعات" : "Avg Revenue"}</p>
                    <p className="mt-1 text-base sm:text-lg font-bold font-mono text-frost">
                      {current.avgGrossRevenue}
                    </p>
                  </div>

                  <div className="gl-tile p-3.5 bg-rose-950/20 border-rose-500/30">
                    <p className="text-[11px] text-rose-300">{isAr ? "متوسط التسريب الشهري" : "Avg Leaked Cash"}</p>
                    <p className="mt-1 text-base sm:text-lg font-bold font-mono text-rose-400">
                      {current.avgLeakDiscovered}
                    </p>
                    <p className="text-[10px] text-rose-400/80 mt-0.5 font-bold">
                      {current.avgLeakPercent} {isAr ? "من إجمالي الدخل" : "of turnover"}
                    </p>
                  </div>

                  <div className="gl-tile p-3.5">
                    <p className="text-[11px] text-frost-dim">{isAr ? "فروقات تسوية الشحن" : "COD Shortfall"}</p>
                    <p className="mt-1 text-base sm:text-lg font-bold font-mono text-amber-400">
                      {current.avgCodDiscrepancy}
                    </p>
                    <p className="text-[10px] text-frost-faint mt-0.5">{isAr ? "مفقودة شهرياً" : "lost monthly"}</p>
                  </div>

                  <div className="gl-tile p-3.5">
                    <p className="text-[11px] text-frost-dim">{isAr ? "نسبة المرتجع RTO" : "RTO Return Rate"}</p>
                    <p className="mt-1 text-base sm:text-lg font-bold font-mono text-frost">
                      {current.avgRtoRate}
                    </p>
                  </div>

                  <div className="gl-tile p-3.5">
                    <p className="text-[11px] text-frost-dim">{isAr ? "إعلانات خاسرة" : "Losing Ad Sets"}</p>
                    <p className="mt-1 text-base sm:text-lg font-bold font-mono text-indigo-400">
                      {current.avgLosingAdRate}
                    </p>
                    <p className="text-[10px] text-frost-faint mt-0.5">{isAr ? "دون هامش ربح" : "negative ROAS"}</p>
                  </div>

                  <div className="gl-tile p-3.5 bg-emerald-950/20 border-emerald-500/30">
                    <p className="text-[11px] text-emerald-300">{isAr ? "قفزة الهامش الصافي" : "Net Margin Lift"}</p>
                    <p className="mt-1 text-base sm:text-lg font-bold font-mono text-emerald-400">
                      {current.marginBefore} → {current.marginAfter}
                    </p>
                    <p className="text-[10px] text-emerald-400/80 mt-0.5 font-bold">{isAr ? "بعد سد التسريبات" : "post-audit"}</p>
                  </div>
                </div>

                {/* Case Study Evidence Banner */}
                <div className="rounded-2xl border border-line bg-surface-raised p-4 flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-signal/10 text-signal border border-signal/20">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-frost">
                      {isAr ? "حالة تدقيق حقيقية موثقة:" : "Verified Audit Case:"}
                    </p>
                    <p className="text-xs text-frost-dim mt-1 leading-relaxed">
                      {isAr ? current.topRecoveryCaseAr : current.topRecoveryCaseEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Margin Shift Comparison (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-line bg-surface-raised p-6 flex flex-col justify-between h-full space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-frost-dim">
                    {isAr ? "مقارنة صافي الربح الفعلي" : "Real Net Margin Transformation"}
                  </span>
                  <h4 className="text-base font-bold text-frost mt-1">
                    {isAr ? "أثر التدقيق على أرباح المتجر في الجيب" : "Impact of Eliminating Profit Leaks"}
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* Before */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-frost-dim">
                      <span>{isAr ? "قبل التدقيق (مع التسريبات)" : "Before (With Silent Leaks)"}</span>
                      <span className="text-rose-400 font-bold">{current.marginBefore}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-surface border border-line overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500/60"
                        style={{ width: current.marginBefore }}
                      ></div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-frost-dim">
                      <span className="text-emerald-400 font-bold">{isAr ? "بعد تدقيق Growlab ومطابقة الشحن" : "After Growlab Reconciliation"}</span>
                      <span className="text-emerald-400 font-bold">{current.marginAfter}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-surface border border-line overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: current.marginAfter }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-surface p-3.5 text-xs text-frost-dim leading-relaxed">
                  <span className="font-bold text-frost">
                    {isAr ? "لماذا لا تكتشف ذلك لوحات الإعلانات؟" : "Why do ad platforms miss this?"}
                  </span>{" "}
                  {isAr
                    ? "لأن Meta وGoogle وSnapchat تحسب الإيراد الظاهري فقط، ولا تعرف مرتجعات الشحن، تكلفة المنتجات الحقيقية، أو تأخيرات تسليم نقد الـ COD."
                    : "Ad networks only track raw ROAS and ignore shipping returns, unit COGS, and courier payment shortfalls."}
                </div>
              </div>
            </div>
          </div>
        </StageGlow>
      </div>
    </section>
  );
}
