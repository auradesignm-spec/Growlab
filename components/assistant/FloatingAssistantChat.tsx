"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Trash2,
  X,
  Zap,
  Store,
  ShieldCheck,
  Calculator,
  Play,
  Bot,
  Layers,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { AssistantActionPayload } from "@/app/api/assistant/chat/route";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  text: string;
  action?: AssistantActionPayload | null;
  suggestions?: string[];
  timestamp: string;
  isExecuting?: boolean;
}

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: "welcome-1",
    role: "assistant",
    text: "مرحباً بك! أنا مساعد Growlab الذكي والمنفّذ المباشر لمهامك.\n\nيمكنني إرشادك كعميل، أو تنفيذ مهام كاملة نيابة عنك فوراً: بناء المتاجر، محاكاة المبيعات، احتساب صافي الأرباح، وتوجيهك لتوثيق الهوية.",
    action: {
      type: "trigger_simulation",
      titleAr: "تجربة محاكي المبيعات وتدفق الطلبات اللحظي",
      titleEn: "Try Live Sales & Order Stream Simulator",
      descriptionAr: "شاهد كيف تصل الطلبات واحتساب صافي الربح الحقيقي بعد الإعلانات",
      descriptionEn: "Experience real-time incoming orders and true net margins",
      targetUrl: "/dashboard?tab=simulator",
      targetTab: "simulator",
    },
    suggestions: [
      "💰 احسب صافي أرباح منتج جديد",
      "🛍️ جرّب متجر المشتري والدفع عند الاستلام",
      "🎬 كتالوج العينات وروابط المسوقين",
      "⚡ تشغيل محاكي المبيعات اللحظية",
      "🎨 بناء متجر عطور بالبلوكات",
      "🛡️ توجيهي لتوثيق الهوية والشارة الزرقاء",
    ],
    timestamp: "الآن",
  },
];

