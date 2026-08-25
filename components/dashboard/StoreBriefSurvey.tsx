"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitStoreBrief } from "@/app/(dashboard)/dashboard/onboarding-actions";
import { BRIEF_AUDIENCES, BRIEF_CATEGORIES } from "@/lib/merchant-store/brief";

export default function StoreBriefSurvey({ initialName = "" }: { initialName?: string }) {
  const t = useTranslations("dashboardApp.storeBrief");
  const locale = useLocale();
  const ar = locale === "ar";
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [businessName, setBusinessName] = useState(initialName);
  const [audienceId, setAudienceId] = useState(BRIEF_AUDIENCES[0].id);
  const [slogan, setSlogan] = useState("");
  const [categoryId, setCategoryId] = useState(BRIEF_CATEGORIES[0].id);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canNext =
    (step === 0 && businessName.trim().length >= 2) ||
    step === 1 ||
    (step === 2 && slogan.trim().length >= 4) ||
    step === 3;

  function next() {
    if (step < 3) {
      setStep((s) => (s + 1) as 0 | 1 | 2 | 3);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await submitStoreBrief({ businessName, slogan, audienceId, categoryId });
      } catch (e) {
        setError(e instanceof Error ? e.message : t("failed"));
      }
    });
  }

  return (
    <div className="px-5 py-10 sm:px-8">
      <div className="gl-survey-card mx-auto max-w-lg !max-h-none overflow-visible">
        <p className="gl-eyebrow">{t("progress", { current: step + 1, total: 4 })}</p>
        <h1 className="mt-2 text-[22px] font-semibold leading-snug text-frost">{t("title")}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{t("lede")}</p>

        {step === 0 ? (
          <label className="mt-6 block">
            <span className="text-[13px] text-frost-dim">{t("name")}</span>
            <input
              required
              minLength={2}
              maxLength={80}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="gl-input mt-1.5"
              autoComplete="organization"
            />
          </label>
        ) : null}

        {step === 1 ? (
          <fieldset className="mt-6 space-y-2.5 border-0 p-0">
            <legend className="gl-survey-legend">{t("audience")}</legend>
            {BRIEF_AUDIENCES.map((row) => (
              <button
                key={row.id}
                type="button"
                aria-pressed={audienceId === row.id}
                className={`gl-survey-option${audienceId === row.id ? " is-on" : ""}`}
                onClick={() => setAudienceId(row.id)}
              >
                {ar ? row.ar : row.en}
              </button>
            ))}
          </fieldset>
        ) : null}

        {step === 2 ? (
          <label className="mt-6 block">
            <span className="text-[13px] text-frost-dim">{t("slogan")}</span>
            <input
              required
              minLength={4}
              maxLength={160}
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="gl-input mt-1.5"
            />
            <span className="mt-1.5 block text-[12px] text-frost-faint">{t("sloganHint")}</span>
          </label>
        ) : null}

        {step === 3 ? (
          <fieldset className="mt-6 space-y-2.5 border-0 p-0">
            <legend className="gl-survey-legend">{t("category")}</legend>
            {BRIEF_CATEGORIES.map((row) => (
              <button
                key={row.id}
                type="button"
                aria-pressed={categoryId === row.id}
                className={`gl-survey-option${categoryId === row.id ? " is-on" : ""}`}
                onClick={() => setCategoryId(row.id)}
              >
                {ar ? row.labelAr : row.labelEn}
              </button>
            ))}
          </fieldset>
        ) : null}

        {error ? (
          <p className="mt-4 text-[13px] text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="gl-survey-actions">
          {step > 0 ? (
            <button type="button" className="gl-survey-btn-ghost" onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}>
              {t("back")}
            </button>
          ) : null}
          <button type="button" className="gl-survey-btn-ink" disabled={!canNext || pending} onClick={next}>
            {pending ? t("saving") : step === 3 ? t("build") : t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}
