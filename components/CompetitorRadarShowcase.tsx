"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
  Radar,
  Flame,
  ShieldAlert,
  Swords,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  TrendingUp,
  Target,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";
import { enterHref } from "@/lib/auth/paths";

interface CompetitorPreview {
  id: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  country: string;
  flag: string;
  activeAdsCount: number;
  longestRunningDays: number;
  threatScore: number; // 0-100
  threatLevel: "critical" | "high" | "moderate";
  topAngleAr: string;
  topAngleEn: string;
  weaknessAr: string;
  weaknessEn: string;
  counterHookAr: string;
  counterHookEn: string;
}

const SAMPLE_COMPETITORS: CompetitorPreview[] = [
  {
    id: "comp-1",
    nameAr: "دار العود الملكي (سعودي/عماني)",
    nameEn: "Royal Oud House (KSA / OMN)",
    categoryAr: "العطور الفاخرة والبخور",
    categoryEn: "Luxury Fragrances & Oud",
    country: "OMN",
    flag: "🇴🇲",
    activeAdsCount: 14,
    longestRunningDays: 42,
    threatScore: 88,
    threatLevel: "critical",
    topAngleAr: "زاوية الثبات الأسطوري والفوحان مع شحن مجاني",
    topAngleEn: "Legendary Longevity & Projection with Free Shipping",
    weaknessAr: "شكاوى تأخر شحن المندوبين (5-7 أيام) ولا يوجد خيار تجربة عينة قبل فتح الزجاجة.",
    weaknessEn: "Slow courier delivery (5-7 days) & no sample vial to test before opening.",
    counterHookAr: "«عطر يوصلك خلال 24 ساعة + عينة تجربة مجانية: جرب أولاً وإن ما عجبك المندوب يرجعه فوراً!»",
    counterHookEn: "'Delivered in 24h + Free sample vial: try before opening, risk-free courier returns!'",
  },
  {
    id: "comp-2",
    nameAr: "أورا جادجتس الخليج",
    nameEn: "Aura GCC Gadgets",
    categoryAr: "إلكترونيات وكماليات سيارات",
    categoryEn: "Automotive & Smart Gadgets",
    country: "KSA",
    flag: "🇸🇦",
    activeAdsCount: 9,
    longestRunningDays: 31,
    threatScore: 74,
    threatLevel: "high",
    topAngleAr: "فيديو UGC مقارنة قبل وبعد لتنظيف وشحن السيارة",
    topAngleEn: "UGC Before/After Comparison Video for Car Detailing",
    weaknessAr: "سعر مرتفع جداً (ضعف سعر التوريد) بدون ضمان استبدال فوري عند التلف.",
    weaknessEn: "Overpriced markup without clear immediate replacement warranty.",
    counterHookAr: "«نفس قوة الأداء بسعر أقل 35% مع ضمان استبدال فوري عند باب بيتك والدفع عند الاستلام»",
    counterHookEn: "'Same high-spec gadget for 35% less + instant doorstep replacement warranty on COD.'",
  },
  {
    id: "comp-3",
    nameAr: "بوتيك سيلك روز",
    nameEn: "Silk Rose Boutique",
    categoryAr: "أزياء وعبايات خليجية",
    categoryEn: "Gulf Abayas & Luxury Fashion",
    country: "UAE",
    flag: "🇦🇪",
    activeAdsCount: 6,
    longestRunningDays: 19,
    threatScore: 56,
    threatLevel: "moderate",
    topAngleAr: "تصاميم كلاسيكية مع مؤثرين مشاهير",
    topAngleEn: "Classic Minimalist Cuts with Influencer Endorsements",
    weaknessAr: "عدم وضوح جدول المقاسات الدقيق وارتفاع نسبة الإرجاع بسبب المقاس الخاطئ.",
    weaknessEn: "Vague sizing chart leading to high sizing-related exchange rates.",
    counterHookAr: "«فيديو يوضح تفاصيل القماش والمقاس على أرض الواقع + استبدال مقاس مجاني خلال 48 ساعة»",
    counterHookEn: "'Real fit showcase video + 100% free size exchange delivered within 48 hours.'",
  },
];

