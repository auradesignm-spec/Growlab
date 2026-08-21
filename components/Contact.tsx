"use client";

import { useState, type FormEvent } from "react";
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
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [values, setValues] = useState<ContactFormData>(EMPTY_FORM);

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
      setErrors(validationErrors);
      return;
    }

    setValues(sanitized);
    setErrors({});
    setSent(true);
    setValues(EMPTY_FORM);
    event.currentTarget.reset();
  }

  return (
    <section id="contact" className="section-padding bg-ink text-onDark">
      <div className="container-wrap">
        <div className="eyebrow eyebrow-light">لنبدأ</div>
        <h2 className="section-heading">جاهز تشوف الفرق؟</h2>
        <p className="mt-3.5 max-w-xl text-lg text-onDarkSoft">
          احجز استشارة مجانية 15 دقيقة، أو تواصل معنا مباشرة على واتساب.
        </p>

        <div className="mt-11 grid grid-cols-1 items-start gap-14 md:grid-cols-2">
          <form onSubmit={handleSubmit} noValidate aria-label="نموذج التواصل">
            <Field
              id="name"
              label="الاسم"
              placeholder="اسمك الكامل"
              type="text"
              maxLength={FIELD_LIMITS.name}
              required
              value={values.name}
              error={errors.name}
              onChange={handleChange}
            />
            <Field
              id="biz"
              label="اسم النشاط التجاري"
              placeholder="مثال: متجر أثاث المنزل"
              type="text"
              maxLength={FIELD_LIMITS.biz}
              required
              value={values.biz}
              error={errors.biz}
              onChange={handleChange}
            />
            <Field
              id="phone"
              label="رقم واتساب"
              placeholder="+968 XXXXXXXX"
              type="tel"
              maxLength={FIELD_LIMITS.phone}
              required
              value={values.phone}
              error={errors.phone}
              onChange={handleChange}
            />

            <div className="mb-4">
              <label htmlFor="msg" className="mb-1.5 block font-mono text-[13.5px] text-onDarkSoft">
                وش تحتاج بالضبط؟
              </label>
              <textarea
                id="msg"
                name="msg"
                value={values.msg}
                maxLength={FIELD_LIMITS.msg}
                placeholder="حدثنا شوي عن نشاطك وهدفك"
                className={`input-field min-h-[100px] resize-y ${errors.msg ? "input-field-error" : ""}`}
                onChange={(event) => handleChange("msg", event.target.value)}
                aria-invalid={Boolean(errors.msg)}
                aria-describedby={errors.msg ? "msg-error" : undefined}
              />
              {errors.msg && (
                <p id="msg-error" className="mt-1.5 text-sm text-[#E39284]" role="alert">
                  {errors.msg}
                </p>
              )}
            </div>

            {errors.form && (
              <p className="mb-3 text-sm text-[#E39284]" role="alert">
                {errors.form}
              </p>
            )}

            <button type="submit" className="btn-primary w-full">
              أرسل الطلب
            </button>

            {sent && (
              <p className="mt-3 text-[13px] text-onDarkSoft" role="status">
                وصلنا طلبك. بنرجع لك خلال ٢٤ ساعة على واتساب.
              </p>
            )}
          </form>

          <div className="flex flex-col gap-4 pt-2">
            <ContactCard
              href="#contact"
              title="تواصل مباشر على واتساب"
              subtitle="رد سريع خلال ساعات العمل"
              dotClass="bg-teal"
            />
            <ContactCard
              href="#contact"
              title="احجز مكالمة تعارف مجانية"
              subtitle="١٥ دقيقة، بدون أي التزام"
              dotClass="bg-gold"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface ContactCardProps {
  readonly href: string;
  readonly title: string;
  readonly subtitle: string;
  readonly dotClass: string;
}

function ContactCard({ href, title, subtitle, dotClass }: ContactCardProps) {
  return (
    <a
      href={href}
      className="card-interactive flex items-center gap-3.5 border-onDark/20 bg-onDark/[0.06] px-5 py-4.5 text-onDark shadow-none hover:bg-onDark/10"
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
      <span>
        <strong className="block text-[15px]">{title}</strong>
        <span className="text-[13px] text-onDarkSoft">{subtitle}</span>
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
      <label htmlFor={id} className="mb-1.5 block font-mono text-[13.5px] text-onDarkSoft">
        {label}
        {required && <span className="text-gold-soft"> *</span>}
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
        className={`input-field ${error ? "input-field-error" : ""}`}
        onChange={(event) => onChange(id, event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-[#E39284]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
