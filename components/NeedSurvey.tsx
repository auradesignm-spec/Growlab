"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { track } from "@/lib/analytics";
import {
  markSurveyDone,
  SURVEY_COPY,
  SURVEY_HOW,
  SURVEY_PAINS,
  SURVEY_WHO,
  surveyAdvice,
  surveyIsDone,
  type SurveyHow,
  type SurveyPain,
  type SurveyWho,
} from "@/lib/needSurvey";
import { startProductTour, tourIsDone, PRODUCT_TOUR_EVENT } from "@/lib/productTour";
import GlassBubbleTrack from "@/components/GlassBubbleTrack";

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
  const t = useTranslations("marketing.survey");
  const ar = useLocale() === "ar";
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [who, setWho] = useState<SurveyWho | null>(null);
  const [how, setHow] = useState<SurveyHow | null>(null);
  const [pain, setPain] = useState<SurveyPain | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(
    (showGuide: boolean) => {
      markSurveyDone();
      setOpen(false);
      if (showGuide && who) {
        track("Need Survey Done", { who, how: how ?? "", pain: pain ?? "" });
        window.setTimeout(() => startProductTour(), 320);
      }
    },
    [how, pain, who],
  );

  useEffect(() => {
    if (surveyIsDone() || tourIsDone()) return;
    const id = window.setTimeout(() => setOpen(true), 480);
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
      if (event.key === "Escape") finish(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [finish, open]);

  const canNext =
    step === 3 || (step === 0 && who != null) || (step === 1 && how != null) || (step === 2 && pain != null);

  function onNext() {
    if (step < 3) {
      setStep((s) => (s + 1) as 0 | 1 | 2 | 3);
      return;
    }
    finish(true);
  }

  const copy = (key: keyof typeof SURVEY_COPY) => (ar ? SURVEY_COPY[key].ar : SURVEY_COPY[key].en);
  const advice = who ? (ar ? surveyAdvice(who, how, pain).ar : surveyAdvice(who, how, pain).en) : "";

  if (!open) return null;

  return (
    <div className="gl-survey-scrim" role="presentation">
      <div className="gl-survey-stage">
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="gl-survey-card">
          <div className="gl-survey-dots" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className={index <= step ? "is-on" : ""} />
            ))}
          </div>
          <p className="gl-survey-kicker">{t("progress", { current: step + 1, total: 4 })}</p>
          <h2 id={titleId} className="gl-survey-title">
            {step < 3 ? copy("title") : copy("result")}
          </h2>
          {step === 0 ? (
            <fieldset className="mt-5 border-0 p-0">
              <legend className="gl-survey-legend">{copy("q1")}</legend>
              <GlassBubbleTrack persistPressed resetKey={who ?? "q1"} className="gl-survey-picks mt-2.5 flex flex-col gap-2.5">
                {SURVEY_WHO.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    data-bubble-item
                    aria-pressed={who === option.id}
                    className={`gl-survey-option relative z-[1]${who === option.id ? " is-on" : ""}`}
                    onClick={() => setWho(option.id)}
                  >
                    {ar ? option.ar : option.en}
                  </button>
                ))}
              </GlassBubbleTrack>
            </fieldset>
          ) : null}
          {step === 1 ? (
            <fieldset className="mt-5 border-0 p-0">
              <legend className="gl-survey-legend">{copy("q2")}</legend>
              <GlassBubbleTrack persistPressed resetKey={how ?? "q2"} className="gl-survey-picks mt-2.5 flex flex-col gap-2.5">
                {SURVEY_HOW.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    data-bubble-item
                    aria-pressed={how === option.id}
                    className={`gl-survey-option relative z-[1]${how === option.id ? " is-on" : ""}`}
                    onClick={() => setHow(option.id)}
                  >
                    {ar ? option.ar : option.en}
                  </button>
                ))}
              </GlassBubbleTrack>
            </fieldset>
          ) : null}
          {step === 2 ? (
            <fieldset className="mt-5 border-0 p-0">
              <legend className="gl-survey-legend">{copy("q3")}</legend>
              <GlassBubbleTrack persistPressed resetKey={pain ?? "q3"} className="gl-survey-picks mt-2.5 flex flex-col gap-2.5">
                {SURVEY_PAINS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    data-bubble-item
                    aria-pressed={pain === option.id}
                    className={`gl-survey-option relative z-[1]${pain === option.id ? " is-on" : ""}`}
                    onClick={() => setPain(option.id)}
                  >
                    {ar ? option.ar : option.en}
                  </button>
                ))}
              </GlassBubbleTrack>
            </fieldset>
          ) : null}
          {step === 3 ? <p className="gl-survey-advice">{advice}</p> : null}
          <div className="gl-survey-actions">
            {step > 0 ? (
              <button type="button" className="gl-survey-btn-ghost" onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}>
                {t("back")}
              </button>
            ) : null}
            <button type="button" className="gl-survey-btn-ink" disabled={!canNext} onClick={onNext}>
              {step === 3 ? t("show") : t("next")}
            </button>
            <button type="button" className="gl-survey-skip" onClick={() => finish(false)}>
              {t("skip")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
