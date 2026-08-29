import type { ContactFieldErrors, ContactFormData } from "@/lib/types";
import {
  sanitizePlainText,
  sanitizePhone,
  sanitizeEmail,
  sanitizeSafeHtml,
  sanitizeUrl,
  sanitizeSlug,
  sanitizeObject,
  hasSqlInjectionPattern,
} from "@/lib/security/inputSanitizer";

const FIELD_LIMITS = {
  name: 100,
  biz: 150,
  phone: 20,
  msg: 1000,
} as const satisfies Record<keyof ContactFormData, number>;

export function sanitizeTextInput(value: string, maxLength: number): string {
  return sanitizePlainText(value, maxLength);
}

export function sanitizePhoneInput(value: string): string {
  return sanitizePhone(value, FIELD_LIMITS.phone);
}

export function isValidName(value: string): boolean {
  return value.length >= 2 && value.length <= FIELD_LIMITS.name && !hasSqlInjectionPattern(value);
}

export function isValidBusinessName(value: string): boolean {
  return value.length >= 2 && value.length <= FIELD_LIMITS.biz && !hasSqlInjectionPattern(value);
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function sanitizeEmailInput(value: string): string {
  return sanitizeEmail(value, 120);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 120 && !hasSqlInjectionPattern(value);
}

export function isValidMessage(value: string): boolean {
  return value.length <= FIELD_LIMITS.msg && !hasSqlInjectionPattern(value);
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
    errors.msg = "الرسالة طويلة جدًا أو تحتوي على مدخلات غير مقبولة.";
  }

  return {
    sanitized,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export {
  FIELD_LIMITS,
  sanitizeSafeHtml,
  sanitizeUrl,
  sanitizeSlug,
  sanitizeObject,
  hasSqlInjectionPattern,
};

