"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
  Radar,
  Search,
  SlidersHorizontal,
  Sparkles,
  Flame,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Globe,
  Layers,
  BarChart3,
  Lightbulb,
  Crosshair,
  Zap,
  Info,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronDown,
  TrendingUp,
  Compass,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";
import CompetitorCard from "./CompetitorCard";
import CompetitorDetailDrawer from "./CompetitorDetailDrawer";
import CounterStrategyBattleplanView from "./CounterStrategyBattleplan";
import WeaknessHunterGrid from "./WeaknessHunterGrid";
import MarketOpportunitiesView from "./MarketOpportunitiesView";
import CompetitiveGapVisualizer from "./CompetitiveGapVisualizer";
import { scanCompetitorsAction, getCounterStrategyAction } from "@/lib/radar/actions";
import type { TargetMarket, AdPlatform, CounterStrategyBattleplan } from "@/lib/radar/types";

const MARKETS: Array<{ code: TargetMarket; labelAr: string; labelEn: string; flag: string }> = [
  { code: "OM", labelAr: "سلطنة عُمان", labelEn: "Oman", flag: "🇴🇲" },
  { code: "SA", labelAr: "المملكة العربية السعودية", labelEn: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", labelAr: "الإمارات العربية المتحدة", labelEn: "United Arab Emirates", flag: "🇦🇪" },
  { code: "KW", labelAr: "الكويت", labelEn: "Kuwait", flag: "🇰🇼" },
  { code: "QA", labelAr: "قطر", labelEn: "Qatar", flag: "🇶🇦" },
  { code: "BH", labelAr: "البحرين", labelEn: "Bahrain", flag: "🇧🇭" },
  { code: "ALL", labelAr: "كل دول الخليج", labelEn: "All GCC", flag: "🌐" },
];

const PLATFORMS: Array<{ id: AdPlatform; name: string; color: string }> = [
  { id: "meta", name: "Meta (IG & FB)", color: "text-sky-600 bg-sky-50 border-sky-200" },
  { id: "tiktok", name: "TikTok Ads", color: "text-pink-600 bg-pink-50 border-pink-200" },
  { id: "snapchat", name: "Snapchat Ads", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "google", name: "Google & YouTube", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

const QUICK_SUGGESTIONS = [
  { ar: "عطور لبان", en: "Frankincense Perfume" },
  { ar: "عبايات راقية", en: "Luxury Abayas" },
  { ar: "سيروم تفتيح", en: "Brightening Serum" },
  { ar: "قهوة مختصة", en: "Specialty Coffee" },
  { ar: "تمور فاخرة", en: "Premium Dates" },
];

export default function CompetitorRadarView() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Search form state
  const [keyword, setKeyword] = useState("عطور لبان");
  const [selectedMarket, setSelectedMarket] = useState<TargetMarket>("OM");
  const [selectedPlatforms, setSelectedPlatforms] = useState<AdPlatform[]>(["meta", "tiktok"]);
  const [isLoading, setIsLoading] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);

  // Active view tab state
  const [activeTab, setActiveTab] = useState<"competitors" | "battleplan" | "weaknesses" | "opportunities" | "gap">("competitors");
  const [tierFilter, setTierFilter] = useState<"all" | "direct" | "potential">("all");

  // Intelligence Results state
  const [projectData, setProjectData] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [battleplan, setBattleplan] = useState<CounterStrategyBattleplan | null>(null);
  const [inspectingCompetitor, setInspectingCompetitor] = useState<any | null>(null);

  function togglePlatform(platform: AdPlatform) {
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  }

  async function handleSearch(e?: React.FormEvent, customKw?: string) {
    if (e) e.preventDefault();
    const queryKw = customKw || keyword;
    if (!queryKw.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setScanStep(isAr ? "الاتصال بمكتبات إعلانات Meta و TikTok..." : "Querying Meta & TikTok Ad Archives...");

    try {
      setTimeout(() => {
        setScanStep(isAr ? "تحليل الخطافات الإعلانية ونسب النشاط..." : "Analyzing creative hooks & spend velocity...");
      }, 700);

      setTimeout(() => {
        setScanStep(isAr ? "حساب مؤشرات التهديد (Threat Score) ونقاط الضعف..." : "Calculating Threat Scores & weaknesses...");
      }, 1400);

      const result = await scanCompetitorsAction(queryKw, selectedMarket, selectedPlatforms);

      setProjectData(result.project);
      const comps = result.competitors || [];
      setCompetitors(comps);
      setOpportunities(result.opportunities || []);

      // Generate Counter Strategy Battleplan
      const bp = await getCounterStrategyAction(queryKw, comps);
      setBattleplan(bp);
    } catch (err: any) {
      console.error("Scan error:", err);
    } finally {
      setIsLoading(false);
      setScanStep("");
    }
  }

  const filteredCompetitors = competitors.filter((c) => {
    if (tierFilter === "all") return true;
    return c.tier === tierFilter;
  });

  return (
    <div className="space-y-8 text-slate-900 pb-16" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Banner & Header */}
      <div className="rounded-3xl border border-line bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-2xs">
              <Radar className="h-6 w-6 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {isAr ? "رادار التعمين والامتثال الذكي" : "Omanization & Compliance Radar"}
                </h1>
                <span className="rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                  PRO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {isAr
                  ? "متابعة نسب التعمين والامتثال التنظيمي، رصد الأنشطة المحظورة وتفادي الغرامات الوزارية بذكاء"
                  : "Track Omanization quotas, monitor regulatory compliance, identify restricted activities, and prevent fines"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <div className="flex items-center gap-1.5 rounded-xl border border-line bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-semibold text-slate-800">{isAr ? "الرادار نشط" : "Radar Online"}</span>
            </div>
            <Link
              href="/dashboard?tab=financial_analytics"
              className="gl-btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1.5"
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isAr ? "صافي الأرباح" : "Profit Engine"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Search & Radar Control Stage */}
      <StageGlow tone="dusk" className="w-full">
        <div className="gl-stage p-5 sm:p-7 rounded-3xl border border-line bg-white/95 backdrop-blur-md shadow-lg">
          <form onSubmit={handleSearch} className="space-y-5">
            {/* Main Input Row */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={
                    isAr
                      ? "أدخل اسم المنتج، المجال، أو اسم منافس (مثال: عطور لبان، عبايات، قهوة مختصة)..."
                      : "Enter product, niche, or competitor brand (e.g. Frankincense perfumes, specialty coffee)..."
                  }
                  className="w-full rounded-2xl border border-line bg-slate-50/70 py-3.5 ps-12 pe-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !keyword.trim()}
                className="gl-btn-primary flex items-center justify-center gap-2 !py-3.5 !px-6 !text-sm whitespace-nowrap shadow-sm disabled:opacity-60 font-bold"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{isAr ? "جاري المسح والتحليل..." : "Scanning Market..."}</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="h-4 w-4" />
                    <span>{isAr ? "تشغيل مسح الرادار" : "Scan Competitors"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Filter Bar: Market + Platforms + Quick Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-line">
              {/* Target Market */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{isAr ? "السوق المستهدف:" : "Target GCC Market:"}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MARKETS.map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => setSelectedMarket(m.code)}
                      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                        selectedMarket === m.code
                          ? "bg-slate-900 text-white shadow-2xs font-bold"
                          : "border border-line bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span>{m.flag}</span>
                      <span>{isAr ? m.labelAr : m.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Filter */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{isAr ? "منصات الإعلانات:" : "Ad Networks:"}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map((p) => {
                    const isSelected = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition ${
                          isSelected
                            ? p.color + " font-bold shadow-2xs"
                            : "border-line bg-slate-50 text-slate-400 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Suggestions Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                {isAr ? "مقترحات سريعة:" : "Quick Ideas:"}
              </span>
              {QUICK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const kw = isAr ? item.ar : item.en;
                    setKeyword(kw);
                    handleSearch(undefined, kw);
                  }}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-xs text-slate-700 transition"
                >
                  {isAr ? item.ar : item.en}
                </button>
              ))}
            </div>
          </form>
        </div>
      </StageGlow>

      {/* Loading Scanning State */}
      {isLoading && (
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-8 sm:p-12 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 mb-4 animate-bounce">
            <Radar className="h-8 w-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {isAr ? "جاري مسح وتحليل ساحة المنافسين..." : "Scanning & Decrypting Competitor Field..."}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-mono text-indigo-700 animate-pulse">
            {scanStep}
          </p>

          <div className="mt-6 max-w-md mx-auto h-2 w-full rounded-full bg-indigo-200/60 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {/* Results View */}
      {hasSearched && !isLoading && (
        <div className="space-y-6">
          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("competitors")}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "competitors"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-line text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Crosshair className="h-4 w-4" />
                <span>
                  {isAr ? "قائمة المنافسين" : "Competitors"} ({competitors.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("battleplan")}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "battleplan"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-line text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Zap className="h-4 w-4 text-amber-300" />
                <span>{isAr ? "خطة الهجوم المضاد" : "Counter Battleplan"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("weaknesses")}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "weaknesses"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-line text-slate-600 hover:bg-slate-100"
                }`}
              >
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                <span>{isAr ? "مصفوفة نقاط الضعف" : "Weakness Matrix"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("opportunities")}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "opportunities"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-line text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Compass className="h-4 w-4 text-emerald-300" />
                <span>{isAr ? "الفرص الشاغرة" : "White Spaces"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("gap")}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "gap"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-line text-slate-600 hover:bg-slate-100"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>{isAr ? "مقارنة الفجوة" : "Competitive Gap"}</span>
              </button>
            </div>

            {/* Sub Filter for Competitors tab */}
            {activeTab === "competitors" && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setTierFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    tierFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  {isAr ? "الكل" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setTierFilter("direct")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    tierFilter === "direct" ? "bg-white text-rose-700 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  {isAr ? "مباشر" : "Direct"}
                </button>
                <button
                  type="button"
                  onClick={() => setTierFilter("potential")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    tierFilter === "potential" ? "bg-white text-amber-700 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  {isAr ? "محتمل" : "Potential"}
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: COMPETITORS GRID */}
          {activeTab === "competitors" && (
            <div className="space-y-6">
              {filteredCompetitors.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-10 text-center text-slate-500">
                  {isAr ? "لم يتم العثور على منافسين يطابقون هذا الفلتر." : "No competitors matched this filter."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCompetitors.map((comp) => (
                    <CompetitorCard
                      key={comp.id || comp.name}
                      competitor={comp}
                      onInspect={(c) => setInspectingCompetitor(c)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COUNTER STRATEGY BATTLEPLAN */}
          {activeTab === "battleplan" && battleplan && (
            <CounterStrategyBattleplanView
              battleplan={battleplan}
              productKeyword={keyword}
            />
          )}

          {/* TAB 3: WEAKNESS HUNTER GRID */}
          {activeTab === "weaknesses" && (
            <WeaknessHunterGrid
              competitors={competitors}
              onInspectCompetitor={(c) => setInspectingCompetitor(c)}
            />
          )}

          {/* TAB 4: MARKET WHITE SPACES */}
          {activeTab === "opportunities" && (
            <MarketOpportunitiesView
              opportunities={opportunities}
              productKeyword={keyword}
            />
          )}

          {/* TAB 5: COMPETITIVE GAP VISUALIZER */}
          {activeTab === "gap" && (
            <CompetitiveGapVisualizer competitors={competitors} />
          )}
        </div>
      )}

      {/* Empty State (Before Search) */}
      {!hasSearched && !isLoading && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-line text-slate-400 shadow-2xs mb-4">
            <Crosshair className="h-7 w-7 text-indigo-500" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {isAr ? "لم يتم تشغيل مسح بعد" : "No Radar Scan Initiated Yet"}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {isAr
              ? "اكتب اسم منتجك أو مجالك أعلاه لبدء استخراج المنافسين، تفكيك إعلاناتهم، واكتشاف الثغرات في عروضهم."
              : "Type your product name or category above to reveal rival ad campaigns, creative hooks, and weaknesses."}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-start rtl:text-right">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mb-2">
                <Flame className="h-4 w-4" />
              </span>
              <p className="text-xs font-bold text-slate-900">
                {isAr ? "1. كشف الإعلانات الرابحة" : "1. Winning Ad Formats"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {isAr ? "معرفة الإعلانات التي تستمر بالصرف لأكثر من 30 يوماً." : "Spot campaigns running 30+ days without fatigue."}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 mb-2">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <p className="text-xs font-bold text-slate-900">
                {isAr ? "2. صيد نقاط الضعف" : "2. Weakness Hunter"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {isAr ? "استخراج العيوب في عروضهم، التوصيل، وثقة العملاء." : "Extract offer friction, slow delivery, and trust gaps."}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-2">
                <Zap className="h-4 w-4" />
              </span>
              <p className="text-xs font-bold text-slate-900">
                {isAr ? "3. خطة الهجوم المضاد" : "3. Counter Strategy"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {isAr ? "توليد خطافات إعلانية وعروض تتفوق على نقاط ضعفهم." : "Generate superior hooks and offers to win their customers."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deep Competitor Detail Drawer Modal */}
      {inspectingCompetitor && (
        <CompetitorDetailDrawer
          competitor={inspectingCompetitor}
          onClose={() => setInspectingCompetitor(null)}
        />
      )}
    </div>
  );
}
