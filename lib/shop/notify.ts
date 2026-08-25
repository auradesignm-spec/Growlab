import { getDirectWhatsAppUrl, getWhatsAppUrl } from "@/lib/constants";
import { publicAppUrl } from "@/lib/shop/appUrl";

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

export function getBuyerReceiveConfirmWhatsAppUrl(input: {
  buyerPhone: string;
  productTitle: string;
  serial: string;
  quantity: number;
  variantLabel?: string;
  confirmToken: string;
}): string | null {
  const url = `${publicAppUrl()}/order/receive/${encodeURIComponent(input.confirmToken)}`;
  const details = [input.productTitle, input.variantLabel, `×${input.quantity}`].filter(Boolean).join(" · ");
  const lines = [
    "هل استلمت طلبك على Growlab؟",
    details,
    `رقم الطلب: ${input.serial}`,
    "",
    "اضغط الرابط وأجِب بنعم أو لا. الرابط لمرة واحدة ولا يعمل إن أُرسل لغيرك.",
    url,
  ];
  return getDirectWhatsAppUrl(input.buyerPhone, lines.join("\n"));
}
