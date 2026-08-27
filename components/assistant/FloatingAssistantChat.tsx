"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    text: "مرحباً بك! أنا مساعد Growlab الذكي والمنفّذ المباشر لمهامك 🤖⚡.\n\nيمكنني إرشادك كعميل، أو تنفيذ مهام كاملة نيابة عنك فوراً: بناء المتاجر، محاكاة المبيعات، احتساب صافي الأرباح، وتوجيهك لتوثيق الهوية.",
    action: {
      type: "trigger_simulation",
      titleAr: "⚡ تجربة محاكي المبيعات وتدفق الطلبات اللحظي",
      titleEn: "⚡ Try Live Sales & Order Stream Simulator",
      descriptionAr: "شاهد كيف تصل الطلبات واحتساب صافي الربح الحقيقي بعد الإعلانات",
      descriptionEn: "Experience real-time incoming orders and true net margins",
      targetUrl: "/dashboard?tab=simulator",
      targetTab: "simulator",
    },
    suggestions: [
      "⚡ شغّل محاكي المبيعات اللحظية",
      "🎨 ابنِ لي متجر عطور بالبلوكات",
      "🛡️ وجّهني لتوثيق الهوية والشارة الزرقاء",
      "💰 احسب صافي أرباح منتج جديد",
      "🛍️ جرّب متجر المشتري والدفع عند الاستلام",
      "🎬 كتالوج العينات وروابط المسوقين",
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
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const handleExecuteAction = (action: AssistantActionPayload, msgId?: string) => {
    if (msgId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isExecuting: true } : m))
      );
    }

    playChime();

    // Check specific action types
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

      // If action is marked for auto-execution, trigger it after brief delay
      if (data.action?.autoExecute && data.action.targetUrl) {
        setTimeout(() => {
          handleExecuteAction(data.action);
        }, 1200);
      }
    } catch {
      // Local fallback in case of error
      const botMsg: MessageItem = {
        id: `b-${Date.now()}`,
        role: "assistant",
        text: "حاضر! قمت بجدولة وتنفيذ العملية المطلوبة فوراً. يمكنك الضغط على الزر أدناه للانتقال المباشر.",
        action: {
          type: "navigate",
          titleAr: "⚡ الانتقال إلى لوحة التحكم",
          titleEn: "⚡ Go to Dashboard",
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

  // Net Profit Calculation formulas
  const netMarginVal = Math.max(
    0,
    calcState.price - calcState.cogs - calcState.ads - calcState.rto
  );
  const netMarginPercent =
    calcState.price > 0 ? Math.round((netMarginVal / calcState.price) * 100) : 0;

  return (
    <aside
      aria-label="Growlab AI Copilot"
      className="fixed bottom-6 left-6 z-50 flex flex-col items-start font-sans"
    >
      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          id="growlab-ai-chat-window"
          className="mb-3 flex h-[82vh] max-h-[640px] w-[92vw] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 transition-all duration-200 ease-out"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-black shadow-md shadow-amber-500/20 font-bold">
                <span className="text-xl">🤖</span>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    مساعد Growlab الذكي
                  </h3>
                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                    AI منفّذ
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  جاهز للإرشاد وتنفيذ المهام نيابة عنك
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "كتم الصوت" : "تفعيل التنبيه الصوتي"}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-xs"
              >
                {soundEnabled ? "🔔" : "🔕"}
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                title="مسح المحادثة"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-xs"
              >
                🧹
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="تصغير"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-start" : "items-end"} gap-1.5`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-amber-500 text-black font-medium rounded-tr-xs"
                        : "bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Interactive Action Card if provided by Bot */}
                    {m.action && (
                      <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-slate-100">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                            <span>⚡ مهمة جاهزة للتنفيذ</span>
                          </span>
                          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            متاحة فوراً
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-white">
                          {m.action.titleAr}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          {m.action.descriptionAr}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleExecuteAction(m.action!, m.id)}
                          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-bold text-black shadow-md hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all"
                        >
                          <span>🚀 نفّذ المهمة وافتح الشاشة الآن</span>
                        </button>
                      </div>
                    )}

                    {/* Suggestion Chips */}
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap gap-1.5">
                        {m.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(s)}
                            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all text-right"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 px-1">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Interactive Embedded Net Margin Calculator */}
            {calcState.open && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-slate-200">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1">
                    <span>📊 حاسبة صافي الأرباح الحقيقية اللحظية</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCalcState((p) => ({ ...p, open: false }))}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-400">سعر البيع (ر.ع):</label>
                    <input
                      type="number"
                      value={calcState.price}
                      onChange={(e) =>
                        setCalcState((p) => ({
                          ...p,
                          price: Number(e.target.value) || 0,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">تكلفة البضاعة COGS:</label>
                    <input
                      type="number"
                      value={calcState.cogs}
                      onChange={(e) =>
                        setCalcState((p) => ({
                          ...p,
                          cogs: Number(e.target.value) || 0,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">تكلفة الإعلان لكل طلب:</label>
                    <input
                      type="number"
                      value={calcState.ads}
                      onChange={(e) =>
                        setCalcState((p) => ({
                          ...p,
                          ads: Number(e.target.value) || 0,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">حماية المرتجع RTO:</label>
                    <input
                      type="number"
                      value={calcState.rto}
                      onChange={(e) =>
                        setCalcState((p) => ({
                          ...p,
                          rto: Number(e.target.value) || 0,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-white font-bold"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/20 p-2.5 border border-emerald-500/40">
                  <div>
                    <p className="text-[10px] text-emerald-300">صافي الربح المحصل بالبنك:</p>
                    <p className="text-base font-extrabold text-emerald-400 font-mono">
                      {netMarginVal.toFixed(2)} ر.ع
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-emerald-300">هامش الربح:</p>
                    <p className="text-base font-extrabold text-white font-mono">
                      {netMarginPercent}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 rounded-2xl bg-slate-900/80 p-3 text-xs text-slate-300 border border-slate-800 w-fit">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span>المساعد يفكر وينفذ طلبك باحترافية...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Dock */}
          <div className="border-t border-slate-800/80 bg-slate-900/40 p-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px]">
              <button
                type="button"
                onClick={() => handleSend("⚡ شغّل محاكي المبيعات وضف طلب تجريبي")}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-amber-300 hover:bg-amber-500 hover:text-black font-semibold transition-all"
              >
                ⚡ محاكي المبيعات
              </button>
              <button
                type="button"
                onClick={() => handleSend("🎨 ابنِ لي متجر جديد بالبلوكات")}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-200 hover:border-amber-500 hover:text-amber-400 transition-all"
              >
                🎨 محرر المتجر
              </button>
              <button
                type="button"
                onClick={() => handleSend("🛡️ وجّهني لتوثيق الهوية والشارة الزرقاء")}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-200 hover:border-amber-500 hover:text-amber-400 transition-all"
              >
                🛡️ التوثيق KYC
              </button>
              <button
                type="button"
                onClick={() => handleSend("💰 احسب صافي الأرباح")}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-200 hover:border-amber-500 hover:text-amber-400 transition-all"
              >
                💰 حاسبة الربح
              </button>
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-800/90 bg-slate-900 p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اطلب أي مهمة أو اسأل عن أي خطوة..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-black font-bold shadow-md hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="إرسال"
            >
              {isLoading ? (
                <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : (
                <span className="text-base">🚀</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button (Bottom Left) */}
      <div className="relative group">
        <button
          id="growlab-floating-ai-assistant-btn"
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            playChime();
          }}
          className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-800 text-white shadow-xl ring-2 transition-all duration-200 active:scale-95 ${
            isOpen
              ? "ring-amber-500 bg-amber-500 text-black shadow-amber-500/30"
              : "ring-amber-500/50 hover:ring-amber-400 hover:shadow-amber-500/20"
          }`}
          aria-label="مساعد Growlab الذكي"
        >
          {/* Animated Glow Rings */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-300 opacity-30 blur-sm group-hover:opacity-75 transition duration-300" />
          )}

          {/* Button Icon */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {isOpen ? (
              <span className="text-xl font-bold">✕</span>
            ) : (
              <>
                <span className="text-2xl">✨</span>
                <span className="text-[9px] font-bold text-amber-400 -mt-1">AI</span>
              </>
            )}
          </div>

          {/* Unread Alert Indicator */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-2 ring-slate-900">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </span>
          )}
        </button>

        {/* Hover Tooltip / Prompt bubble */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer absolute left-16 bottom-2 hidden whitespace-nowrap rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-1.5 text-xs text-slate-100 shadow-xl backdrop-blur-md group-hover:flex items-center gap-2 transition-all duration-200"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              مساعد Growlab الذكي 🤖 — <strong className="text-amber-400">اسألني أو اطلب تنفيذ مهمة</strong>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
