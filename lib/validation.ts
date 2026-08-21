import type { ContactFieldErrors, ContactFormData } from "@/lib/types";

const HTML_ENTITY_PATTERN = /[<>"'&]/g;
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const MULTI_SPACE_PATTERN = /\s{2,}/g;

const FIELD_LIMITS = {
  name: 100,
  biz: 150,
  phone: 20,
  msg: 1000,
} as const satisfies Record<keyof ContactFormData, number>;

export function sanitizeTextInput(value: string, maxLength: number): string {
  return value
    .replace(CONTROL_CHAR_PATTERN, "")
    .replace(HTML_ENTITY_PATTERN, "")
    .replace(MULTI_SPACE_PATTERN, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizePhoneInput(value: string): string {
  return value
    .replace(/[^\d+\s\-()]/g, "")
    .trim()
    .slice(0, FIELD_LIMITS.phone);
}

export function isValidName(value: string): boolean {
  return value.length >= 2 && value.length <= FIELD_LIMITS.name;
}

export function isValidBusinessName(value: string): boolean {
  return value.length >= 2 && value.length <= FIELD_LIMITS.biz;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidMessage(value: string): boolean {
  return value.length <= FIELD_LIMITS.msg;
}

export function validateContactForm(raw: ContactFormData): {
  sanitized: ContactFormData;
  errors: ContactFieldErrors;
  isValid: boolean;
} {
  const sanitized: ContactFormData = {
    name: sanitizeTextInput(raw.name, FIELD_LIMITS.name),
    biz: sanitizeTextInput(raw.biz, FIELD_LIMITS.biz),
    phone: sanitizePhoneInput(raw.phone),
    msg: sanitizeTextInput(raw.msg, FIELD_LIMITS.msg),
  };

  const errors: ContactFieldErrors = {};

  if (!isValidName(sanitized.name)) {
    errors.name = "أدخل اسمًا صالحًا (حرفان على الأقل).";
  }

  if (!isValidBusinessName(sanitized.biz)) {
    errors.biz = "أدخل اسم نشاط تجاري صالحًا (حرفان على الأقل).";
  }

  if (!isValidPhone(sanitized.phone)) {
    errors.phone = "أدخل رقم واتساب صالحًا (7–15 رقمًا).";
  }

  if (!isValidMessage(sanitized.msg)) {
    errors.msg = "الرسالة طويلة جدًا.";
  }

  return {
    sanitized,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export { FIELD_LIMITS };
