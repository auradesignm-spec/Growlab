"use client";

import { useState, useTransition } from "react";
import { ODOO_PURPLE } from "@/lib/merchant-store/configurator";

export interface StartNowValues {
  fullName: string;
  websiteName: string;
  email: string;
  phone: string;
  country: string;
  language: "ar" | "en";
}

export default function StartNowForm({
  initial,
  labels,
  onSubmit,
}: {
  initial: StartNowValues;
  labels: {
    title: string;
    freeAccess: string;
    fullName: string;
    websiteName: string;
    email: string;
    phone: string;
    country: string;
    countryOman: string;
    language: string;
    languageAr: string;
    languageEn: string;
    legal: string;
    cta: string;
    submitting: string;
  };
  onSubmit: (values: StartNowValues) => Promise<void>;
}) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [websiteName, setWebsiteName] = useState(initial.websiteName);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone.startsWith("+") ? initial.phone : "+968");
  const [language, setLanguage] = useState<"ar" | "en">(initial.language);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit({
          fullName,
          websiteName,
          email,
          phone,
          country: "om",
          language,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  const fieldClass =
    "w-full rounded border border-[#D4D4D8] bg-white px-3 py-2.5 text-[14px] text-[#18181B] outline-none focus:border-[#714B67]";

  return (
    <div className="mx-auto max-w-xl px-5 py-12 sm:px-8">
      <h1 className="text-center text-[32px] font-semibold text-[#18181B]" style={{ letterSpacing: "normal" }}>
        {labels.title}
      </h1>
      <p className="mt-2 text-center text-[14px] text-[#71717A]" style={{ letterSpacing: "normal" }}>
        {labels.freeAccess}
      </p>

      <form onSubmit={submit} className="mt-10 overflow-hidden rounded-lg border border-[#E4E4E7] bg-[#F4F4F5]">
        <div className="space-y-3 p-5 sm:p-6">
          <label className="block">
            <span className="mb-1 block text-[12px] text-[#71717A]">{labels.fullName}</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={fieldClass}
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] text-[#71717A]">{labels.websiteName}</span>
            <input
              required
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              className={fieldClass}
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[12px] text-[#71717A]">{labels.email}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-[#71717A]">{labels.phone}</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
                dir="ltr"
                autoComplete="tel"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[12px] text-[#71717A]">{labels.country}</span>
              <select className={fieldClass} defaultValue="om" disabled>
                <option value="om">{labels.countryOman}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-[#71717A]">{labels.language}</span>
              <select
                className={fieldClass}
                value={language}
                onChange={(e) => setLanguage(e.target.value as "ar" | "en")}
              >
                <option value="ar">{labels.languageAr}</option>
                <option value="en">{labels.languageEn}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="border-t border-[#E4E4E7] bg-white px-5 py-5 sm:px-6">
          <p className="text-center text-[12px] leading-relaxed text-[#71717A]" style={{ letterSpacing: "normal" }}>
            {labels.legal}
          </p>
          {error ? <p className="mt-3 text-center text-[13px] text-danger">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full rounded py-3 text-[15px] font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: ODOO_PURPLE }}
          >
            {pending ? labels.submitting : labels.cta}
          </button>
        </div>
      </form>
    </div>
  );
}
