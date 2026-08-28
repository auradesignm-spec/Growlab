"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import type { MerchantProductRow } from "@/lib/dashboard/merchant";
import type { ChannelRadarAnalysisResult, PlatformDemandMetric } from "@/lib/services/channelDemandAnalyzer";

interface AdChannelDemandRadarProps {
  products: MerchantProductRow[];
  locale: string;
  onNavigateTab?: (tab: "products" | "campaign" | "store" | "simulator" | "analytics" | "ad_radar") => void;
  preselectedProductId?: string;
}

export default function AdChannelDemandRadar({
  products,
  locale,
  onNavigateTab,
  preselectedProductId,
}: AdChannelDemandRadarProps) {
  const isAr = locale !== "en";
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProductId || products[0]?.id || "custom"
  );

  // Custom product state
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState("تجميل وعطور");
  const [customPrice, setCustomPrice] = useState<number>(18);
  const [targetMarket, setTargetMarket] = useState("عُمان والخليج (Oman & GCC)");
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<string>("all");

  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [copiedHook, setCopiedHook] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<ChannelRadarAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-run analysis for first product or preselected
  useEffect(() => {
    const initialProd = products.find((p) => p.id === (preselectedProductId || products[0]?.id));
    const title = initialProd?.title || "سيروم التفتيح والنضارة الفورية";
    const category = initialProd?.category || "عناية وتجميل";
    const price = initialProd?.basePrice ?? 16;

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/marketing/channel-radar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productTitle: title,
            productCategory: category,
            priceOmr: price,
            targetMarket,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to analyze channel demand");
        }

        const data: ChannelRadarAnalysisResult = await res.json();
        setAnalysisResult(data);
      } catch (err: any) {
        console.error("Error analyzing channel demand:", err);
        setError(err?.message || (isAr ? "تعذر تحليل مؤشرات القنوات حالياً" : "Failed to analyze channels"));
      }
    });
  }, [preselectedProductId, products, targetMarket, isAr]);

  async function runAnalysisForProduct(title: string, category: string, price: number) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/marketing/channel-radar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productTitle: title,
            productCategory: category,
            priceOmr: price,
            targetMarket,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to analyze channel demand");
        }

        const data: ChannelRadarAnalysisResult = await res.json();
        setAnalysisResult(data);
      } catch (err: any) {
        console.error("Error analyzing channel demand:", err);
        setError(err?.message || (isAr ? "تعذر تحليل مؤشرات القنوات حالياً" : "Failed to analyze channels"));
      }
    });
  }

  function handleProductChange(prodId: string) {
    setSelectedProductId(prodId);
    if (prodId === "custom") {
      return;
    }
    const found = products.find((p) => p.id === prodId);
    if (found) {
      runAnalysisForProduct(found.title, found.category || "عام", found.basePrice);
    }
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customTitle.trim()) return;
    runAnalysisForProduct(customTitle.trim(), customCategory, customPrice);
  }

  function handleCopy(text: string, type: "kw" | "hook") {
    navigator.clipboard.writeText(text);
    if (type === "kw") {
      setCopiedKeyword(text);
      setTimeout(() => setCopiedKeyword(null), 2000);
    } else {
      setCopiedHook(true);
      setTimeout(() => setCopiedHook(false), 2000);
    }
  }

  const chartData = (analysisResult?.platforms || []).map((p) => ({
    name: isAr ? p.nameAr : p.name,
    shortName: p.name,
    demandScore: p.demandSurgeScore,
    budgetShare: p.recommendedBudgetShare,
    growth: p.trendGrowthPercent,
    roas: p.estimatedROAS,
    id: p.id,
  }));

  const filteredPlatforms =
    selectedPlatformTab === "all"
      ? analysisResult?.platforms || []
      : (analysisResult?.platforms || []).filter((p) => p.id === selectedPlatformTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Strategy Pitch */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 via-slate-900/70 to-slate-950 p-6 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span>{isAr ? "محلل الذكاء الاصطناعي لاختيار المنصة الأنسب" : "AI Multi-Platform Demand Radar"}</span>
              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">API Live</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {isAr ? "رادار كشف أعلى المنصات طلباً لمنتجك" : "Find The Highest-Demand Ad Channel"}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
              {isAr
                ? "يحلل محرك الذكاء الاصطناعي عمليات البحث الحية عبر تيك توك، سناب شات، إنستغرام، وجوجل لتوجيه ميزانيتك وصناع المحتوى نحو المنصة ذات أعلى تدفق طلب وعائد استثماري (ROAS)."
                : "Analyzes live search queries, hashtag velocity, and intent across TikTok, Snapchat, Instagram, and Google to pick your highest ROAS advertising channel."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("campaign")}
                className="gl-btn-primary !min-h-10 !py-2 !px-4 !text-xs"
              >
                {isAr ? "إطلاق حملة للمنصة الفائزة" : "Launch Creator Campaign"}
              </button>
            )}
          </div>
        </div>

        {/* Product Selection Bar */}
        <div className="relative z-10 mt-6 border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">{isAr ? "اختر منتجاً للتحليل:" : "Select Product:"}</span>
            {products.slice(0, 6).map((prod) => {
              const active = selectedProductId === prod.id;
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleProductChange(prod.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border border-indigo-400 bg-indigo-500/30 text-white shadow-sm"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {prod.title} ({prod.basePrice} OMR)
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleProductChange("custom")}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedProductId === "custom"
                  ? "border border-pink-400 bg-pink-500/30 text-white shadow-sm"
                  : "border border-dashed border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {isAr ? "+ فحص منتج جديد مخصص" : "+ Test Custom Idea"}
            </button>
          </div>

          {/* Custom product form */}
          {selectedProductId === "custom" && (
            <form onSubmit={handleCustomSubmit} className="mt-4 rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isAr ? "اسم المنتج / الكلمة الرئيسية" : "Product Title"}
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={isAr ? "مثال: مكنسة ذكية لاسلكية" : "e.g. Cordless Smart Vacuum"}
                    className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isAr ? "الصنف والتصنيف" : "Category"}
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder={isAr ? "مثال: أدوات منزلية وإلكترونيات" : "e.g. Home Gadgets"}
                    className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isAr ? "سعر البيع المقترح (ر.ع)" : "Target Price (OMR)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isPending || !customTitle.trim()}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {isPending ? (isAr ? "جاري التحليل..." : "Analyzing...") : (isAr ? "تحليل الطلب الفوري" : "Run AI Analysis")}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Loading state indicator */}
      {isPending && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50/50 p-8 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <div className="relative mb-3 flex h-12 w-12 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              AI
            </span>
          </div>
          <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
            {isAr ? "جاري مسح مؤشرات البحث والطلب عبر 6 منصات رئيسية..." : "Scanning search trends across 6 ad channels..."}
          </h3>
          <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-400">
            {isAr
              ? "يتم تحليل خوارزميات TikTok و Snapchat و Google و Instagram وتحديد أنسب زاوية تسويقية وميزانية."
              : "Evaluating viral search velocity, audience demographic fit, and estimated ROAS."}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Analysis Content */}
      {analysisResult && !isPending && (
        <div className="space-y-6">
          {/* Winner Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-indigo-950/90 p-6 text-white shadow-xl">
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-400 px-3 py-0.5 text-xs font-extrabold text-slate-950 shadow-sm">
                    {isAr ? "المنصة الفائزة رقم 1" : "Winner #1 Recommended Platform"}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                    {isAr ? `طلب متزايد +${analysisResult.winnerPlatform.trendGrowthPercent}%` : `+${analysisResult.winnerPlatform.trendGrowthPercent}% Demand Growth`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-white sm:text-3xl">
                    {isAr ? analysisResult.winnerPlatform.nameAr : analysisResult.winnerPlatform.name}
                  </h3>
                  <span className="rounded-xl bg-white/10 px-3 py-1 text-xs font-bold text-amber-300">
                    {isAr ? `تخصيص ${analysisResult.winnerPlatform.recommendedBudgetShare}% من الميزانية` : `${analysisResult.winnerPlatform.recommendedBudgetShare}% Budget Share`}
                  </span>
                </div>

                <p className="max-w-2xl text-sm leading-relaxed text-slate-200">
                  {isAr ? analysisResult.winnerPlatform.summaryAr : analysisResult.winnerPlatform.summaryEn}
                </p>

                {/* Key Metrics row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
                  <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                    <p className="text-[11px] text-slate-400">{isAr ? "مؤشر الطلب والبحث" : "Demand Surge"}</p>
                    <p className="text-lg font-bold text-emerald-400">{analysisResult.winnerPlatform.demandSurgeScore} / 100</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                    <p className="text-[11px] text-slate-400">{isAr ? "العائد المتوقع (ROAS)" : "Est. ROAS"}</p>
                    <p className="text-lg font-bold text-amber-300">{analysisResult.platforms[0]?.estimatedROAS || "4.2x"}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                    <p className="text-[11px] text-slate-400">{isAr ? "الكلمة الأكثر بحثاً" : "Top Keyword"}</p>
                    <p className="truncate text-xs font-semibold text-indigo-300" title={analysisResult.marketInsights.topSurgingKeyword}>
                      {analysisResult.marketInsights.topSurgingKeyword}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                    <p className="text-[11px] text-slate-400">{isAr ? "وقت الذروة" : "Peak Hours"}</p>
                    <p className="text-xs font-semibold text-slate-200">{analysisResult.marketInsights.bestTimeToAdvertise.split(" ")[0]} مساءً</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 shrink-0">
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("campaign")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg transition hover:bg-emerald-400"
                  >
                    <span>{isAr ? "إنشاء حملة تسويق للمنصة الفائزة" : "Create Targeted Campaign"}</span>
                  </button>
                )}
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("simulator")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
                  >
                    <span>{isAr ? "تجربة تدفق الطلبات في المحاكي" : "Test in Live Simulator"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cross-Platform Comparison Chart */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-card)] dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? "مقارنة مؤشرات الطلب وتوزيع الميزانية عبر المنصات" : "Platform Demand Surge & Budget Allocation"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? "أعمدة الطلب المتزايد (0-100) مقابل النسبة الموصى بها من الميزانية الإعلانية لكل منصة."
                    : "Demand surge index (0-100) vs recommended budget distribution per channel."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedPlatformTab("all")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    selectedPlatformTab === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {isAr ? "الكل (مقارنة)" : "All Platforms"}
                </button>
                {analysisResult.platforms.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlatformTab(p.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      selectedPlatformTab === p.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {p.logoIcon} {isAr ? p.nameAr : p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Bar Comparison */}
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white shadow-xl">
                            <p className="font-bold text-amber-400">{data.name}</p>
                            <p className="mt-1 text-emerald-400">مؤشر الطلب: {data.demandScore}/100</p>
                            <p className="text-indigo-300">حصة الميزانية الموصى بها: {data.budgetShare}%</p>
                            <p className="text-slate-300">نمو البحث: +{data.growth}%</p>
                            <p className="text-slate-400">العائد المتوقع: {data.roas}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => {
                      if (value === "demandScore") return isAr ? "مؤشر الطلب والبحث (Demand Index)" : "Demand Surge Index";
                      return isAr ? "توزيع الميزانية المقترح % (Budget Share)" : "Recommended Budget %";
                    }}
                  />
                  <Bar dataKey="demandScore" name="demandScore" fill="#6366f1" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-demand-${index}`}
                        fill={index === 0 ? "#10b981" : index === 1 ? "#6366f1" : "#94a3b8"}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="budgetShare" name="budgetShare" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Detail Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlatforms.map((platform) => {
              const isWinner = platform.rank === 1;
              return (
                <div
                  key={platform.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm ${
                    isWinner
                      ? "border-emerald-500 bg-emerald-50/30 dark:border-emerald-500/50 dark:bg-emerald-950/20"
                      : "border-line bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl dark:bg-slate-800">
                          {platform.logoIcon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 dark:text-white">
                              {isAr ? platform.nameAr : platform.name}
                            </h4>
                            {isWinner && (
                              <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-950">
                                #1
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {platform.purchaseIntentLabelAr}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {platform.demandSurgeScore}/100
                        </span>
                        <p className="mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          +{platform.trendGrowthPercent}% نمو
                        </p>
                      </div>
                    </div>

                    {/* Target Audience & ROAS */}
                    <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>{isAr ? "الجمهور المطابق:" : "Target Audience:"}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{platform.targetAudienceAr}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>{isAr ? "العائد المتوقع (ROAS):" : "Est. ROAS:"}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{platform.estimatedROAS}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>{isAr ? "الميزانية الموصى بها:" : "Budget Share:"}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{platform.recommendedBudgetShare}%</span>
                      </div>
                    </div>

                    {/* Search Queries cloud */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {isAr ? "أكثر الكلمات والعبارات بحثاً على المنصة:" : "Top Search Queries:"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {platform.topSearchQueries.map((query, qIdx) => (
                          <button
                            key={query}
                            type="button"
                            onClick={() => handleCopy(query, "kw")}
                            title={isAr ? "انقر للنسخ" : "Click to copy"}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            <span>{query}</span>
                            <span className="text-[9px] text-slate-400">{copiedKeyword === query ? "تم" : "نسخ"}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Winning Ad Format & Hook */}
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                          {isAr ? "صيغة الإعلان الفائزة:" : "Winning Ad Format:"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        {platform.winningAdFormatAr}
                      </p>
                      <div className="mt-1 border-t border-indigo-100 pt-1.5 dark:border-indigo-900/40">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{isAr ? "السيناريو المقترح:" : "Suggested Hook:"}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(platform.hookAngleAr, "hook")}
                            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            {copiedHook ? (isAr ? "تم النسخ" : "Copied!") : (isAr ? "نسخ" : "Copy")}
                          </button>
                        </div>
                        <p className="mt-0.5 italic text-[11px] text-indigo-950 dark:text-indigo-100">
                          &quot;{platform.hookAngleAr}&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer CTAs */}
                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      <span>تكلفة النقرة: {platform.cpcLevel === "low" ? "منخفضة" : platform.cpcLevel === "medium" ? "متوسطة" : "مرتفعة"}</span>
                    </div>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("campaign")}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-600 dark:bg-white dark:text-slate-900 dark:hover:bg-indigo-100"
                      >
                        {isAr ? "تجهيز الحملة" : "Setup Campaign"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strategic Market Insights Footer */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {isAr ? "الخلاصة الاستراتيجية والنصيحة التنفيذية للتسويق" : "Executive Marketing Strategy Blueprint"}
              </h4>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="rounded-xl bg-white p-3.5 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700">
                <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                  {isAr ? "حالة السوق الخليجي وسلوك المستهلك:" : "GCC Market Consumer Behavior:"}
                </p>
                <p>{isAr ? analysisResult.marketInsights.gccMarketTrendSummaryAr : analysisResult.marketInsights.gccMarketTrendSummaryEn}</p>
              </div>
              <div className="rounded-xl bg-white p-3.5 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  {isAr ? "التوصية المباشرة:" : "Executive Advice:"}
                </p>
                <p>{isAr ? analysisResult.executiveAdviceAr : analysisResult.executiveAdviceEn}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
