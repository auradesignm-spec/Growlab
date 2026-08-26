export const NEED_SURVEY_KEY = "gl.needSurvey.v5";

export function surveyIsDone(): boolean {
  try {
    return localStorage.getItem(NEED_SURVEY_KEY) === "done";
  } catch {
    return false;
  }
}

export function markSurveyDone() {
  try {
    localStorage.setItem(NEED_SURVEY_KEY, "done");
  } catch {
    /* ignore */
  }
}

export const SURVEY_COPY = {
  title: { ar: "ثلاث أسئلة", en: "Three questions" },
  result: { ar: "باختصار — هذا اللي فهمناه", en: "In short — this is what we heard" },
  q1: { ar: "وش وضعك اليوم؟", en: "Where are you today?" },
  q2: { ar: "الطلب يوصلك من وين؟", en: "How do orders reach you?" },
  q3: { ar: "وش أكبر خسارة عندك؟", en: "What costs you the most?" },
} as const;

export type SurveyWho = "no_store" | "has_store" | "browse";
export type SurveyHow = "whatsapp" | "store" | "not_yet";
export type SurveyPain = "cancel" | "ads" | "chaos";
export type GuideTarget = "open-account" | "how" | "proof-paths";

export const SURVEY_WHO = [
  { id: "no_store" as const, ar: "تاجر أبيع نقد عند الاستلام — ما عندي متجر إلكتروني", en: "Merchant selling cash on delivery — no online store" },
  { id: "has_store" as const, ar: "تاجر عندي متجر إلكتروني", en: "Merchant with an online store" },
  { id: "browse" as const, ar: "لست تاجر — أبي أفهم الفكرة قبل أي حساب", en: "Not a merchant — I want to understand first" },
];

export const SURVEY_HOW = [
  { id: "whatsapp" as const, ar: "واتساب أو اتصال — الطلب في الشات", en: "WhatsApp or calls — orders live in chat" },
  { id: "store" as const, ar: "من صفحة المتجر الإلكتروني", en: "From the online store page" },
  { id: "not_yet" as const, ar: "لسا ما عندي طلبات أونلاين", en: "I do not take online orders yet" },
];

export const SURVEY_PAINS = [
  { id: "cancel" as const, ar: "يطلبون بعدين يلغون أو ما يستلمون", en: "They order then cancel or refuse the parcel" },
  { id: "ads" as const, ar: "أدفع إعلان وما أدري إذا رجع لي نقد", en: "I pay for ads and cannot tell if cash came back" },
  { id: "chaos" as const, ar: "الطلبات تضيع بين الشات والدفاتر", en: "Orders get lost between chat and notebooks" },
];

export function surveyAdvice(
  who: SurveyWho,
  how: SurveyHow | null,
  pain: SurveyPain | null,
): { ar: string; en: string; target: GuideTarget } {
  const target: GuideTarget = who === "browse" ? "how" : who === "has_store" ? "proof-paths" : "open-account";

  const ar: string[] = [
    "Growlab للتاجر اللي يبيع، والزبون يدفع عند الاستلام. ما نخصم عمولة إلا بعد ما الزبون يدفع للمندوب.",
  ];
  const en: string[] = [
    "Growlab is for merchants who sell with payment on delivery. We take commission only after the buyer pays the courier.",
  ];

  if (who === "no_store") {
    ar.push("من إجابتك: تحتاج صفحة طلب باسمك (اسم وجوال وعنوان)، مو بناء متجر كامل.");
    en.push("From your answer: you need an order page under your name (name, phone, address), not a full store build.");
  } else if (who === "has_store") {
    ar.push("من إجابتك: متجرك يبقى مكانه. نربط المنتج ونسوق فوقه، بدون نقل الكتالوج.");
    en.push("From your answer: your store stays. We attach the product and market on top, without moving the catalog.");
  } else {
    ar.push("من إجابتك: أنت تقرأ الفكرة. الجولة الجاية تمشي على الصفحة: كيف يمشي الطلب، ومتى تطلع الفلوس.");
    en.push("From your answer: you are learning the idea. The next walkthrough shows how an order moves and when money leaves.");
  }

  if (how === "whatsapp") {
    ar.push("الطلب عندنا يتقفل في الصفحة، مو في المحادثة، عشان ما يضيع في الشات.");
    en.push("An order closes on a page, not in chat, so it does not get lost in the thread.");
  } else if (how === "store") {
    ar.push("قناة متجرك تبقى؛ نحن نزيد حملة فوقها.");
    en.push("Your store channel stays; we add a campaign on top.");
  } else if (how === "not_yet") {
    ar.push("نبدأ من صفحة الطلب، مو من تجهيز متجر من صفر.");
    en.push("We start from an order page, not from building a store from scratch.");
  }

  if (pain === "cancel") {
    ar.push("الشحن يُدفع مع الطلب حتى ما تطلع شحنة بلا التزام، وهذا يقلل الإلغاء في الطريق.");
    en.push("Shipping is paid with the order so a parcel does not leave without a stake, which cuts cancellations on the way.");
  } else if (pain === "ads") {
    ar.push("النقرة عندنا ما تخصم منك. العمولة بعد بيعة حقيقية عند الاستلام.");
    en.push("A click here does not debit you. Commission is after a real payment on delivery.");
  } else if (pain === "chaos") {
    ar.push("كل طلب له سجل: اسم وعنوان وحالة. مو ورق وشات.");
    en.push("Every order has a record: name, address, status. Not paper and chat.");
  }

  ar.push("التالي: جولة قصيرة على هذه الصفحة، مو تسجيل إجباري.");
  en.push("Next: a short walkthrough of this page. Signing in is not required yet.");

  return { ar: ar.join(" "), en: en.join(" "), target };
}
