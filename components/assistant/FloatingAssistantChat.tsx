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
    text: "مرحباً بك في Growlab (مساعد ريادة للامتثال). أنا وكيلك الذكي لمتابعة اللوائح، التراخيص، ونسب التعمين في سلطنة عُمان.\n\nأنا هنا لحساب نسبة التعمين لقطاعك، تتبع مواعيد تجديد السجل التجاري ورخص البلدية، وتنبيهك استباقياً قبل وقوع أي غرامات عبر واتساب ولوحة التحكم.",
    action: {
      type: "open_quiz",
      titleAr: "بدء فحص الامتثال السريع (مجاناً)",
      titleEn: "Start Free Compliance Audit",
      descriptionAr: "فحص فوري خلال دقيقة لنسب التعمين، التراخيص، والغرامات المحتملة",
      descriptionEn: "Instant 1-minute audit for quotas and permits",
      targetUrl: "/quiz",
    },
    suggestions: [
      "كيف أحسب نسبة التعمين المطلوبة لنشاطي؟",
      "ما هي غرامات تأخر تجديد السجل التجاري والبلدية؟",
      "افتح حاسبة التعمين والغرامات الفورية",
      "ما هي باقات الاشتراك والأسعار في Growlab؟",
      "كيف تعمل تنبيهات واتساب الاستباقية؟",
      "استعراض لوحة تحكم الامتثال",
    ],
    timestamp: "الآن",
  },
];

