"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Users,
  Calendar,
  Clock,
  Receipt,
  FileText,
  Download,
  Printer,
  Sparkles,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Settings,
  Bell,
  RefreshCw,
  Plus,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Phone,
  HelpCircle,
  Search,
  Filter,
  Zap,
} from "lucide-react";
import { getSavedQuizData, type ComplianceSurveyAnswers, type ComplianceDiagnosticResult } from "@/lib/needSurvey";
import InstantComplianceTools from "./InstantComplianceTools";

type DashboardTab = "overview" | "tools" | "timeline" | "alerts" | "chat" | "reports" | "settings";

interface TimelineItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: "cr" | "municipality" | "tax" | "labour" | "tawteen";
  categoryLabelAr: string;
  categoryLabelEn: string;
  dueDate: string;
  daysRemaining: number;
  status: "urgent" | "soon" | "ok" | "done";
  costEstimated?: string;
  actionUrl?: string;
  notesAr: string;
}

interface AlertItem {
  id: string;
  priority: "high" | "medium" | "low";
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  date: string;
  category: string;
  isResolved?: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

export default function ComplianceDashboard() {
  const locale = useLocale();
  const isAr = locale !== "en";

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [quizData, setQuizData] = useState<{
    answers: ComplianceSurveyAnswers | null;
    result: ComplianceDiagnosticResult | null;
  }>({ answers: null, result: null });

  // Initial defaults
  const [businessName, setBusinessName] = useState(isAr ? "مؤسسة الأفق للتجارة والخدمات" : "Al-Ufuq Trading & Services");
  const [crNumber, setCrNumber] = useState("1429854");
  const [whatsappNumber, setWhatsappNumber] = useState("+968 9123 4567");
  const [sectorName, setSectorName] = useState(isAr ? "تجارة وتجزئة" : "Retail & Commerce");
  const [totalStaff, setTotalStaff] = useState(6);
  const [omaniStaff, setOmaniStaff] = useState(2);
  const [targetOmanisationRate, setTargetOmanisationRate] = useState(35);

  // Load any saved quiz data from localStorage
  useEffect(() => {
    const saved = getSavedQuizData();
    if (saved.answers) {
      setQuizData(saved);
      if (saved.answers.totalEmployees) setTotalStaff(saved.answers.totalEmployees);
      if (saved.answers.omaniEmployees) setOmaniStaff(saved.answers.omaniEmployees);
      if (saved.result?.requiredOmanisationRate) setTargetOmanisationRate(saved.result.requiredOmanisationRate);
      if (saved.result?.sectorLabelAr && isAr) setSectorName(saved.result.sectorLabelAr);
    }
  }, [isAr]);

  const currentOmanisationRate = totalStaff > 0 ? Math.round((omaniStaff / totalStaff) * 100) : 100;
  const isOmanisationOk = currentOmanisationRate >= targetOmanisationRate;
  const missingOmanis = Math.max(0, Math.ceil((targetOmanisationRate / 100) * totalStaff) - omaniStaff);

  // Timeline records
  const [timeline, setTimeline] = useState<TimelineItem[]>([
    {
      id: "tl-1",
      titleAr: "تجديد رخصة البلدية (بلدية مسقط)",
      titleEn: "Muscat Municipality License Renewal",
      category: "municipality",
      categoryLabelAr: "رخصة بلدية",
      categoryLabelEn: "Municipal Permit",
      dueDate: "2026-03-28",
      daysRemaining: 18,
      status: "soon",
      costEstimated: "45 ر.ع",
      actionUrl: "https://www.mm.gov.om",
      notesAr: "يتطلب إرفاق عقد الإيجار المعتمد وشهادة السجل التجاري.",
    },
    {
      id: "tl-2",
      titleAr: "تقديم إقرار ضريبة القيمة المضافة (الربع الأول)",
      titleEn: "Q1 VAT Return Filing (Tax Authority)",
      category: "tax",
      categoryLabelAr: "جهاز الضرائب",
      categoryLabelEn: "Tax Authority",
      dueDate: "2026-04-30",
      daysRemaining: 51,
      status: "ok",
      costEstimated: "حسب المبيعات",
      actionUrl: "https://tms.taxoman.gov.om",
      notesAr: "رفع كشوفات المبيعات والمشتريات عبر بوابة الضرائب الإلكترونية.",
    },
    {
      id: "tl-3",
      titleAr: "تحديث بيانات القوى العاملة في منصة توطين",
      titleEn: "Tawteen Platform Workforce Update",
      category: "tawteen",
      categoryLabelAr: "منصة توطين",
      categoryLabelEn: "Tawteen",
      dueDate: "2026-04-15",
      daysRemaining: 36,
      status: "ok",
      costEstimated: "مجاني",
      actionUrl: "https://www.mol.gov.om",
      notesAr: "مطابقة المسميات الوظيفية وأجور الكوادر الوطنية المسجلة في التأمينات.",
    },
    {
      id: "tl-4",
      titleAr: "تجديد السجل التجاري الرئيسي",
      titleEn: "Main Commercial Registry Renewal",
      category: "cr",
      categoryLabelAr: "السجل التجاري",
      categoryLabelEn: "Commercial Registry",
      dueDate: "2026-08-10",
      daysRemaining: 153,
      status: "ok",
      costEstimated: "35 ر.ع",
      actionUrl: "https://www.business.gov.om",
      notesAr: "عبر بوابة 'استثمر بسهولة' بوزارة التجارة والصناعة وترويج الاستثمار.",
    },
  ]);

  // Alerts records
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: "alt-1",
      priority: missingOmanis > 0 ? "high" : "low",
      titleAr: missingOmanis > 0 ? `نقص في نسبة التعمين (مطلوب ${missingOmanis} موظف عُماني)` : "نسبة التعمين مستوفاة بالكامل",
      titleEn: missingOmanis > 0 ? `Omanisation Gap: Need ${missingOmanis} Omani Hire` : "Omanisation Quota Met",
      descAr: missingOmanis > 0
        ? `نسبة التعمين الحالية (${currentOmanisationRate}%) أقل من مستهدف نشاط ${sectorName} (${targetOmanisationRate}%). ننصح بتعيين كادر وطني لتفادي غرامات وزارة العمل ووقف المأذونيات.`
        : `أنت محقق لنسبة ${currentOmanisationRate}% وهي أعلى من المطلوب (${targetOmanisationRate}%).`,
      date: "اليوم",
      category: "وزارة العمل",
    },
    {
      id: "alt-2",
      priority: "medium",
      titleAr: "اقتراب موعد تجديد ترخيص البلدية (متبقي 18 يوماً)",
      titleEn: "Municipal Permit Expiry in 18 Days",
      descAr: "رخصة بلدية مسقط تنتهي بتاريخ 28 مارس 2026. يرجى تجديد الترخيص لتفادي غرامة التأخير 50 ر.ع.",
      date: "منذ يومين",
      category: "البلديات",
    },
    {
      id: "alt-3",
      priority: "low",
      titleAr: "جاهزية الفوترة الإلكترونية لضريبة القيمة المضافة",
      titleEn: "E-Invoicing Readiness Check",
      descAr: "تأكد من تضمين الرقم الضريبي ورمز الاستجابة السريعة (QR) في كافة فواتير المبيعات الصادرة.",
      date: "منذ أسبوع",
      category: "جهاز الضرائب",
    },
  ]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      role: "assistant",
      text: isAr
        ? "مرحباً بك! 👋 أنا وكيل ريادة الذكي للامتثال التنظيمي.\nأنا هنا لمساعدتك في استفسارات نسب التعمين، تراخيص وزارة التجارة والبلديات، متطلبات الفوترة، وإجراءات التأمينات الاجتماعية في سلطنة عُمان. كيف يمكنني خدمتك اليوم؟"
        : "Welcome! I am your AI Regulatory Compliance Advisor for Oman. How can I assist you with Omanisation quotas, permits, or tax requirements?",
      time: "الآن",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch("/app/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          businessContext: {
            businessName,
            crNumber,
            sectorName,
            totalStaff,
            omaniStaff,
            currentOmanisationRate,
            targetOmanisationRate,
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: data.text || "تم تحليل استفسارك التنظيمي بنجاح.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: isAr
          ? "بناءً على لوائح وزارة العمل العُمانية، يجب الحفاظ على نسبة التعمين المقررة وتجديد التراخيص قبل موعدها بـ 30 يوماً. يمكنك تجديد السجل عبر 'استثمر بسهولة'."
          : "Under Omani regulations, maintain your mandatory quota and renew permits 30 days ahead.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Quick report printing / download simulation
  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#080B13] text-white flex flex-col" dir={isAr ? "rtl" : "ltr"}>
      
      {/* Top Dashboard Header */}
      <header className="border-b border-white/10 bg-[#0C101C]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-black font-bold shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="h-6 w-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white">{businessName}</h1>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  CR #{crNumber}
                </span>
              </div>
              <span className="text-xs text-white/50 block">
                {isAr ? `نشاط: ${sectorName} • سلطنة عُمان 🇴🇲` : `Sector: ${sectorName} • Oman 🇴🇲`}
              </span>
            </div>
          </div>

          {/* Quick Actions & Live Indicator */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isAr ? "حراسة الامتثال نشطة 24/7" : "Live Compliance Guard Active"}</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{isAr ? "استشر الوكيل" : "Ask AI Advisor"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-white/10 bg-[#0A0E18] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
          {[
            { id: "overview" as const, labelAr: "نظرة عامة والامتثال", labelEn: "Overview", icon: ShieldCheck },
            { id: "tools" as const, labelAr: "أدوات الامتثال الفورية", labelEn: "Instant Compliance Tools", icon: Zap, badge: "AI" },
            { id: "timeline" as const, labelAr: "جدول المواعيد والتجديدات", labelEn: "Timeline", icon: Calendar, badge: "18d" },
            { id: "alerts" as const, labelAr: "التنبيهات النشطة", labelEn: "Alerts", icon: Bell, badge: missingOmanis > 0 ? "1" : undefined },
            { id: "chat" as const, labelAr: "وكيل ريادة الذكي (AI)", labelEn: "AI Advisor Chat", icon: MessageCircle },
            { id: "reports" as const, labelAr: "التقارير الشهرية", labelEn: "Reports", icon: FileText },
            { id: "settings" as const, labelAr: "إعدادات المنشأة", labelEn: "Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* ==================== 1. OVERVIEW TAB ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Quick Access Card for Killer Features */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#0E1528] to-[#0E1424] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold shrink-0 shadow-lg shadow-emerald-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {isAr ? "جديد: أدوات الامتثال الفورية ومحاكي الغرامات" : "New: Instant Compliance & Penalty Tools"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      5 ميزات حصرية
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">
                    {isAr
                      ? "محاكي الغرامات 'ماذا لو؟' • مدقق الفواتير بالرؤية الحاسوبية • مصنف السلع 5% أو 0% • تنبيهات الواتساب"
                      : "Penalty Simulator • AI Invoice Auditor • Tax Classifier • WhatsApp Alerts"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("tools")}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/10 shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <span>{isAr ? "فتح أدوات الامتثال الفورية" : "Launch Instant Tools"}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Compliance Health Card */}
              <div className="p-5 rounded-2xl bg-[#0E1424] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/60">{isAr ? "مؤشر الامتثال العام" : "Compliance Score"}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOmanisationOk ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-amber-400"
                    }`}
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-extrabold text-white">
                    {isOmanisationOk ? "92%" : "68%"}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isOmanisationOk ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {isOmanisationOk ? (isAr ? "ممتاز وآمن" : "Safe") : (isAr ? "يحتاج تعديل" : "Action Needed")}
                  </span>
                </div>
                <p className="text-[11px] text-white/40">
                  {isAr ? "بناءً على فحص السجل والتراخيص والتعمين" : "Based on active regulations"}
                </p>
              </div>

              {/* Omanisation Metric Card */}
              <div className="p-5 rounded-2xl bg-[#0E1424] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/60">{isAr ? "نسبة التعمين الحالية" : "Omanisation Rate"}</span>
                  <Users className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-mono text-3xl font-extrabold ${
                      isOmanisationOk ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {currentOmanisationRate}%
                  </span>
                  <span className="text-xs text-white/50">
                    ({isAr ? "المستهدف:" : "Target:"} {targetOmanisationRate}%)
                  </span>
                </div>
                <p className="text-[11px] text-white/40">
                  {isAr
                    ? `${omaniStaff} عُماني من إجمالي ${totalStaff} موظف`
                    : `${omaniStaff} Omanis of ${totalStaff} staff`}
                </p>
              </div>

              {/* Next Renewal Milestone */}
              <div className="p-5 rounded-2xl bg-[#0E1424] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/60">{isAr ? "أقرب موعد تجديد" : "Next Due Date"}</span>
                  <Calendar className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-extrabold text-amber-300">18</span>
                  <span className="text-xs text-white/60">{isAr ? "يوماً متبقية" : "Days left"}</span>
                </div>
                <p className="text-[11px] text-white/40">
                  {isAr ? "ترخيص بلدية مسقط (28 مارس 2026)" : "Muscat Municipal Permit"}
                </p>
              </div>

              {/* Prevented Fines Value Ticker */}
              <div className="p-5 rounded-2xl bg-[#0E1424] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/60">{isAr ? "غرامات تم تفاديها" : "Prevented Fines"}</span>
                  <TrendingDown className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-extrabold text-emerald-400">1,250</span>
                  <span className="text-xs font-semibold text-emerald-300/70">{isAr ? "ر.ع" : "OMR"}</span>
                </div>
                <p className="text-[11px] text-white/40">
                  {isAr ? "وفورات مباشرة بفضل التنبيهات المبكرة" : "Saved through timely actions"}
                </p>
              </div>
            </div>

            {/* Core Overview Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Omanisation Breakdown & Licenses Health */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Omanisation Deep Card */}
                <div className="p-6 rounded-2xl bg-[#0E1424] border border-white/10 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">{isAr ? "متابعة نسب التعمين (وزارة العمل)" : "Omanisation Tracking"}</h2>
                        <span className="text-xs text-white/50">
                          {isAr ? `القطاع الاقتصادي: ${sectorName}` : `Sector: ${sectorName}`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("settings")}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      {isAr ? "تعديل عدد الموظفين" : "Update staff"}
                    </button>
                  </div>

                  {/* Visual Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">
                        {isAr ? `المحقق: ${currentOmanisationRate}%` : `Current: ${currentOmanisationRate}%`}
                      </span>
                      <span className="text-white/50">
                        {isAr ? `المستهدف الإلزامي: ${targetOmanisationRate}%` : `Target: ${targetOmanisationRate}%`}
                      </span>
                    </div>

                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOmanisationOk ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(100, currentOmanisationRate)}%` }}
                      />
                    </div>
                  </div>

                  {/* Quota Action Advisory */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                      isOmanisationOk
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/25 text-amber-300"
                    }`}
                  >
                    {isOmanisationOk ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <span className="font-bold text-white block">
                        {isOmanisationOk
                          ? isAr
                            ? "مؤسستك مستوفية لنسبة التعمين المقررة قانوناً"
                            : "Mandatory Omanisation Quota Achieved"
                          : isAr
                          ? `⚠️ تنبيه: مطلوب تعيين ${missingOmanis} موظف عُماني لتفادي حظر المأذونيات`
                          : `Need ${missingOmanis} Omani staff to reach target`}
                      </span>
                      <p className="text-white/70 leading-relaxed">
                        {isOmanisationOk
                          ? isAr
                            ? "جميع معاملاتك وتصاريح العمل في وزارة العمل متاحة بدون أي قيود. احرص على تجديد العقود في التأمينات بانتظام."
                            : "All work permits can be processed smoothly."
                          : isAr
                          ? `للوصول إلى ${targetOmanisationRate}%، يحتاج نشاطك لإضافة ${missingOmanis} موظف عُماني. يمكنك الاستفادة من برامج دعم الأجور المتاحة.`
                          : "Hire Omanis to avoid transaction blockages."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Regulatory Entities Status List */}
                <div className="p-6 rounded-2xl bg-[#0E1424] border border-white/10 space-y-4">
                  <h2 className="text-base font-bold text-white">{isAr ? "رادار التراخيص والجهات الرسمية" : "Entity Regulatory Status"}</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        titleAr: "السجل التجاري (استثمر بسهولة)",
                        titleEn: "Commercial Registry",
                        status: "سارٍ ونشط",
                        expiry: "2026-08-10",
                        isOk: true,
                      },
                      {
                        titleAr: "رخصة البلدية (بلدية مسقط)",
                        titleEn: "Municipal Permit",
                        status: "يستحق التجديد قريباً",
                        expiry: "2026-03-28",
                        isOk: false,
                      },
                      {
                        titleAr: "منصة توطين والتأمينات",
                        titleEn: "Tawteen & Social Protection",
                        status: "محدث ومعتمد",
                        expiry: "محدث شهرياً",
                        isOk: true,
                      },
                      {
                        titleAr: "الفوترة وضريبة القيمة المضافة (VAT)",
                        titleEn: "VAT & E-Invoicing",
                        status: "متوافق مع المعايير",
                        expiry: "الإقرار: 30 أبريل",
                        isOk: true,
                      },
                    ].map((item) => (
                      <div
                        key={item.titleAr}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white block">{isAr ? item.titleAr : item.titleEn}</span>
                          <span className="text-white/40 block text-[11px]">{item.expiry}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.isOk
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Active Alerts & WhatsApp Feed */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Active Alerts Panel */}
                <div className="p-5 rounded-2xl bg-[#0E1424] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-emerald-400" />
                      <h2 className="text-sm font-bold text-white">{isAr ? "التنبيهات العاجلة" : "Active Alerts"}</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("alerts")}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      {isAr ? "عرض الكل" : "View all"}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {alerts.slice(0, 3).map((al) => (
                      <div
                        key={al.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          al.priority === "high"
                            ? "bg-rose-500/10 border-rose-500/25 text-rose-200"
                            : al.priority === "medium"
                            ? "bg-amber-500/10 border-amber-500/25 text-amber-200"
                            : "bg-white/[0.02] border-white/10 text-white/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{isAr ? al.titleAr : al.titleEn}</span>
                          <span className="text-[10px] text-white/40">{al.date}</span>
                        </div>
                        <p className="text-[11px] text-white/60 leading-relaxed">{isAr ? al.descAr : al.descEn}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Alert Feed Card */}
                <div className="p-5 rounded-2xl bg-[#0E1424] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <MessageCircle className="h-4 w-4" />
                    <span>{isAr ? "ربط تنبيهات واتساب" : "WhatsApp Alerts Sync"}</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {isAr
                      ? `التنبيهات تصل تلقائياً إلى رقمك: ${whatsappNumber}`
                      : `Alerts dispatched to: ${whatsappNumber}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
                  >
                    {isAr ? "تغيير رقم الواتساب" : "Change WhatsApp Number"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== INSTANT COMPLIANCE TOOLS TAB ==================== */}
        {activeTab === "tools" && (
          <div className="animate-in fade-in duration-200">
            <InstantComplianceTools
              businessName={businessName}
              crNumber={crNumber}
              initialWhatsapp={whatsappNumber}
            />
          </div>
        )}

        {/* ==================== 2. TIMELINE / CALENDAR TAB ==================== */}
        {activeTab === "timeline" && (
          <div className="p-6 rounded-2xl bg-[#0E1424] border border-white/10 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{isAr ? "جدول المواعيد والاستحقاقات التنظيمية" : "Regulatory Deadlines Timeline"}</h2>
                <p className="text-xs text-white/50">{isAr ? "تتبع دقيق لكافة مواعيد تجديد التراخيص والضرائب والبلديات" : "Track all upcoming renewal dates"}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">{isAr ? "إجمالي الاستحقاقات القادمة: 4" : "4 Upcoming Deadlines"}</span>
              </div>
            </div>

            <div className="space-y-3">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.daysRemaining <= 20
                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                          : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      <Calendar className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{isAr ? item.titleAr : item.titleEn}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">
                          {isAr ? item.categoryLabelAr : item.categoryLabelEn}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">{item.notesAr}</p>
                      <span className="text-[11px] text-white/40 block">
                        {isAr ? `تاريخ الاستحقاق: ${item.dueDate} • الرسوم التقديرية: ${item.costEstimated}` : `Due: ${item.dueDate}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:border-s sm:border-white/10 sm:ps-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-end">
                      <span
                        className={`font-mono text-xl font-bold block ${
                          item.daysRemaining <= 20 ? "text-amber-400" : "text-white"
                        }`}
                      >
                        {item.daysRemaining} {isAr ? "يوم" : "days"}
                      </span>
                      <span className="text-[10px] text-white/40">{isAr ? "متبقي" : "Remaining"}</span>
                    </div>

                    {item.actionUrl && (
                      <a
                        href={item.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-colors"
                      >
                        <span>{isAr ? "رابط التجديد" : "Renew"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 3. ALERTS TAB ==================== */}
        {activeTab === "alerts" && (
          <div className="p-6 rounded-2xl bg-[#0E1424] border border-white/10 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{isAr ? "سجل التنبيهات والمخاطر النشطة" : "Active Alerts & Risk Radar"}</h2>
                <p className="text-xs text-white/50">{isAr ? "مرتبة حسب درجة الخطورة والأولوية" : "Prioritized by risk level"}</p>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    al.priority === "high"
                      ? "bg-rose-500/10 border-rose-500/30"
                      : al.priority === "medium"
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-white/[0.02] border-white/10"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          al.priority === "high"
                            ? "bg-rose-500 text-white"
                            : al.priority === "medium"
                            ? "bg-amber-500 text-black"
                            : "bg-emerald-500 text-black"
                        }`}
                      >
                        {al.priority === "high"
                          ? isAr ? "عالي الخطورة" : "Critical"
                          : al.priority === "medium"
                          ? isAr ? "متوسط" : "Medium"
                          : isAr ? "منخفض" : "Low"}
                      </span>
                      <span className="font-bold text-sm text-white">{isAr ? al.titleAr : al.titleEn}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed max-w-2xl">{isAr ? al.descAr : al.descEn}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab("chat")}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
                    >
                      {isAr ? "استشارة الوكيل" : "Consult AI"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 4. AI ADVISOR CHAT TAB ==================== */}
        {activeTab === "chat" && (
          <div className="p-6 rounded-2xl bg-[#0E1424] border border-white/10 flex flex-col h-[600px] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{isAr ? "وكيل ريادة الذكي للاستشارات" : "AI Compliance Advisor"}</h2>
                  <span className="text-[11px] text-white/40">{isAr ? "متصل ببيانات وقوانين سلطنة عُمان" : "Oman Regulations Expert"}</span>
                </div>
              </div>

              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {isAr ? "متصل الآن" : "Online"}
              </span>
            </div>

            {/* Chat History List */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pe-2">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-white/[0.04] border border-white/10 text-white/90 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-white/30 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs text-white/50 p-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span>{isAr ? "جاري استشارة لوائح وقوانين سلطنة عُمان..." : "Analyzing regulations..."}</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  isAr
                    ? "اسأل عن نسب التعمين، تجديد التراخيص، غرامات البلدية، أو الفوترة..."
                    : "Ask about Omanisation, renewals, municipality permits..."
                }
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shrink-0 disabled:opacity-40 transition-all active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== 5. REPORTS TAB ==================== */}
        {activeTab === "reports" && (
          <div className="p-6 rounded-2xl bg-[#0E1424] border border-white/10 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{isAr ? "تقارير الامتثال الشهرية المعتمدة" : "Monthly Compliance Reports"}</h2>
                <p className="text-xs text-white/50">{isAr ? "تقارير جاهزة للتحميل والتقديم للبنوك والجهات الرسمية" : "Ready for export and audit"}</p>
              </div>

              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>{isAr ? "تصدير التقرير الحالي (PDF)" : "Export PDF"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  titleAr: "تقرير فحص الامتثال الشامل (مارس 2026)",
                  titleEn: "Comprehensive Compliance Audit (March 2026)",
                  descAr: "يتضمن تفصيل نسب التعمين، رادار التراخيص، وحالة الفوترة الضريبية.",
                  date: "2026-03-01",
                  size: "1.2 MB",
                },
                {
                  titleAr: "شهادة الامتثال التنظيمي للربع الأول 2026",
                  titleEn: "Q1 2026 Regulatory Certificate",
                  descAr: "وثيقة ملخصة تثبت مطابقة المؤسسة لمتطلبات وزارة العمل وجهاز الضرائب.",
                  date: "2026-02-15",
                  size: "850 KB",
                },
              ].map((rep) => (
                <div
                  key={rep.titleAr}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-sm text-white">{isAr ? rep.titleAr : rep.titleEn}</span>
                    </div>
                    <p className="text-xs text-white/60">{rep.descAr}</p>
                    <span className="text-[11px] text-white/40 block">
                      {rep.date} • {rep.size}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors shrink-0"
                    title={isAr ? "طباعة / تحميل" : "Print"}
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 6. SETTINGS TAB ==================== */}
        {activeTab === "settings" && (
          <div className="p-6 rounded-2xl bg-[#0E1424] border border-white/10 space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">{isAr ? "إعدادات المنشأة وبيانات الامتثال" : "Entity Settings"}</h2>
              <p className="text-xs text-white/50">{isAr ? "تحديث أرقام السجل والعمالة وقنوات تنبيهات واتساب" : "Update CR, workforce and alerts"}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">{isAr ? "اسم المؤسسة / الشركة:" : "Business Name:"}</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">{isAr ? "رقم السجل التجاري (CR):" : "CR Number:"}</label>
                <input
                  type="text"
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">{isAr ? "رقم واتساب للتنبيهات (+968):" : "WhatsApp Number:"}</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">{isAr ? "نوع النشاط الاقتصادي:" : "Sector:"}</label>
                <input
                  type="text"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">{isAr ? "إجمالي عدد الموظفين:" : "Total Staff:"}</label>
                <input
                  type="number"
                  value={totalStaff}
                  onChange={(e) => setTotalStaff(Number(e.target.value))}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">{isAr ? "عدد الكوادر العُمانية:" : "Omani Staff:"}</label>
                <input
                  type="number"
                  value={omaniStaff}
                  onChange={(e) => setOmaniStaff(Number(e.target.value))}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md transition-all active:scale-95"
              >
                {isAr ? "حفظ التعديلات والرجوع للوحة" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
