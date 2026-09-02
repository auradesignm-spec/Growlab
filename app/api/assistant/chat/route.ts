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
أنت "مساعد Growlab للامتثال" (وكيل ريادة الذكي) — المستشار الآلي المعتمد للامتثال التنظيمي وحماية المؤسسات الصغيرة والمتوسطة (SMEs) في سلطنة عُمان.

قواعد إلزامية صارمة:
1. ممنوع منعاً باتاً استخدام أي Emoji أو رموز تعبيرية (مثل الوجوه والرموز التعبيرية) في ردودك نهائياً. استخدم نصوصاً واضحة وتنسيق Markdown بنقاط احترافية.
2. لغتك: عربية مهنية دقيقة، راقية، ومباشرة تناسب أصحاب الأعمال والمستثمرين في سلطنة عُمان.

معلومات النظام واللوائح العُمانية:
- نسب التعمين الإلزامية حسب وزارة العمل:
  * التجارة والتجزئة: 35%
  * المقاولات والإنشاءات: 20%
  * الخدمات والمطاعم والاستشارات: 30%
  * الصناعة والورش: 25%
  * الأنشطة الأخرى: 25%
- عواقب نقص التعمين: وقف استخراج تصاريح العمل (المأذونيات) وغرامات تتراوح بين 200 إلى 500 ر.ع شهرياً عن كل مواطن ناقص (تصل لـ 2,400 إلى 6,000 ر.ع سنوياً).
- السجل التجاري ورخص البلدية: انتهاء الصلاحية يسبب غرامات تراكمية ووقف السجل في بوابة "استثمر بسهولة" وتجميد الحسابات البنكية للمؤسسة.
- منصة توطين وصندوق الحماية الاجتماعية: التسجيل إلزامي لتوثيق نسب القوى العاملة الوطنية رسمياً.
- متطلبات جهاز الضرائب والفوترة الإلكترونية: عدم إصدار فواتير ضريبية نظامية يعرض المنشأة لغرامات فحص ضريبي تبدأ من 500 إلى 5,000 ر.ع.

باقات منصة Growlab:
- باقة الأساسية (Starter): 9 ر.ع شهرياً (أو 7 ر.ع بالدفع السنوي) — تتبع سجل تجاري واحد، تنبيهات تجديد التراخيص عبر واتساب، حاسبة التعمين، تقرير شهري.
- باقة النمو (Growth): 19 ر.ع شهرياً (أو 15 ر.ع بالدفع السنوي) — الخيار الأكثر طلباً: تتبع حتى 3 سجلات وفروع، وكيل ذكاء اصطناعي على واتساب 24/7، مراقبة منصة توطين، تدقيق الفوترة وضريبة القيمة المضافة، تنبيهات مبكرة (60 و 30 و 7 أيام)، وتصدير تقارير PDF رسمية.
- باقة المحترفين (Pro): 39 ر.ع شهرياً (أو 31 ر.ع بالدفع السنوي) — تتبع غير محدود ومناسب لمكاتب سند، مجموعات الشركات، واستشارات الامتثال المتقدمة.
- أداة فحص الامتثال السريع: مجانية 100% متاحة للجميع لحساب نسبة التعمين والغرامات المتوقعة فوراً دون الحاجة لبطاقة ائتمان.

