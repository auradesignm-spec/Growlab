"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { submitContactLead } from "@/app/(marketing)/contact-actions";
import { WHATSAPP_CONSULTATION_URL, WHATSAPP_GENERAL_URL } from "@/lib/constants";
import type {
  ContactFieldErrors,
  ContactFieldName,
  ContactFormData,
  ContactInputFieldName,
  FieldProps,
} from "@/lib/types";
import { FIELD_LIMITS, sanitizePhoneInput, sanitizeTextInput, validateContactForm } from "@/lib/validation";

const EMPTY_FORM: ContactFormData = {
  name: "",
  biz: "",
  phone: "",
  msg: "",
};

export default function Contact() {
  const t = useTranslations("marketing.contact");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [values, setValues] = useState<ContactFormData>(EMPTY_FORM);
  const [pending, startTransition] = useTransition();

  function handleChange(field: ContactFieldName, value: string) {
    const sanitized =
      field === "phone"
        ? sanitizePhoneInput(value)
        : sanitizeTextInput(value, FIELD_LIMITS[field]);

    setValues((prev) => ({ ...prev, [field]: sanitized }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.form;
      return next;
    });
    setSent(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { sanitized, errors: validationErrors, isValid } = validateContactForm(values);

    if (!isValid) {
      setErrors({
        name: validationErrors.name ? t("errName") : undefined,
        biz: validationErrors.biz ? t("errBiz") : undefined,
        phone: validationErrors.phone ? t("errPhone") : undefined,
        msg: validationErrors.msg ? t("errMsg") : undefined,
      });
      return;
    }

    setValues(sanitized);
    setErrors({});
    startTransition(async () => {
      const result = await submitContactLead(sanitized);
      if (!result.ok) {
        setErrors({ form: t("sendFailed") });
        return;
      }
      setSent(true);
      setValues(EMPTY_FORM);
    });
  }

  return (
    <section id="contact" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 items-start gap-8 md:grid-cols-2">
          <Reveal>
          <form onSubmit={handleSubmit} noValidate aria-label={t("formAria")} className="gl-stage p-6 sm:p-8">
            <Field
              id="name"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              type="text"
              maxLength={FIELD_LIMITS.name}
              required
              value={values.name}
              error={errors.name}
              onChange={handleChange}
            />
            <Field
              id="biz"
              label={t("biz")}
              placeholder={t("bizPlaceholder")}
              type="text"
              maxLength={FIELD_LIMITS.biz}
              required
              value={values.biz}
              error={errors.biz}
              onChange={handleChange}
            />
            <Field
              id="phone"
              label={t("phone")}
              placeholder="+968 XXXXXXXX"
              type="tel"
              maxLength={FIELD_LIMITS.phone}
              required
              value={values.phone}
              error={errors.phone}
              onChange={handleChange}
            />

            <div className="mb-4">
              <label htmlFor="msg" className="mb-1.5 block font-mono text-[13.5px] text-frost-faint">
                {t("msg")}
              </label>
              <textarea
                id="msg"
                name="msg"
                value={values.msg}
                maxLength={FIELD_LIMITS.msg}
                placeholder={t("msgPlaceholder")}
                className={`gl-input min-h-[100px] resize-y ${errors.msg ? "gl-input-error" : ""}`}
                onChange={(event) => handleChange("msg", event.target.value)}
                aria-invalid={Boolean(errors.msg)}
                aria-describedby={errors.msg ? "msg-error" : undefined}
              />
              {errors.msg && (
                <p id="msg-error" className="mt-1.5 text-sm text-danger" role="alert">
                  {errors.msg}
                </p>
              )}
            </div>

            {errors.form && (
              <p className="mb-3 text-sm text-danger" role="alert">
                {errors.form}
              </p>
            )}

            <button type="submit" className="gl-btn-primary" disabled={pending}>
              {pending ? t("sending") : t("submit")}
            </button>

            {sent && (
              <p className="mt-3 text-[13px] text-ok" role="status">
                {t("sent")}
              </p>
            )}
          </form>
          </Reveal>

          <Reveal delay={100} className="flex flex-col gap-4 pt-2">
            <ContactCard href={WHATSAPP_GENERAL_URL} title={t("whatsappTitle")} subtitle={t("whatsappSubtitle")} />
            <ContactCard href={WHATSAPP_CONSULTATION_URL} title={t("callTitle")} subtitle={t("callSubtitle")} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

interface ContactCardProps {
  readonly href: string;
  readonly title: string;
  readonly subtitle: string;
}

function ContactCard({ href, title, subtitle }: ContactCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="gl-tile gl-tile-hover flex items-center px-5 py-4 text-frost"
    >
      <span>
        <strong className="block text-[15px] font-medium">{title}</strong>
        <span className="text-[13px] text-frost-faint">{subtitle}</span>
      </span>
    </a>
  );
}

interface ControlledFieldProps extends FieldProps {
  readonly value: string;
  readonly onChange: (field: ContactInputFieldName, value: string) => void;
}

function Field({
  id,
  label,
  placeholder,
  type,
  maxLength,
  required = false,
  value,
  error,
  onChange,
}: ControlledFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block font-mono text-[13.5px] text-frost-faint">
        {label}
        {required && <span className="text-frost-dim"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        autoComplete={id === "phone" ? "tel" : id === "name" ? "name" : "organization"}
        className={`gl-input ${error ? "gl-input-error" : ""}`}
        onChange={(event) => onChange(id, event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
