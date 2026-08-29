"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Volume2,
  VolumeX,
  X,
  Zap,
  Store,
  ShieldCheck,
  Calculator,
  Play,
  RotateCcw,
  Sparkles,
  Package,
  TrendingUp,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
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
      "احسب صافي أرباح منتج جديد",
      "جرّب متجر المشتري والدفع عند الاستلام",
      "كتالوج العينات وروابط المسوقين",
      "تشغيل محاكي المبيعات اللحظية",
      "بناء متجر عطور بالبلوكات",
      "توجيهي لتوثيق الهوية والشارة الزرقاء",
    ],
    timestamp: "الآن",
  },
];

const QUICK_ACTIONS = [
  {
    id: "sim",
    label: "محاكي المبيعات",
    prompt: "شغّل محاكي المبيعات وضف طلب تجريبي",
    icon: Zap,
    highlight: true,
  },
  {
    id: "store",
    label: "محرر المتجر",
    prompt: "ابنِ لي متجر جديد بالبلوكات",
    icon: Store,
  },
  {
    id: "kyc",
    label: "التوثيق KYC",
    prompt: "وجّهني لتوثيق الهوية والشارة الزرقاء",
    icon: ShieldCheck,
  },
  {
    id: "calc",
    label: "حاسبة صافي الربح",
    prompt: "احسب صافي الأرباح",
    icon: Calculator,
  },
  {
    id: "audit",
    label: "فحص التسريب المالي",
    prompt: "افحص التسريبات المالية في متجري",
    icon: TrendingUp,
  },
  {
    id: "samples",
    label: "عينات المسوقين",
    prompt: "استعرض كتالوج عينات المسوقين المجانية",
    icon: Package,
  },
  {
    id: "cod",
    label: "تحصيلات COD والشحن",
    prompt: "كيف تعمل مطابقة تحصيلات شركات الشحن؟",
    icon: CreditCard,
  },
];

