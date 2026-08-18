"use client";

import { useState } from "react";
import { CompanyAccount, Product, Order, Campaign } from "./types";
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Calculator,
  Target,
  ShieldAlert,
  Percent,
  Layers,
  ArrowRight,
  Download,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface HighThinkingAdvisorProps {
  company: CompanyAccount;
  products: Product[];
  orders: Order[];
  campaigns: Campaign[];
}

export default function HighThinkingAdvisor({
  company,
  products,
  orders,
  campaigns,
}: HighThinkingAdvisorProps) {
  const [analysisType, setAnalysisType] = useState<
    "growth_strategy" | "unit_economics" | "ad_scaling" | "pricing_elasticity" | "objection_matrix"
  >("growth_strategy");
  const [customQuestion, setCustomQuestion] = useState("");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [copied, setCopied] = useState(false);

  const modules = [
    {
      id: "growth_strategy",
      title: "خارطة النمو ومضاعفة المبيعات (Growth Roadmap)",
      desc: "تحليل استراتيجي متكامل لمعدلات التحويل، قنوات البيع، وسلوك المشترين في الخليج.",
      icon: TrendingUp,
      badge: "تفكير استراتيجي",
    },
    {
      id: "unit_economics",
      title: "هندسة الوحدة الاقتصادية و ROAS (Unit Economics)",
      desc: "حساب دقيق لهوامش الربح الصافية، وتكلفة الاستحواذ المسموح بها (Max CAC).",
      icon: Calculator,
      badge: "نمذجة مالية",
    },
    {
      id: "ad_scaling",
      title: "استراتيجية توسيع إعلانات ميتا (Meta Ad Scaling)",
      desc: "خطة توسيع الميزانية الرأسية والأفقية مع تجنب تراجع كفاءة الإعلان (Ad Fatigue).",
      icon: Target,
      badge: "ميديا باينج",
    },
    {
      id: "pricing_elasticity",
      title: "هيكلة الباقات وعروض الـ Bundles",
      desc: "تصميم حزم وعروض تصاعدية ترفع متوسط قيمة الطلب (AOV) بدون الإضرار بالربحية.",
      icon: Layers,
      badge: "تسعير وباقات",
    },
    {
      id: "objection_matrix",
      title: "مصفوفة تفكيك اعتراضات الزبائن الخليجيين",
      desc: "تحليل سيكولوجي لكل أسباب التردد وبناء ردود حاسمة تدرب وكيل الذكاء عليها.",
      icon: ShieldAlert,
      badge: "سيكولوجيا البيع",
    },
  ];

  const handleRunAnalysis = async (type?: string, question?: string) => {
    const selectedType = type || analysisType;
    const finalQuery = question || customQuestion || `تحليل استراتيجي عميق لمتجر ${company.name} في مجال ${company.category}`;

    setIsThinking(true);
    setAnalysisResult(null);

    try {
      const storeContext = {
        name: company.name,
        category: company.category,
        totalProducts: products.length,
        products: products.map((p) => ({
          name: p.name,
          price: p.price,
          cost: p.cost,
          margin: p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) + "%" : "0%",
        })),
        totalOrders: orders.length,
        totalSalesVolume: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        activeCampaigns: campaigns.map((c) => ({
          name: c.name,
          spent: c.spent,
          roas: c.roas,
          clicks: c.clicks,
          orders: c.orders,
        })),
      };

      const res = await fetch("/api/gemini/thinking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalQuery,
          analysisType: selectedType,
          marketCategory: company.category,
          storeData: storeContext,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        throw new Error(data.error || "فشل التحليل");
      }
    } catch (e: any) {
      console.error("Thinking Advisor Error:", e);
      setAnalysisResult("حدث خطأ أثناء إجراء التحليل الاستراتيجي عالي التفكير. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-ink via-ink-2 to-[#2E200B] p-6 sm:p-8 text-onDark shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 font-mono text-xs font-bold text-gold-soft">
            <BrainCircuit className="h-4 w-4" />
            <span>Gemini 3.1 Pro — High Thinking Mode (الاستنتاج والتفكير العميق)</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black text-onDark">
            مستشار النمو والرؤى الاستراتيجية العميقة لمتجرك
          </h2>

          <p className="text-xs sm:text-sm text-onDarkSoft leading-relaxed">
            يستخدم هذا المحرك أعلى مستويات التفكير الرياضي والمنطقي (Thinking Level: HIGH) لتحليل بيانات متجرك، حساب الهوامش الصافية، وتصميم استراتيجيات إعلانية قابلة للتنفيذ الفوري.
          </p>
        </div>

        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
      </div>

      {/* Analysis Modules Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const Icon = m.icon;
          const isSelected = analysisType === m.id;
          return (
            <div
              key={m.id}
              onClick={() => {
                setAnalysisType(m.id as any);
                handleRunAnalysis(m.id);
              }}
              className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-gold bg-gold/[0.04] shadow-md ring-1 ring-gold"
                  : "border-line bg-white hover:border-gold/50 hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-gold font-bold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-paper px-2.5 py-0.5 font-mono text-[10px] font-bold text-muted border border-line">
                    {m.badge}
                  </span>
                </div>
                <h4 className="font-display text-sm font-bold text-ink mb-1.5">{m.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{m.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-bold text-gold">
                <span>تشغيل التحليل المعمق</span>
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Strategic Question Bar */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
        <label className="block font-display text-sm font-bold text-ink mb-2">
          أو اسأل المستشار الاستراتيجي أي سؤال معقد يخص متجرك وتوسعك:
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="مثال: كيف أضاعف مبيعات العطور هذا الشهر بميزانية 200 ريال وما هو أفضل عرض ترويجي؟"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <button
            onClick={() => handleRunAnalysis(analysisType, customQuestion)}
            disabled={isThinking}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3 font-bold text-xs sm:text-sm text-gold shadow-md hover:bg-ink-2 transition-all disabled:opacity-50"
          >
            <BrainCircuit className="h-4 w-4" />
            <span>تشغيل التفكير العميق</span>
          </button>
        </div>
      </div>

      {/* Thinking Status Banner */}
      {isThinking && (
        <div className="rounded-2xl border border-gold/40 bg-gold/10 p-6 text-center space-y-3 animate-pulse">
          <div className="flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-gold">
              <BrainCircuit className="h-6 w-6 animate-spin" />
            </span>
          </div>
          <h4 className="font-display text-base font-bold text-ink">
            جاري تشغيل محرك التفكير العميق (Gemini 3.1 Pro Thinking Mode)...
          </h4>
          <p className="text-xs text-muted max-w-lg mx-auto">
            يقوم النموذج بدراسة الرياضيات المالية للمتجر، تسعير المنتجات، هوامش الربح، وفحص زوايا التسويق لإخراج تقرير استراتيجي تنفيذي شامل.
          </p>
        </div>
      )}

      {/* Analysis Output Report */}
      {analysisResult && (
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/15 text-teal font-bold">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  التقرير الاستراتيجي المتقدم — {company.name}
                </h3>
                <span className="text-[11px] font-mono text-muted">
                  مبني بواسطة Gemini 3.1 Pro • Thinking Level: HIGH
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2 text-xs font-mono font-bold text-ink hover:border-gold transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-teal" />
                    <span>تم نسخ التقرير!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>نسخ التقرير</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report Body */}
          <div className="prose prose-sm max-w-none text-ink text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-body">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
}
