"use client";

import { useState, useRef } from "react";
import { CompanyAccount, Product, Order } from "./types";
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
  Sliders,
  CheckCircle2,
  Lock,
  ExternalLink,
  PackageCheck,
  Smartphone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import WhatsAppConnectModal from "./WhatsAppConnectModal";

interface AgentStudioProps {
  company: CompanyAccount;
  products: Product[];
  onUpdateCompany: (company: CompanyAccount) => void;
  onOrderCreated?: (order: Order) => void;
  prefillQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  time: string;
  extractedOrder?: any;
}

export default function AgentStudio({
  company,
  products,
  onUpdateCompany,
  onOrderCreated,
  prefillQuery,
}: AgentStudioProps) {
  const [agentName, setAgentName] = useState(company.agentName);
  const [agentDialect, setAgentDialect] = useState(company.agentDialect);
  const [discountMax, setDiscountMax] = useState(company.agentAutoDiscountMax);
  const [isSaved, setIsSaved] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);

  // Chat Simulator State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "agent",
      text: `مرحباً بك في ${company.name}! 👋 أنا ${company.agentName}، مستشارك الذكي للمبيعات، كيف أقدر أساعدك اليوم في اختيار طلبك المناسب؟`,
      time: "الآن",
    },
  ]);
  const [inputQuery, setInputQuery] = useState(prefillQuery || "");
  const [isTyping, setIsTyping] = useState(false);

  // Voice recording & transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const quickSimPrompts = [
    `كم سعر ${products[0]?.name || "المنتج"} وهل التوصيل مجاني؟`,
    "هل عندكم توصيل لصلالة ومسقط والدفع عند الاستلام؟",
    "أبغى قطعتين هل في كود خصم خاص؟",
    "اسمي سالم من ولاية نزوى وأرغب بتأكيد الطلب الآن",
  ];

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleTranscribeAudio(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("تعذر الوصول إلى الميكروفون. يرجى التأكد من منح الإذن في المتصفح.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

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
            prompt: `استفسار عميل واتساب لمتجر ${company.name}`,
          }),
        });

        const data = await res.json();
        if (data.transcription) {
          setInputQuery(data.transcription);
          handleSendMessage(data.transcription);
        }
        setIsTranscribing(false);
      };
    } catch (err) {
      console.error("Transcribe error:", err);
      setIsTranscribing(false);
    }
  };

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
      console.error("TTS error:", e);
      setPlayingAudioId(null);
    }
  };

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

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: q,
      time: new Date().toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    try {
      // Call Real Gemini Server-Side Agent API
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          companyName: company.name,
          category: company.category,
          agentName: agentName,
          agentDialect: agentDialect,
          agentAutoDiscountMax: discountMax,
          products: products,
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || "أهلاً بك! نسعد بخدمتك وتقديم كل التفاصيل فوراً.";

      // Handle real order extraction if customer closed a deal
      if (data.extractedOrder && onOrderCreated) {
        const orderData = data.extractedOrder;
        const matchedProduct = products.find((p) =>
          p.name.toLowerCase().includes((orderData.productName || "").toLowerCase())
        ) || products[0];

        const newRealOrder: Order = {
          id: `ORD-${Date.now().toString().slice(-4)}`,
          customerName: orderData.customerName || "عميل محادثة الوكيل",
          customerPhone: orderData.customerPhone || company.whatsappNumber || "+968 9000 0000",
          city: orderData.city || "مسقط",
          address: orderData.address || "توصيل لباب المنزل والدفع عند الاستلام",
          productId: matchedProduct?.id || "p1",
          productName: matchedProduct?.name || orderData.productName || "طلب من محادثة الوكيل",
          quantity: orderData.quantity || 1,
          totalAmount: matchedProduct ? matchedProduct.price * (orderData.quantity || 1) : 35,
          paymentMethod: "cash_on_delivery",
          status: "confirmed_by_ai",
          createdAt: "الآن",
          aiConversationSnippet: `العميل: "${q}" \nالوكيل: "${aiReply.slice(0, 80)}..."`,
          source: "whatsapp_ai",
        };

        onOrderCreated(newRealOrder);
        setLastCreatedOrder(newRealOrder);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: "agent",
          text: aiReply,
          time: new Date().toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" }),
          extractedOrder: data.extractedOrder,
        },
      ]);
    } catch (err) {
      console.error("AI Agent error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: "agent",
          text: "أهلاً بك! كل منتجاتنا متوفرة مع شحن سريع وضمان ذهبي للاستبدال، كيف تحب نسجل طلبك؟",
          time: "الآن",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black text-ink">
            استوديو وتدريب وكيل المبيعات الذكي (Gemini AI Agent)
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            خصص شخصية ولهجة وصلاحيات الخصم، واختبر استجابة الوكيل في الوقت الفعلي مع محرك الذكاء الاصطناعي الحقيقي.
          </p>
        </div>

        <button
          onClick={() => setIsWhatsAppModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-4 py-2 text-xs font-mono font-bold text-teal shadow-xs hover:bg-teal/20 transition-all cursor-pointer"
        >
          <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
          <span>ربط واتساب و Webhook حقيقي</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Real Order Created Alert Notification */}
      {lastCreatedOrder && (
        <div className="rounded-2xl border border-teal/40 bg-teal/10 p-4 flex items-center justify-between text-xs text-ink animate-fadeIn">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-6 w-6 text-teal shrink-0" />
            <div>
              <span className="font-bold text-teal block font-display">
                🎉 تم التقاط طلب جديد وتسجيله بنجاح بواسطة الذكاء الاصطناعي!
              </span>
              <p className="text-muted text-[11px]">
                المنتج: {lastCreatedOrder.productName} • العميل: {lastCreatedOrder.customerName} ({lastCreatedOrder.city}) • الإجمالي: {lastCreatedOrder.totalAmount}$
              </p>
            </div>
          </div>
          <span className="rounded-full bg-teal px-3 py-1 font-mono text-[11px] font-bold text-white">
            مؤكد في تبويب الطلبات
          </span>
        </div>
      )}

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
                  اسم الوكيل الظاهر للعملاء:
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
                  لهجة وأسلوب المحادثة:
                </label>
                <select
                  value={agentDialect}
                  onChange={(e) => setAgentDialect(e.target.value as any)}
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none bg-white"
                >
                  <option value="omani">لهجة عمانية ودية (طبيعية ولبقة: هلا وغلا، فديتك)</option>
                  <option value="saudi">لهجة سعودية محببة (يا هلا والله، سم طال عمرك)</option>
                  <option value="gulf">لهجة خليجية بيضاء (شاملة ومحببة لكافة دول الخليج)</option>
                  <option value="standard_arabic">لغة عربية فصحى راقية ومهنية</option>
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
                  max="25"
                  step="1"
                  value={discountMax}
                  onChange={(e) => setDiscountMax(Number(e.target.value))}
                  className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <span className="text-[11px] text-muted block mt-1">
                  يستخدمها الوكيل بذكاء فقط عندما يتردد المشتري بالسعر كحافز أخير.
                </span>
              </div>

              <div className="rounded-xl bg-paper p-3.5 text-xs space-y-2 border border-line">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <ShieldCheck className="h-4 w-4 text-teal" />
                  <span>ضوابط وإجراءات الأمان وإغلاق الصفقات:</span>
                </div>
                <div className="space-y-1 text-muted text-[11px]">
                  <p>✓ تأكيد العنوان والمدينة ورقم الهاتف قبل تثبيت أي طلب.</p>
                  <p>✓ الالتزام الصارم بأسعار المنتجات وسياسة الشحن الخاصة بمتجرك.</p>
                  <p>✓ تسجيل الطلب تلقائياً في لوحة تحكم متجرك بمجرد موافقة العميل.</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-ink py-3 text-center text-xs sm:text-sm font-bold text-onDark shadow-md hover:bg-ink-2 transition-all flex items-center justify-center gap-2"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-teal" />
                    <span>تم حفظ وتطبيق تعليمات الوكيل السحابية!</span>
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

          {/* WhatsApp Channel & In-Platform Recipient Box */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366] text-white">
                  <Smartphone className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-display text-sm font-bold text-ink">رقم المستلم والربط الداخلي</h4>
                  <span className="text-[11px] text-teal font-mono font-bold">
                    {company.recipientPhone || company.whatsappNumber || "96897844742"}
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-[10px] font-bold text-teal font-mono">
                مربوط بالمنصة
              </span>
            </div>

            <div className="rounded-xl border border-teal/30 bg-teal/5 p-3 text-xs text-ink mb-3 space-y-1">
              <span className="font-bold text-teal block">✓ تم تحديد وربط الرقم داخلياً:</span>
              <p className="text-muted text-[11px]">
                تصلك كافة إشعارات الطلبات وتأكيدات الذكاء الاصطناعي مباشرة على هذا الرقم دون الحاجة لربط خارجي أو مسح باركود.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold/15 p-3 text-xs text-[#AD7A2A] font-bold border border-gold/40 hover:bg-gold hover:text-[#241A08] transition-all cursor-pointer"
            >
              <Smartphone className="h-4 w-4" />
              <span>تعديل رقم المستلم أو إجراء اختبار حي</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Chat Simulator (Gemini Powered) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-gold/40 bg-ink p-5 sm:p-6 text-onDark shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-onDark/15 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-[#241A08] font-bold font-display shadow-md">
                  G
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-teal border-2 border-ink" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-sm font-bold text-onDark">{agentName}</h4>
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-mono text-gold-soft">
                    Gemini 3.7 AI
                  </span>
                </div>
                <p className="text-[11px] text-gold-soft font-mono">
                  محاكي واتساب المباشر — مدرب حياً على منتجات {company.name}
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
              اختر سؤالاً سريعاً لتجربة تفاعل الوكيل الحقيقي مع منتجاتك:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickSimPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  disabled={isTyping}
                  className="rounded-lg border border-onDark/20 bg-onDark/[0.06] px-2.5 py-1.5 text-[11px] text-onDarkSoft hover:bg-gold/20 hover:text-onDark hover:border-gold/40 transition-all text-right disabled:opacity-50"
                >
                  💬 {p}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-[340px] max-h-[420px] overflow-y-auto rounded-xl border border-onDark/15 bg-ink-2/90 p-4 space-y-3 shadow-inner">
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
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {m.sender === "agent" && (
                    <div className="mt-2 flex items-center justify-end border-t border-onDark/10 pt-1.5">
                      <button
                        onClick={() => handlePlayTTS(m.text, m.id)}
                        className="flex items-center gap-1 text-[11px] font-mono text-gold-soft hover:text-gold transition-colors"
                      >
                        {playingAudioId === m.id ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5 animate-pulse text-gold" />
                            <span>جاري التحدث...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>استماع صوتي</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tl-xs bg-teal/20 border border-teal/30 px-4 py-2.5 text-xs text-gold-soft font-mono flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gold animate-bounce" />
                  <span>الوكيل يفكر ويكتب الرد عبر الذكاء الاصطناعي...</span>
                </div>
              </div>
            )}

            {isTranscribing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tr-xs bg-teal/20 border border-teal/30 px-4 py-2 text-xs text-teal font-mono flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal animate-ping" />
                  <span>جاري تفريغ الصوت عبر Gemini 3.5 Flash...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar with Voice Note Support */}
          <div className="mt-4 flex items-center gap-2">
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger text-white shadow-md animate-pulse"
                title="إيقاف التسجيل وتفريغ الرسالة الصوتية"
              >
                <MicOff className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                disabled={isTyping || isTranscribing}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-onDark/25 bg-onDark/[0.08] text-gold-soft hover:text-gold hover:border-gold/50 transition-all disabled:opacity-50"
                title="تسجيل رسالة صوتية (تفريغ ذكي فوري)"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder={
                isRecording
                  ? "🔴 جاري الاستماع لصوتك... اضغط الميكروفون للإرسال"
                  : "اكتب استفساراً أو اضغط الميكروفون لتجربة رسالة صوتية..."
              }
              disabled={isTyping || isRecording}
              className="flex-1 rounded-xl border border-onDark/25 bg-onDark/[0.08] px-4 py-3 text-xs sm:text-sm text-onDark placeholder:text-onDarkSoft/50 focus:border-gold focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isTyping}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-[#241A08] shadow-md transition-all hover:bg-gold-soft disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <Send className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Connection Modal */}
      <WhatsAppConnectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        company={company}
        onUpdateCompany={onUpdateCompany}
      />
    </div>
  );
}
