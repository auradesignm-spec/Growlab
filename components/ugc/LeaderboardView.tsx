"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Percent,
  ShoppingBag,
  ExternalLink,
  Crown,
  Sparkles,
  Info,
  Calendar,
  Filter,
  CheckCircle2,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import { useUgc } from "@/lib/UgcContext";
import { TimePeriod, ProductCategory } from "@/lib/ugc-types";

export const LeaderboardView: React.FC = () => {
  const { getLeaderboard } = useUgc();

  const [period, setPeriod] = useState<TimePeriod>("weekly");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const leaderboardEntries = useMemo(() => {
    return getLeaderboard(period, category);
  }, [getLeaderboard, period, category]);

  const topThree = leaderboardEntries.slice(0, 3);
  const remaining = leaderboardEntries.slice(3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Leaderboard Hero Header & Anti-Gaming Formula Banner */}
      <div className="relative rounded-3xl bg-gradient-to-b from-growlab-bgCard to-growlab-bgDark border border-growlab-border p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-growlab-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-growlab-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-growlab-gold/15 text-growlab-gold border border-growlab-gold/30 text-xs font-bold">
              <Crown className="h-4 w-4" />
              <span>نظام الترتيب التنافسي الذكي • UGC Leaderboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              أفضل صناع المحتوى أداءً وتحويلاً في الخليج
            </h1>
            <p className="text-xs sm:text-sm text-onDarkSoft leading-relaxed">
              معيار ترتيب مركّب ومقاوم للتلاعب يجمع بين حجم المبيعات الفعلي، ومعدل التحويل (Conversion Rate)، وعدد الطلبات المكتملة لمكافأة الجودة والالتزام الحقيقي.
            </p>
          </div>

          {/* Quick controls: Formula info toggle */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <button
              onClick={() => setShowFormulaInfo(!showFormulaInfo)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold text-xs text-white transition-all cursor-pointer shadow-sm"
            >
              <Info className="h-4 w-4 text-growlab-gold" />
              <span>كيف يتم احتساب النقاط المركبة؟</span>
            </button>
            <span className="text-[11px] text-muted flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-growlab-emerald" />
              يتجدد الترتيب الأسبوعي كل يوم أحد 11:59 م
            </span>
          </div>
        </div>

        {/* Formula breakdown drawer */}
        {showFormulaInfo && (
          <div className="mt-6 p-4 rounded-2xl bg-growlab-ledger border border-growlab-gold/40 text-xs space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="font-bold text-growlab-gold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>معادلة الترتيب المركّب (Composite Scoring Formula):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
              <div className="p-3 rounded-xl bg-growlab-bgCard border border-growlab-border">
                <div className="font-bold text-white mb-1">1. قيمة المبيعات (وزن 50%)</div>
                <p className="text-muted leading-relaxed">
                  حجم المبيعات الفعلي بالدولار/العملة المحلية الناتج عن متجر الصانع.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-growlab-bgCard border border-growlab-border">
                <div className="font-bold text-growlab-emerald mb-1">2. معدل التحويل (وزن 30%)</div>
                <p className="text-muted leading-relaxed">
                  نسبة الزوار الذين أتموا الشراء (يكافئ جودة المحتوى لا الحجم فقط).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-growlab-bgCard border border-growlab-border">
                <div className="font-bold text-cyan-400 mb-1">3. عدد الطلبات (وزن 20%)</div>
                <p className="text-muted leading-relaxed">
                  تكرار العمليات الناجحة وتفاعل العملاء مع شحنات التاجر.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Period Selection Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-2xl bg-growlab-bgCard border border-growlab-border">
        {/* Time Windows */}
        <div className="flex items-center bg-growlab-bgDark p-1 rounded-xl border border-growlab-border text-xs w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={() => setPeriod("weekly")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              period === "weekly"
                ? "bg-growlab-gold text-growlab-bgDark font-bold shadow-md"
                : "text-muted hover:text-white"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>الأسبوعي (Weekly)</span>
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              period === "monthly"
                ? "bg-growlab-gold text-growlab-bgDark font-bold shadow-md"
                : "text-muted hover:text-white"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>الشهري (Monthly)</span>
          </button>
          <button
            onClick={() => setPeriod("all-time")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              period === "all-time"
                ? "bg-growlab-gold text-growlab-bgDark font-bold shadow-md"
                : "text-muted hover:text-white"
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span>الشامل (All-Time)</span>
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {(
            [
              { id: "all", label: "جميع الفئات" },
              { id: "tech", label: "📱 تقنية" },
              { id: "perfume", label: "✨ عطور" },
              { id: "fashion", label: "👗 أزياء" },
              { id: "beauty", label: "🌿 جمال" },
            ] as Array<{ id: ProductCategory | "all"; label: string }>
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
                category === cat.id
                  ? "bg-growlab-bgSurface border-growlab-gold text-white font-bold"
                  : "bg-growlab-bgDark border-growlab-border text-muted hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium (Gold, Silver, Bronze) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {topThree.map((entry, idx) => {
          const isFirst = entry.rank === 1;
          const isSecond = entry.rank === 2;
          const isThird = entry.rank === 3;

          const crownColor = isFirst
            ? "from-amber-400 to-amber-600 border-amber-400 text-amber-950"
            : isSecond
            ? "from-slate-200 to-slate-400 border-slate-300 text-slate-900"
            : "from-amber-700 to-amber-900 border-amber-600 text-amber-100";

          const cardBorder = isFirst
            ? "border-amber-400/50 shadow-glow-gold/20"
            : isSecond
            ? "border-slate-400/30"
            : "border-amber-700/30";

          return (
            <div
              key={entry.creatorId}
              className={`relative rounded-3xl bg-growlab-bgCard border ${cardBorder} p-6 flex flex-col justify-between shadow-xl group hover:scale-[1.02] transition-all duration-300 ${
                isFirst ? "md:-translate-y-2 bg-gradient-to-b from-growlab-bgCard via-growlab-bgCard to-growlab-bgSurface" : ""
              }`}
            >
              {/* Rank Crown Ribbon */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r ${crownColor} font-bold text-xs shadow-md`}
                >
                  <Crown className="h-4 w-4" />
                  <span>المركز #{entry.rank}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-growlab-bgDark border border-growlab-border text-growlab-gold">
                  {entry.compositeScore.toLocaleString()} نقطة
                </span>
              </div>

              {/* Creator info */}
              <div className="text-center space-y-3 my-2">
                <div className="relative inline-block">
                  <img
                    src={entry.avatar}
                    alt={entry.displayName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-growlab-border group-hover:border-growlab-gold transition-colors mx-auto shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-growlab-gold text-growlab-bgDark shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold font-display text-white group-hover:text-growlab-gold transition-colors">
                    {entry.displayName}
                  </h3>
                  <div className="text-xs text-muted font-mono">@{entry.username}</div>
                </div>

                {entry.badgeTitle && (
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-growlab-bgSurface border border-growlab-border text-onDarkSoft">
                    ✨ {entry.badgeTitle}
                  </div>
                )}
              </div>

              {/* Performance stats */}
              <div className="mt-4 pt-4 border-t border-growlab-border grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-growlab-bgDark border border-growlab-border">
                  <div className="text-[10px] text-muted">المبيعات</div>
                  <div className="font-mono font-bold text-white text-xs mt-0.5">
                    ${entry.salesValueUSD.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-growlab-bgDark border border-growlab-border">
                  <div className="text-[10px] text-muted">التحويل</div>
                  <div className="font-mono font-bold text-growlab-emerald text-xs mt-0.5">
                    {entry.conversionRate}%
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-growlab-bgDark border border-growlab-border">
                  <div className="text-[10px] text-muted">الطلبات</div>
                  <div className="font-mono font-bold text-cyan-400 text-xs mt-0.5">
                    {entry.orderCount}
                  </div>
                </div>
              </div>

              {/* Storefront button */}
              <Link
                href={`/creator/${entry.username}`}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-growlab-bgSurface hover:bg-growlab-gold hover:text-growlab-bgDark text-white border border-growlab-border hover:border-growlab-gold text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>زيارة المتجر المصغر</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table (Ranks 4+) */}
      {remaining.length > 0 && (
        <div className="rounded-2xl bg-growlab-bgCard border border-growlab-border overflow-hidden shadow-xl">
          <div className="p-4 border-b border-growlab-border bg-growlab-bgSurface/50 flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white">
              باقي الترتيب التنافسي المعتمد
            </h3>
            <span className="text-xs text-muted">
              عرض {leaderboardEntries.length} صانع محتوى
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right text-xs">
              <thead className="bg-growlab-bgDark text-muted uppercase text-[11px] font-mono border-b border-growlab-border">
                <tr>
                  <th className="py-3 px-4">الترتيب</th>
                  <th className="py-3 px-4">صانع المحتوى</th>
                  <th className="py-3 px-4">الدولة</th>
                  <th className="py-3 px-4">المبيعات</th>
                  <th className="py-3 px-4">معدل التحويل</th>
                  <th className="py-3 px-4">الطلبات</th>
                  <th className="py-3 px-4">النقاط المركبة</th>
                  <th className="py-3 px-4 text-center">المتجر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-growlab-border">
                {remaining.map((entry) => (
                  <tr
                    key={entry.creatorId}
                    className="hover:bg-growlab-bgSurface/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-muted">
                      #{entry.rank}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={entry.avatar}
                          alt={entry.displayName}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-bold text-white">{entry.displayName}</div>
                          <div className="font-mono text-[10px] text-muted">@{entry.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      {entry.country === "OM" ? "🇴🇲 عُمان" : entry.country === "SA" ? "🇸🇦 السعودية" : "🇦🇪 الإمارات"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ${entry.salesValueUSD.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-growlab-emerald">
                      {entry.conversionRate}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted">
                      {entry.orderCount} طلب
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-growlab-gold">
                      {entry.compositeScore.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/creator/${entry.username}`}
                        className="inline-flex p-1.5 rounded-lg bg-growlab-bgDark text-muted hover:text-white hover:border-growlab-gold border border-growlab-border transition-colors"
                        title="فتح المتجر المصغر"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
