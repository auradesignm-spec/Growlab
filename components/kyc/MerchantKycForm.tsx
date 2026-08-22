"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitMerchantKyc } from "@/app/(dashboard)/dashboard/kyc-actions";

export default function MerchantKycForm({
  initial,
  reviewNote,
}: {
  initial?: {
    businessName: string;
    commercialRegNo: string;
    taxNumber: string;
    ownerFullName: string;
    city: string;
  };
  reviewNote?: string | null;
}) {
  const t = useTranslations("kyc.merchant");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await submitMerchantKyc(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="gl-eyebrow">{t("kicker")}</p>
      <h2 className="mt-3 max-w-xl font-display text-display-md text-frost">{t("title")}</h2>
      <p className="gl-lede mt-3">{t("lede")}</p>
      {reviewNote && (
        <p className="mt-4 max-w-xl border border-danger/40 bg-danger/10 px-4 py-3 font-serif text-sm italic text-danger">
          {t("rejectedNote", { note: reviewNote })}
        </p>
      )}

      <form action={onSubmit} className="mt-8 max-w-xl space-y-5">
        <Field label={t("businessName")}>
          <input name="businessName" required defaultValue={initial?.businessName} className="gl-input" />
        </Field>
        <Field label={t("commercialRegNo")} hint={t("commercialRegHint")}>
          <input name="commercialRegNo" required defaultValue={initial?.commercialRegNo} className="gl-input" />
        </Field>
        <Field label={t("taxNumber")} hint={t("optional")}>
          <input name="taxNumber" defaultValue={initial?.taxNumber} className="gl-input" />
        </Field>
        <Field label={t("ownerFullName")}>
          <input name="ownerFullName" required defaultValue={initial?.ownerFullName} className="gl-input" />
        </Field>
        <Field label={t("city")}>
          <input name="city" required defaultValue={initial?.city} className="gl-input" />
        </Field>

        <div className="space-y-3 border-t border-white/10 pt-5">
          <p className="font-west text-[11px] uppercase tracking-[0.24em] text-pulse">{t("docsTitle")}</p>
          <FileField name="commercial_register" label={t("docCr")} />
          <FileField name="owner_id_front" label={t("docIdFront")} />
          <FileField name="owner_id_back" label={t("docIdBack")} />
        </div>

        {error && <p className="font-mono text-xs text-danger">{error}</p>}
        <button type="submit" disabled={pending} className="gl-btn-primary disabled:opacity-40">
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{label}</span>
      {hint && <span className="mt-0.5 block font-serif text-[12px] italic text-frost-faint">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function FileField({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{label}</span>
      <input
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        className="mt-1.5 block w-full text-sm text-frost-dim file:me-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:font-west file:text-[11px] file:uppercase file:tracking-[0.16em] file:text-frost"
      />
    </label>
  );
}
