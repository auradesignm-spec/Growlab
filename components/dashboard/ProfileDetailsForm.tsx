"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { saveProfileDetails } from "@/app/(dashboard)/dashboard/profile-actions";

export default function ProfileDetailsForm({
  initial,
}: {
  initial: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    emailLocked: boolean;
  };
}) {
  const t = useTranslations("profile");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await saveProfileDetails(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("failed"));
      }
    });
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="gl-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-3 max-w-lg text-display-lg font-semibold text-frost">{t("title")}</h1>
      <p className="gl-lede mt-3">{t("lede")}</p>

      <form action={onSubmit} className="mt-8 max-w-xl space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] text-frost-faint">{t("firstName")}</span>
            <input
              name="firstName"
              required
              minLength={2}
              defaultValue={initial.firstName}
              className="gl-input mt-1.5"
              autoComplete="given-name"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-frost-faint">{t("lastName")}</span>
            <input
              name="lastName"
              required
              minLength={2}
              defaultValue={initial.lastName}
              className="gl-input mt-1.5"
              autoComplete="family-name"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-[11px] text-frost-faint">{t("phone")}</span>
          <input
            name="phone"
            required
            type="tel"
            defaultValue={initial.phone}
            placeholder={t("phonePlaceholder")}
            className="gl-input mt-1.5"
            autoComplete="tel"
          />
        </label>
        <label className="block">
          <span className="text-[11px] text-frost-faint">{t("email")}</span>
          <input
            name="email"
            required
            type="email"
            defaultValue={initial.email}
            readOnly={initial.emailLocked}
            className="gl-input mt-1.5"
            autoComplete="email"
          />
          {initial.emailLocked ? <p className="mt-1.5 text-[12px] text-frost-faint">{t("emailLocked")}</p> : null}
        </label>
        {error ? <p className="text-[13px] text-danger">{error}</p> : null}
        <button type="submit" disabled={pending} className="gl-btn-primary disabled:opacity-40">
          {pending ? t("saving") : t("submit")}
        </button>
      </form>
    </section>
  );
}
