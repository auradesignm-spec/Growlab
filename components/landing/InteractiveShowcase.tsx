"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import MagneticButton from "@/components/motion/MagneticButton";
import {
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Activity,
  Bot,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Sliders,
  DollarSign,
  Lock,
} from "lucide-react";

export function InteractiveShowcase() {
  const { t, isRtl, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"sales" | "creative" | "rules" | "feed">("sales");

  // Tab 1: Chat Simulator State
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string; order?: any }>>([
    {
      sender: "user",
      text: t.showcase.salesCloserSim.initialMessage,
      time: "10:45 PM",
    },
    {
      sender: "ai",
      text:
        lang === "ar"
          ? "يا هلا وغلا فيك أخي أحمد! 🌟 أكيد التوصيل لمسقط وباب بيتك مجاني وسريع خلال 24 ساعة. وبخصوص الخصم، عشانك حاب تاخذ ساعتين بنعطيك عرض حصري: بدل 50 ر.ع بيصير الإجمالي 42 ر.ع فقط مع ضمان استبدال لمدة سنة كاملة! تحب نسجل الطلب ونجهزه لك الحين؟"
          : "Welcome Ahmed! 🌟 Yes, express delivery to your door in Muscat is 100% free within 24 hours. As for the discount, if you get 2 watches today, I can unlock an exclusive bundle: instead of $120, your total is only $98 with a 1-year replacement warranty! Shall I secure this order for you now?",
      time: "10:45 PM",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [dealClosed, setDealClosed] = useState(false);

  // Tab 2: Creative Generator State
  const [selectedProduct, setSelectedProduct] = useState("watch");
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<{
    hooks: string[];
    copy: string;
  }>({
    hooks: [
      lang === "ar"
        ? 'مشهد سقوط الساعة في الماء ثم التقاطها فوراً: "لو فاكر إن كل الساعات الفاخرة ما تتحمل الاستخدام اليومي.. شوف هالفيديو!"'
        : 'Water drop test visual on camera: "If you think luxury watches cannot handle real daily life.. watch this!"',
      lang === "ar"
        ? 'فتح صندوق سينمائي سريع (Unboxing): "وصلتني بعد 24 ساعة بالضبط من الطلب.. وخامتها فاجأتني!"'
        : 'Cinematic fast unboxing: "Delivered in 24 hours flat.. and the stainless steel finish blew me away!"',
      lang === "ar"
        ? 'مقارنة مباشرة بين ساعة بـ 200 ر.ع وهذه الساعة: "ليش تدفع 3 أضعاف السعر عشان اسم الماركة فقط؟"'
        : 'Split screen price comparison: "Why pay 3x more just for a designer label logo?"',
    ],
    copy:
      lang === "ar"
        ? `🔥 العرض الأكثر طلباً في عُمان والخليج! 
ساعة فاخرة مقاومة للماء والخدش، بتصميم ياباني أصلي وضمان استبدال فوري لمدة سنة كاملة.
✅ توصيل سريع لباب البيت والدفع عند الاستلام
🎁 خصم خاص 20% عند طلب قطعتين اليوم
👉 اضغط على زر الواتساب وتحدث مع مستشارنا لحجز طلبك الآن قبل نفاد الكمية!`
        : `🔥 The #1 Best-Selling Watch in the Gulf!
Scratch-proof sapphire glass, Japanese precision movement, and a 1-year full replacement warranty.
✅ Free 24h express doorstep courier & cash on delivery
🎁 Instant bundle savings when you order 2 pieces today
👉 Tap the WhatsApp button to lock in your unit before inventory sells out!`,
  });
  const [copied, setCopied] = useState(false);

  // Tab 3: Rules & Guardrails State
  const [minMargin, setMinMargin] = useState(35);
  const [maxDiscount, setMaxDiscount] = useState(10);

  const handleQuickPrompt = (promptText: string) => {
    if (isTyping) return;
    const userMsg = { sender: "user" as const, text: promptText, time: "10:46 PM" };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      let orderObj = null;

      if (promptText.includes("ضمان") || promptText.includes("warranty")) {
        reply =
          lang === "ar"
            ? "الضمان ذهبي وشامل لمدة سنة كاملة ضد أي عيب مصنعي يا غالي! لو صار أي شيء نبدلها لك فوراً لباب بيتك بدون أي تعقيد. مرتاح كذا؟"
            : "You get a comprehensive 1-year golden warranty covering any defect! If anything happens, we replace it at your doorstep hassle-free. Ready to proceed?";
      } else if (promptText.includes("20") || promptText.includes("55") || promptText.includes("غالي")) {
        reply =
          lang === "ar"
            ? "تستاهل كل خير والله، بس تكلفة الخامة الأصلية عالية، و42 ر.ع لحبتين (يعني الحبة بـ 21 فقط مع شحن مجاني وضمان سنة) هو أفضل سعر نقدر نقدمه عشان نحافظ على الجودة العالية. نعتمد الطلب؟"
            : "I completely understand! But with genuine premium parts, $98 for 2 units ($49/unit with free courier and warranty) is our absolute best value. Shall we lock it in?";
      } else {
        reply =
          lang === "ar"
            ? "تم يا بطل! تم تسجيل طلبك لساعتين على عنوانك في الغبرة، مسقط، والإجمالي 42 ر.ع والتوصيل غداً إن شاء الله. بيوصلك إشعار التتبع فوراً! شرفتنا جداً 🌟"
            : "Awesome! Your order for 2 watches to Muscat has been confirmed for $98 total with free delivery tomorrow. Tracking link is on its way! 🌟";
        orderObj = {
          id: "ORD-9921",
          customer: "Ahmed Al-Maamari",
          items: "2x Luxury Chronograph Watch",
          total: lang === "ar" ? "42 ر.ع" : "$98.00",
          city: "Muscat",
        };
        setDealClosed(true);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          time: "10:46 PM",
          order: orderObj,
        },
      ]);
      setIsTyping(false);
    }, 1100);
  };

  const handleCopyAd = () => {
    navigator.clipboard.writeText(generatedAd.copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="showcase" className="relative py-24 bg-dark-1/90 border-t border-white/10 overflow-hidden">
      {/* Background Lights */}
      <div className="pointer-events-none absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan/10 rounded-full blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald/10 rounded-full blur-[150px]" />

      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-cyan/10 px-3.5 py-1.5 border border-cyan/30 mb-4"
          >
            <Zap className="h-3.5 w-3.5 text-cyan" />
            <span className="text-xs font-mono font-bold text-cyan">
              {t.showcase.badge}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display mb-4"
          >
            {t.showcase.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-onDarkSoft leading-relaxed font-body"
          >
            {t.showcase.subtitle}
          </motion.p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl bg-dark-2 p-1.5 border border-white/10 backdrop-blur-xl shadow-xl">
            {[
              { id: "sales", label: t.showcase.tabs.salesCloser },
              { id: "creative", label: t.showcase.tabs.creativeEngine },
              { id: "rules", label: t.showcase.tabs.negotiator },
              { id: "feed", label: t.showcase.tabs.analytics },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer select-none ${
                  activeTab === tab.id
                    ? "text-dark"
                    : "text-onDarkSoft hover:text-onDark hover:bg-white/5"
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald to-teal shadow-glow-emerald"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panels with Smooth Animation */}
        <div className="rounded-3xl border border-white/10 bg-dark-card/95 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-2xl">
          <AnimatePresence mode="wait">
            {/* TAB 1: AI Sales Closer Simulator */}
            {activeTab === "sales" && (
              <motion.div
                key="sales"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left Side: Simulation Info & Quick Interactive Prompts */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald animate-ping" />
                      <span className="font-mono text-xs font-bold text-emerald">
                        {t.showcase.salesCloserSim.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-display">
                      {lang === "ar" ? "محاكاة محادثة واتساب حية" : "Live WhatsApp Sales Simulator"}
                    </h3>
                    <p className="text-xs sm:text-sm text-onDarkSoft leading-relaxed font-body">
                      {lang === "ar"
                        ? "انقر على أي من الأسئلة أو الاعتراضات الشائعة أدناه وشاهد كيف يتصرف الوكيل الذكي:"
                        : "Click any common buyer objection or scenario below to see the agent close in real-time:"}
                    </p>
                  </div>

                  {/* Interactive Quick Prompts Buttons */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-mono font-bold text-muted uppercase">
                      {lang === "ar" ? "خيارات تجربة سريعة:" : "Test Scenarios:"}
                    </span>
                    {t.showcase.salesCloserSim.quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickPrompt(prompt)}
                        className="w-full text-left rtl:text-right p-3 rounded-xl bg-dark-2 hover:bg-dark-3 border border-white/10 hover:border-emerald/40 text-xs text-white font-medium transition-all duration-200 cursor-pointer flex items-center justify-between group"
                      >
                        <span>&quot;{prompt}&quot;</span>
                        <Zap className="h-3.5 w-3.5 text-muted group-hover:text-emerald transition-colors" />
                      </button>
                    ))}
                  </div>

                  {/* Metrics Badge */}
                  <div className="rounded-2xl bg-dark-2/90 border border-white/10 p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted block font-mono">
                        {lang === "ar" ? "سرعة المعالجة" : "Response Latency"}
                      </span>
                      <span className="text-lg font-bold font-mono text-emerald">0.82s</span>
                    </div>
                    <div className="text-right rtl:text-left">
                      <span className="text-xs text-muted block font-mono">
                        {lang === "ar" ? "معدل التحويل" : "Conversion Rate"}
                      </span>
                      <span className="text-lg font-bold font-mono text-cyan">94.8%</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: WhatsApp Interactive Window */}
                <div className="lg:col-span-7 rounded-2xl bg-dark border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[460px]">
                  {/* WhatsApp Header */}
                  <div className="bg-dark-2 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald text-dark font-bold">
                        <Bot className="h-5 w-5" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-soft border-2 border-dark" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{lang === "ar" ? "سالم — وكيل Growlab" : "Salem — AI Closer"}</span>
                          <span className="text-[10px] text-emerald font-mono">✓ Verified</span>
                        </div>
                        <span className="text-[10px] text-onDarkSoft">
                          {isTyping
                            ? t.showcase.salesCloserSim.agentTyping
                            : lang === "ar"
                            ? "متصل الآن • رد فوري"
                            : "Online • Instant reply"}
                        </span>
                      </div>
                    </div>

                    {dealClosed && (
                      <span className="rounded-full bg-emerald/20 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald border border-emerald/40 animate-pulse">
                        {t.showcase.salesCloserSim.dealClosedBadge}
                      </span>
                    )}
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#06080D]">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex flex-col ${
                          msg.sender === "user" ? "items-start" : "items-end"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-dark-3 text-onDark rounded-tl-xs border border-white/10"
                              : "bg-emerald/15 text-white rounded-tr-xs border border-emerald/30 shadow-xs"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-muted mt-1 px-1 font-mono">
                          {msg.time}
                        </span>

                        {/* Order Confirmed Box */}
                        {msg.order && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-2 w-full max-w-[85%] rounded-xl bg-emerald/10 border border-emerald/40 p-3 text-left rtl:text-right"
                          >
                            <div className="flex items-center gap-2 text-emerald font-bold text-xs mb-1">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{t.showcase.salesCloserSim.orderDetected}</span>
                            </div>
                            <div className="text-[11px] text-onDarkSoft space-y-0.5 font-mono">
                              <div>• {msg.order.items}</div>
                              <div>
                                • {t.showcase.salesCloserSim.total}{" "}
                                <span className="text-white font-bold">{msg.order.total}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex items-center gap-1.5 bg-emerald/10 rounded-xl px-3 py-2 text-xs text-emerald w-fit">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-bounce" />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-emerald animate-bounce"
                          style={{ animationDelay: "0.15s" }}
                        />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-emerald animate-bounce"
                          style={{ animationDelay: "0.3s" }}
                        />
                        <span className="ms-2 text-[11px] font-mono">
                          {t.showcase.salesCloserSim.agentTyping}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Input Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (inputText.trim()) {
                        handleQuickPrompt(inputText.trim());
                        setInputText("");
                      }
                    }}
                    className="p-3 bg-dark-2 border-t border-white/10 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={t.showcase.salesCloserSim.sendPlaceholder}
                      className="flex-1 rounded-xl bg-dark px-3.5 py-2 text-xs text-white placeholder:text-muted border border-white/10 focus:border-emerald focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald text-dark font-bold hover:brightness-110 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Meta Ad Hook Studio */}
            {activeTab === "creative" && (
              <motion.div
                key="creative"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      {lang === "ar" ? "مولد خطافات ونصوص إعلانات ميتا وتيك توك" : "Viral Meta & TikTok Ad Copy Generator"}
                    </h3>
                    <p className="text-xs text-onDarkSoft font-body">
                      {lang === "ar"
                        ? "صياغة خطافات بصرية تجبر المشاهد على توقيف التمرير (Stop The Scroll) وزيادة الـ ROAS."
                        : "Generate high-converting stop-the-scroll video hooks and UGC ad scripts."}
                    </p>
                  </div>

                  <MagneticButton
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsGeneratingAd(true);
                      setTimeout(() => setIsGeneratingAd(false), 900);
                    }}
                    className="self-start sm:self-auto"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isGeneratingAd ? t.showcase.creativeEngineSim.generating : t.showcase.creativeEngineSim.generateBtn}</span>
                  </MagneticButton>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Visual Hooks */}
                  <div className="rounded-2xl bg-dark-2 p-5 border border-white/10 space-y-3">
                    <span className="text-xs font-bold font-mono text-cyan flex items-center gap-1.5">
                      <Zap className="h-4 w-4" />
                      <span>{t.showcase.creativeEngineSim.hooksTitle}</span>
                    </span>

                    <div className="space-y-2.5">
                      {generatedAd.hooks.map((hook, i) => (
                        <div
                          key={i}
                          className="rounded-xl bg-dark p-3 border border-white/5 text-xs text-white leading-relaxed flex items-start gap-2.5"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cyan/15 text-cyan font-mono font-bold text-[10px]">
                            {i + 1}
                          </span>
                          <span>{hook}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary Text & Copy */}
                  <div className="rounded-2xl bg-dark-2 p-5 border border-white/10 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-mono text-emerald flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" />
                          <span>{t.showcase.creativeEngineSim.copyTitle}</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAd}
                          className="flex items-center gap-1 text-[11px] font-mono text-onDarkSoft hover:text-emerald transition-colors"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald" /> : <Copy className="h-3 w-3" />}
                          <span>{copied ? t.showcase.creativeEngineSim.copied : t.showcase.creativeEngineSim.copyBtn}</span>
                        </button>
                      </div>

                      <div className="rounded-xl bg-dark p-3.5 border border-white/5 text-xs text-onDark font-body leading-relaxed whitespace-pre-line">
                        {generatedAd.copy}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-muted">
                      <span>CTR Benchmark: +3.8%</span>
                      <span className="text-emerald">Predicted ROAS: 4.8x</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: Rules & Guardrails */}
            {activeTab === "rules" && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {t.showcase.negotiatorSim.title}
                  </h3>
                  <p className="text-xs text-onDarkSoft font-body">
                    {t.showcase.negotiatorSim.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Slider 1: Min Margin */}
                  <div className="rounded-2xl bg-dark-2 p-5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Lock className="h-4 w-4 text-emerald" />
                        <span>{t.showcase.negotiatorSim.minMarginLabel}</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-emerald">
                        {minMargin}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      value={minMargin}
                      onChange={(e) => setMinMargin(Number(e.target.value))}
                      className="w-full accent-emerald cursor-pointer"
                    />
                    <span className="block text-[11px] text-muted font-body">
                      {lang === "ar"
                        ? "الوكيل لن يقبل أي سعر يقلص هامش ربحك الصافي عن هذه النسبة."
                        : "The AI agent strictly rejects any deal eroding net gross margins below this threshold."}
                    </span>
                  </div>

                  {/* Slider 2: Max Discount Ceiling */}
                  <div className="rounded-2xl bg-dark-2 p-5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sliders className="h-4 w-4 text-gold" />
                        <span>{t.showcase.negotiatorSim.maxDiscountLabel}</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-gold">
                        {maxDiscount}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                    <span className="block text-[11px] text-muted font-body">
                      {lang === "ar"
                        ? "يستخدم الوكيل هذا السقف فقط عند تردد العميل أو شراء أكثر من قطعة."
                        : "AI applies this discount incentive only as a final trigger for bulk or hesitant leads."}
                    </span>
                  </div>
                </div>

                {/* AI Active Decision Matrix Preview */}
                <div className="rounded-2xl bg-emerald/10 border border-emerald/30 p-4 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald shrink-0" />
                  <span className="text-xs text-white font-medium font-body">
                    {t.showcase.negotiatorSim.sampleRule}
                  </span>
                </div>
              </motion.div>
            )}

            {/* TAB 4: Real-time Live Operations Feed */}
            {activeTab === "feed" && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-dark-2 p-4 border border-white/10">
                    <span className="text-xs text-muted font-mono block">
                      {lang === "ar" ? "مبيعات اليوم الآلية" : "Automated Sales Today"}
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-emerald">
                      {t.showcase.analyticsSim.salesToday}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-dark-2 p-4 border border-white/10">
                    <span className="text-xs text-muted font-mono block">
                      {lang === "ar" ? "عائد الإعلانات المباشر" : "Real-time ROAS"}
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-cyan">
                      {t.showcase.analyticsSim.roasToday}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-dark-2 p-4 border border-white/10">
                    <span className="text-xs text-muted font-mono block">
                      {lang === "ar" ? "صفقات أغلقت بنجاح" : "Deals Closed Today"}
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-gold">
                      {t.showcase.analyticsSim.chatsClosed}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold font-mono text-muted uppercase">
                    {t.showcase.analyticsSim.liveFeedTitle}
                  </span>

                  {[
                    {
                      order: "#GL-9842",
                      customer: "Khalfan A. (Sohar)",
                      amount: lang === "ar" ? "35 ر.ع" : "$85.00",
                      time: "Just now",
                      status: "Delivered to Dispatch",
                    },
                    {
                      order: "#GL-9841",
                      customer: "Muna S. (Dubai)",
                      amount: lang === "ar" ? "68 ر.ع" : "$165.00",
                      time: "2 mins ago",
                      status: "Payment Confirmed",
                    },
                    {
                      order: "#GL-9840",
                      customer: "Faisal R. (Riyadh)",
                      amount: lang === "ar" ? "52 ر.ع" : "$128.00",
                      time: "6 mins ago",
                      status: "Auto-Negotiated (-5%)",
                    },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-dark-2 p-3 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald font-bold">{row.order}</span>
                        <span className="text-white font-medium">{row.customer}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-white font-bold">{row.amount}</span>
                        <span className="text-[10px] font-mono text-muted">{row.time}</span>
                        <span className="rounded-md bg-emerald/15 px-2 py-0.5 text-[10px] font-mono text-emerald font-bold hidden sm:inline-block">
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
