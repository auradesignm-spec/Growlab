"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  SECTOR_OPTIONS,
  generateComplianceDiagnostic,
  saveQuizResult,
  getSectorTarget,
  type SectorType,
  type YesNoUnknown,
  type ComplianceSurveyAnswers,
  type ComplianceDiagnosticResult,
} from "@/lib/needSurvey";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Receipt,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingDown,
  Lock,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function NeedSurvey() {
  if (CLERK_ENABLED) return <NeedSurveyWhenGuest />;
  return <NeedSurveyDialog />;
}

function NeedSurveyWhenGuest() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded || isSignedIn) return null;
  return <NeedSurveyDialog />;
}

export function NeedSurveyDialog({
  isOpen,
  onClose,
  standalone = false,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  standalone?: boolean;
}) {
  const currentLocale = useLocale();
  const isAr = currentLocale !== "en";
  const router = useRouter();
  const titleId = useId();

  const [open, setOpen] = useState(standalone ? true : false);
  const [step, setStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for 6 compliance questions
  const [sector, setSector] = useState<SectorType | null>("retail");
  const [totalEmployees, setTotalEmployees] = useState<number>(5);
  const [omaniEmployees, setOmaniEmployees] = useState<number>(1);
  const [knowsCrExpiry, setKnowsCrExpiry] = useState<"yes" | "unknown" | null>(null);
  const [crExpiryDate, setCrExpiryDate] = useState<string>("");
  const [isRegisteredTawteen, setIsRegisteredTawteen] = useState<YesNoUnknown | null>(null);
  const [hasEInvoicing, setHasEInvoicing] = useState<YesNoUnknown | null>(null);

  // Computed Diagnostic
  const [diagnostic, setDiagnostic] = useState<ComplianceDiagnosticResult | null>(null);

  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle external trigger or URL hash
  useEffect(() => {
    if (typeof isOpen === "boolean") {
      setOpen(isOpen);
      return;
    }
    const handleHash = () => {
      if (window.location.hash === "#quiz" || window.location.hash === "#audit") {
        setOpen(true);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    
    // Custom event listener for buttons across page
    const openHandler = () => setOpen(true);
    window.addEventListener("open-compliance-quiz", openHandler);

    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("open-compliance-quiz", openHandler);
    };
  }, [isOpen]);

  const autoAdvance = useCallback((nextStep: number, delayMs = 260) => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }
    advanceTimerRef.current = setTimeout(() => {
      setStep(nextStep);
      advanceTimerRef.current = null;
    }, delayMs);
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const handleSectorSelect = (sec: SectorType) => {
    setSector(sec);
    autoAdvance(1, 240);
  };

  const handleTotalEmployeesSubmit = () => {
    // If omani employees exceed total, adjust automatically
    if (omaniEmployees > totalEmployees) {
      setOmaniEmployees(totalEmployees);
    }
    autoAdvance(2, 100);
  };

  const handleOmaniEmployeesSubmit = () => {
    autoAdvance(3, 100);
  };

  const handleCrOption = (option: "yes" | "unknown") => {
    setKnowsCrExpiry(option);
    if (option === "unknown") {
      autoAdvance(4, 240);
    }
  };

  const handleCrDateSubmit = () => {
    autoAdvance(4, 100);
  };

  const handleTawteenSelect = (val: YesNoUnknown) => {
    setIsRegisteredTawteen(val);
    autoAdvance(5, 240);
  };

  const handleEInvoicingSelect = async (val: YesNoUnknown) => {
    setHasEInvoicing(val);
    setIsSubmitting(true);

    const answers: ComplianceSurveyAnswers = {
      sector,
      totalEmployees,
      omaniEmployees,
      knowsCrExpiry,
      crExpiryDate: knowsCrExpiry === "yes" ? crExpiryDate : undefined,
      isRegisteredTawteen,
      hasEInvoicing: val,
    };

    const result = generateComplianceDiagnostic(answers);
    setDiagnostic(result);
    saveQuizResult(answers, result);

    // Send asynchronously to backend webhook
    try {
      fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      }).catch((e) => console.warn("Background webhook sync:", e));
    } catch {
      /* ignore */
    }

    setIsSubmitting(false);
    setStep(6); // Go to Diagnostic Result Screen
  };

  const handleBack = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const handleRegister = () => {
    handleClose();
    router.push("/sign-up");
  };

  const handleGoDashboard = () => {
    handleClose();
    router.push("/dashboard");
  };

  if (!open && !standalone) return null;

  const TOTAL_QUESTIONS = 6;
  const progressPercent = step <= 5 ? Math.round(((step + 1) / TOTAL_QUESTIONS) * 100) : 100;
  const targetRateForSelectedSector = getSectorTarget(sector);
  const liveOmanisationPct = totalEmployees > 0 ? Math.round((omaniEmployees / totalEmployees) * 100) : 100;

  return (
    <div
      role={standalone ? "region" : "dialog"}
      aria-modal={standalone ? undefined : "true"}
      aria-labelledby={titleId}
      className={
        standalone
          ? "w-full max-w-2xl mx-auto my-4 font-body"
          : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 font-body"
      }
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#0E131F] border border-white/10 shadow-2xl text-white font-body"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span id={titleId} className="text-sm font-semibold text-white block leading-tight">
                {isAr ? "فاحص الامتثال الذكي للمؤسسات العُمانية" : "Oman SME Compliance Audit"}
              </span>
              <span className="text-[11px] text-white/50">
                {step < 6
                  ? isAr
                    ? `السؤال ${step + 1} من ${TOTAL_QUESTIONS}`
                    : `Question ${step + 1} of ${TOTAL_QUESTIONS}`
                  : isAr
                  ? "تقرير الامتثال المباشر"
                  : "Instant Compliance Result"}
              </span>
            </div>
          </div>

          {!standalone && (
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Progress Line */}
        {step < 6 && (
          <div className="h-1 w-full bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-7 min-h-[420px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* QUESTION 1: Sector */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -20 : 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{isAr ? "الخطوة الأولى: تحديد النشاط" : "Step 1: Business Sector"}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {isAr ? "ما نوع نشاطك التجاري في سلطنة عُمان؟" : "What is your business sector in Oman?"}
                  </h3>
                  <p className="text-sm text-white/60">
                    {isAr
                      ? "تختلف نسب التعمين والاشتراطات البلدية بحسب القطاع الاقتصادي المعتمد."
                      : "Omanisation quotas and permits vary based on your sector."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {SECTOR_OPTIONS.map((opt) => {
                    const isSelected = sector === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSectorSelect(opt.id)}
                        className={`group relative flex items-start gap-3 p-3.5 rounded-xl border text-start transition-all ${
                          isSelected
                            ? "border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                            isSelected
                              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                              : "border-white/10 bg-white/5 text-white/60 group-hover:text-white"
                          }`}
                        >
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-white">{isAr ? opt.ar : opt.en}</span>
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {opt.targetOmanisation}% {isAr ? "تعمين" : "target"}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-1 leading-relaxed line-clamp-2">
                            {isAr ? opt.descAr : opt.descEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* QUESTION 2: Total Employees */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -20 : 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Users className="h-3.5 w-3.5" />
                    <span>{isAr ? "الخطوة الثانية: القوى العاملة" : "Step 2: Workforce Size"}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {isAr ? "كم إجمالي عدد الموظفين في مؤسستك؟" : "How many total employees do you have?"}
                  </h3>
                  <p className="text-sm text-white/60">
                    {isAr
                      ? "يشمل ذلك جميع الموظفين (عُمانيين ووافدين) المسجلين في المؤسسة."
                      : "Includes all registered staff (Omani nationals & expatriates)."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setTotalEmployees((n) => Math.max(1, n - 1))}
                      className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xl flex items-center justify-center border border-white/10 transition-all active:scale-95"
                    >
                      -
                    </button>
                    <div className="text-center px-4">
                      <span className="font-mono text-5xl font-extrabold text-white tracking-tight">
                        {totalEmployees}
                      </span>
                      <span className="block text-xs text-white/50 mt-1">
                        {isAr ? "موظف مسجل" : "Registered staff"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTotalEmployees((n) => n + 1)}
                      className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xl flex items-center justify-center border border-white/10 transition-all active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {[1, 3, 5, 10, 20, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTotalEmployees(num)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                          totalEmployees === num
                            ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {num} {isAr ? "موظف" : "staff"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    <span>{isAr ? "السابق" : "Back"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTotalEmployeesSubmit}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <span>{isAr ? "متابعة" : "Continue"}</span>
                    {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* QUESTION 3: Omani Employees */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -20 : 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>{isAr ? "الخطوة الثالثة: التعمين" : "Step 3: Omanisation"}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {isAr ? "كم عدد الموظفين العُمانيين من ضمنهم؟" : "How many of them are Omani nationals?"}
                  </h3>
                  <p className="text-sm text-white/60">
                    {isAr
                      ? `النسبة الإلزامية لنشاط ${SECTOR_OPTIONS.find((s) => s.id === sector)?.ar || "نشاطك"} هي ${targetRateForSelectedSector}%.`
                      : `Mandatory target is ${targetRateForSelectedSector}%.`}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setOmaniEmployees((n) => Math.max(0, n - 1))}
                      className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xl flex items-center justify-center border border-white/10 transition-all active:scale-95"
                    >
                      -
                    </button>
                    <div className="text-center px-4">
                      <span className="font-mono text-5xl font-extrabold text-white tracking-tight">
                        {omaniEmployees}
                      </span>
                      <span className="block text-xs text-white/50 mt-1">
                        {isAr ? "موظف عُماني" : "Omani staff"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOmaniEmployees((n) => Math.min(totalEmployees, n + 1))}
                      className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xl flex items-center justify-center border border-white/10 transition-all active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  {/* Live Omanisation Indicator */}
                  <div className="w-full max-w-sm rounded-xl p-3 bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">{isAr ? "نسبة التعمين الحالية:" : "Current Rate:"}</span>
                      <span
                        className={`font-mono font-bold ${
                          liveOmanisationPct >= targetRateForSelectedSector ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {liveOmanisationPct}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40">{isAr ? "المستهدف:" : "Target:"}</span>
                      <span className="font-mono font-semibold text-white/80">{targetRateForSelectedSector}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    <span>{isAr ? "السابق" : "Back"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOmaniEmployeesSubmit}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <span>{isAr ? "متابعة" : "Continue"}</span>
                    {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* QUESTION 4: CR Expiry Date */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -20 : 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{isAr ? "الخطوة الرابعة: السجل التجاري" : "Step 4: Commercial Registry"}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {isAr ? "هل تعرف تاريخ انتهاء سجلك التجاري؟" : "Do you know your CR expiration date?"}
                  </h3>
                  <p className="text-sm text-white/60">
                    {isAr
                      ? "انتهاء السجل التجاري أو رخصة البلدية يسبب غرامات تراكمية وتوقف المعاملات الحكومية."
                      : "Expired CR or permits cause recurring penalties."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCrOption("yes")}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-start transition-all ${
                      knowsCrExpiry === "yes"
                        ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-5 w-5 shrink-0 ${knowsCrExpiry === "yes" ? "text-emerald-400" : "text-white/40"}`}
                    />
                    <div>
                      <span className="font-semibold text-sm text-white block">
                        {isAr ? "نعم — سأدخل التاريخ" : "Yes — I will enter date"}
                      </span>
                      <span className="text-xs text-white/50">{isAr ? "لضبط عداد التنبيهات" : "To set reminder"}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCrOption("unknown")}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-start transition-all ${
                      knowsCrExpiry === "unknown"
                        ? "border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/30"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 shrink-0 ${
                        knowsCrExpiry === "unknown" ? "text-amber-400" : "text-white/40"
                      }`}
                    />
                    <div>
                      <span className="font-semibold text-sm text-white block">{isAr ? "لا أعرف بدقة" : "I am not sure"}</span>
                      <span className="text-xs text-white/50">{isAr ? "سيتم التنبيه لمراجعته" : "Audit needed"}</span>
                    </div>
                  </button>
                </div>

                {knowsCrExpiry === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2"
                  >
                    <label className="block text-xs font-medium text-white/80">
                      {isAr ? "حدد تاريخ انتهاء السجل التجاري:" : "CR Expiry Date:"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={crExpiryDate}
                        onChange={(e) => setCrExpiryDate(e.target.value)}
                        className="flex-1 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={handleCrDateSubmit}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg transition-all"
                      >
                        {isAr ? "تأكيد والتالي" : "Confirm & Next"}
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    <span>{isAr ? "السابق" : "Back"}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* QUESTION 5: Tawteen & Social Security */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -20 : 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{isAr ? "الخطوة الخامسة: منصة توطين" : "Step 5: Tawteen Platform"}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {isAr
                      ? "هل مؤسستك مسجلة في منصة توطين وصندوق الحماية الاجتماعية؟"
                      : "Is your business registered on Tawteen platform?"}
                  </h3>
                  <p className="text-sm text-white/60">
                    {isAr
                      ? "التسجيل في توطين شرط أساسي لاحتساب نسب التعمين الرسمية وتفادي غرامات القوى العاملة."
                      : "Required for official quota validation."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { val: "yes" as const, ar: "نعم، مسجلة ومحدثة", en: "Yes, registered", icon: CheckCircle2, color: "emerald" },
                    { val: "no" as const, ar: "لا، غير مسجلة", en: "No, not registered", icon: X, color: "red" },
                    { val: "unknown" as const, ar: "لا أعرف / لست متأكداً", en: "Not sure", icon: AlertTriangle, color: "amber" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleTawteenSelect(opt.val)}
                      className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                        isRegisteredTawteen === opt.val
                          ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <opt.icon
                        className={`h-6 w-6 mb-2 ${
                          opt.color === "emerald"
                            ? "text-emerald-400"
                            : opt.color === "red"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      />
                      <span className="font-semibold text-sm text-white">{isAr ? opt.ar : opt.en}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    <span>{isAr ? "السابق" : "Back"}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* QUESTION 6: E-Invoicing & VAT */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -20 : 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>{isAr ? "الخطوة السادسة: الفوترة والضرائب" : "Step 6: E-Invoicing & Tax"}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {isAr
                      ? "هل تصدر فواتير إلكترونية حالياً متوافقة مع متطلبات جهاز الضرائب؟"
                      : "Do you issue compliant e-invoices for tax authority?"}
                  </h3>
                  <p className="text-sm text-white/60">
                    {isAr
                      ? "جهاز الضرائب يفرض غرامات تصل لـ 5,000 ر.ع في حال عدم إصدار فواتير ضريبية نظامية."
                      : "Non-compliant tax invoicing incurs penalties up to 5,000 OMR."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { val: "yes" as const, ar: "نعم، نظامية ومتوافقة", en: "Yes, compliant", icon: CheckCircle2, color: "emerald" },
                    { val: "no" as const, ar: "لا / فواتير ورقية عادية", en: "No / Manual only", icon: X, color: "red" },
                    { val: "unknown" as const, ar: "لا أعرف الشروط", en: "Not sure", icon: AlertTriangle, color: "amber" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleEInvoicingSelect(opt.val)}
                      className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                        hasEInvoicing === opt.val
                          ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <opt.icon
                        className={`h-6 w-6 mb-2 ${
                          opt.color === "emerald"
                            ? "text-emerald-400"
                            : opt.color === "red"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      />
                      <span className="font-semibold text-sm text-white">{isAr ? opt.ar : opt.en}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    <span>{isAr ? "السابق" : "Back"}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: INSTANT DIAGNOSTIC RESULT SCREEN */}
            {step === 6 && diagnostic && (
              <motion.div
                key="step-result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Result Header Badge & Gauge */}
                <div
                  className={`p-5 rounded-2xl border ${
                    diagnostic.status === "red"
                      ? "bg-red-500/10 border-red-500/30"
                      : diagnostic.status === "yellow"
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-emerald-500/10 border-emerald-500/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            diagnostic.status === "red"
                              ? "bg-red-500 text-white"
                              : diagnostic.status === "yellow"
                              ? "bg-amber-500 text-black"
                              : "bg-emerald-500 text-black"
                          }`}
                        >
                          {diagnostic.status === "red" ? (
                            <ShieldAlert className="h-3.5 w-3.5" />
                          ) : diagnostic.status === "yellow" ? (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          )}
                          {isAr ? diagnostic.statusLabelAr : diagnostic.statusLabelEn}
                        </span>
                        <span className="text-xs text-white/50">
                          {isAr ? `نشاط: ${diagnostic.sectorLabelAr}` : "Audit Result"}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {isAr ? diagnostic.statusDescriptionAr : diagnostic.statusDescriptionEn}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 sm:border-s sm:border-white/10 sm:ps-5 shrink-0">
                      <div className="text-center">
                        <span className="block font-mono text-3xl font-extrabold text-white">
                          {diagnostic.score}%
                        </span>
                        <span className="text-[11px] text-white/50">{isAr ? "مؤشر الامتثال" : "Compliance"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Fines & Omanisation Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                    <span className="text-xs text-white/60 flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                      {isAr ? "تقدير الغرامات المحتملة المعرض لها:" : "Estimated Fine Exposure:"}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-2xl font-extrabold text-rose-400">
                        {diagnostic.totalEstimatedFine.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-rose-300/80">{isAr ? "ريال عُماني" : "OMR"}</span>
                    </div>
                    <p className="text-[11px] text-white/40">
                      {isAr ? "يمكن تفادي 100% من هذه المبالغ بضبط التراخيص والتعمين." : "100% preventable via proactive compliance."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                    <span className="text-xs text-white/60 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-emerald-400" />
                      {isAr ? "مؤشر التعمين الحالي:" : "Omanisation Status:"}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-extrabold text-white">
                        {diagnostic.currentOmanisationRate}%
                      </span>
                      <span className="text-xs text-white/50">
                        {isAr
                          ? `(المطلوب: ${diagnostic.requiredOmanisationRate}%)`
                          : `(Target: ${diagnostic.requiredOmanisationRate}%)`}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50">
                      {diagnostic.missingOmaniCount > 0
                        ? isAr
                          ? `مطلوب تعيين ${diagnostic.missingOmaniCount} موظف عُماني لتفادي حظر المأذونيات.`
                          : `Need to hire ${diagnostic.missingOmaniCount} Omani staff.`
                        : isAr
                        ? "مستوفٍ لنسبة التعمين المقررة لقطاعك."
                        : "Fully compliant with quota."}
                    </p>
                  </div>
                </div>

                {/* 2-3 Tailored Recommendations */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-white/70 block">
                    {isAr ? "التوصيات الفورية المقترحة لمنشأتك:" : "Instant Recommended Actions:"}
                  </span>
                  <div className="space-y-2">
                    {diagnostic.recommendations.slice(0, 3).map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5 text-xs text-white/80"
                      >
                        <Zap className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white block mb-0.5">
                            {isAr ? rec.titleAr : rec.titleEn}
                          </span>
                          <span className="text-white/60 leading-relaxed block">
                            {isAr ? rec.descAr : rec.descEn}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivational Register & Dashboard Buttons */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isAr ? "سجّل مجاناً لحفظ التقرير ومنع الغرامات" : "Register Free to Save Report"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoDashboard}
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
                  >
                    <span>{isAr ? "معاينة لوحة التحكم" : "View Dashboard Demo"}</span>
                    {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
