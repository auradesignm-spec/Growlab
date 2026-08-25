export const NEED_SURVEY_KEY = "gl.needSurvey.v3";

export const SURVEY_COPY = {
  title: { ar: "سؤالان بسيطان", en: "Two short questions" },
  result: { ar: "هذا اللي تسويه في Growlab", en: "This is what you do in Growlab" },
  q1: { ar: "من أنت؟", en: "Who are you?" },
  q2: { ar: "وش أكبر مشكلة عندك؟", en: "What is the biggest problem?" },
} as const;

export type SurveyWho = "no_store" | "has_store" | "browse";
export type SurveyPain = "ads" | "noshow" | "whatsapp";
export type GuideTarget = "open-account" | "how" | "proof-paths";
export type AdviceKey = "adviceAds" | "adviceNoshow" | "adviceWhatsapp" | "adviceStore" | "adviceRead";

export const SURVEY_ADVICE: Record<AdviceKey, { ar: string; en: string }> = {
  adviceAds: {
    ar: "الإعلان عندنا ما يخصم قبل النقد. النقرة مجاناً. حد يوقف الصرف. افتح حسابك من الزر المشار إليه.",
    en: "Ads here do not deduct before cash. Clicks are free. A cap stops spend. Open your account on the marked button.",
  },
  adviceNoshow: {
    ar: "الشحن يُدفع مع الطلب حتى ما تتحرك شحنة بلا التزام. السلعة عند الباب إن اختار. افتح الحساب من الزر المشار إليه.",
    en: "Shipping is paid with the order so a parcel does not move without a stake. Goods at the door if they choose. Open the account on the marked button.",
  },
  adviceWhatsapp: {
    ar: "الطلب يقفل في صفحة: اسم وجوال وعنوان. مو محادثة. افتح الحساب من الزر المشار إليه.",
    en: "The order closes on a page: name, phone, address. Not a chat. Open the account on the marked button.",
  },
  adviceStore: {
    ar: "متجرك يبقى. نستورد المنتج والحملة فوقه. اقرأ البطاقتين المشار إليهما.",
    en: "Your store stays. We import the product and run the campaign on top. Read the two marked cards.",
  },
  adviceRead: {
    ar: "ثلاث خطوات: عمولة، شحن الآن، ثم تصوير الرابط. اقرأ الخطوات المشار إليها.",
    en: "Three steps: commission, ship now, then post the link. Read the marked steps.",
  },
};

export const SURVEY_WHO = [
  { id: "no_store" as const, ar: "تاجر — ما عندي متجر إلكتروني", en: "Merchant — no online store yet" },
  { id: "has_store" as const, ar: "تاجر — عندي سلة أو زد", en: "Merchant — I have Salla or Zid" },
  { id: "browse" as const, ar: "لست تاجراً — أبي أفهم بس", en: "Not a merchant — I just want to understand" },
];

export const SURVEY_PAINS = [
  { id: "ads" as const, ar: "أدفع إعلان والنقد ما يوصل", en: "I pay for ads and cash does not arrive" },
  { id: "noshow" as const, ar: "يطلبون بعدين يلغون", en: "They order then cancel" },
  { id: "whatsapp" as const, ar: "الطلبات كلها واتساب", en: "Orders are all on WhatsApp" },
];

export function surveyAdvice(who: SurveyWho, pain: SurveyPain | null): { advice: AdviceKey; target: GuideTarget } {
  if (who === "browse") return { advice: "adviceRead", target: "how" };
  if (who === "has_store") return { advice: "adviceStore", target: "proof-paths" };
  if (pain === "noshow") return { advice: "adviceNoshow", target: "open-account" };
  if (pain === "whatsapp") return { advice: "adviceWhatsapp", target: "open-account" };
  return { advice: "adviceAds", target: "open-account" };
}
