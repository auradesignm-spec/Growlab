"use client";

import { useState } from "react";
import { CompanyAccount } from "./types";
import {
  X,
  Bot,
  QrCode,
  Globe,
  Copy,
  Check,
  Zap,
  Send,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Smartphone,
  Server,
  PhoneCall,
  BellRing,
  CheckCircle2,
  Phone,
  Sparkles,
} from "lucide-react";

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyAccount;
  onUpdateCompany: (company: CompanyAccount) => void;
}

export default function WhatsAppConnectModal({
  isOpen,
  onClose,
  company,
  onUpdateCompany,
}: WhatsAppConnectModalProps) {
  const [activeTab, setActiveTab] = useState<"platform_recipient" | "infobip" | "meta_api" | "test_dispatcher">(
    "platform_recipient"
  );

  // Recipient Phone in-platform state (User directive: "اريد رقم المستلم يتم تحديده في منصتي ويربطه لا اريد ربط رقم حاليا")
  const [recipientNumber, setRecipientNumber] = useState(
    company.recipientPhone || company.whatsappNumber || "96897844742"
  );
  const [recipientName, setRecipientName] = useState(company.ownerName || "مسؤول المتجر");
  const [notifyOnNewOrders, setNotifyOnNewOrders] = useState(true);
  const [notifyOnAiInquiries, setNotifyOnAiInquiries] = useState(true);
  const [notifyOnDiscount, setNotifyOnDiscount] = useState(true);
  const [isSavedInPlatform, setIsSavedInPlatform] = useState(false);

  // Infobip Live API state
  const [infobipApiKey, setInfobipApiKey] = useState(
    "b9a2ac1b7e039099892b0defa7cd9e58-f1cf66c8-86db-472a-b22d-196f982d1825"
  );
  const [infobipBaseUrl, setInfobipBaseUrl] = useState("https://pdv3ge.api.infobip.com");
  const [infobipSender, setInfobipSender] = useState("447860088970");
  const [infobipRecipient, setInfobipRecipient] = useState(
    company.recipientPhone || "96897844742"
  );
  const [infobipMessageType, setInfobipMessageType] = useState<"template" | "text">("template");
  const [infobipTemplateName, setInfobipTemplateName] = useState("test_whatsapp_template_en");
  const [infobipPlaceholderName, setInfobipPlaceholderName] = useState("qusay");
  const [infobipCustomText, setInfobipCustomText] = useState(
    `مرحباً بك! تم تأكيد ربط رقم المستلم (${recipientNumber}) لمتجر ${company.name} بنجاح في منصة Growlab.`
  );
  const [infobipSending, setInfobipSending] = useState(false);
  const [infobipResponse, setInfobipResponse] = useState<any>(null);

  // Meta Cloud API inputs
  const [phoneNumberId, setPhoneNumberId] = useState(
    company.whatsappConfig?.phoneNumberId || "109823485723940"
  );
  const [wabaId, setWabaId] = useState(
    company.whatsappConfig?.wabaId || "982347598234759"
  );
  const [accessToken, setAccessToken] = useState(
    company.whatsappConfig?.accessToken || ""
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Dispatcher Test state
  const [testPhone, setTestPhone] = useState("+968 9000 0000");
  const [testMessage, setTestMessage] = useState("مرحبا، كم سعر المنتجات المتوفرة وهل التوصيل مجاني لمسقط؟");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== "undefined" ? window.location.origin : "https://growlab.om";
  const webhookUrl = `${currentHost}/api/whatsapp/webhook`;
  const verifyToken = "growlab_webhook_secret_token";

  // Clean phone number for direct link
  const cleanPhone = recipientNumber.replace(/[^0-9]/g, "");
  const sampleMessage = encodeURIComponent(
    `مرحباً ${company.name}، أود الاستفسار عن المنتجات والعروض المتوفرة اليوم.`
  );
  const waDirectUrl = `https://wa.me/${cleanPhone || "96897844742"}?text=${sampleMessage}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Save recipient number directly inside platform
  const handleSavePlatformRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCompany: CompanyAccount = {
      ...company,
      recipientPhone: recipientNumber.trim(),
      whatsappNumber: recipientNumber.trim(),
      whatsappConnected: true,
      whatsappConfig: {
        phoneNumberId: phoneNumberId || "internal_platform_router",
        wabaId: wabaId || "internal_waba",
        accessToken: accessToken || "internal_token",
        verifyToken,
        connectedPhone: recipientNumber.trim(),
        status: "connected",
        webhookUrl,
        autoReplyEnabled: true,
        welcomeMessage: `مرحباً بك في ${company.name}! 👋 أنا ${company.agentName}، كيف أقدر أساعدك؟`,
      },
    };

    onUpdateCompany(updatedCompany);
    setInfobipRecipient(recipientNumber.trim());
    setIsSavedInPlatform(true);
    setTimeout(() => setIsSavedInPlatform(false), 3000);
  };

  const handleSendInfobipLive = async () => {
    setInfobipSending(true);
    setInfobipResponse(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: infobipRecipient.replace(/[^0-9]/g, ""),
          from: infobipSender,
          type: infobipMessageType,
          templateName: infobipTemplateName,
          placeholders: [infobipPlaceholderName],
          message: infobipCustomText,
          apiKey: infobipApiKey,
          baseUrl: infobipBaseUrl,
        }),
      });

      const data = await res.json();
      setInfobipResponse(data);
    } catch (e: any) {
      setInfobipResponse({ error: e.message || "Failed to send" });
    } finally {
      setInfobipSending(false);
    }
  };

  const handleSaveMetaSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany({
      ...company,
      whatsappNumber: recipientNumber,
      recipientPhone: recipientNumber,
      whatsappConnected: true,
      whatsappConfig: {
        phoneNumberId,
        wabaId,
        accessToken,
        verifyToken,
        connectedPhone: recipientNumber,
        status: "connected",
        webhookUrl,
        autoReplyEnabled: true,
        welcomeMessage: `مرحباً بك في ${company.name}! 👋 أنا ${company.agentName}، كيف أقدر أساعدك؟`,
      },
    });
    onClose();
  };

  const handleRunWebhookTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: testMessage,
          companyName: company.name,
          category: company.category,
          agentName: company.agentName,
          agentDialect: company.agentDialect,
          agentAutoDiscountMax: company.agentAutoDiscountMax,
        }),
      });
      const data = await res.json();
      setTestResult(data.reply || "تم استلام الرد بنجاح من وكيل الذكاء الاصطناعي!");
    } catch (e: any) {
      setTestResult("حدث خطأ أثناء الاتصال بالخادم: " + e.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-ink px-6 py-5 text-onDark">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-md">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-onDark">
                تحديد رقم المستلم والربط الداخلي للمنصة
              </h3>
              <p className="text-xs text-onDarkSoft font-mono">
                {company.name} • رقم المستلم المعتمد: {recipientNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-onDarkSoft hover:bg-onDark/10 hover:text-onDark transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line bg-paper px-6 pt-3 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("platform_recipient")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "platform_recipient"
                ? "border-gold text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <PhoneCall className="h-4 w-4 text-gold" />
            <span>تحديد رقم المستلم (ربط داخلي بالمنصة)</span>
            <span className="rounded bg-teal/20 px-1.5 py-0.5 text-[10px] text-teal font-mono font-bold">
              معتمد ومفعل
            </span>
          </button>

          <button
            onClick={() => setActiveTab("infobip")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "infobip"
                ? "border-gold text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Zap className="h-4 w-4 text-gold" />
            <span>اختبار الإرسال الحي (Infobip API)</span>
          </button>

          <button
            onClick={() => setActiveTab("test_dispatcher")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "test_dispatcher"
                ? "border-gold text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Bot className="h-4 w-4 text-purple-600" />
            <span>محاكي ردود الوكيل الذكي</span>
          </button>

          <button
            onClick={() => setActiveTab("meta_api")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "meta_api"
                ? "border-gold text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Server className="h-4 w-4 text-muted" />
            <span>Meta Cloud API (اختياري مستقبلاً)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: IN-PLATFORM RECIPIENT PHONE ROUTING (NO EXTERNAL HARDWARE LINK NEEDED) */}
          {activeTab === "platform_recipient" && (
            <div className="space-y-6">
              {/* Highlight Banner */}
              <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <div className="text-xs text-ink leading-relaxed">
                  <span className="font-bold block text-sm mb-1 text-teal">
                    تم ربط وتحديد رقم المستلم داخلياً بالمنصة مباشرة 🚀
                  </span>
                  لا حاجة لمسح باركود خارجي أو ربط هاتف حالياً. يمكنك تعديل رقم المستلم المعتمد لمتجر{" "}
                  <b>{company.name}</b> في أي وقت، وستصلك عليه كافة تنبيهات الطلبات الجديدة وإغلاقات الوكيل الذكي.
                </div>
              </div>

              {/* Form to Set and Bind Recipient Number */}
              <form onSubmit={handleSavePlatformRecipient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                      رقم هاتف المستلم المعتمد (WhatsApp Recipient) *:
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-muted" />
                      <input
                        type="text"
                        required
                        value={recipientNumber}
                        onChange={(e) => setRecipientNumber(e.target.value)}
                        placeholder="96897844742"
                        className="w-full rounded-xl border border-line pr-10 pl-3.5 py-2.5 font-mono text-xs sm:text-sm text-ink focus:border-gold focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-muted font-mono mt-1 block">
                      مثال: 96897844742 (رمز الدولة ثم رقم الهاتف)
                    </span>
                  </div>

                  <div>
                    <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                      اسم المستلم أو جهة التنبيهات:
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="مسؤول المبيعات / صاحب المتجر"
                      className="w-full rounded-xl border border-line px-3.5 py-2.5 text-xs sm:text-sm text-ink focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Routing & Notification Preferences */}
                <div className="rounded-2xl border border-line bg-paper p-4 space-y-3">
                  <span className="font-mono text-xs font-bold text-ink block">
                    إعدادات توجيه التنبيهات إلى رقم المستلم:
                  </span>
                  
                  <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnNewOrders}
                      onChange={(e) => setNotifyOnNewOrders(e.target.checked)}
                      className="rounded border-line text-gold focus:ring-gold"
                    />
                    <span>إرسال إشعار فوري عند إغلاق وتأكيد أي طلب جديد من قِبل وكيل الذكاء الاصطناعي</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnAiInquiries}
                      onChange={(e) => setNotifyOnAiInquiries(e.target.checked)}
                      className="rounded border-line text-gold focus:ring-gold"
                    />
                    <span>إشعار عند طلب العميل التحدث مع موظف بشري أو طلب خصم إضافي</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnDiscount}
                      onChange={(e) => setNotifyOnDiscount(e.target.checked)}
                      className="rounded border-line text-gold focus:ring-gold"
                    />
                    <span>ملخص يومي بإجمالي مبيعات المتجر ونسبة نمو الحملات</span>
                  </label>
                </div>

                {/* Direct click-to-chat preview link */}
                <div className="rounded-2xl border border-line bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-ink">
                      رابط المحادثة المباشر مع المستلم (Direct WhatsApp Link):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(waDirectUrl, "direct_link")}
                      className="flex items-center gap-1 text-[11px] text-gold font-bold hover:underline"
                    >
                      {copiedField === "direct_link" ? (
                        <>
                          <Check className="h-3 w-3 text-teal" />
                          <span className="text-teal">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>نسخ الرابط</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl bg-paper px-3 py-2 text-[11px] font-mono text-muted break-all">
                    {waDirectUrl}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-muted">
                    {isSavedInPlatform ? (
                      <span className="inline-flex items-center gap-1 text-teal font-bold animate-in fade-in">
                        <CheckCircle2 className="h-4 w-4" />
                        تم حفظ وتعيين رقم المستلم بنجاح في المنصة!
                      </span>
                    ) : (
                      <span>سيتم اعتماد هذا الرقم لجميع رسائل المتجر والوكيل الذكي.</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs sm:text-sm font-bold text-[#241A08] shadow-md hover:brightness-110 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>حفظ وتثبيت رقم المستلم في المنصة</span>
                  </button>
                </div>
              </form>

              {/* Quick Test Box */}
              <div className="border-t border-line pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs text-ink block">
                    هل ترغب في اختبار إرسال رسالة واتساب حية إلى {recipientNumber} الآن؟
                  </span>
                  <span className="text-[11px] text-muted">
                    يمكنك إرسال رسالة تجريبية عبر Infobip API المدمجة بنقرة واحدة.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInfobipRecipient(recipientNumber);
                    setActiveTab("infobip");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal/40 bg-teal/10 px-4 py-2 text-xs font-bold text-teal hover:bg-teal/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>انتقل للاختبار الحي</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INFOBIP WHATSAPP LIVE DISPATCHER */}
          {activeTab === "infobip" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/10 via-paper to-gold/5 p-4 flex items-start gap-3">
                <Zap className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div className="text-xs text-ink leading-relaxed">
                  <span className="font-bold block text-sm mb-1 text-ink">
                    إرسال رسائل WhatsApp Business حية عبر Infobip 🚀
                  </span>
                  يمكنك إرسال رسائل القوالب المعتمدة (Template) أو رسائل المحادثة الفورية وتجربتها مباشرة على رقم هاتفك.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    Endpoint الأساسي (Base URL):
                  </label>
                  <input
                    type="text"
                    value={infobipBaseUrl}
                    onChange={(e) => setInfobipBaseUrl(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    رقم المرسل المعتمد (Sender From):
                  </label>
                  <input
                    type="text"
                    value={infobipSender}
                    onChange={(e) => setInfobipSender(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    رقم هاتف المستلم (Recipient To) *:
                  </label>
                  <input
                    type="text"
                    value={infobipRecipient}
                    onChange={(e) => setInfobipRecipient(e.target.value)}
                    placeholder="96897844742"
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-muted font-mono mt-1 block">
                    مع رمز الدولة بدون + (مثال: 96897844742)
                  </span>
                </div>

                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    نوع الرسالة (Message Type):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInfobipMessageType("template")}
                      className={`rounded-xl border p-2 text-xs font-bold transition-all cursor-pointer ${
                        infobipMessageType === "template"
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-line bg-paper text-muted"
                      }`}
                    >
                      قالب Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setInfobipMessageType("text")}
                      className={`rounded-xl border p-2 text-xs font-bold transition-all cursor-pointer ${
                        infobipMessageType === "text"
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-line bg-paper text-muted"
                      }`}
                    >
                      نص حر Text
                    </button>
                  </div>
                </div>
              </div>

              {/* Template specifics */}
              {infobipMessageType === "template" ? (
                <div className="rounded-2xl border border-line bg-paper p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[11px] font-semibold text-ink mb-1 block">
                        اسم القالب المعتمد (Template Name):
                      </label>
                      <input
                        type="text"
                        value={infobipTemplateName}
                        onChange={(e) => setInfobipTemplateName(e.target.value)}
                        className="w-full rounded-xl border border-line bg-white px-3 py-2 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[11px] font-semibold text-ink mb-1 block">
                        المتغير بالرسالة Placeholder (الاسم):
                      </label>
                      <input
                        type="text"
                        value={infobipPlaceholderName}
                        onChange={(e) => setInfobipPlaceholderName(e.target.value)}
                        placeholder="qusay"
                        className="w-full rounded-xl border border-line bg-white px-3 py-2 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    نص الرسالة المباشرة:
                  </label>
                  <textarea
                    rows={2}
                    value={infobipCustomText}
                    onChange={(e) => setInfobipCustomText(e.target.value)}
                    className="w-full rounded-xl border border-line p-3 text-xs sm:text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSendInfobipLive}
                disabled={infobipSending || !infobipRecipient.trim()}
                className="w-full rounded-xl bg-[#25D366] py-3 text-center text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#1EBE5D] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {infobipSending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>جاري إرسال الرسالة عبر Infobip WhatsApp API...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>إرسال رسالة واتساب حقيقية الآن إلى {infobipRecipient}</span>
                  </>
                )}
              </button>

              {/* Live Response Box */}
              {infobipResponse && (
                <div
                  className={`rounded-2xl border p-4 space-y-2 text-xs font-mono ${
                    infobipResponse.success
                      ? "border-teal/40 bg-teal/10 text-teal"
                      : "border-danger/40 bg-danger/10 text-danger"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      {infobipResponse.success ? "✓ تم الإرسال بنجاح!" : "⚠ استجابة الخادم:"}
                    </span>
                    <span className="text-[10px] text-muted">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] p-2 bg-white/80 rounded-lg text-ink">
                    {JSON.stringify(infobipResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DISPATCHER SIMULATOR */}
          {activeTab === "test_dispatcher" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-purple-500/30 bg-purple-50 p-4">
                <h4 className="font-bold text-sm text-purple-900 mb-1">
                  محاكي استجابة الوكيل الذكي للرسائل الواردة
                </h4>
                <p className="text-xs text-purple-700">
                  اختبر كيف يقوم الوكيل الذكي بتحليل رسائل العميل الواردة، وإتمام عمليات البيع وتأكيد العناوين تلقائياً.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    نص رسالة العميل التجريبية:
                  </label>
                  <textarea
                    rows={3}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full rounded-xl border border-line p-3 text-xs sm:text-sm text-ink focus:border-gold focus:outline-none"
                    placeholder="مثال: أحتاج علبتين عود وعنواني في مسقط الخوض..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRunWebhookTest}
                  disabled={isTesting || !testMessage.trim()}
                  className="rounded-xl bg-ink px-6 py-2.5 text-xs font-bold text-onDark shadow-md hover:bg-ink-2 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isTesting ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>جاري معالجة الرد عبر Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 text-gold" />
                      <span>اختبار رد الوكيل الذكي الفوري</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div className="rounded-2xl border border-line bg-paper p-4 space-y-2">
                    <span className="font-mono text-xs font-bold text-teal block">
                      استجابة الوكيل الذكي المولدة:
                    </span>
                    <div className="text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-line">
                      {testResult}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: META CLOUD API (ADVANCED / OPTIONAL) */}
          {activeTab === "meta_api" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-line bg-paper p-4 flex items-start gap-3">
                <Server className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-ink leading-relaxed">
                  <span className="font-bold block text-sm mb-1 text-ink">
                    إعدادات Webhook و Meta Cloud API المتقدمة
                  </span>
                  إذا أردت مستقبلاً ربط حساب Meta Business Manager رسمياً بحساب WABA مخصص.
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    رابط الـ Webhook الخاص بك (Webhook Callback URL):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 font-mono text-xs text-ink select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(webhookUrl, "webhook")}
                      className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold hover:border-gold"
                    >
                      {copiedField === "webhook" ? "تم النسخ" : "نسخ"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    رمز التحقق (Verify Token):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={verifyToken}
                      className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 font-mono text-xs text-ink select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(verifyToken, "token")}
                      className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold hover:border-gold"
                    >
                      {copiedField === "token" ? "تم النسخ" : "نسخ"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
