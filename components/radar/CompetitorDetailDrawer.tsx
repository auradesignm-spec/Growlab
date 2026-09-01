"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  X,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Play,
  Layers,
  Sparkles,
  Truck,
  ShieldCheck,
  Tag,
  Copy,
  Check,
  TrendingUp,
  Target,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function CompetitorDetailDrawer({
  competitor,
  onClose,
}: {
  competitor: any;
  onClose: () => void;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ads" | "weaknesses" | "positioning">("ads");

  if (!competitor) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const threat = competitor.threatScore || 50;
  const ads = competitor.ads || [];
  const weaknesses = competitor.weaknesses || [];
  const analysis = competitor.analyses?.[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-2xl min-h-screen bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right-8 duration-200"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Top Header */}
        <div className="border-b border-line p-6 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg">
                {competitor.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {competitor.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {competitor.domain && (
                    <span className="text-xs text-slate-500 font-mono">
                      {competitor.domain}
                    </span>
                  )}
                  <span className="rounded-md bg-slate-200/80 text-slate-700 text-[10px] font-bold px-2 py-0.5">
                    {competitor.market || "OM"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {isAr ? "مؤشر التهديد" : "Threat Score"}
                </span>
                <span className="text-xl font-black text-rose-600">
                  {threat}/100
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Metric Bar Row */}
          <div className="grid grid-cols-4 gap-2 mt-5 text-center text-xs">
            <div className="rounded-xl bg-white border border-line p-2.5 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-medium block">
                {isAr ? "الصلة بالسوق" : "Relevance"}
              </span>
              <strong className="text-slate-900 font-bold">{competitor.relevanceScore || 70}%</strong>
            </div>
            <div className="rounded-xl bg-white border border-line p-2.5 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-medium block">
                {isAr ? "النشاط الإعلاني" : "Activity"}
              </span>
              <strong className="text-slate-900 font-bold">{competitor.activityScore || 65}%</strong>
            </div>
            <div className="rounded-xl bg-white border border-line p-2.5 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-medium block">
                {isAr ? "تنوع المحتوى" : "Creative"}
              </span>
              <strong className="text-slate-900 font-bold">{competitor.creativeScore || 60}%</strong>
            </div>
            <div className="rounded-xl bg-white border border-line p-2.5 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-medium block">
                {isAr ? "قوة العرض" : "Offer Strength"}
              </span>
              <strong className="text-slate-900 font-bold">{competitor.offerScore || 65}%</strong>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 mt-5 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("ads")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "ads"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-line text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>
                {isAr ? "الإعلانات والحملات" : "Ad Creatives"} ({ads.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("weaknesses")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "weaknesses"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white border border-line text-slate-600 hover:bg-slate-100"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>
                {isAr ? "نقاط الضعف المرصودة" : "Weaknesses"} ({weaknesses.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("positioning")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "positioning"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-line text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>{isAr ? "التموضع والهجوم" : "Counter Positioning"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* TAB 1: ADS CREATIVE BREAKDOWN */}
          {activeTab === "ads" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {isAr ? "تفكيك الحملات الإعلانية النشطة:" : "Active Ad Copy Breakdown:"}
                </h3>
                <span className="text-xs text-slate-500">
                  {isAr ? "مرتبة حسب مدة الصمود" : "Sorted by days active"}
                </span>
              </div>

              {ads.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500 text-sm">
                  {isAr ? "لم يتم رصد إعلانات عامة نشطة حالياً لهذا المنافس." : "No active public ads detected."}
                </div>
              ) : (
                ads.map((ad: any, idx: number) => (
                  <div
                    key={ad.id || idx}
                    className="rounded-2xl border border-line bg-slate-50/50 p-5 space-y-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 uppercase">
                          {ad.platform || "META"} • {ad.format || "VIDEO"}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {ad.daysActive || 1} {isAr ? "يوماً نشط" : "days running"}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                        {isAr ? "سرعة الإنفاق: " : "Spend: "}
                        {ad.spendVelocity === "high" ? (isAr ? "عالية 🔥" : "High") : (isAr ? "متوسطة" : "Medium")}
                      </span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {isAr ? "العنوان الرئيسي:" : "Headline:"}
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {ad.headline}
                      </p>
                    </div>

                    {/* Ad Framework Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {ad.hook && (
                        <div className="rounded-xl bg-white border border-line p-2.5 space-y-0.5">
                          <span className="text-[10px] font-bold text-indigo-600 block">
                            🎣 {isAr ? "الخطاف (Hook):" : "Hook:"}
                          </span>
                          <p className="text-slate-800 italic">&ldquo;{ad.hook}&rdquo;</p>
                        </div>
                      )}
                      {ad.painPoint && (
                        <div className="rounded-xl bg-white border border-line p-2.5 space-y-0.5">
                          <span className="text-[10px] font-bold text-rose-600 block">
                            ⚡ {isAr ? "نقطة الألم المستهدفة:" : "Pain Point:"}
                          </span>
                          <p className="text-slate-800">{ad.painPoint}</p>
                        </div>
                      )}
                      {ad.promise && (
                        <div className="rounded-xl bg-white border border-line p-2.5 space-y-0.5">
                          <span className="text-[10px] font-bold text-emerald-600 block">
                            ✨ {isAr ? "الوعد والحل:" : "Promise:"}
                          </span>
                          <p className="text-slate-800">{ad.promise}</p>
                        </div>
                      )}
                      {ad.offer && (
                        <div className="rounded-xl bg-white border border-line p-2.5 space-y-0.5">
                          <span className="text-[10px] font-bold text-amber-600 block">
                            🎁 {isAr ? "العرض والدعوة:" : "Offer & CTA:"}
                          </span>
                          <p className="text-slate-800">{ad.offer} ({ad.cta || "Shop"})</p>
                        </div>
                      )}
                    </div>

                    {/* Body Copy */}
                    {ad.bodyCopy && (
                      <div className="rounded-xl bg-white border border-line p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {isAr ? "النص الإعلاني الكامل (Copy):" : "Full Copy:"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(ad.bodyCopy, `ad_${idx}`)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                          >
                            {copiedText === `ad_${idx}` ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-600">{isAr ? "تم النسخ" : "Copied"}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>{isAr ? "نسخ النص" : "Copy"}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                          {ad.bodyCopy}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: WEAKNESS HUNTER */}
          {activeTab === "weaknesses" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-1">
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>{isAr ? "ثغرات ونقاط ضعف قابلة للاستغلال:" : "Exploitable Vulnerabilities:"}</span>
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {isAr
                    ? "تم تحليل نماذج الشحن وسياسات الضمان وتنوع المحتوى لرصد الثغرات التي ترفع تردد العميل عند الشراء من هذا المنافس."
                    : "Evidence-backed friction points extracted from the competitor's ad copy, shipping terms, and guarantee policies."}
                </p>
              </div>

              {weaknesses.map((w: any, idx: number) => (
                <div
                  key={w.id || idx}
                  className="rounded-2xl border border-line bg-white p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 uppercase">
                      {w.type || "FRICTION"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {isAr ? "مستوى الثقة:" : "Confidence:"}{" "}
                      <strong className="text-emerald-600 uppercase font-bold">{w.confidence || "high"}</strong>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {w.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {w.description}
                  </p>

                  {w.evidence && (
                    <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-500 font-mono border border-line">
                      <strong>{isAr ? "الدليل المرصود:" : "Evidence:"}</strong> {w.evidence}
                    </div>
                  )}

                  {w.exploitationAngle && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                        <Zap className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{isAr ? "كيف تتفوق عليه فوراً (Angle of Attack):" : "Exploitation Angle:"}</span>
                      </div>
                      <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                        {w.exploitationAngle}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: POSITIONING & COUNTER STRATEGY */}
          {activeTab === "positioning" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-line bg-slate-50 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isAr ? "التموضع التسويقي للمنافس:" : "Competitor Positioning:"}
                </h4>
                <p className="text-sm font-bold text-slate-900">
                  {analysis?.positioning || (isAr ? "منافس تقليدي يركز على عروض الخصومات وتوسيع الحصة السوقية" : "Direct market rival")}
                </p>
                <div className="pt-2 border-t border-line text-xs text-slate-600 leading-relaxed">
                  {analysis?.creativeStrategy || (isAr ? "يعتمد على تكرار الحملات الناجحة بدون اختبار زوايا جديدة" : "Standard creative pacing")}
                </div>
              </div>

              {/* Counter Attack Summary */}
              <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>{isAr ? "الخلاصة الاستراتيجية للهجوم المضاد:" : "Strategic Counter Summary:"}</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {analysis?.aiSummary || (isAr ? `تجنب منافسته على السعر وحده؛ ركز على سرعة التسليم (خلال 24-48 ساعة) وضمان عينة التجربة الخارجية المجانية لكسب ثقة العملاء المترددين.` : "Differentiate on speed, proof, and risk reversal rather than margin-destroying price wars.")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Drawer Footer */}
        <div className="border-t border-line p-4 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="gl-btn-secondary w-full text-center py-2 text-xs font-bold"
          >
            {isAr ? "إغلاق نافذة الفحص" : "Close Inspector"}
          </button>
        </div>
      </div>
    </div>
  );
}