دورك في الردود:
- اشرح الإجراءات والحلول خطوة بخطوة ووجّه المستخدم لأداة الفحص (/quiz) أو لوحة التحكم (/dashboard) أو استعراض الباقات (/#pricing).
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
    } else if (lower.includes("سعر") || lower.includes("باقات") || lower.includes("اشتراك") || lower.includes("pricing")) {
      action = {
        type: "open_pricing",
        titleAr: "استعراض باقات مساعد ريادة",
        titleEn: "View Pricing Plans",
        descriptionAr: "باقات تبدأ من 9 ر.ع/شهر (الأساسية)، و 19 ر.ع/شهر (النمو)، و 39 ر.ع/شهر (المحترفين)",
        descriptionEn: "Flexible plans for Omani SMEs",
        targetUrl: "/#pricing",
      };
    }

    if (!ai) {
      // Local rule-based high quality fallback
      let fallbackText = `أهلاً بك. أنا مساعد Growlab للامتثال (وكيل ريادة الذكي) لحماية ومتابعة المؤسسات الصغيرة والمتوسطة في سلطنة عُمان.

مجالات المساعدة الفورية:
1. مراقبة نسب التعمين: احتساب النسبة بدقة لقطاعك وتحديد عدد الكوادر الوطنية المطلوبة لتفادي وقف المأذونيات.
2. تجديد التراخيص: متابعة مواعيد السجل التجاري ورخص البلدية وعقود الإيجار.
3. تنبيهات واتساب الاستباقية: وصول إشعارات قبل 60 و 30 و 7 أيام من أي استحقاق.
4. التدقيق الضريبي والفوترة: التحقق من جاهزية الفواتير الضريبية لمتطلبات جهاز الضرائب.`;

      if (lower.includes("تعمين") || lower.includes("موظف")) {
        fallbackText = `احتساب نسب التعمين لنشاطك في سلطنة عُمان:
النسب المقررة حسب قرارات وزارة العمل:
- تجارة وتجزئة: 35%
- مقاولات وإنشاءات: 20%
- خدمات ومطاعم واستشارات: 30%
- صناعة وورش: 25%
- الأنشطة الأخرى: 25%

عواقب النقص:
عدم استيفاء النسبة يؤدي لوقف إصدار تصاريح العمل (المأذونيات) للوافدين، وغرامات مالية شهرية تتراوح بين 200 إلى 500 ر.ع عن كل مواطن ناقص. يمكنك بدء فحص الامتثال الفوري لحساب وضعك بدقة.`;
      } else if (lower.includes("سجل") || lower.includes("بلدية") || lower.includes("غرام")) {
        fallbackText = `تجنب غرامات السجل التجاري ورخص البلدية:
- التأخر في تجديد السجل التجاري عبر بوابة "استثمر بسهولة" يسبب غرامات تأخير متراكمة وتجميد الحسابات البنكية للمؤسسة.
- انتهاء ترخيص البلدية يعرض المنشأة لإشعار مخالفة وغرامات بلدية فورية.
- المنصة ترسل لك تنبيهات استباقية دورية عبر واتساب قبل 60 و 30 و 7 أيام مع روابط مباشرة للإنجاز.`;
      } else if (lower.includes("سعر") || lower.includes("باق") || lower.includes("تكلف")) {
        fallbackText = `باقات الاشتراك في Growlab (مساعد ريادة):
1. باقة الأساسية (Starter): 9 ر.ع/شهرياً (7 ر.ع بالدفع السنوي) — تتبع سجل تجاري واحد، تنبيهات واتساب، وحاسبة التعمين.
2. باقة النمو (Growth): 19 ر.ع/شهرياً (15 ر.ع بالدفع السنوي) — تتبع حتى 3 سجلات، وكيل ذكاء اصطناعي 24/7، تدقيق منصة توطين والفوترة، وتصدير تقارير PDF.
3. باقة المحترفين (Pro): 39 ر.ع/شهرياً (31 ر.ع بالدفع السنوي) — تتبع غير محدود لمجموعات الشركات ومكاتب سند والاستشارات.

ملاحظة: فحص الامتثال الأولي مجاني 100% بدون أي رسوم.`;
      } else if (lower.includes("توطين") || lower.includes("حماية") || lower.includes("عقد")) {
        fallbackText = `منصة توطين وصندوق الحماية الاجتماعية:
- تسجيل وتوثيق عقود العمل للعمانيين في منصة توطين وربطها بصندوق الحماية الاجتماعية شرط أساسي لاحتساب الموظف في نسبة التعمين الرسمية.
- يوفر لك الوكيل دليلاً إرشادياً سريعاً لخطوات توثيق العقود والتأكد من اعتمادها رسمياً.`;
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