export default function FloatingAssistantChat() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
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
  const quickActionsRef = useRef<HTMLDivElement | null>(null);

  // Mouse drag scrolling state for Quick Actions
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!quickActionsRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - quickActionsRef.current.offsetLeft;
    scrollLeftRef.current = quickActionsRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !quickActionsRef.current) return;
    e.preventDefault();
    const x = e.pageX - quickActionsRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    quickActionsRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const scrollQuickActions = (direction: "left" | "right") => {
    if (!quickActionsRef.current) return;
    const offset = direction === "left" ? -140 : 140;
    quickActionsRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 180);
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
      // Audio playback restriction fallback
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

    // Trigger paper airplane flight animation
    setIsFlying(true);
    setTimeout(() => setIsFlying(false), 500);

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
      className="fixed z-50 bottom-4 end-4 sm:bottom-6 sm:end-6 font-sans pointer-events-none"
    >
      <div className="pointer-events-auto flex flex-col items-end">
        {/* Mobile Backdrop Overlay when chat is open */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs sm:hidden transition-opacity duration-200"
            aria-hidden="true"
          />
        )}

        {/* AI Chat Window - iOS 26 Liquid Glass Aesthetic with Sky Blue (#70C5F8) & Deep Black Theme */}
        {isOpen && (
          <div
            id="growlab-ai-chat-window"
            className="fixed inset-x-3 bottom-16 z-50 flex h-[62dvh] max-h-[420px] flex-col overflow-hidden rounded-[24px] border border-white/20 bg-black/80 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1.5px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.08)] backdrop-blur-3xl ring-1 ring-white/10 sm:static sm:inset-auto sm:mb-2.5 sm:h-[400px] sm:max-h-[420px] sm:w-[335px] sm:rounded-[24px] transition-all duration-300 ease-out"
            dir="rtl"
          >
            {/* Top Specular Liquid Glass Edge */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent z-20" />

            {/* Liquid Glass Sky Blue Ambient Highlights */}
            <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-[#70C5F8]/20 blur-2xl" />
            <div className="pointer-events-none absolute top-1/2 -right-12 h-32 w-32 rounded-full bg-[#70C5F8]/15 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-20 w-20 rounded-full bg-[#70C5F8]/15 blur-xl" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-black/40" />

            {/* Liquid Glass Header */}
            <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl">
              <div className="flex items-center gap-2 min-w-0">
                {/* Bot Avatar Disc (Clean, no green dot) */}
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                  <img
                    src="/AIbot.gif"
                    alt="Growlab AI Bot"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/AI.gif";
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[11.5px] font-bold text-white tracking-tight truncate">
                      مساعد Growlab الذكي
                    </h3>
                    <span className="shrink-0 rounded-full border border-[#70C5F8]/40 bg-[#70C5F8]/15 px-1.5 py-0.2 text-[8px] font-bold text-[#70C5F8] backdrop-blur-md">
                      منفّذ آلي
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-300/80 truncate">
                    متصل • جاهز لإرشادك وتنفيذ المهام
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.15] hover:text-white transition-all backdrop-blur-md active:scale-95"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3 w-3 text-[#70C5F8]" />
                  ) : (
                    <VolumeX className="h-3 w-3 text-slate-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.15] hover:text-white transition-all backdrop-blur-md active:scale-95"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.15] hover:text-white transition-all backdrop-blur-md active:scale-95"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Messages Stream Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-2.5 space-y-2 [scrollbar-width:thin] scrollbar-thumb-white/15 scrollbar-track-transparent">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-start" : "items-end"} gap-0.5`}
                  >
                    <div
                      className={`max-w-[88%] p-2 sm:p-2.5 text-[11px] leading-relaxed backdrop-blur-2xl transition-all ${
                        isUser
                          ? "rounded-2xl rounded-tr-xs border border-[#70C5F8]/40 bg-gradient-to-br from-[#70C5F8] to-[#4EAEE8] text-black font-semibold shadow-[0_4px_14px_rgba(112,197,248,0.35),inset_0_1px_0_rgba(255,255,255,0.6)]"
                          : "rounded-2xl rounded-tl-xs border border-white/15 bg-black/50 text-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                      {/* Interactive Action Card if provided by Bot */}
                      {m.action && (
                        <div className="mt-1.5 rounded-xl border border-[#70C5F8]/30 bg-black/60 p-2 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#70C5F8]">
                              <Zap className="h-2.5 w-2.5 text-[#70C5F8]" />
                              <span>مهمة قابلة للتنفيذ</span>
                            </span>
                            <span className="rounded-full border border-[#70C5F8]/30 bg-[#70C5F8]/15 px-1.5 py-0.2 text-[8px] font-bold text-[#70C5F8]">
                              فوري
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] font-bold text-white">
                            {m.action.titleAr}
                          </p>
                          <p className="mt-0.5 text-[9.5px] text-slate-300 leading-normal">
                            {m.action.descriptionAr}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleExecuteAction(m.action!, m.id)}
                            className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#70C5F8]/50 bg-gradient-to-r from-[#70C5F8] to-[#4EAEE8] px-2 py-1 text-[11px] font-bold text-black shadow-[0_4px_12px_rgba(112,197,248,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] hover:brightness-105 active:scale-[0.98] transition-all"
                          >
                            <Play className="h-2.5 w-2.5 fill-black" />
                            <span>تنفيذ المهمة وفتح الشاشة</span>
                          </button>
                        </div>
                      )}

                      {/* Suggestion Chips */}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-white/10 flex flex-col gap-1">
                          {m.suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSend(s)}
                              className="group flex items-center justify-between gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10.5px] font-medium text-slate-200 shadow-xs hover:border-[#70C5F8]/50 hover:bg-[#70C5F8]/15 hover:text-[#70C5F8] active:scale-[0.99] transition-all text-right backdrop-blur-md"
                            >
                              <span className="leading-tight">{s}</span>
                              <span className="text-[9px] text-slate-400 group-hover:text-[#70C5F8] opacity-60 group-hover:opacity-100 transition-opacity">
                                ↵
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] font-mono text-slate-400/70 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Interactive Embedded Net Margin Calculator */}
              {calcState.open && (
                <div className="rounded-xl border border-[#70C5F8]/30 bg-black/70 p-2 text-[10.5px] text-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between border-b border-[#70C5F8]/20 pb-1">
                    <h4 className="font-bold text-[#70C5F8] flex items-center gap-1 text-[10.5px]">
                      <Calculator className="h-2.5 w-2.5 text-[#70C5F8]" />
                      <span>حاسبة صافي الأرباح</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCalcState((p) => ({ ...p, open: false }))}
                      className="flex h-4 w-4 items-center justify-center rounded border border-white/10 bg-white/5 text-slate-300 hover:text-white"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>

                  <div className="mt-1.5 grid grid-cols-2 gap-1 text-[9.5px]">
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
                        className="mt-0.5 w-full rounded border border-white/15 bg-black/60 px-1.5 py-0.5 text-white font-bold backdrop-blur-md focus:border-[#70C5F8] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300">تكلفة البضاعة:</label>
                      <input
                        type="number"
                        value={calcState.cogs}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            cogs: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-0.5 w-full rounded border border-white/15 bg-black/60 px-1.5 py-0.5 text-white font-bold backdrop-blur-md focus:border-[#70C5F8] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300">الإعلانات لكل طلب:</label>
                      <input
                        type="number"
                        value={calcState.ads}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            ads: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-0.5 w-full rounded border border-white/15 bg-black/60 px-1.5 py-0.5 text-white font-bold backdrop-blur-md focus:border-[#70C5F8] focus:outline-hidden"
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
                        className="mt-0.5 w-full rounded border border-white/15 bg-black/60 px-1.5 py-0.5 text-white font-bold backdrop-blur-md focus:border-[#70C5F8] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between rounded-lg border border-[#70C5F8]/40 bg-[#70C5F8]/15 p-1.5">
                    <div>
                      <p className="text-[8.5px] text-[#70C5F8]">صافي الربح:</p>
                      <p className="text-[11px] font-extrabold text-[#70C5F8] font-mono">
                        {netMarginVal.toFixed(2)} ر.ع
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[8.5px] text-[#70C5F8]">الهامش الصافي:</p>
                      <p className="text-[11px] font-extrabold text-white font-mono">
                        {netMarginPercent}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/60 p-1.5 text-[10.5px] text-slate-200 backdrop-blur-xl w-fit">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-[#70C5F8] animate-ping" />
                  <span>المساعد يجهز وينفذ طلبك...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips Bar - Smooth Horizontal Drag & Navigation Arrows */}
            <div className="relative z-10 flex items-center border-t border-white/10 bg-black/40 px-1 py-1 backdrop-blur-xl">
              {/* Left Navigation Chevron */}
              <button
                type="button"
                onClick={() => scrollQuickActions("left")}
                className="flex h-6 w-5 shrink-0 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                aria-label="تمرير لليمين"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              {/* Chips Scrollable Container with Drag Support */}
              <div
                ref={quickActionsRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-1 whitespace-nowrap px-1 text-[10px]">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleSend(action.prompt)}
                        className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-medium shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0.5px_rgba(255,255,255,0.3)] active:scale-95 transition-all backdrop-blur-md ${
                          action.highlight
                            ? "border border-[#70C5F8]/50 bg-[#70C5F8]/25 text-[#70C5F8] hover:bg-[#70C5F8] hover:text-black"
                            : "border border-white/15 bg-black/40 text-slate-200 hover:border-[#70C5F8]/40 hover:bg-white/[0.14] hover:text-[#70C5F8]"
                        }`}
                      >
                        <Icon className="h-2.5 w-2.5 shrink-0" />
                        <span className="whitespace-nowrap">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Navigation Chevron */}
              <button
                type="button"
                onClick={() => scrollQuickActions("right")}
                className="flex h-6 w-5 shrink-0 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                aria-label="تمرير لليسار"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Input Bar Section */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative z-10 flex items-center gap-1.5 border-t border-white/10 bg-black/80 p-1.5 backdrop-blur-2xl"
            >
              <div className="relative flex flex-1 items-center rounded-xl border border-white/15 bg-white/[0.05] px-2.5 py-0.5 backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] focus-within:border-[#70C5F8]/80 focus-within:ring-1 focus-within:ring-[#70C5F8]/30 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اطلب أي مهمة أو اسأل..."
                  className="w-full bg-transparent py-0.5 text-[11px] text-white placeholder-slate-400/70 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="إرسال الرسالة"
                className="group relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#70C5F8]/50 bg-gradient-to-r from-[#70C5F8] to-[#4EAEE8] text-black font-bold shadow-[0_4px_12px_rgba(112,197,248,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] hover:brightness-105 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {isLoading ? (
                  <span className="h-3 w-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <span
                    className={`relative flex items-center justify-center transition-all duration-500 ease-out ${
                      isFlying
                        ? "-translate-x-4 -translate-y-4 scale-75 opacity-0 -rotate-12"
                        : "translate-x-0 translate-y-0 scale-100 opacity-100 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                    }`}
                  >
                    <Send className="h-3.5 w-3.5 -scale-x-100" />
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Floating Action Button (Strictly Circular, Clean Liquid Glass, Smooth Morph Animation) */}
        <button
          id="growlab-floating-ai-assistant-toggle"
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (!isOpen) playChime();
          }}
          className={`group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border transition-all duration-300 ease-out shadow-[0_10px_28px_rgba(0,0,0,0.65),inset_0_1.5px_1px_rgba(255,255,255,0.4)] active:scale-95 focus:outline-none select-none ${
            isOpen
              ? "border-[#70C5F8]/60 bg-black/90 text-[#70C5F8] shadow-[0_0_20px_rgba(112,197,248,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] rotate-90 backdrop-blur-2xl"
              : "border-white/25 bg-black/90 hover:border-[#70C5F8]/60 hover:scale-105 rotate-0 backdrop-blur-xl"
          }`}
          aria-label={isOpen ? "إغلاق مساعد Growlab الذكي" : "فتح مساعد Growlab الذكي"}
        >
          {/* Bot Avatar Disc (Visible when closed - Clean without any green circle badge) */}
          <div
            className={`absolute inset-0 flex items-center justify-center overflow-hidden rounded-full transition-all duration-300 ease-out ${
              isOpen
                ? "opacity-0 scale-50 rotate-45 pointer-events-none"
                : "opacity-100 scale-100 rotate-0"
            }`}
          >
            <img
              src="/AIbot.gif"
              alt="Growlab AI Bot"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/AI.gif";
              }}
            />
          </div>

          {/* X Close Icon (Visible when open with smooth rotation) */}
          <div
            className={`flex items-center justify-center transition-all duration-300 ease-out ${
              isOpen
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 -rotate-90 pointer-events-none"
            }`}
          >
            <X className="h-4.5 w-4.5 text-[#70C5F8] drop-shadow-[0_0_8px_rgba(112,197,248,0.6)]" />
          </div>
        </button>
      </div>
    </aside>
  );
}

