import { getWhatsAppUrl } from "@/lib/constants";

export function getNewOrderWhatsAppUrl(input: {
  productTitle: string;
  buyerName: string;
  buyerCity: string;
  quantity: number;
  creatorUsername: string;
}): string {
  const lines = [
    "طلب COD جديد على Growlab",
    `المنتج: ${input.productTitle}`,
    `المسوّق: @${input.creatorUsername}`,
    `المشتري: ${input.buyerName}`,
    input.buyerCity ? `المدينة: ${input.buyerCity}` : "",
    `الكمية: ${input.quantity}`,
    "راجع اللوحة: تأكيد ثم شحن ثم تأكيد التحصيل.",
  ].filter(Boolean);
  return getWhatsAppUrl(lines.join("\n"));
}
