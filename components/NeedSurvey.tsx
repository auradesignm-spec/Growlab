"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { track } from "@/lib/analytics";
import {
  markSurveyDone,
  generateDiagnosticResult,
  surveyIsDone,
  SURVEY_MODES,
  SURVEY_CR,
  SURVEY_PRODUCTS,
  SURVEY_CHANNELS,
  SURVEY_GOALS,
  type SurveyMode,
  type SurveyCR,
  type SurveyProduct,
  type SurveyChannel,
  type SurveyGoal,
} from "@/lib/needSurvey";
import { startProductTour, tourIsDone, PRODUCT_TOUR_EVENT } from "@/lib/productTour";
import { useRouter } from "next/navigation";

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

function NeedSurveyDialog() {
  const isAr = useLocale() !== "en";
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<number>(0);

  // Survey answers
  const [mode, setMode] = useState<SurveyMode | null>(null);
  const [cr, setCr] = useState<SurveyCR | null>(null);
  const [product, setProduct] = useState<SurveyProduct | null>(null);
  const [channel, setChannel] = useState<SurveyChannel | null>(null);
  const [goal, setGoal] = useState<SurveyGoal | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  const TOTAL_STEPS = 6; // 5 questions + 1 diagnostic summary

  const finish = useCallback(
    (actionType: "tour" | "navigate" | "skip", targetUrl?: string) => {
      markSurveyDone();
      setOpen(false);
      track("Need Survey Completed", {
        mode: mode ?? "none",
        cr: cr ?? "none",
        product: product ?? "none",
        channel: channel ?? "none",
        goal: goal ?? "none",
        actionType,
      });

      if (actionType === "tour") {
        window.setTimeout(() => startProductTour(), 250);
      } else if (actionType === "navigate" && targetUrl) {
        router.push(targetUrl);
      }
    },
    [channel, cr, goal, mode, product, router],
  );

  useEffect(() => {
    if (surveyIsDone() || tourIsDone()) return;
    const id = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const hide = () => setOpen(false);
    window.addEventListener(PRODUCT_TOUR_EVENT, hide);
    return () => window.removeEventListener(PRODUCT_TOUR_EVENT, hide);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish("skip");
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [finish, open]);

  const canNext =
    (step === 0 && mode != null) ||
    (step === 1 && cr != null) ||
    (step === 2 && product != null) ||
    (step === 3 && channel != null) ||
    (step === 4 && goal != null) ||
    step === 5;

  const result = generateDiagnosticResult({ mode, cr, product, channel, goal });

  if (!open) return null;

  return (
    <div className="gl-survey-scrim" role="presentation">
      <div className="gl-survey-stage max-w-xl w-full">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="gl-survey-card !max-h-[92vh] !p-6 sm:!p-8 overflow-y-auto"
        >
          {/* Progress Indicators */}
          <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-3">
            <h2 className="text-sm font-semibold text-frost">
              {isAr ? "استبيان التوجيه الذكي" : "Diagnostic Survey"}
            </h2>
            <div className="flex items-center gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === step
                      ? "w-6 bg-slate-900"
                      : index < step
                      ? "w-3 bg-emerald-500"
                      : "w-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs font-semibold text-frost-dim">
            {isAr
              ? `الخطوة ${step + 1} من ${TOTAL_STEPS}`
              : `Step ${step + 1} of ${TOTAL_STEPS}`}
          </p>

          {/* Question 0: Mode Preference */}
          {step === 0 && (
            <div className="mt-2 space-y-4">
              <div>
                <h2 id={titleId} className="text-xl sm:text-2xl font-bold text-frost leading-snug">
                  {isAr
                    ? "هل تفضل تجربة فعلية للمنصة أو تجربة ديمو تفاعلية؟"
                    : "Do you prefer a Real Platform Setup or an Interactive Demo?"}
                </h2>
                <p className="mt-1 text-sm text-frost-dim">
                  {isAr
                    ? "اختر طريقتك المفضلة لبدء استخدام واستكشاف Growlab"
                    : "Select your preferred way to explore and start with Growlab"}
                </p>
              </div>

              <div className="grid gap-3 pt-2">
                {SURVEY_MODES.map((option) => {
                  const isSelected = mode === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMode(option.id)}
                      className={`w-full rounded-2xl p-4 text-start transition-all border ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.01]"
                          : "border-line bg-white/70 hover:bg-white hover:border-slate-300 text-frost"
                      }`}
                    >
                      <p className="font-bold text-[15px]">{isAr ? option.ar : option.en}</p>
                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          isSelected ? "text-slate-300" : "text-frost-dim"
                        }`}
                      >
                        {isAr ? option.descAr : option.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question 1: Commercial Registration (CR vs Home / Freelancer vs Creator) */}
          {step === 1 && (
            <div className="mt-2 space-y-4">
              <div>
                <h2 id={titleId} className="text-xl sm:text-2xl font-bold text-frost leading-snug">
                  {isAr
                    ? "ما هو نوع نشاطك؟ وهل لديك سجل تجاري رسمي؟"
                    : "What is your business type? Do you hold a Commercial Register (CR)?"}
                </h2>
                <p className="mt-1 text-sm text-frost-dim">
                  {isAr
                    ? "نخصص لك مسار التوثيق المناسب؛ أصحاب المشاريع المنزلية لا يحتاجون سجل تجاري!"
                    : "We tailor the verification track; home businesses do not require a CR!"}
                </p>
              </div>

              <div className="grid gap-3 pt-2">
                {SURVEY_CR.map((option) => {
                  const isSelected = cr === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setCr(option.id)}
                      className={`w-full rounded-2xl p-4 text-start transition-all border ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.01]"
                          : "border-line bg-white/70 hover:bg-white hover:border-slate-300 text-frost"
                      }`}
                    >
                      <p className="font-bold text-[15px]">{isAr ? option.ar : option.en}</p>
                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          isSelected ? "text-slate-300" : "text-frost-dim"
                        }`}
                      >
                        {isAr ? option.descAr : option.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question 2: Product Type */}
          {step === 2 && (
            <div className="mt-2 space-y-4">
              <div>
                <h2 id={titleId} className="text-xl sm:text-2xl font-bold text-frost leading-snug">
                  {isAr
                    ? "ما هو نوع المنتجات أو الخدمات التي تقدمها؟"
                    : "What type of products or services do you offer?"}
                </h2>
                <p className="mt-1 text-sm text-frost-dim">
                  {isAr
                    ? "يساعدنا ذلك في ضبط دورة الشحن، الدفع عند الاستلام، وتوصيل المندوبين"
                    : "Helps configure your shipping loop, COD settlement, and delivery dispatch"}
                </p>
              </div>

              <div className="grid gap-3 pt-2">
                {SURVEY_PRODUCTS.map((option) => {
                  const isSelected = product === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setProduct(option.id)}
                      className={`w-full rounded-2xl p-4 text-start transition-all border ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.01]"
                          : "border-line bg-white/70 hover:bg-white hover:border-slate-300 text-frost"
                      }`}
                    >
                      <p className="font-bold text-[15px]">{isAr ? option.ar : option.en}</p>
                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          isSelected ? "text-slate-300" : "text-frost-dim"
                        }`}
                      >
                        {isAr ? option.descAr : option.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question 3: Sales Channels */}
          {step === 3 && (
            <div className="mt-2 space-y-4">
              <div>
                <h2 id={titleId} className="text-xl sm:text-2xl font-bold text-frost leading-snug">
                  {isAr
                    ? "كيف تبيع وتستقبل طلبات الزبائن حالياً؟"
                    : "How do you currently capture and fulfill orders?"}
                </h2>
                <p className="mt-1 text-sm text-frost-dim">
                  {isAr
                    ? "سنبين لك كيف تربط قنواتك الحالية وتوقف ضياع الطلبات بين الرسائل"
                    : "We will demonstrate how to connect your channels and prevent lost chat orders"}
                </p>
              </div>

              <div className="grid gap-3 pt-2">
                {SURVEY_CHANNELS.map((option) => {
                  const isSelected = channel === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setChannel(option.id)}
                      className={`w-full rounded-2xl p-4 text-start transition-all border ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.01]"
                          : "border-line bg-white/70 hover:bg-white hover:border-slate-300 text-frost"
                      }`}
                    >
                      <p className="font-bold text-[15px]">{isAr ? option.ar : option.en}</p>
                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          isSelected ? "text-slate-300" : "text-frost-dim"
                        }`}
                      >
                        {isAr ? option.descAr : option.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question 4: Primary Goal / Pain Point */}
          {step === 4 && (
            <div className="mt-2 space-y-4">
              <div>
                <h2 id={titleId} className="text-xl sm:text-2xl font-bold text-frost leading-snug">
                  {isAr
                    ? "ما هو التحدي الأكبر أو الهدف الرئيسي الذي تريد تحقيقه؟"
                    : "What is your main challenge or primary objective to solve?"}
                </h2>
                <p className="mt-1 text-sm text-frost-dim">
                  {isAr
                    ? "لنركز لك في الجولة التوضيحية على الأداة التي تحل هذا التحدي بالذات"
                    : "So our tour spotlights the exact tool that solves this primary challenge"}
                </p>
              </div>

              <div className="grid gap-3 pt-2">
                {SURVEY_GOALS.map((option) => {
                  const isSelected = goal === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setGoal(option.id)}
                      className={`w-full rounded-2xl p-4 text-start transition-all border ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.01]"
                          : "border-line bg-white/70 hover:bg-white hover:border-slate-300 text-frost"
                      }`}
                    >
                      <p className="font-bold text-[15px]">{isAr ? option.ar : option.en}</p>
                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          isSelected ? "text-slate-300" : "text-frost-dim"
                        }`}
                      >
                        {isAr ? option.descAr : option.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Smart Diagnostic Forecast & Actionable Roadmap */}
          {step === 5 && (
            <div className="mt-2 space-y-5">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50/50 p-5 border border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white uppercase">
                    {isAr ? result.badgeAr : result.badgeEn}
                  </span>
                  <span className="text-xs font-semibold text-emerald-900">
                    {isAr ? "تحليل الذكاء الاصطناعي لاحتياجك" : "AI Needs Assessment"}
                  </span>
                </div>

                <h2 id={titleId} className="mt-2 text-xl font-bold text-slate-900 leading-snug">
                  {isAr ? result.titleAr : result.titleEn}
                </h2>

                <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                  {isAr ? result.pathDescriptionAr : result.pathDescriptionEn}
                </p>
              </div>

              {/* Step by step tour preview */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isAr ? "المحطات التي سنرشدك لتجربتها خطوة بخطوة:" : "Key stops you will explore:"}
                </p>
                <div className="space-y-2">
                  {(isAr ? result.keyStepsAr : result.keyStepsEn).map((st, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl border border-line bg-white/80 p-3 text-xs text-slate-800 shadow-sm"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-[10px] text-white">
                        {i + 1}
                      </span>
                      <span className="font-medium leading-relaxed">{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="gl-survey-btn-ghost text-xs"
                >
                  {isAr ? "← السابق" : "← Back"}
                </button>
              )}
              <button
                type="button"
                onClick={() => finish("skip")}
                className="text-xs text-frost-dim underline-offset-2 hover:underline hover:text-frost px-2"
              >
                {isAr ? "تخطي الاستبيان" : "Skip Survey"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {step < 5 ? (
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setStep((s) => s + 1)}
                  className="gl-survey-btn-ink font-bold px-6 text-sm disabled:opacity-40"
                >
                  {isAr ? "متابعة ←" : "Next →"}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => finish("tour")}
                    className="gl-btn-primary !min-h-10 !py-2 !px-5 !text-xs"
                  >
                    <span>{isAr ? "بدء الجولة التوضيحية الفورية" : "Launch Interactive Tour"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => finish("navigate", result.actionUrl)}
                    className="gl-btn-secondary !min-h-10 !py-2 !px-5 !text-xs"
                  >
                    <span>{isAr ? result.actionLabelAr : result.actionLabelEn}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

