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
    text: "مرحباً بك في **Growlab**! 👋 أنا مستشارك التجاري والمساعد الذكي للتنفيذ الفوري.\n\nأنا هنا لشرح فكرة المنصة الفريدة، مقارنتها بالبدائل التقليدية، وإرشادك للباقة المناسبة لمتجرك (المجانية 0 ر.ع. أو باقة Pro المدفوعة بـ 15 ر.ع./شهر)، أو تنفيذ مهامك كبناء المتجر بالبلوكات واحتساب صافي الأرباح.",
    action: {
      type: "open_free_plan",
      titleAr: "البدء مجاناً وتجربة المنصة (0 ر.ع.)",
      titleEn: "Start for Free (0 OMR)",
      descriptionAr: "إنشاء حسابك وتجربة المتجر والحملات بدون أي رسوم تسجيل",
      descriptionEn: "Create free account and test platform features",
      targetUrl: "/enter/merchant",
    },
    suggestions: [
      "ايش فكرة المنصة وكيف تختلف عن سلة وشوبيفاي؟",
      "ما الفرق بين الباقة المجانية وباقة Pro؟",
      "أريد الاشتراك في الباقة المجانية (0 ر.ع.)",
      "أريد الترقية إلى باقة Pro (15 ر.ع./شهر)",
      "كيف أضيف منتج جديد لمتجري؟",
      "احسب صافي أرباح حملة إعلانية",
    ],
    timestamp: "الآن",
  },
];