const QUICK_ACTIONS = [
  {
    id: "audit",
    label: "فحص الامتثال السريع",
    prompt: "أريد إجراء فحص شامل لامتثال مؤسستي وحساب الغرامات المحتملة",
    icon: ShieldCheck,
    highlight: true,
  },
  {
    id: "calc",
    label: "حاسبة التعمين والغرامات",
    prompt: "افتح حاسبة التعمين والغرامات في المحادثة",
    icon: Calculator,
  },
  {
    id: "dashboard",
    label: "لوحة تحكم الامتثال",
    prompt: "استعرض لوحة تحكم الامتثال",
    icon: TrendingUp,
  },
  {
    id: "pricing",
    label: "الأسعار والباقات",
    prompt: "ما هي باقات الاشتراك والأسعار في Growlab؟",
    icon: CreditCard,
  },
  {
    id: "whatsapp",
    label: "تنبيهات واتساب",
    prompt: "كيف تعمل تنبيهات واتساب الاستباقية قبل 60 يوماً؟",
    icon: Zap,
  },
  {
    id: "tawteen",
    label: "منصة توطين والحماية",
    prompt: "ما هي شروط منصة توطين وصندوق الحماية الاجتماعية لتوثيق العقود؟",
    icon: Sparkles,
  },
  {
    id: "tax",
    label: "الفوترة الإلكترونية والضرائب",
    prompt: "ما هي متطلبات الفوترة الضريبية لتفادي غرامات جهاز الضرائب؟",
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

  // Omanisation & Fine mini-calculator state in chat
  const [calcState, setCalcState] = useState<{
    open: boolean;
    sector: string;
    targetQuota: number;
    totalStaff: number;
    omaniStaff: number;
  }>({
    open: false,
    sector: "تجارة وتجزئة (35%)",
    targetQuota: 35,
    totalStaff: 8,
    omaniStaff: 1,
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

    if (action.type === "open_quiz" || action.targetUrl === "/quiz") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-compliance-quiz"));
      }
      return;
    }

    if (action.type === "calculate_omanisation" || action.type === "calculate_profit") {
      setCalcState((prev) => ({ ...prev, open: true }));
      scrollToBottom();
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

    // Auto open calculator if user asks for it
    if (textToSend.includes("حاسبة") || textToSend.includes("احسب")) {
      setCalcState((prev) => ({ ...prev, open: true }));
    }

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
        text: data.text || "تم تحليل استفسارك التنظيمي بنجاح.",
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
        text: "أهلاً بك. يمكنك إجراء فحص شامل لنسب التعمين والتراخيص مجاناً أو استعراض لوحة التحكم لحماية مؤسستك من الغرامات.",
        action: {
          type: "open_quiz",
          titleAr: "بدء فحص الامتثال السريع (مجاناً)",
          titleEn: "Start Compliance Audit",
          descriptionAr: "فحص فوري خلال دقيقة لنسب التعمين والتراخيص وتحديد الغرامات المحتملة",
          descriptionEn: "Instant 1-minute audit",
          targetUrl: "/quiz",
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

  const currentQuota =
    calcState.totalStaff > 0
      ? Math.round((calcState.omaniStaff / calcState.totalStaff) * 100)
      : 0;
  const requiredOmanis = Math.ceil(
    (calcState.targetQuota / 100) * calcState.totalStaff
  );
  const missingOmanis = Math.max(0, requiredOmanis - calcState.omaniStaff);
  const estimatedMonthlyFine = missingOmanis * 250;
  const isCompliant = missingOmanis === 0;

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

        {/* AI Chat Window — Emerald theme, taller on mobile */}
        {isOpen && (
          <div
            id="growlab-ai-chat-window"
            className="fixed inset-x-2 sm:inset-x-auto bottom-[4.5rem] sm:bottom-auto z-50 flex h-[78dvh] max-h-[560px] sm:h-[520px] sm:max-h-[560px] sm:w-[370px] flex-col overflow-hidden rounded-[22px] sm:rounded-[26px] border border-emerald-200/60 bg-white text-black shadow-[0_20px_50px_rgba(16,185,129,0.12),0_4px_16px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-3xl ring-1 ring-emerald-100/80 sm:static sm:mb-2.5 transition-all duration-300 ease-out"
            dir="rtl"
          >
            {/* Top Emerald Specular Edge */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent z-20" />

            {/* Ambient Emerald Highlights */}
            <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-emerald-100/50 blur-2xl" />
            <div className="pointer-events-none absolute top-1/2 -right-12 h-36 w-36 rounded-full bg-teal-100/40 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-24 w-24 rounded-full bg-emerald-50/60 blur-xl" />

            {/* Header */}
            <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/50 px-3.5 py-2.5 backdrop-blur-xl">
              <div className="flex items-center gap-2 min-w-0">
                {/* Bot Avatar Disc */}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-200 bg-emerald-50 shadow-xs">
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
                      مساعد Growlab للامتثال
                    </h3>
                    <span className="shrink-0 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[8.5px] font-black text-emerald-800 shadow-xs">
                      وكيل معتمد
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[9.5px] text-emerald-700 font-medium truncate">
                    مستشارك الذكي للأنظمة واللوائح العُمانية
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all shadow-xs active:scale-95"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="إعادة بدء المحادثة"
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all shadow-xs active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="إغلاق"
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all shadow-xs active:scale-95"
                >
                  <X className="h-3.5 w-3.5" />
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
                          ? "rounded-2xl rounded-tr-xs border border-emerald-600 bg-emerald-600 text-white font-medium shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                          : "rounded-2xl rounded-tl-xs border border-emerald-100 bg-emerald-50/60 text-slate-900 shadow-[0_2px_8px_rgba(16,185,129,0.06),inset_0_1px_0_rgba(255,255,255,1)]"
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
                        <div className="mt-2 rounded-xl border border-emerald-200 bg-white p-2.5 shadow-xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1 text-[10.5px] sm:text-[10px] font-extrabold text-emerald-800">
                              <Zap className="h-3 w-3 text-emerald-600 fill-emerald-400" />
                              <span>مهمة قابلة للتنفيذ</span>
                            </span>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8.5px] font-bold text-emerald-700 shadow-2xs">
                              فوري
                            </span>
                          </div>
                          <p className="mt-1 text-[11.5px] sm:text-[11px] font-extrabold text-slate-900">
                            {m.action.titleAr}
                          </p>
                          <p className="mt-0.5 text-[10.5px] sm:text-[10px] text-slate-600 leading-normal">
                            {m.action.descriptionAr}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleExecuteAction(m.action!, m.id)}
                            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-2.5 py-2 sm:py-1.5 text-[11.5px] sm:text-[11px] font-extrabold text-white shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-white text-white" />
                            <span>تنفيذ المهمة وفتح الشاشة</span>
                          </button>
                        </div>
                      )}

                      {/* Suggestion Chips — Emerald theme */}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-emerald-100 flex flex-col gap-1.5">
                          {m.suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSend(s)}
                              className="group flex items-center justify-between gap-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 hover:border-emerald-400 px-3 py-2 sm:px-2.5 sm:py-1.5 text-[11px] sm:text-[10.5px] font-semibold text-emerald-900 shadow-xs active:scale-[0.99] transition-all text-right cursor-pointer"
                            >
                              <span className="leading-tight">{s}</span>
                              <span className="text-[10px] font-bold text-emerald-500 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all">
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

              {/* Interactive Embedded Omanisation & Fine Calculator */}
              {calcState.open && (
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-[11px] sm:text-[10.5px] text-black shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-black flex items-center gap-1.5 text-[12px] sm:text-[11.5px]">
                      <Calculator className="h-3.5 w-3.5 text-emerald-600" />
                      <span>حاسبة التعمين والغرامات الفورية</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCalcState((p) => ({ ...p, open: false }))}
                      className="flex h-5 w-5 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-black hover:bg-slate-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="mt-2.5 space-y-2">
                    <div>
                      <label className="text-black font-semibold text-[10.5px]">قطاع النشاط التجاري:</label>
                      <select
                        value={calcState.sector}
                        onChange={(e) => {
                          const val = e.target.value;
                          let quota = 25;
                          if (val.includes("35%")) quota = 35;
                          else if (val.includes("20%")) quota = 20;
                          else if (val.includes("30%")) quota = 30;
                          else if (val.includes("25%")) quota = 25;
                          setCalcState((p) => ({
                            ...p,
                            sector: val,
                            targetQuota: quota,
                          }));
                        }}
                        className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-black font-bold focus:border-slate-400 focus:bg-white focus:outline-hidden text-xs"
                      >
                        <option value="تجارة وتجزئة (35%)">تجارة وتجزئة (المستهدف: 35%)</option>
                        <option value="خدمات ومطاعم واستشارات (30%)">خدمات ومطاعم واستشارات (المستهدف: 30%)</option>
                        <option value="صناعة وورش (25%)">صناعة وورش (المستهدف: 25%)</option>
                        <option value="مقاولات وإنشاءات (20%)">مقاولات وإنشاءات (المستهدف: 20%)</option>
                        <option value="أنشطة وقطاعات أخرى (25%)">أنشطة عامة أخرى (المستهدف: 25%)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-black font-semibold text-[10.5px]">إجمالي القوى العاملة:</label>
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={calcState.totalStaff}
                          onChange={(e) =>
                            setCalcState((p) => ({
                              ...p,
                              totalStaff: Math.max(1, Number(e.target.value) || 1),
                            }))
                          }
                          className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-black font-bold focus:border-slate-400 focus:bg-white focus:outline-hidden text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-black font-semibold text-[10.5px]">عدد الموظفين العُمانيين:</label>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={calcState.omaniStaff}
                          onChange={(e) =>
                            setCalcState((p) => ({
                              ...p,
                              omaniStaff: Math.max(0, Number(e.target.value) || 0),
                            }))
                          }
                          className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-black font-bold focus:border-slate-400 focus:bg-white focus:outline-hidden text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Result Summary Box */}
                    <div
                      className={`mt-2 rounded-xl p-2.5 border ${
                        isCompliant
                          ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                          : "bg-rose-50 border-rose-200 text-rose-950"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10.5px]">
                          نسبتك الحالية: {currentQuota}% (المطلوب {calcState.targetQuota}%)
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            isCompliant
                              ? "bg-emerald-200 text-emerald-900"
                              : "bg-rose-200 text-rose-900"
                          }`}
                        >
                          {isCompliant ? "مستوفٍ للنسبة" : "عجز في التعمين"}
                        </span>
                      </div>

                      <p className="mt-1 text-[10.5px] leading-relaxed">
                        {isCompliant
                          ? "وضعك التنظيمي سليم، ولا توجد قيود على استخراج المأذونيات حالياً."
                          : `مطلوب تعيين ${missingOmanis} موظف عُماني لتفادي حظر المأذونيات والغرامات الشهرية.`}
                      </p>

                      {!isCompliant && (
                        <div className="mt-2 pt-1.5 border-t border-rose-200/70 flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-rose-800">مخاطر الغرامات التقديرية:</span>
                          <span className="font-black text-rose-950 font-mono">
                            ~{estimatedMonthlyFine} ر.ع / شهرياً
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleExecuteAction({
                          type: "open_quiz",
                          titleAr: "بدء فحص الامتثال الشامل",
                          titleEn: "Start Compliance Audit",
                          descriptionAr: "فحص متقدم لكافة التراخيص",
                          descriptionEn: "Full audit",
                          targetUrl: "/quiz",
                        })
                      }
                      className="w-full mt-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>بدء فحص الامتثال الشامل للمؤسسة</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-[11.5px] sm:text-[11px] font-medium text-emerald-800 shadow-xs w-fit">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>المساعد يجهز وينفذ طلبك...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips Bar — Emerald theme */}
            <div className="relative z-10 flex items-center border-t border-emerald-100 bg-emerald-50/60 px-1.5 py-2 sm:py-1.5 backdrop-blur-xl">
              {/* Left Navigation Chevron */}
              <button
                type="button"
                onClick={() => scrollQuickActions("left")}
                className="flex h-7 w-7 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-100 transition-all active:scale-90"
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
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 sm:px-2.5 sm:py-1 font-bold shadow-xs active:scale-95 transition-all cursor-pointer ${
                          action.highlight
                            ? "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700"
                            : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-400"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 sm:h-3 sm:w-3 shrink-0 ${action.highlight ? "text-white" : "text-emerald-600"}`} />
                        <span className="whitespace-nowrap font-bold">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Navigation Chevron */}
              <button
                type="button"
                onClick={() => scrollQuickActions("right")}
                className="flex h-7 w-7 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-100 transition-all active:scale-90"
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
              className="relative z-10 flex items-center gap-2 border-t border-emerald-100 bg-white p-2.5 sm:p-2 backdrop-blur-2xl"
            >
              <div className="relative flex flex-1 items-center rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-1.5 sm:py-1 shadow-[inset_0_1px_2px_rgba(16,185,129,0.06)] focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اطلب أي مهمة أو اسأل..."
                  autoCapitalize="none"
                  autoCorrect="off"
                  enterKeyHint="send"
                  className="w-full bg-transparent py-0.5 text-[16px] sm:text-[12px] font-medium text-slate-800 placeholder-emerald-400/70 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="إرسال الرسالة"
                className="group relative flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span
                    className={`relative flex items-center justify-center transition-all duration-500 ease-out ${
                      isFlying
                        ? "-translate-x-4 -translate-y-4 scale-75 opacity-0 -rotate-12"
                        : "translate-x-0 translate-y-0 scale-100 opacity-100 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                    }`}
                  >
                    <Send className="h-4 w-4 sm:h-3.5 sm:w-3.5 -scale-x-100 text-white" />
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
          className={`group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border transition-all duration-300 ease-out shadow-[0_10px_28px_rgba(16,185,129,0.25),inset_0_1.5px_1px_rgba(255,255,255,0.9)] active:scale-95 focus:outline-none select-none ${
            isOpen
              ? "border-emerald-400 bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] rotate-90 backdrop-blur-2xl"
              : "border-emerald-200 bg-white hover:border-emerald-400 hover:scale-105 rotate-0 backdrop-blur-xl"
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

