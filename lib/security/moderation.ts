import { scanForContactLeak } from "@/lib/security/antiLeak";

export type ModerationReason = "contact_leak" | "prohibited";

export interface ModerationHit {
  flagged: boolean;
  reasons: ModerationReason[];
}

const PROHIBITED_PATTERN =
  /(إباح[يى]|جنس(?:ي|ية)?|\+18|xxx|porn|حشيش|مخدر|كوكايين|هيروين|سلاح|مسدس|ذخير|قمار|رهان|خمر|خمور|كحول|نصب|احتيال|وهمي)/i;

export function scanModeration(text: string): ModerationHit {
  const reasons: ModerationReason[] = [];
  if (scanForContactLeak(text).flagged) reasons.push("contact_leak");
  if (PROHIBITED_PATTERN.test(text)) reasons.push("prohibited");
  return { flagged: reasons.length > 0, reasons };
}

export function excerpt(text: string, max = 140): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1)}…`;
}
