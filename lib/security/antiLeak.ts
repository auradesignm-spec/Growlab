/**
 * Anti-disintermediation guardrails.
 *
 * Growlab's entire trust model depends on merchant<->creator interactions
 * staying inside the platform: commissions are only computable/guaranteed
 * through a locked CreatorDeal + tracked Order, and sample fulfillment must
 * never require exchanging personal contact details. This module scans
 * free-text fields (sample request notes, storefront bios, etc.) for phone
 * numbers, emails, and social/messaging handles so those channels can never
 * be smuggled through a text field, with a matching user-facing warning.
 *
 * This is a best-effort heuristic filter, not a cryptographic guarantee —
 * it raises the cost of leaking contact info, it doesn't make it impossible.
 */

export type ContactLeakCategory = "phone" | "email" | "social";

export interface ContactLeakResult {
  readonly flagged: boolean;
  readonly categories: readonly ContactLeakCategory[];
}

// Loosely matches phone-number-shaped digit runs (7+ digits, optional
// +country code, spaces/dashes/dots/parens as separators). Deliberately
// permissive since sample-request notes are short and rarely contain long
// legitimate digit runs.
const PHONE_PATTERN = /(?:\+?\d[\d\s.\-()]{5,}\d)/;

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// Arabic + English brand names/keywords for the messaging apps and social
// networks people use to route around the platform, plus their common
// short-link domains and the generic "@handle" pattern.
const SOCIAL_KEYWORD_PATTERN =
  /(واتس\s*(اب|أب)?|whats\s*app|wa\.me\/|انستا(جرام)?|instagram|insta\.gram|ig\.me|تيليجرام|telegram|t\.me\/|سناب\s*(شات)?|snapchat|تيك\s*توك|tiktok|فيسبوك|facebook|fb\.me\/|@[a-zA-Z0-9_.]{3,30}\b)/i;

export function scanForContactLeak(text: string): ContactLeakResult {
  const categories: ContactLeakCategory[] = [];

  if (EMAIL_PATTERN.test(text)) {
    categories.push("email");
  }
  if (PHONE_PATTERN.test(text)) {
    categories.push("phone");
  }
  if (SOCIAL_KEYWORD_PATTERN.test(text)) {
    categories.push("social");
  }

  return { flagged: categories.length > 0, categories };
}

export const CONTACT_LEAK_WARNING_AR =
  "ممنوع مشاركة أرقام هواتف، بريد إلكتروني، أو حسابات تواصل خارجية (واتساب، انستقرام، إلخ) داخل المنصة. تواصل التاجر والمسوق بالكامل عبر Growlab.";

export function generateShippingRef(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `GL-${suffix}`;
}
