import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { sanitizePlainText } from "@/lib/security/inputSanitizer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
}

export interface AssistantActionPayload {
  type:
    | "navigate"
    | "open_quiz"
    | "open_dashboard"
    | "open_timeline"
    | "open_alerts"
    | "calculate_omanisation"
    | "open_pricing"
    | "open_whatsapp_setup"
    | "custom_task";
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  targetUrl?: string;
  targetTab?: string;
  autoExecute?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AssistantChatResponse {
  text: string;
  action?: AssistantActionPayload | null;
  suggestions?: string[];
}

const SYSTEM_PROMPT = `
أنت "وكيل ريادة الذكي" — الوكيل والمستشار الآلي الرسمي للامتثال التنظيمي للمؤسسات الصغيرة والمتوسطة (SMEs) في سلطنة عُمان.

شخصيتك وأهدافك:
- ودود، دقيق، محترف، وفاهم بعمق لكافة قوانين العمل العمانية، نسب التعمين المطلوبة لكل قطاع، متطلبات وزارة العمل، وزارة التجارة والصناعة وترويج الاستثمار، بلديات سلطنة عمان، وجهاز الضرائب.
- هدفك مساعدة أصحاب المؤسسات العمانية ورواد الأعمال على حماية أنشطتهم وتجنب الغرامات المالية المفاجئة عبر التنبيهات المسبقة على واتساب ولوحة التحكم.
- تشرح الباقات (Starter المجانية/الأساسية، Growth للنمو بـ 19 ر.ع، Pro للشركات ومكاتب سند بـ 39 ر.ع).
- توجه المستخدمين لإجراء "الفحص المجاني الفوري للامتثال" لحساب نسب التعمين والغرامات المحتملة.

الأفعال والاقتراحات المتاحة:
- إذا سأل المستخدم عن فحص منشأته: وجهه للاستبيان (/quiz أو الفحص السريع).
- إذا سأل عن لوحة التحكم: وجهه إلى (/dashboard).
- إذا سأل عن الأسعار: قارن الباقات بوضوح.
`;

let aiClient: GoogleGenAI | null = null;

function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawMessage = body.message;
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (!rawMessage || typeof rawMessage !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const cleanMessage = sanitizePlainText(rawMessage);
    const ai = getAi();

    // Determine smart interactive action based on query intent
    let action: AssistantActionPayload | null = null;
    let suggestions: string[] = [
      "كيف أحسب نسبة التعمين المطلوبة لنشاطي؟",
      "ما هي غرامات تأخر تجديد السجل التجاري؟",
      "كيف أربط التنبيهات على رقم الواتساب؟",
      "ما الفرق بين باقة Growth وباقة Pro؟",
    ];

    const lower = cleanMessage.toLowerCase();
    if (lower.includes("فحص") || lower.includes("استبيان") || lower.includes("غرامتي") || lower.includes("احسب")) {
      action = {
        type: "open_quiz",
        titleAr: "بدء فحص الامتثال السريع (مجاناً)",
        titleEn: "Start Compliance Audit (Free)",
        descriptionAr: "فحص فوري خلال دقيقة لنسب التعمين وتواريخ التراخيص وتحديد الغرامات المحتملة",
        descriptionEn: "1-minute audit for Omanisation and permits",
        targetUrl: "/quiz",
      };
    } else if (lower.includes("لوحة") || lower.includes("تحكم") || lower.includes("dashboard")) {
      action = {
        type: "open_dashboard",
        titleAr: "فتح لوحة تحكم الامتثال",
        titleEn: "Open Compliance Dashboard",
        descriptionAr: "متابعة مؤشرات التعمين، جدول المواعيد، والتنبيهات النشطة",
        descriptionEn: "Monitor compliance overview and timeline",
        targetUrl: "/dashboard",
      };
    } else if (lower.includes("سعر") || lower.includes("باقات") || lower.includes("اشتراك")) {
      action = {
        type: "open_pricing",
        titleAr: "استعراض باقات مساعد ريادة",
        titleEn: "View Pricing Plans",
        descriptionAr: "باقات مرنة تبدأ من الفحص المجاني و 19 ر.ع/شهر للمؤسسات المتنامية",
        descriptionEn: "Flexible plans for Omani SMEs",
        targetUrl: "/#pricing",
      };
    }

    if (!ai) {
      // Local rule-based high quality fallback
      let fallbackText = `أهلاً بك! 👋 أنا وكيل ريادة الذكي للامتثال التنظيمي في سلطنة عُمان.

أساعدك في:
1. **مراقبة نسب التعمين**: حساب النسبة المطلوبة وتنبيهك قبل تطبيق أي غرامات من وزارة العمل.
2. **تجديد التراخيص**: متابعة السجل التجاري ورخص البلديات وعقود الإيجار.
3. **تنبيهات واتساب 24/7**: وصول إشعارات استباقية قبل انتهاء المواعيد بـ 60 و 30 و 7 أيام.`;

      if (lower.includes("تعمين") || lower.includes("موظف")) {
        fallbackText = `📊 **احتساب نسب التعمين لنشاطك:**
النسب المطلوبة تختلف بحسب النشاط الاقتصادي في سلطنة عمان:
• تجارة وتجزئة: **35%**
• مقاولات وإنشاءات: **20%**
• خدمات ومطاعم واستشارات: **30%**
• صناعة وورش: **25%**

💡 عدم تحقيق النسبة يعرض المؤسسة لوقف استخراج المأذونيات وغرامات مالية. يمكنك تشغيل "الفحص الفوري" لحساب وضع منشأتك بدقة.`;
      } else if (lower.includes("سجل") || lower.includes("بلدية") || lower.includes("غرام")) {
        fallbackText = `🏛️ **تجنب غرامات السجل التجاري والتراخيص:**
- التأخر في تجديد السجل التجاري عبر "استثمر بسهولة" يترتب عليه غرامات تراكمية وتجميد المعاملات البنكية.
- يقوم "مساعد ريادة" بتتبع تاريخ انتهائك وإرسال إشعارات مبكرة لك عبر واتساب لمباشرة التجديد دون مفاجآت.`;
      }

      return NextResponse.json({
        text: fallbackText,
        action,
        suggestions,
      });
    }

    // Call Gemini 3.7 Flash
    const formattedContents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      ...history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: cleanMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: formattedContents as any,
    });

    return NextResponse.json({
      text: response.text || "تم تحليل طلبك بنجاح من وكيل ريادة الذكي.",
      action,
      suggestions,
    });
  } catch (error: unknown) {
    console.error("[AssistantChat] Error processing chat:", error);
    return NextResponse.json(
      {
        text: "مرحباً بك! أنا وكيل ريادة الذكي لمساعدتك في الامتثال التنظيمي للمؤسسات في سلطنة عُمان. يمكنك استخدام أزرار الإجراءات السريعة أدناه للبدء.",
        suggestions: ["ابدأ فحص الامتثال", "احسب نسبة التعمين", "عرض الباقات"],
      },
      { status: 200 }
    );
  }
}
