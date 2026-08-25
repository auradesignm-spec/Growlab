export const PRODUCT_TOUR_KEY = "gl.productTour.v1";
export const PRODUCT_TOUR_EVENT = "gl:product-tour";

export type TourStepId = "open-account" | "how" | "proof-paths" | "pricing" | "sign-in";

export const TOUR_STEPS: {
  id: TourStepId;
  title: { ar: string; en: string };
  body: { ar: string; en: string };
}[] = [
  {
    id: "open-account",
    title: { ar: "هنا تبدأ بعد الجولة", en: "You start here after the tour" },
    body: {
      ar: "هذا الزر يفتح حساب التاجر. لا تضغطه الآن — نمرّ على النظام أولاً.",
      en: "This opens a merchant account. Do not tap it yet — we walk the system first.",
    },
  },
  {
    id: "how",
    title: { ar: "كيف تبيع وتُحصّل", en: "How you sell and collect" },
    body: {
      ar: "ثلاث خطوات: تثبّت العمولة، الشحن يُدفع الآن والسلعة عند الباب، ثم الزبون يصوّر وينشر رابط التتبع.",
      en: "Three steps: lock commission, ship now and goods at the door, then the buyer photographs and posts the tracking link.",
    },
  },
  {
    id: "proof-paths",
    title: { ar: "مساران لنفس القفل", en: "Two paths, one lock" },
    body: {
      ar: "ما عندك متجر: صفحة طلب عند الباب. عندك سلة أو زد: الحملة فوق متجرك بدون نقل الكتالوج.",
      en: "No store: a pay-at-the-door order page. Salla or Zid: the campaign sits on your store without moving the catalog.",
    },
  },
  {
    id: "pricing",
    title: { ar: "متى تدفع للمنصة", en: "When you pay the platform" },
    body: {
      ar: "الاشتراك شيء. حد الصرف شيء آخر. العمولة بعد التحصيل عند الباب أو بعد موافقتك على المقطع.",
      en: "The subscription is one thing. The spend cap is another. Commission after door pay or after you OK a reel.",
    },
  },
  {
    id: "sign-in",
    title: { ar: "جاهز؟ ابدأ من هنا", en: "Ready? Start here" },
    body: {
      ar: "اضغط ابدأ لتسجيل الدخول أو إنشاء حساب. بعدها نجهّز متجرك من أسئلتك.",
      en: "Tap Start to sign in or create an account. Then we prepare your store from your answers.",
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
