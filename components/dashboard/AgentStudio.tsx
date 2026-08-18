"use client";

import { useState } from "react";
import { CompanyAccount, Product } from "./types";
import {
  Bot,
  Sparkles,
  Send,
  Check,
  QrCode,
  Settings,
  Zap,
  ShieldCheck,
  MessageSquare,
  RefreshCw,
  PhoneCall,
  Sliders,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface AgentStudioProps {
  company: CompanyAccount;
  products: Product[];
  onUpdateCompany: (company: CompanyAccount) => void;
  prefillQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  time: string;
  isOrderSnippet?: boolean;
}

export default function AgentStudio({
  company,
  products,
  onUpdateCompany,
  prefillQuery,
}: AgentStudioProps) {
  const [agentName, setAgentName] = useState(company.agentName);
  const [agentDialect, setAgentDialect] = useState(company.agentDialect);
  const [discountMax, setDiscountMax] = useState(company.agentAutoDiscountMax);
  const [isSaved, setIsSaved] = useState(false);

  // Chat Simulator State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "agent",
      text: `مرحباً بك في ${company.name}! 👋 أنا ${company.agentName}، كيف أقدر أساعدك اليوم في اختيار طلبك المناسب؟`,
      time: "الآن",
    },
  ]);
  const [inputQuery, setInputQuery] = useState(prefillQuery || "");
  const [isTyping, setIsTyping] = useState(false);

  const quickSimPrompts = [
    `كم سعر ${products[0]?.name || "المنتج"} وهل التوصيل مجاني؟`,
    "هل عندكم توصيل لصلالة والدفع عند الاستلام؟",
    "أبغى قطعتين هل في كود خصم خاص؟",
    "هل يوجد ضمان ذهبي لو ما ناسبني المنتج؟",
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany({
      ...company,
      agentName,
      agentDialect,
      agentAutoDiscountMax: discountMax,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSendMessage = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: q,
      time: "الآن",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    // Dynamic AI Response Logic based on Products & Guidelines
    setTimeout(() => {
      let aiText = "";
      const lowerQ = q.toLowerCase();

      const matchedProd = products.find((p) =>
        lowerQ.includes(p.name.toLowerCase()) || lowerQ.includes(p.category.toLowerCase())
      ) || products[0];

      if (lowerQ.includes("سعر") || lowerQ.includes("بكم") || lowerQ.includes("كم")) {
        aiText = `سعر ${matchedProd?.name} هو ${matchedProd?.price}$ فقط (${matchedProd?.price * 0.38} ريال عماني تقريباً) مع علبة فاخرة. والتوصيل سريع خلال 24-48 ساعة لجميع ولايات السلطنة والدفع عند الاستلام متاح! ✨ تحب أسجل لك حبة؟`;
      } else if (lowerQ.includes("خصم") || lowerQ.includes("تخفيض") || lowerQ.includes("قطعتين") || lowerQ.includes("كود")) {
        aiText = `يسعدنا ذلك جداً! 🎁 بما أنك طلبت قطعتين، فعلت لك كود خصم خاص (${matchedProd?.name.slice(0, 4).toUpperCase()}10) يخصم لك 10% فوراً. إجمالي الطلب بعد الخصم سيكون ${(matchedProd?.price * 2 * 0.9).toFixed(1)}$ فقط! أرسل لي اسمك وولايتك لتأكيد الشحن فوراً 🚚`;
      } else if (lowerQ.includes("صلالة") || lowerQ.includes("توصيل") || lowerQ.includes("مسقط") || lowerQ.includes("صحار")) {
        aiText = `أهلاً بك! نعم نوصل لجميع الولايات والمحافظات (مسقط، صلالة، صحار، نزوى، البريمي، وسائر دول الخليج) خلال 24-48 ساعة عبر مندوب سريع مع خدمة فحص المنتج قبل الاستلام والدفع عند الباب! 📦`;
      } else if (lowerQ.includes("ضمان") || lowerQ.includes("استرجاع") || lowerQ.includes("أصلي")) {
        aiText = `أكيد 100%! كل منتجات ${company.name} مشمولة بـ ${matchedProd?.warranty || "ضمان ذهبي للاستبدال والاسترجاع"}. راحتك وثقتك هي أولويتنا دائماً.`;
      } else {
        aiText = `أهلاً بك! ${matchedProd?.name} متوفر الآن وبكميات محدودة بمميزات: ${matchedProd?.sellingPoints[0] || "جودة ممتازة"}. ومتاح توصيل فوري لكافة الولايات مع الدفع عند الاستلام. كيف تحب نستكمل طلبك؟ 🤍`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: "agent",
          text: aiText,
          time: "الآن",
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black text-ink">
            استوديو تخصيص واختبار وكيل الذكاء الاصطناعي
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            خصص شخصية ولهجة وصلاحيات التفاوض لوكيل المبيعات، واختبره حياً في محادثات واتساب تفاعلية.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-xs font-mono font-bold text-teal">
          <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
          <span>الوكيل متصل بـ WhatsApp Webhook</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Settings Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-ink mb-4 pb-3 border-b border-line">
              <Sliders className="h-5 w-5 text-gold" />
              <span>إعدادات شخصية وسلوك الوكيل</span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  اسم الوكيل الظاهر للعملاء
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  لهجة وأسلوب المحادثة
                </label>
                <select
                  value={agentDialect}
                  onChange={(e) => setAgentDialect(e.target.value as any)}
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none bg-white"
                >
                  <option value="omani">لهجة عمانية ودية (طبيعية وتفاعلية)</option>
                  <option value="gulf">لهجة خليجية بيضاء (شاملة ومحببة)</option>
                  <option value="standard_arabic">لغة عربية فصحى راقية ومهنية</option>
                  <option value="casual">أسلوب شبابي حماسي ومرن</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-xs font-semibold text-ink">
                    أقصى نسبة خصم يمنحها الوكيل لإغلاق المتردد:
                  </label>
                  <span className="font-mono text-xs font-bold text-teal">{discountMax}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={discountMax}
                  onChange={(e) => setDiscountMax(Number(e.target.value))}
                  className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <span className="text-[11px] text-muted block mt-1">
                  يستخدمها الوكيل ذكياً فقط عندما يتردد العميل بالسعر لإتمام البيع.
                </span>
              </div>

              <div className="rounded-xl bg-paper p-3 text-xs space-y-2 border border-line">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <ShieldCheck className="h-4 w-4 text-teal" />
                  <span>ضوابط وإجراءات الأمان:</span>
                </div>
                <div className="space-y-1 text-muted text-[11px]">
                  <p>✓ تأكيد العنوان والمدينة ورقم الهاتف قبل تثبيت أي طلب.</p>
                  <p>✓ عدم إعطاء أي وعود خارج مواصفات المنتجات المرفوعة.</p>
                  <p>✓ تحويل المحادثات المعقدة جداً للمؤسسين بنقرة واحدة.</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-ink py-3 text-center text-xs sm:text-sm font-bold text-onDark shadow-md hover:bg-ink-2 transition-all flex items-center justify-center gap-2"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-teal" />
                    <span>تم حفظ وتحديث تعليمات الوكيل بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    <span>حفظ وتطبيق التعديلات على الوكيل</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* WhatsApp QR & Channel Box */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366] text-white">
                  <Bot className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-display text-sm font-bold text-ink">ربط واتساب التجاري</h4>
                  <span className="text-[11px] text-muted">{company.whatsappNumber}</span>
                </div>
              </div>
              <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-[10px] font-bold text-teal font-mono">
                نشط 24/7
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed mb-3">
              الوكيل يستقبل المحادثات الواردة من إعلانات ميتا ويغلق المبيعات تلقائياً على مدار الساعة.
            </p>

            <div className="flex items-center gap-2 rounded-xl bg-paper p-3 text-xs text-ink font-mono">
              <QrCode className="h-4 w-4 text-muted" />
              <span>مربوط عبر Growlab Cloud API Gateway</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Chat Simulator (Playground) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-gold/40 bg-ink p-5 sm:p-6 text-onDark shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-onDark/15 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink font-bold font-display shadow-md">
                  G
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-teal border-2 border-ink" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-onDark">
                  {agentName}
                </h4>
                <p className="text-[11px] text-gold-soft font-mono">
                  محاكي واتساب المباشر — مدرب على منتجات {company.name}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: "m1",
                    sender: "agent",
                    text: `مرحباً بك في ${company.name}! 👋 أنا ${agentName}، كيف أقدر أساعدك اليوم في اختيار طلبك المناسب؟`,
                    time: "الآن",
                  },
                ])
              }
              className="flex items-center gap-1 text-[11px] font-mono text-onDarkSoft hover:text-gold transition-colors"
              title="إعادة تعيين المحادثة"
            >
              <RefreshCw className="h-3 w-3" />
              <span>تفريغ المحادثة</span>
            </button>
          </div>

          {/* Quick Simulation Chips */}
          <div className="mb-4 space-y-1.5">
            <span className="block font-mono text-[10px] text-onDarkSoft">
              اختر سؤالاً سريعاً لتجربة تفاعل الوكيل:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickSimPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  className="rounded-lg border border-onDark/20 bg-onDark/[0.06] px-2.5 py-1.5 text-[11px] text-onDarkSoft hover:bg-gold/20 hover:text-onDark hover:border-gold/40 transition-all text-right"
                >
                  💬 {p}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-[320px] max-h-[420px] overflow-y-auto rounded-xl border border-onDark/15 bg-ink-2/90 p-4 space-y-3 shadow-inner">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "rounded-tr-xs bg-onDark/[0.12] text-onDark"
                      : "rounded-tl-xs bg-teal/30 border border-teal/40 text-onDark shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 font-mono text-[10px] text-onDarkSoft mb-1">
                    <span>{m.sender === "user" ? "العميل (أنت)" : agentName}</span>
                    <span className="text-[9px]">{m.time}</span>
                  </div>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tl-xs bg-teal/20 border border-teal/30 px-4 py-2.5 text-xs text-gold-soft font-mono flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gold animate-bounce" />
                  <span>الوكيل يكتب الرد الآن...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="اكتب أي استفسار أو تفاوض مع وكيل متجرك..."
              className="flex-1 rounded-xl border border-onDark/25 bg-onDark/[0.08] px-4 py-3 text-xs sm:text-sm text-onDark placeholder:text-onDarkSoft/50 focus:border-gold focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isTyping}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-[#241A08] shadow-md transition-all hover:bg-gold-soft disabled:opacity-50 active:scale-95"
            >
              <Send className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