export default function CompetitorRadarShowcase() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [activeCompetitorId, setActiveCompetitorId] = useState<string>("comp-1");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");

  const filteredCompetitors = SAMPLE_COMPETITORS.filter(
    (c) => selectedCountry === "ALL" || c.country === selectedCountry
  );

  const activeCompetitor =
    SAMPLE_COMPETITORS.find((c) => c.id === activeCompetitorId) || SAMPLE_COMPETITORS[0];

  return (
    <section id="competitor-radar" className="relative scroll-mt-24 py-section overflow-hidden">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/30 bg-signal/10 px-3 py-1 text-xs font-semibold text-signal">
              <Radar className="size-3.5 animate-pulse" />
              {isAr ? "ميزة جديدة: استخبارات السوق الخليجي" : "New: GCC Market Intelligence"}
            </span>
          </div>

          <h2 className="gl-heading mt-3 max-w-3xl text-balance text-display-lg">
            {isAr
              ? "رادار المنافسين: اعرف إعلاناتهم الرابحة واقتنص ثغراتهم قبل أن تطلق حملتك"
              : "Competitor Radar: Detect rival winning ads & white spaces before spending"}
          </h2>

          <p className="gl-lede mt-4 max-w-2xl text-frost-dim">
            {isAr
              ? "لا تصرف ميزانيتك على تخمينات عشوائية. راقب الحملات الإعلانية الصامدة لأكثر من 30 يوماً في الخليج، احسب مؤشر التهديد، واستخرج زوايا الهجوم المضاد المربحة فوراً."
              : "Never waste ad spend on guesswork. Track rival ads active for 30+ days across GCC, calculate Threat Scores, and deploy winning counter-attack hooks."}
          </p>
        </Reveal>

        <StageGlow className="mt-10" tone="signal">
          <div className="gl-stage p-4 sm:p-6 lg:p-8">
            {/* Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal ring-1 ring-signal/30">
                  <Radar className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-frost text-sm sm:text-base">
                    {isAr ? "محاكي رصد الإعلانات والمنافسين الحي" : "Live GCC Competitor Radar Simulator"}
                  </h3>
                  <p className="text-xs text-frost-dim">
                    {isAr
                      ? "رصد وتحليل 314+ حملة نشطة في عُمان، السعودية، والإمارات"
                      : "Monitoring 314+ active campaigns across Oman, KSA & UAE"}
                  </p>
                </div>
              </div>

              {/* Country filter */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface-lowest p-1">
                {[
                  { id: "ALL", label: isAr ? "كل الخليج" : "All GCC" },
                  { id: "OMN", label: "🇴🇲 عمان" },
                  { id: "KSA", label: "🇸🇦 السعودية" },
                  { id: "UAE", label: "🇦🇪 الإمارات" },
                ].map((country) => (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => setSelectedCountry(country.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      selectedCountry === country.id
                        ? "bg-signal text-signal-on shadow-sm"
                        : "text-frost-dim hover:text-frost"
                    }`}
                  >
                    {country.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Competitor Cards list */}
              <div className="space-y-3 lg:col-span-5">
                <p className="text-xs font-semibold text-frost-dim uppercase tracking-wider">
                  {isAr ? "المنافسون المرصودون في نطاقك:" : "Monitored Rivals in Your Niche:"}
                </p>

                {filteredCompetitors.map((comp) => {
                  const isSelected = comp.id === activeCompetitor.id;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setActiveCompetitorId(comp.id)}
                      className={`w-full text-start transition-all rounded-xl p-4 border flex flex-col gap-2 relative ${
                        isSelected
                          ? "bg-surface-elevated border-signal/50 ring-1 ring-signal/30 shadow-md"
                          : "bg-surface-lowest/60 border-line hover:border-frost-faint/30 hover:bg-surface-lowest"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{comp.flag}</span>
                          <div>
                            <p className="text-sm font-bold text-frost">
                              {isAr ? comp.nameAr : comp.nameEn}
                            </p>
                            <p className="text-xs text-frost-dim">
                              {isAr ? comp.categoryAr : comp.categoryEn}
                            </p>
                          </div>
                        </div>

                        <div className="text-end">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              comp.threatLevel === "critical"
                                ? "bg-danger/20 text-danger border border-danger/30"
                                : comp.threatLevel === "high"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-signal/20 text-signal border border-signal/30"
                            }`}
                          >
                            <ShieldAlert className="size-3" />
                            {isAr ? "تهديد" : "Threat"} {comp.threatScore}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-frost-dim border-t border-line/50 pt-2 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="size-3 text-frost-dim" />
                          {comp.activeAdsCount} {isAr ? "إعلانات نشطة" : "Active Ads"}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-amber-400">
                          <Flame className="size-3" />
                          {comp.longestRunningDays} {isAr ? "يوم صمود مستمر" : "Days Active"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Deep Intelligence & Battleplan Preview */}
              <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-line bg-surface-lowest p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{activeCompetitor.flag}</span>
                        <h4 className="text-base sm:text-lg font-bold text-frost">
                          {isAr ? activeCompetitor.nameAr : activeCompetitor.nameEn}
                        </h4>
                      </div>
                      <p className="text-xs text-frost-dim mt-0.5">
                        {isAr ? activeCompetitor.categoryAr : activeCompetitor.categoryEn} • {activeCompetitor.activeAdsCount} {isAr ? "حملات إعلانية متتبعة" : "Tracked ad sets"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
                      <Clock className="size-4 text-amber-400" />
                      <div>
                        <p className="text-[10px] text-amber-300 font-medium">
                          {isAr ? "مدة أطول إعلان نشط (Winner)" : "Longevity Index"}
                        </p>
                        <p className="text-xs font-bold text-amber-200">
                          {activeCompetitor.longestRunningDays} {isAr ? "يوماً متواصلاً 🔥" : "Days Active 🔥"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Intelligence breakdown */}
                  <div className="mt-5 space-y-4">
                    {/* Angle */}
                    <div className="rounded-xl bg-surface-elevated/70 border border-line p-3.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-frost">
                        <Target className="size-3.5 text-signal" />
                        <span>{isAr ? "الزاوية التسويقية الأساسية للمنافس:" : "Primary Marketing Angle:"}</span>
                      </div>
                      <p className="mt-1.5 text-xs sm:text-sm text-frost-dim leading-relaxed">
                        {isAr ? activeCompetitor.topAngleAr : activeCompetitor.topAngleEn}
                      </p>
                    </div>

                    {/* Weakness Hunter */}
                    <div className="rounded-xl bg-danger/10 border border-danger/25 p-3.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-danger">
                        <AlertTriangle className="size-3.5" />
                        <span>{isAr ? "صياد الثغرات (Weakness Hunter):" : "Exploitable Weakness:"}</span>
                      </div>
                      <p className="mt-1.5 text-xs sm:text-sm text-frost leading-relaxed">
                        {isAr ? activeCompetitor.weaknessAr : activeCompetitor.weaknessEn}
                      </p>
                    </div>

                    {/* Counter Strategy Battleplan */}
                    <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-4">
                      <div className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <Swords className="size-4" />
                          {isAr ? "خطة الهجوم المضاد المقترحة (Counter-Hook):" : "Counter-Strategy Winning Hook:"}
                        </span>
                        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                          AI Battleplan
                        </span>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm font-medium text-emerald-100 leading-relaxed">
                        {isAr ? activeCompetitor.counterHookAr : activeCompetitor.counterHookEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <p className="text-xs text-frost-dim">
                    {isAr
                      ? "استكشف الكلمات المفتاحية، الفجوات السوقية، وتقرير التهديد المالي الكامل."
                      : "Explore real-time keywords, white spaces, and full competitor threat audits."}
                  </p>

                  <Link
                    href="/dashboard/competitor-radar"
                    className="inline-flex items-center gap-2 gl-btn-primary !min-h-10 !py-2 !px-5 !text-xs font-bold shadow-md"
                  >
                    <Radar className="size-4" />
                    <span>{isAr ? "فتح رادار المنافسين بالكامل" : "Launch Full Competitor Radar"}</span>
                    <ArrowIcon className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </StageGlow>
      </div>
    </section>
  );
}
