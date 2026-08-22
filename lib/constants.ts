export const WHATSAPP_NUMBER = "96897844742" as const;
export const WHATSAPP_DISPLAY = "+968 9784 4742" as const;

const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function getWhatsAppUrl(message?: string): string {
  if (!message) return WHATSAPP_BASE_URL;
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_GENERAL_URL = getWhatsAppUrl("مرحباً Growlab، أبي أستفسر عن خدماتكم.");
export const WHATSAPP_CONSULTATION_URL = getWhatsAppUrl(
  "مرحباً Growlab، أبي أحجز استشارة مجانية 15 دقيقة."
);
