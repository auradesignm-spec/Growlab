export const PRODUCT_TOUR_KEY = "gl.productTour.v2";
export const PRODUCT_TOUR_EVENT = "gl:product-tour";

export type TourStepId = "open-account" | "how" | "proof-paths" | "pricing" | "sign-in";

export const TOUR_STEPS: {
  id: TourStepId;
  title: { ar: string; en: string };
  body: { ar: string; en: string };
}[] = [
  {
    id: "open-account",
    title: { ar: "Growlab للتاجر اللي يبيع نقداً", en: "Growlab is for cash-on-delivery shops" },
    body: {
      ar: "مو منصة مثل سلة. أنت تبيع عطور أو أزياء أو إلكترونيات ويُدفع ثمنها عند الباب. ما نخصم ريال إلا بعد ما الزبون يدفع للمندوب.",
      en: "Not a Salla-style store builder. You sell goods paid at the door. We take nothing until the buyer pays the courier.",
    },
  },
  {
    id: "how",
    title: { ar: "الطلب يمشي كذا", en: "How an order actually moves" },
    body: {
      ar: "الزبون يطلب من صفحة: اسم وجوال وعنوان. يدفع الشحن الحين عشان ما يلغي في الطريق. ثمن السلعة مع المندوب. أنت تؤكد الاستلام من لوحتك.",
      en: "They order on a page: name, phone, address. Shipping is paid now so the parcel does not leave without a stake. Product price with the courier. You confirm receipt in the dashboard.",
    },
  },
  {
    id: "proof-paths",
    title: { ar: "عندك متجر أو لا — نفس الفكرة", en: "Store or no store — same idea" },
    body: {
      ar: "ما عندك موقع: نعطيك صفحة طلب باسمك. عندك سلة أو زد: منتجك يبقى هناك والحملة فوقه. ما ننقل كتالوجك ولا نبدّل متجرك.",
      en: "No site yet: you get an order page under your name. Already on Salla or Zid: the product stays there and the campaign sits on top. We do not move your catalog.",
    },
  },
  {
    id: "pricing",
    title: { ar: "متى تطلع الفلوس منك", en: "When money leaves you" },
    body: {
      ar: "الزيارة والنقرة مجاناً. العمولة تخصم بعد بيعة حقيقية عند الباب، أو بعد ما توافق على مقطع الزبون. تقدر تحط سقف يوقف الحملة إذا وصلت حدك.",
      en: "Visits and clicks are free. Share commission comes off after a real door payment, or after you approve a buyer clip. You can set a cap that stops the campaign.",
    },
  },
  {
    id: "sign-in",
    title: { ar: "افتح حساب التاجر", en: "Open the merchant account" },
    body: {
      ar: "اضغط ابدأ وسجّل. بعدها تحط أول منتج وتثبت عمولة المشاركة. اللي يستلم يقدر ينشر رابط التتبع ويجيب الطلب الجاي.",
      en: "Tap Start and sign in. Then add the first product and set the share rate. Who receives can post the tracking link and bring the next order.",
    },
  },
];

export function visibleGuideEl(id: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const nodes = [...document.querySelectorAll<HTMLElement>(`[data-guide="${id}"]`)];
  return (
    nodes.find((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return false;
      return rect.width > 8 && rect.height > 8;
    }) ?? null
  );
}

export function startProductTour() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PRODUCT_TOUR_EVENT));
}

export function tourIsDone(): boolean {
  try {
    return localStorage.getItem(PRODUCT_TOUR_KEY) === "done";
  } catch {
    return false;
  }
}

export function markTourDone() {
  try {
    localStorage.setItem(PRODUCT_TOUR_KEY, "done");
  } catch {
    /* ignore */
  }
}
