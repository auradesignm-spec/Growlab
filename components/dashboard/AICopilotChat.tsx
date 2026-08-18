"use client";

import { useState, useRef, useEffect } from "react";
import { CompanyAccount, Product } from "./types";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Copy,
  Check,
  Zap,
  BrainCircuit,
  MessageSquare,
  ChevronDown,
  Layers,
  Wand2,
  ShoppingBag,
  TrendingUp,
  Target,
} from "lucide-react";

interface AICopilotChatProps {
  company: CompanyAccount;
  products: Product[];
  onApplyAdCopy?: (copy: string) => void;
}

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export default function AICopilotChat({ company, products, onApplyAdCopy }: AICopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_welcome",
      role: "model",
      content: `مرحباً بك في مساعد النمو الذكي (Growlab AI Copilot) لمتجر **${company.name}**! 🚀\n\nأنا هنا لمساعدتك في صياغة حملات إعلانية رابحة، كتابة نصوص بيع مقنعة، حل اعتراضات الزبائن، ومضاعفة أرباح متجرك. يمكنك الكتابة أو التحدث معي بالصوت!`,
      timestamp: "الآن",
      modelUsed: "gemini-3.5-flash",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"general" | "sales_closer" | "ad_strategist" | "copywriter" | "retention_expert">("general");
  const [selectedModel, setSelectedModel] = useState<"gemini-3.5-flash" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite">("gemini-3.5-flash");

  // Voice recording & transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // TTS audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const rolesList = [
    { id: "general", label: "مستشار النمو العام", icon: Sparkles, desc: "توجيه شامل واستشارات استراتيجية" },
    { id: "sales_closer", label: "خبير إغلاق الصفقات", icon: Zap, desc: "إقناع العملاء وحل الاعتراضات ببراعة" },
    { id: "ad_strategist", label: "مدير إعلانات ميتا وتيك توك", icon: Target, desc: "هندسة الحملات ورفع الـ ROAS" },
    { id: "copywriter", label: "كاتب إعلانات محترف", icon: Wand2, desc: "نصوص إعلانية وخطافات بصرية جذابة" },
    { id: "retention_expert", label: "خبير ولاء العملاء وواتساب", icon: MessageSquare, desc: "إعادة استهداف وزيادة تكرار الشراء" },
  ];

  const quickPrompts = [
    {
      title: "✍️ نصوص إعلانية لمنتج",
      prompt: `اكتب لي 3 نصوص إعلانية متباينة لمنصة إنستغرام لمنتج: ${products[0]?.name || "المنتج الأبرز"}، مع التركيز على حل المشكلة والأثر المباشر.`,
    },
    {
      title: "🛡️ تفكيك اعتراض السعر",
      prompt: `الزبائن يقولون "السعر غالي مقارنة بالسوق"، كيف أرد عليهم بذكاء وأقنعهم بجودة الضمان والتوصيل؟`,
    },
    {
      title: "📦 فكرة عرض Bundle لرفع السلة",
      prompt: `اقترح علي حزمة منتجات (Bundle / Offer) ترفع متوسط قيمة الطلب (AOV) لمتجرنا في مجال ${company.category}.`,
    },
    {
      title: "📱 رسالة إعادة استهداف واتساب",
      prompt: `صمم رسالة واتساب قصيرة وودودة لمتابعة العملاء الذين أبدوا اهتماماً ولم يكملوا الطلب بعد.`,
    },
  ];

  // Send message to Gemini Chat
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const productsSummary = products.map((p) => `${p.name} (${p.price} OMR/USD)`).join("، ");

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          role: selectedRole,
          companyContext: {
            name: company.name,
            category: company.category,
            productsSummary: productsSummary,
          },
        }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `m_${Date.now()}`,
            role: "model",
            content: data.reply,
            timestamp: new Date().toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" }),
            modelUsed: data.modelUsed || selectedModel,
          },
        ]);
      } else {
        throw new Error(data.error || "فشل الاتصال بنموذج الذكاء");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `m_${Date.now()}`,
          role: "model",
          content: "عذراً، حدث خطأ مؤقت أثناء الاتصال بنموذج Gemini. يرجى المحاولة مجدداً.",
          timestamp: "الآن",
          modelUsed: selectedModel,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start Voice Recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleTranscribeAudio(audioBlob);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("تعذر الوصول إلى الميكروفون. يرجى التأكد من منح الإذن في المتصفح.");
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  // Transcribe Audio via Gemini 3.5 Flash
  const handleTranscribeAudio = async (blob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const res = await fetch("/api/gemini/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType: blob.type || "audio/webm",
            prompt: `سياق متجر ${company.name} في مجال ${company.category}`,
          }),
        });

        const data = await res.json();
        if (data.transcription) {
          setInputMessage((prev) => (prev ? `${prev} ${data.transcription}` : data.transcription));
        }
        setIsTranscribing(false);
      };
    } catch (err) {
      console.error("Transcription error:", err);
      setIsTranscribing(false);
    }
  };

  // Play Audio with TTS
  const handlePlayTTS = async (text: string, msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(msgId);
      const res = await fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceName: "Kore" }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.onended = () => setPlayingAudioId(null);
        audio.play();
      } else {
        setPlayingAudioId(null);
      }
    } catch (e) {
      console.error("TTS play error:", e);
      setPlayingAudioId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold font-bold">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                مساعد النمو ومستشار المبيعات الذكي (Gemini AI Copilot)
              </h2>
              <p className="text-xs text-muted">
                محادثة ذكية متعددة الأدوار مع تفريغ صوتي فوري وتوليد استراتيجيات متقدمة
              </p>
            </div>
          </div>
        </div>

        {/* Model & Role Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Role Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-1.5 font-bold text-ink">
            <span className="text-muted text-[11px]">الدور:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="bg-transparent font-bold text-ink focus:outline-none cursor-pointer"
            >
              {rolesList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-1.5 font-mono text-[11px] font-bold text-ink">
            <span className="text-muted">النموذج:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent font-mono font-bold text-ink focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash (سريع ومتوازن)</option>
              <option value="gemini-3.1-pro-preview">🧠 Gemini 3.1 Pro (استنتاج وتفكير متقدم)</option>
              <option value="gemini-3.1-flash-lite">🚀 Gemini 3.1 Flash Lite (فائق السرعة)</option>
            </select>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: "m_welcome",
                  role: "model",
                  content: `تم تحديث الجلسة. أنا مستشارك الذكي لمتجر ${company.name}، كيف تحب نبدأ اليوم؟`,
                  timestamp: "الآن",
                  modelUsed: selectedModel,
                },
              ])
            }
            className="flex items-center gap-1 rounded-xl border border-line px-3 py-1.5 text-muted hover:bg-paper hover:text-ink transition-colors"
            title="تفريغ المحادثة والبدء من جديد"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="text-[11px]">جلسة جديدة</span>
          </button>
        </div>
      </div>

      {/* Quick Inspiration Prompts */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            disabled={isLoading}
            className="rounded-xl border border-line bg-white p-3 text-right text-xs transition-all hover:border-gold hover:shadow-xs disabled:opacity-50 group"
          >
            <div className="font-bold text-ink group-hover:text-gold mb-1">{qp.title}</div>
            <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">{qp.prompt}</p>
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="flex flex-col rounded-2xl border border-line bg-white shadow-sm overflow-hidden min-h-[480px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[520px] bg-[#FAF9F5]/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "justify-start" : "justify-end"}`}
            >
              {m.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink text-gold font-bold font-mono text-xs shadow-xs">
                  أنت
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  m.role === "user"
                    ? "rounded-tr-xs bg-ink text-onDark"
                    : "rounded-tl-xs bg-white border border-line text-ink"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 font-mono text-[10px] text-muted mb-2 border-b border-line/40 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">
                      {m.role === "user" ? "أنت (صاحب المتجر)" : "Growlab Copilot"}
                    </span>
                    {m.modelUsed && (
                      <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[9px] text-gold font-bold">
                        {m.modelUsed}
                      </span>
                    )}
                  </div>
                  <span>{m.timestamp}</span>
                </div>

                {/* Content */}
                <div className="whitespace-pre-wrap font-body text-xs sm:text-sm">
                  {m.content}
                </div>

                {/* Actions on Model Messages */}
                {m.role === "model" && (
                  <div className="mt-3 flex items-center justify-between border-t border-line/40 pt-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayTTS(m.content, m.id)}
                        className="flex items-center gap-1 text-muted hover:text-gold transition-colors font-mono"
                        title="استماع صوتي للرد"
                      >
                        {playingAudioId === m.id ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5 text-gold animate-pulse" />
                            <span className="text-gold">جاري التحدث...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>استماع صوتي</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(m.content, m.id)}
                        className="flex items-center gap-1 text-muted hover:text-ink transition-colors font-mono"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-teal" />
                            <span className="text-teal">تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>نسخ النص</span>
                          </>
                        )}
                      </button>
                    </div>

                    {onApplyAdCopy && (
                      <button
                        onClick={() => onApplyAdCopy(m.content)}
                        className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-bold text-gold hover:bg-gold hover:text-[#241A08] transition-all"
                      >
                        اعتماد كسكريبت إعلاني
                      </button>
                    )}
                  </div>
                )}
              </div>

              {m.role === "model" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold text-[#241A08] font-bold shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-end gap-3">
              <div className="rounded-2xl rounded-tl-xs bg-white border border-line p-4 text-xs font-mono text-muted flex items-center gap-2 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
                <span>الذكاء الاصطناعي يقوم بالتفكير والصياغة...</span>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold text-[#241A08] font-bold">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Voice Transcribing Indicator */}
          {isTranscribing && (
            <div className="flex justify-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink text-gold font-bold">
                <Mic className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-2xl rounded-tr-xs bg-teal/15 border border-teal/30 p-3 text-xs font-mono text-teal flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal animate-bounce" />
                <span>جاري تفريغ الصوت بدقة فائقة عبر Gemini 3.5 Flash...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Voice Recording & Transcription */}
        <div className="border-t border-line bg-white p-3 sm:p-4">
          <div className="flex items-center gap-2">
            {/* Microphone Button */}
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger text-white shadow-md animate-pulse"
                title="إيقاف التسجيل وتفريغ الصوت"
              >
                <MicOff className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                disabled={isLoading || isTranscribing}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-muted hover:text-gold hover:border-gold transition-all disabled:opacity-50"
                title="تسجيل رسالة صوتية وتفريغها تلقائياً"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}

            {/* Input Text Area */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isRecording
                  ? "🔴 جاري الاستماع لصوتك الآن... اضغط الميكروفون للتوقف والتفريغ"
                  : "اكتب استفسارك، أو اطلب نصاً إعلانياً، أو اضغط الميكروفون للتحدث..."
              }
              disabled={isLoading || isRecording}
              className="flex-1 rounded-xl border border-line bg-paper px-4 py-3 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-gold shadow-md hover:bg-ink-2 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-muted font-mono px-1">
            <span>💡 نصيحة: يمكنك تسجيل ملاحظات صوتية وسيقوم الذكاء بتفريغها فوراً.</span>
            <span>مدعوم بنماذج Gemini 3.5 & 3.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
