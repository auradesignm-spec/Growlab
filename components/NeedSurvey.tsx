"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { track } from "@/lib/analytics";
import {
  NEED_SURVEY_KEY,
  SURVEY_ADVICE,
  SURVEY_COPY,
  SURVEY_PAINS,
  SURVEY_WHO,
  surveyAdvice,
  type SurveyPain,
  type SurveyWho,
} from "@/lib/needSurvey";
import { startProductTour, tourIsDone } from "@/lib/productTour";

export default function NeedSurvey() {
  const t = useTranslations("marketing.survey");
  const ar = useLocale() === "ar";
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [who, setWho] = useState<SurveyWho | null>(null);
  const [pain, setPain] = useState<SurveyPain | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const finish = useCallback((showGuide: boolean) => {
    try {
      localStorage.setItem(NEED_SURVEY_KEY, "done");
    } catch {
      /* ignore */
    }
    setOpen(false);
    if (showGuide && who) {
      track("Need Survey Done", { who, pain: pain ?? "" });
    }
    window.setTimeout(() => startProductTour(), 320);
  }, [pain, who]);

  useEffect(() => {
    try {
      if (localStorage.getItem(NEED_SURVEY_KEY) === "done") {
        if (!tourIsDone()) {
          const later = window.setTimeout(() => startProductTour(), 560);
          return () => window.clearTimeout(later);
        }
        return;
      }
    } catch {
      return;
    }
    const id = window.setTimeout(() => setOpen(true), 480);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = dialogRef.current?.querySelector<HTMLElement>("button, [href]");
    node?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [finish, open]);

  const canNext = step === 2 || (step === 0 && who != null) || (step === 1 && pain != null);

  function onNext() {
    if (step === 0 && who) {
      if (who === "no_store") {
        setPain(null);
        setStep(1);
        return;
      }
      setStep(2);
      return;
    }
    if (step === 1 && pain) {
      setStep(2);
      return;
    }
    if (step === 2) finish(true);
  }

  const total = who === "no_store" || step === 1 ? 3 : 2;
  const current = who !== "no_store" && step === 2 ? 2 : step + 1;
  const copy = (key: keyof typeof SURVEY_COPY) => (ar ? SURVEY_COPY[key].ar : SURVEY_COPY[key].en);
  const advice = who ? (ar ? SURVEY_ADVICE[surveyAdvice(who, pain).advice].ar : SURVEY_ADVICE[surveyAdvice(who, pain).advice].en) : "";

  return (
    <>
      {open ? (
        <div className="gl-survey-scrim" role="presentation">
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="gl-survey-card">
            <div className="gl-survey-dots" aria-hidden="true">
              {Array.from({ length: total }, (_, index) => (
                <span key={index} className={index < current ? "is-on" : ""} />
              ))}
            </div>
            <p className="gl-survey-kicker">{t("progress", { current, total })}</p>
            <h2 id={titleId} className="gl-survey-title">
              {step < 2 ? copy("title") : copy("result")}
            </h2>
            {step === 0 ? (
              <fieldset className="mt-5 space-y-2.5 border-0 p-0">
                <legend className="gl-survey-legend">{copy("q1")}</legend>
                {SURVEY_WHO.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={who === option.id}
                    className={`gl-survey-option${who === option.id ? " is-on" : ""}`}
                    onClick={() => setWho(option.id)}
                  >
                    {ar ? option.ar : option.en}
                  </button>
                ))}
              </fieldset>
            ) : null}
            {step === 1 ? (
              <fieldset className="mt-5 space-y-2.5 border-0 p-0">
                <legend className="gl-survey-legend">{copy("q2")}</legend>
                {SURVEY_PAINS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={pain === option.id}
                    className={`gl-survey-option${pain === option.id ? " is-on" : ""}`}
                    onClick={() => setPain(option.id)}
                  >
                    {ar ? option.ar : option.en}
                  </button>
                ))}
              </fieldset>
            ) : null}
            {step === 2 ? <p className="gl-survey-advice">{advice}</p> : null}
            <div className="gl-survey-actions">
              {step > 0 ? (
                <button
                  type="button"
                  className="gl-survey-btn-ghost"
                  onClick={() => setStep(step === 2 && who !== "no_store" ? 0 : ((step - 1) as 0 | 1))}
                >
                  {t("back")}
                </button>
              ) : null}
              <button type="button" className="gl-survey-btn-ink" disabled={!canNext} onClick={onNext}>
                {step === 2 ? t("show") : t("next")}
              </button>
              <button type="button" className="gl-survey-skip" onClick={() => finish(false)}>
                {t("skip")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
