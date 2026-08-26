export const PRODUCT_TOUR_KEY = "gl.productTour.v4";
export const PRODUCT_TOUR_EVENT = "gl:product-tour";

export type TourStepId = "hero" | "how" | "proof-paths" | "pricing" | "open-account";

export const TOUR_STEPS: {
  id: TourStepId;
  title: { ar: string; en: string };
  body: { ar: string; en: string };
}[] = [
  {
    id: "hero",
    title: { ar: "هذا وعد Growlab", en: "This is Growlab’s promise" },
    body: {
      ar: "تبيع، والزبون يدفع عند الاستلام. عمولة Growlab ما تخصم إلا بعد ما الفلوس توصل للمندوب. النقرة والزيارة مجاناً.",
      en: "You sell, the buyer pays on delivery. Growlab takes commission only after cash reaches the courier. Clicks and visits are free.",
    },
  },
  {
    id: "how",
    title: { ar: "كيف يمشي الطلب", en: "How an order moves" },
    body: {
      ar: "الزبون يكتب اسمه وجواله وعنوانه. يدفع الشحن الحين حتى ما تلغى الشحنة في الطريق. ثمن السلعة يُدفع للمندوب عند الاستلام. أنت تؤكد الاستلام من لوحة Growlab.",
      en: "The buyer enters name, phone, and address. Shipping is paid now so the parcel does not leave without a stake. Product price is paid to the courier on delivery. You confirm receipt in Growlab.",
    },
  },
  {
    id: "proof-paths",
    title: { ar: "مساران على Growlab", en: "Two paths on Growlab" },
    body: {
      ar: "ما عندك موقع: صفحة طلب باسمك. عندك متجر: منتجك يبقى، والحملة والعمولة فوقه. نفس الحلقة بعد التحصيل.",
      en: "No site: an order page under your name. Already have a store: the product stays, campaign and commission sit on top. Same loop after collection.",
    },
  },
  {
    id: "pricing",
    title: { ar: "متى تطلع الفلوس منك", en: "When money leaves you" },
    body: {
      ar: "ما في خصم على الزيارة. العمولة بعد بيعة حقيقية عند الاستلام، أو بعد ما توافق على مقطع. حط سقفاً يوقف الحملة إذا وصلت حدك.",
      en: "No charge on a visit. Commission after a real sale on delivery, or after you approve a clip. Set a cap so the campaign stops at your limit.",
    },
  },
  {
    id: "open-account",
    title: { ar: "من هنا تفتح حساب التاجر", en: "Open the merchant account here" },
    body: {
      ar: "هذا الزر يسجّلك في Growlab. بعدها تضيف أول منتج وتثبت عمولة المشاركة. اللي يستلم يقدر ينشر رابط التتبع ويجيب الطلب الجاي.",
      en: "This button signs you into Growlab. Then add the first product and set the share rate. Who receives can post the tracking link and bring the next order.",
    },
  },
];

export function findGuideEl(id: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const nodes = [...document.querySelectorAll<HTMLElement>(`[data-guide="${id}"]`)].filter((node) => {
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = node.getBoundingClientRect();
    return rect.width > 8 && rect.height > 8;
  });
  return (
    nodes.find((node) => {
      const rect = node.getBoundingClientRect();
      return rect.bottom > 80 && rect.top < window.innerHeight - 40;
    }) ?? nodes[0] ?? null
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