export default function FloatingAssistantChat() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Profit mini calculator state if open in chat
  const [calcState, setCalcState] = useState<{
    open: boolean;
    price: number;
    cogs: number;
    ads: number;
    rto: number;
  }>({
    open: false,
    price: 25,
    cogs: 7,
    ads: 5,
    rto: 1.5,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const playChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Ignore audio restriction
    }
  };

  const handleExecuteAction = (action: AssistantActionPayload, msgId?: string) => {
    if (msgId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isExecuting: true } : m))
      );
    }

    playChime();

    if (action.type === "calculate_profit") {
      setCalcState((prev) => ({ ...prev, open: true }));
      scrollToBottom();
      return;
    }

    if (action.type === "trigger_simulation") {
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard?tab=simulator#simulator";
      } else {
        router.push("/dashboard?tab=simulator");
      }
      return;
    }

    if (action.targetUrl) {
      router.push(action.targetUrl);
    }
  };

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || isLoading) return;

    setInput("");
    const userMsg: MessageItem = {
      id: `u-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("ar-OM", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6).map((m) => ({
            role: m.role === "user" ? "user" : "model",
            content: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed response from assistant");
      }

      const data = await res.json();
      playChime();

      const botMsg: MessageItem = {
        id: `b-${Date.now()}`,
        role: "assistant",
        text: data.text || "تم استلام طلبك بنجاح وسأقوم بتنفيذه فوراً!",
        action: data.action,
        suggestions: data.suggestions,
        timestamp: new Date().toLocaleTimeString("ar-OM", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (data.action?.autoExecute && data.action.targetUrl) {
        setTimeout(() => {
          handleExecuteAction(data.action);
        }, 1200);
      }
    } catch {
      const botMsg: MessageItem = {
        id: `b-${Date.now()}`,
        role: "assistant",
        text: "حاضر! قمت بجدولة وتنفيذ العملية المطلوبة فوراً. يمكنك الضغط على الزر أدناه للانتقال المباشر.",
        action: {
          type: "navigate",
          titleAr: "الانتقال إلى لوحة التحكم",
          titleEn: "Go to Dashboard",
          descriptionAr: "متابعة التنفيذ واستكشاف الميزات",
          descriptionEn: "Continue to dashboard",
          targetUrl: "/dashboard?tab=simulator",
        },
        timestamp: "الآن",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setCalcState((prev) => ({ ...prev, open: false }));
  };

  const netMarginVal = Math.max(
    0,
    calcState.price - calcState.cogs - calcState.ads - calcState.rto
  );
  const netMarginPercent =
    calcState.price > 0 ? Math.round((netMarginVal / calcState.price) * 100) : 0;

  return (
    <aside
      aria-label="Growlab AI Copilot"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 z-50 flex flex-col items-start font-sans pointer-events-none max-w-[calc(100vw-32px)] sm:max-w-none"
    >
      <div className="pointer-events-auto flex flex-col items-start w-full sm:w-auto">
        {/* Floating Chat Modal */}
        {isOpen && (
          <div
            id="growlab-ai-chat-window"
            className="relative mb-3 flex h-[76vh] max-h-[580px] w-full sm:w-[410px] flex-col overflow-hidden rounded-2xl sm:rounded-[24px] border border-white/15 bg-slate-950/90 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-3xl ring-1 ring-white/10 transition-all duration-300 ease-out"
            dir="rtl"
          >
            {/* Ambient Glass Glows */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 -right-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/30 pointer-events-none" />

            {/* Liquid Glass Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3.5 py-3 sm:px-4 backdrop-blur-2xl">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                  <img
                    src="/AI.gif"
                    alt="Growlab AI Bot"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://raw.githubusercontent.com/auradesignm-spec/Growlab/main/webimages/AI.gif";
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
                    <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      مساعد Growlab الذكي
                    </h3>
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 backdrop-blur-md">
                      منفّذ آلي
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300/80 flex items-center gap-1 mt-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    جاهز للإرشاد وتنفيذ المهام
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "كتم الصوت" : "تفعيل التنبيه الصوتي"}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.12] hover:text-white transition-all backdrop-blur-md"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5 text-slate-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="مسح المحادثة"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.12] hover:text-white transition-all backdrop-blur-md"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="إغلاق"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.12] hover:text-white transition-all backdrop-blur-md"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="relative z-10 flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-start" : "items-end"} gap-1`}
                  >
                    <div
                      className={`max-w-[90%] p-3.5 text-xs sm:text-[13px] leading-relaxed backdrop-blur-2xl transition-all ${
                        isUser
                          ? "rounded-2xl rounded-tr-xs border border-amber-400/40 bg-gradient-to-br from-amber-400/90 to-amber-500/95 text-slate-950 font-medium shadow-[0_4px_16px_rgba(245,158,11,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]"
                          : "rounded-2xl rounded-tl-xs border border-white/10 bg-white/[0.06] text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                      {/* Interactive Action Card if provided by Bot */}
                      {m.action && (
                        <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-3 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl">
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                              <Zap className="h-3.5 w-3.5 text-amber-400" />
                              <span>مهمة جاهزة للتنفيذ</span>
                            </span>
                            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[9px] font-bold text-emerald-300 backdrop-blur-md">
                              متاحة فوراً
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs font-bold text-white">
                            {m.action.titleAr}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-300 leading-normal">
                            {m.action.descriptionAr}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleExecuteAction(m.action!, m.id)}
                            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300/40 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-xs font-extrabold text-slate-950 shadow-[0_4px_14px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.5)] hover:brightness-110 active:scale-[0.98] transition-all"
                          >
                            <Play className="h-3.5 w-3.5 fill-slate-950" />
                            <span>تنفيذ المهمة وفتح الشاشة الآن</span>
                          </button>
                        </div>
                      )}

                      {/* Suggestion Chips */}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col gap-1.5">
                          {m.suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSend(s)}
                              className="group flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11.5px] font-medium text-slate-200 shadow-xs hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-200 active:scale-[0.99] transition-all text-right backdrop-blur-md"
                            >
                              <span className="leading-snug">{s}</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-amber-300 opacity-60 group-hover:opacity-100 transition-opacity">
                                ↵
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400/70 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Interactive Embedded Net Margin Calculator */}
              {calcState.open && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-950/40 p-3.5 text-xs text-slate-100 shadow-[0_8px_24px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between border-b border-emerald-400/20 pb-2">
                    <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                      <Calculator className="h-3.5 w-3.5 text-emerald-400" />
                      <span>حاسبة صافي الأرباح الحقيقية اللحظية</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCalcState((p) => ({ ...p, open: false }))}
                      className="flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/5 text-slate-300 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="text-slate-300">سعر البيع (ر.ع):</label>
                      <input
                        type="number"
                        value={calcState.price}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            price: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-white font-bold backdrop-blur-md focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300">تكلفة البضاعة COGS:</label>
                      <input
                        type="number"
                        value={calcState.cogs}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            cogs: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-white font-bold backdrop-blur-md focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300">تكلفة الإعلان لكل طلب:</label>
                      <input
                        type="number"
                        value={calcState.ads}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            ads: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-white font-bold backdrop-blur-md focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300">حماية المرتجع RTO:</label>
                      <input
                        type="number"
                        value={calcState.rto}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            rto: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-white font-bold backdrop-blur-md focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between rounded-lg border border-emerald-400/40 bg-emerald-500/20 p-2.5">
                    <div>
                      <p className="text-[10px] text-emerald-200">صافي الربح المحصل بالبنك:</p>
                      <p className="text-sm font-extrabold text-emerald-300 font-mono">
                        {netMarginVal.toFixed(2)} ر.ع
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-emerald-200">هامش الربح:</p>
                      <p className="text-sm font-extrabold text-white font-mono">
                        {netMarginPercent}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-xs text-slate-200 backdrop-blur-xl w-fit">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  <span>المساعد يجهز وينفذ طلبك...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Dock (clean overflow without scrollbar) */}
            <div className="relative z-10 border-t border-white/10 bg-white/[0.02] p-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden backdrop-blur-2xl">
              <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSend("شغّل محاكي المبيعات وضف طلب تجريبي")}
                  className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-semibold shadow-xs active:scale-95 transition-all backdrop-blur-md"
                >
                  <Zap className="h-3 w-3" />
                  <span>محاكي المبيعات</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSend("ابنِ لي متجر جديد بالبلوكات")}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-slate-200 hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-amber-300 font-medium shadow-xs active:scale-95 transition-all backdrop-blur-md"
                >
                  <Store className="h-3 w-3" />
                  <span>محرر المتجر</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSend("وجّهني لتوثيق الهوية والشارة الزرقاء")}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-slate-200 hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-amber-300 font-medium shadow-xs active:scale-95 transition-all backdrop-blur-md"
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span>التوثيق KYC</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSend("احسب صافي الأرباح")}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-slate-200 hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-amber-300 font-medium shadow-xs active:scale-95 transition-all backdrop-blur-md"
                >
                  <Calculator className="h-3 w-3" />
                  <span>حاسبة الربح</span>
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative z-10 flex items-center gap-2 border-t border-white/10 bg-slate-950/70 p-2.5 sm:p-3 backdrop-blur-3xl"
            >
              <div className="relative flex flex-1 items-center rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] focus-within:border-amber-400/60 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اطلب أي مهمة أو اسأل عن أي خطوة..."
                  className="w-full bg-transparent py-1 text-xs sm:text-[13px] text-white placeholder-slate-400/70 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/40 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-[0_4px_14px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                title="إرسال"
              >
                {isLoading ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                ) : (
                  <Send className="h-4 w-4 rotate-180" />
                )}
              </button>
            </form>
          </div>
        )}

        {/* Floating Trigger Button */}
        <div className="relative group">
          <button
            id="growlab-floating-ai-assistant-btn"
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              playChime();
            }}
            className="relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center overflow-hidden rounded-2xl sm:rounded-[22px] border border-white/20 bg-slate-950/90 text-white shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] hover:border-amber-400/50 hover:shadow-[0_12px_40px_rgba(245,158,11,0.25)] active:scale-95 transition-all duration-300 backdrop-blur-2xl"
            aria-label="مساعد Growlab الذكي"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-slate-200" />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl">
                <img
                  src="/AI.gif"
                  alt="Growlab AI Bot"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://raw.githubusercontent.com/auradesignm-spec/Growlab/main/webimages/AI.gif";
                  }}
                />
              </div>
            )}
          </button>

          {/* Hover Tooltip / Prompt bubble on desktop */}
          {!isOpen && (
            <div
              onClick={() => setIsOpen(true)}
              className="cursor-pointer absolute left-16 bottom-1 hidden whitespace-nowrap rounded-xl border border-white/15 bg-slate-950/90 px-3.5 py-1.5 text-xs text-slate-100 shadow-[0_8px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl group-hover:flex items-center gap-2 transition-all duration-200"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-200 font-medium">مساعد Growlab الذكي</span>
                <span className="text-white/20">—</span>
                <strong className="text-amber-300 font-semibold">اسألني أو اطلب تنفيذ مهمة</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
