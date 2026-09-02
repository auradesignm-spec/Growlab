import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COMPLIANCE_SYSTEM_PROMPT = `
أنت "وكيل ريادة الذكي" — المستشار والوكيل الآلي المتخصص في الامتثال التنظيمي وقوانين العمل والتراخيص للمؤسسات الصغيرة والمتوسطة (SMEs) في سلطنة عُمان.

صفتك وأسلوبك:
1. مهني، دقيق، مباشر، مشجع ومريح لأصحاب الأعمال العمانيين ورواد الأعمال.
2. تتحدث باللغة العربية الواضحة (مع استخدام مصطلحات العمل العمانية مثل: سجل تجاري، تراخيص بلدية، منصة توطين، نسب التعمين، صندوق الحماية الاجتماعية، بوابة استثمر بسهولة، جهاز الضرائب، مكاتب سند).
3. تقدم إجابات عملية منظمة بنقاط محددة وتذكر الخطوات الفعلية والتكلفة أو الغرامات التقديرية بالريال العُماني (OMR).
4. تنصح دائماً بالاستباقية وربط تنبيهات الواتساب لتفادي الغرامات.

قواعد المعرفة التنظيمية العمانية المرجعية:
- نسب التعمين:
  * التجارة والتجزئة: تتراوح عادة بين 30% إلى 45% حسب النشاط.
  * المقاولات والإنشاءات: 15% إلى 20%.
  * الخدمات والاستشارات والمطاعم: 25% إلى 35%.
  * الصناعة والورش: 25% إلى 35%.
- الغرامات المحتملة:
  * عدم تحقيق نسب التعمين: قد تؤدي لحظر استخراج مأذونيات العمل وغرامات مالية شهرية متراكمة.
  * تأخر تجديد السجل التجاري والتراخيص البلدية: غرامات تبدأ من 50 ر.ع وتتزايد تدريجياً مع تجميد السجل.
  * عدم التسجيل في منصة توطين وصندوق الحماية الاجتماعية: غرامات فورية وحرمان من التسهيلات التمويلية (مثل قروض بنك التنمية وبرامج ريادة).
  * ضريبة القيمة المضافة (VAT): الفوترة الإلكترونية الإلزامية للمؤسسات التي تتجاوز إيراداتها الحد الإلزامي (38,500 ر.ع سنوياً) وغرامات عدم الامتثال تبدأ من 500 إلى 5,000 ر.ع.

عند الإجابة:
- كن مختصراً ومباشراً وقدم نصيحة ملموسة وخطوات واضحة بالترتيب.
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
    const { prompt, history, businessContext } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const ai = getAi();
    if (!ai) {
      // Fallback smart rule-based answer if API key is not yet set in environment
      return NextResponse.json({
        text: generateFallbackAdvice(prompt, businessContext),
        source: "local-rules",
      });
    }

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `${COMPLIANCE_SYSTEM_PROMPT}
${businessContext ? `\nبيانات المنشأة الحالية للسائل: ${JSON.stringify(businessContext)}\n` : ""}

سؤال المستخدم:
${prompt}`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents,
    });

    return NextResponse.json({
      text: response.text || "تم فحص الاستفسار. يرجى تجديد التراخيص ومراجعة منصة توطين بانتظام.",
      source: "gemini-3.7-flash",
    });
  } catch (error: unknown) {
    console.error("[AiAdvisorAPI] Error generating advice:", error);
    return NextResponse.json({
      text: generateFallbackAdvice("استفسار عام", undefined),
      source: "fallback",
    });
  }
}

function generateFallbackAdvice(prompt: string, context?: any): string {
  const p = prompt.toLowerCase();
  if (p.includes("تعمين") || p.includes("omanisation") || p.includes("توطين")) {
    return `📌 **بشأن نسب التعمين في سلطنة عُمان:**
1. تختلف النسبة المطلوبة وفقاً لنشاطك التجاري (مثال: التجارة 35%، المقاولات 20%، الخدمات 30%).
2. عدم استيفاء النسبة يمنع استخراج تصاريح عمل جديدة للوافدين (المأذونيات).
3. **نصيحة فورية:** سجّل في منصة "توطين" وصندوق الحماية الاجتماعية، واستفد من برامج دعم أجور العمانيين لتفادي أي غرامات شهرية.`;
  }
  if (p.includes("سجل") || p.includes("بلدية") || p.includes("تجديد") || p.includes("ترخيص")) {
    return `🏛️ **بشأن تجديد السجل التجاري وتراخيص البلدية:**
1. يجب تجديد السجل التجاري عبر بوابة "استثمر بسهولة" قبل 30 يوماً من انتهائه لتفادي الغرامات التراكمية.
2. تجديد عقد الإيجار ورخصة البلدية المعتمدة شرط أساسي لسلامة السجل.
3. يقوم "مساعد ريادة" بإرسال تنبيهات تلقائية قبل 60 و 30 و 7 أيام من موعد الانتهاء عبر واتساب.`;
  }
  if (p.includes("ضريبة") || p.includes("فاتورة") || p.includes("vat")) {
    return `📑 **بشأن متطلبات الضرائب والفوترة في عُمان:**
1. التسجيل الإلزامي في ضريبة القيمة المضافة (5%) للمبيعات السنوية التي تتجاوز 38,500 ر.ع.
2. يجب إصدار فواتير ضريبية واضحة تحتوي على الرقم الضريبي وتفاصيل المنتجات والضريبة.
3. التخلف عن تقديم الإقرارات الضريبية الربع سنوية يعرض المنشأة لغرامات تبدأ من 500 ر.ع.`;
  }
  return `مرحباً بك! 👋 أنا وكيل ريادة الذكي للامتثال التنظيمي في سلطنة عُمان.
يمكنني مساعدتك في:
• احتساب نسب التعمين لنشاطك وتجنب غرامات وزارة العمل.
• تتبع مواعيد تجديد السجل التجاري ورخص البلدية وعقود الإيجار.
• متطلبات الفوترة وضريبة القيمة المضافة (VAT).
• التنبيهات الاستباقية الفورية عبر واتساب.`;
}