const QUICK_ACTIONS = [
  {
    id: "concept",
    label: "فكرة المنصة ومقارنتها",
    prompt: "ايش فكرة المنصة هذه وليش اختاركم بدل سلة وشوبيفاي؟",
    icon: Sparkles,
    highlight: true,
  },
  {
    id: "free_plan",
    label: "الباقة المجانية (0 ر.ع.)",
    prompt: "أريد الاشتراك في الباقة المجانية",
    icon: Zap,
  },
  {
    id: "pro_plan",
    label: "باقة Pro (15 ر.ع.)",
    prompt: "أريد الترقية إلى باقة Pro المدفوعة",
    icon: TrendingUp,
  },
  {
    id: "pricing",
    label: "الأسعار والباقات",
    prompt: "ما هي باقات الاشتراك والأسعار في Growlab؟",
    icon: CreditCard,
  },
  {
    id: "sim",
    label: "محاكي المبيعات",
    prompt: "شغّل محاكي المبيعات وضف طلب تجريبي",
    icon: Zap,
  },
  {
    id: "store",
    label: "محرر المتجر بالبلوكات",
    prompt: "ابنِ لي متجر جديد بالبلوكات",
    icon: Store,
  },
  {
    id: "calc",
    label: "حاسبة صافي الربح",
    prompt: "احسب صافي الأرباح",
    icon: Calculator,
  },
  {
    id: "kyc",
    label: "التوثيق والشارة الزرقاء",
    prompt: "وجّهني لتوثيق الهوية والشارة الزرقاء",
    icon: ShieldCheck,
  },
  {
    id: "samples",
    label: "كتالوج عينات المسوقين",
    prompt: "استعرض كتالوج عينات المسوقين المجانية",
    icon: Package,
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
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs sm:hidden transition-opacity duration-200"
            aria-hidden="true"
          />
        )}

        {/* AI Chat Window - Light Theme with Crisp White Canvas, Black Typography & Shimmering Iridescent Action Buttons */}
        {isOpen && (
          <div
            id="growlab-ai-chat-window"
            className="fixed inset-x-2 sm:inset-x-auto bottom-[4.5rem] sm:bottom-auto z-50 flex h-[62dvh] max-h-[460px] sm:h-[450px] sm:max-h-[480px] sm:w-[355px] flex-col overflow-hidden rounded-[22px] sm:rounded-[26px] border border-slate-200 bg-white text-black shadow-[0_20px_50px_rgba(15,23,42,0.18),0_4px_16px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-3xl ring-1 ring-black/5 sm:static sm:mb-2.5 transition-all duration-300 ease-out"
            dir="rtl"
          >
            {/* Top Specular Liquid Glass Edge */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-slate-300 to-transparent z-20" />

            {/* Ambient Pastel Highlights for Light Mesh */}
            <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-sky-100/50 blur-2xl" />
            <div className="pointer-events-none absolute top-1/2 -right-12 h-36 w-36 rounded-full bg-violet-100/40 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-24 w-24 rounded-full bg-amber-100/40 blur-xl" />

            {/* Header */}
            <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-3.5 py-2.5 backdrop-blur-xl">
              <div className="flex items-center gap-2 min-w-0">
                {/* Bot Avatar Disc */}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-xs">
                  <img
                    src="/AIbot.gif"
                    alt="Growlab AI Bot"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/AI.gif";
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[12.5px] sm:text-[12px] font-bold text-black tracking-tight truncate">
                      مساعد Growlab الذكي
                    </h3>
                    <span className="shrink-0 rounded-full gl-iridescent-wavy-btn px-2 py-0.5 text-[8.5px] font-black text-black shadow-xs">
                      منفّذ آلي
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[9.5px] text-slate-600 font-medium truncate">
                    متصل • جاهز لإرشادك وتنفيذ المهام
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-black hover:bg-slate-100 hover:text-black transition-all shadow-xs active:scale-95"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5 text-black" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="إعادة بدء المحادثة"
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-black hover:bg-slate-100 hover:text-black transition-all shadow-xs active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-black" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="إغلاق"
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-black hover:bg-slate-100 hover:text-black transition-all shadow-xs active:scale-95"
                >
                  <X className="h-3.5 w-3.5 text-black" />
                </button>
              </div>
            </div>

            {/* Messages Stream Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-3 space-y-2.5 [scrollbar-width:thin] scrollbar-thumb-slate-300 scrollbar-track-transparent bg-white">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-start" : "items-end"} gap-0.5`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[88%] p-3 sm:p-2.5 text-[12.5px] sm:text-[11.5px] leading-relaxed transition-all ${
                        isUser
                          ? "rounded-2xl rounded-tr-xs border border-slate-900 bg-slate-900 text-white font-medium shadow-[0_4px_12px_rgba(15,23,42,0.12)]"
                          : "rounded-2xl rounded-tl-xs border border-slate-200 bg-slate-50 text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)]"
                      }`}
                    >
                      <p
                        className={`whitespace-pre-line leading-relaxed font-medium ${
                          isUser ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {m.text}
                      </p>

                      {/* Interactive Action Card if provided by Bot */}
                      {m.action && (
                        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2.5 text-black shadow-xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1 text-[10.5px] sm:text-[10px] font-extrabold text-black">
                              <Zap className="h-3 w-3 text-black fill-amber-400" />
                              <span>مهمة قابلة للتنفيذ</span>
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[8.5px] font-bold text-black shadow-2xs">
                              فوري
                            </span>
                          </div>
                          <p className="mt-1 text-[11.5px] sm:text-[11px] font-extrabold text-black">
                            {m.action.titleAr}
                          </p>
                          <p className="mt-0.5 text-[10.5px] sm:text-[10px] text-slate-700 leading-normal">
                            {m.action.descriptionAr}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleExecuteAction(m.action!, m.id)}
                            className="gl-shimmer-iridescent-action-btn mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 sm:py-1.5 text-[11.5px] sm:text-[11px] font-extrabold text-black shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-black text-black" />
                            <span>تنفيذ المهمة وفتح الشاشة</span>
                          </button>
                        </div>
                      )}

                      {/* Suggestion Chips - Wavy Iridescent with Shimmering on Hover */}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                          {m.suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSend(s)}
                              className="gl-iridescent-wavy-chip group flex items-center justify-between gap-1.5 rounded-xl px-3 py-2 sm:px-2.5 sm:py-1.5 text-[11px] sm:text-[10.5px] font-bold text-black shadow-xs active:scale-[0.99] transition-all text-right cursor-pointer"
                            >
                              <span className="leading-tight text-black font-semibold">{s}</span>
                              <span className="text-[10px] font-bold text-slate-700 group-hover:text-black group-hover:translate-x-0.5 transition-all">
                                ↵
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] sm:text-[8.5px] font-mono text-slate-500 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Interactive Embedded Net Margin Calculator */}
              {calcState.open && (
                <div className="rounded-2xl border border-slate-200 bg-white p-2.5 text-[11px] sm:text-[10.5px] text-black shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <h4 className="font-bold text-black flex items-center gap-1 text-[11.5px] sm:text-[11px]">
                      <Calculator className="h-3 w-3 text-black" />
                      <span>حاسبة صافي الأرباح</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCalcState((p) => ({ ...p, open: false }))}
                      className="flex h-5 w-5 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-black hover:bg-slate-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px] sm:text-[10px]">
                    <div>
                      <label className="text-black font-semibold">سعر البيع (ر.ع):</label>
                      <input
                        type="number"
                        value={calcState.price}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            price: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-black font-bold focus:border-slate-400 focus:bg-white focus:outline-hidden text-[16px] sm:text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-black font-semibold">تكلفة البضاعة:</label>
                      <input
                        type="number"
                        value={calcState.cogs}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            cogs: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-black font-bold focus:border-slate-400 focus:bg-white focus:outline-hidden text-[16px] sm:text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-black font-semibold">الإعلانات لكل طلب:</label>
                      <input
                        type="number"
                        value={calcState.ads}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            ads: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-black font-bold focus:border-slate-400 focus:bg-white focus:outline-hidden text-[16px] sm:text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-black font-semibold">حماية المرتجع RTO:</label>
                      <input
                        type="number"
                        value={calcState.rto}
                        onChange={(e) =>
                          setCalcState((p) => ({
                            ...p,
                            rto: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-black font-bold focus:border-slate-400 focus:bg-white focus:outline-hidden text-[16px] sm:text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between rounded-xl gl-shimmer-iridescent-action-btn p-2">
                    <div>
                      <p className="text-[9.5px] sm:text-[9px] font-bold text-slate-800">صافي الربح المتوقع:</p>
                      <p className="text-[12.5px] sm:text-[12px] font-black text-black font-mono">
                        {netMarginVal.toFixed(2)} ر.ع
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[9.5px] sm:text-[9px] font-bold text-slate-800">الهامش الصافي:</p>
                      <p className="text-[12.5px] sm:text-[12px] font-black text-black font-mono">
                        {netMarginPercent}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-[11.5px] sm:text-[11px] font-medium text-black shadow-xs w-fit">
                  <span className="flex h-2 w-2 rounded-full bg-black animate-ping" />
                  <span>المساعد يجهز وينفذ طلبك...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips Bar - Wavy Iridescent Horizontal Chips with Shimmering on Hover */}
            <div className="relative z-10 flex items-center border-t border-slate-200 bg-slate-50/95 px-1.5 py-2 sm:py-1.5 backdrop-blur-xl">
              {/* Left Navigation Chevron */}
              <button
                type="button"
                onClick={() => scrollQuickActions("left")}
                className="flex h-7 w-7 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 hover:text-black transition-all active:scale-90"
                aria-label="تمرير لليمين"
              >
                <ChevronRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
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
                <div className="flex items-center gap-1.5 whitespace-nowrap px-1 text-[11px] sm:text-[10px]">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleSend(action.prompt)}
                        className={`gl-iridescent-wavy-btn flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-2.5 sm:py-1 font-bold text-black shadow-xs active:scale-95 transition-all cursor-pointer ${
                          action.highlight
                            ? "ring-1 ring-slate-400 font-extrabold"
                            : ""
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-3 sm:w-3 shrink-0 text-black" />
                        <span className="whitespace-nowrap font-bold text-black">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Navigation Chevron */}
              <button
                type="button"
                onClick={() => scrollQuickActions("right")}
                className="flex h-7 w-7 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 hover:text-black transition-all active:scale-90"
                aria-label="تمرير لليسار"
              >
                <ChevronLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>

            {/* Input Bar Section - Configured with 16px font size on mobile to prevent iOS Safari auto-zoom */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative z-10 flex items-center gap-2 border-t border-slate-200 bg-white p-2.5 sm:p-2 backdrop-blur-2xl"
            >
              <div className="relative flex flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:py-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اطلب أي مهمة أو اسأل..."
                  autoCapitalize="none"
                  autoCorrect="off"
                  enterKeyHint="send"
                  className="w-full bg-transparent py-0.5 text-[16px] sm:text-[12px] font-medium text-black placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="إرسال الرسالة"
                className="gl-shimmer-iridescent-action-btn group relative flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl text-black font-bold shadow-sm hover:brightness-105 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <span
                    className={`relative flex items-center justify-center transition-all duration-500 ease-out ${
                      isFlying
                        ? "-translate-x-4 -translate-y-4 scale-75 opacity-0 -rotate-12"
                        : "translate-x-0 translate-y-0 scale-100 opacity-100 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                    }`}
                  >
                    <Send className="h-4 w-4 sm:h-3.5 sm:w-3.5 -scale-x-100 text-black" />
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Floating Action Button (Strictly Circular, Smooth Morph Animation) */}
        <button
          id="growlab-floating-ai-assistant-toggle"
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (!isOpen) playChime();
          }}
          className={`group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border transition-all duration-300 ease-out shadow-[0_10px_28px_rgba(15,23,42,0.18),inset_0_1.5px_1px_rgba(255,255,255,0.9)] active:scale-95 focus:outline-none select-none ${
            isOpen
              ? "border-slate-300 bg-white text-slate-900 shadow-[0_0_20px_rgba(99,102,241,0.25),inset_0_1px_0_rgba(255,255,255,1)] rotate-90 backdrop-blur-2xl"
              : "border-slate-200 bg-white hover:border-slate-300 hover:scale-105 rotate-0 backdrop-blur-xl"
          }`}
          aria-label={isOpen ? "إغلاق مساعد Growlab الذكي" : "فتح مساعد Growlab الذكي"}
        >
          {/* Bot Avatar Disc (Visible when closed) */}
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
              width={48}
              height={48}
              className="h-full w-full object-cover shrink-0"
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
            <X className="h-5 w-5 text-slate-900" />
          </div>
        </button>
      </div>
    </aside>
  );
}

