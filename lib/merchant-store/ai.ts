import type { MerchantStoreTheme } from "@/lib/merchant-store/theme";
import { defaultStoreLayout } from "@/lib/merchant-store/layout";

export interface StoreAiInput {
  locale: "ar" | "en";
  businessName: string;
  city?: string;
  category?: string;
  products: Array<{ title: string; category: string; price: number }>;
}

export interface StoreAiSuggestion {
  tagline: string;
  aboutHtml: string;
  offerHeadline: string;
  offerBody: string;
  theme: MerchantStoreTheme;
  productCopy: Array<{ title: string; shortDescription: string; descriptionHtml: string }>;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function templateSuggestion(input: StoreAiInput): StoreAiSuggestion {
  const ar = input.locale === "ar";
  const city = input.city?.trim();
  const top = input.products[0];

  const tagline = ar
    ? city
      ? `${input.businessName} — توصيل ${city}، دفع عند الاستلام`
      : `${input.businessName} — جودة محلية، دفع عند الاستلام`
    : city
      ? `${input.businessName} — ${city} delivery, cash on delivery`
      : `${input.businessName} — local quality, cash on delivery`;

  const aboutHtml = ar
    ? `<p>مرحباً بك في <strong>${escapeHtml(input.businessName)}</strong>. نختار منتجاتنا بعناية ونوصّلها لبابك — <strong>الدفع عند الاستلام</strong> بدون تعقيد.</p><p>تصفّح العروض، اختر المقاس، وأكّد طلبك. فريقنا يتابع كل طلب من لوحة Growlab.</p>`
    : `<p>Welcome to <strong>${escapeHtml(input.businessName)}</strong>. We curate every product and deliver to your door — <strong>cash on delivery</strong>, no hassle.</p><p>Browse offers, pick your size, and confirm your order. Our team tracks every order on Growlab.</p>`;

  const offerHeadline = ar ? "عرض افتتاح المتجر" : "Store launch offer";
  const offerBody = ar
    ? "توصيل سريع داخل عُمان — ادفع نقداً عند استلام طلبك."
    : "Fast delivery across Oman — pay cash when your order arrives.";

  const theme: MerchantStoreTheme = {
    accent: "#1F6FEB",
    heroStyle: "split",
    fontTone: ar ? "classic" : "modern",
    layout: defaultStoreLayout(),
  };

  const productCopy = input.products.map((p) => {
    const shortDescription = ar
      ? `${p.title} — ${p.category} · ${p.price.toFixed(2)} ر.ع.`
      : `${p.title} — ${p.category} · ${p.price.toFixed(2)} OMR`;

    const descriptionHtml = ar
      ? `<h3>لماذا ${escapeHtml(p.title)}؟</h3><p>منتج مختار من ${escapeHtml(input.businessName)}. صورة حقيقية، سعر واضح، و<strong>طلب COD</strong> من نفس الصفحة.</p><ul><li>توصيل لبابك</li><li>دفع عند الاستلام</li><li>دعم عبر Growlab</li></ul>`
      : `<h3>Why ${escapeHtml(p.title)}?</h3><p>Curated by ${escapeHtml(input.businessName)}. Real photos, clear pricing, and <strong>COD checkout</strong> on this page.</p><ul><li>Door delivery</li><li>Cash on delivery</li><li>Support via Growlab</li></ul>`;

    return { title: p.title, shortDescription, descriptionHtml };
  });

  if (top && productCopy.length === 0) {
    productCopy.push({
      title: top.title,
      shortDescription: ar ? `${top.title} — الأكثر طلباً` : `${top.title} — customer favorite`,
      descriptionHtml: aboutHtml,
    });
  }

  return { tagline, aboutHtml, offerHeadline, offerBody, theme, productCopy };
}

async function openAiSuggestion(input: StoreAiInput): Promise<StoreAiSuggestion | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const prompt = input.locale === "ar"
    ? `أنت مساعد تسويق لمتجر Omani. اقترح نصوصاً JSON فقط لمتجر "${input.businessName}".
المنتجات: ${input.products.map((p) => p.title).join("، ")}
المطلوب: tagline (جملة واحدة), aboutHtml (فقرتين HTML), offerHeadline, offerBody, theme {accent hex, heroStyle split|center, fontTone modern|classic}, productCopy [{title, shortDescription, descriptionHtml}]`
    : `You are a store setup assistant for an Omani merchant. Return JSON only for "${input.businessName}".
Products: ${input.products.map((p) => p.title).join(", ")}
Fields: tagline, aboutHtml (2 HTML paragraphs), offerHeadline, offerBody, theme {accent, heroStyle, fontTone}, productCopy [{title, shortDescription, descriptionHtml}]`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return valid JSON matching the requested store copy schema." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as StoreAiSuggestion;
  } catch {
    return null;
  }
}

export async function generateStoreSuggestion(input: StoreAiInput): Promise<StoreAiSuggestion> {
  const ai = await openAiSuggestion(input);
  if (ai?.tagline && ai.aboutHtml) return ai;
  return templateSuggestion(input);
}
