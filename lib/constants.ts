export const WHATSAPP_NUMBER = "96897844742" as const;
export const WHATSAPP_DISPLAY = "+968 9784 4742" as const;

const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function getWhatsAppUrl(message?: string): string {
  if (!message) return WHATSAPP_BASE_URL;
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}

/** Opens WhatsApp with a prefilled message so the marketer picks the chat. */
export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export const WHATSAPP_GENERAL_URL = getWhatsAppUrl("مرحباً Growlab، أريد الاستفسار عن خدماتكم.");
export const WHATSAPP_CONSULTATION_URL = getWhatsAppUrl(
  "مرحباً Growlab، أريد حجز استشارة مجانية لمدة 15 دقيقة."
);
