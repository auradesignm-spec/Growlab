import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/db";
import { getCategoryMeta } from "@/lib/compliance/knowledgeBase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Lazy initialization for Google GenAI SDK.
 */
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * POST /api/tax-agent
 * Tax & Compliance Advisor AI Agent for Omani SMEs ("وكيل ريادة الذكي").
 * 
 * CRITICAL ARCHITECTURAL CONSTRAINT:
 * Strictly fetches knowledge base documents where `is_active === true`.
 * All legacy / superseded versions (`is_active === false`) are strictly excluded
 * from the Gemini context window to prevent conflicting or obsolete legal advice.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query || body.prompt || body.message;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "يرجى تقديم استفسار أو سؤال ضريبي للوكيل الذكي.",
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // STRICT KNOWLEDGE RETRIEVAL: Only Active Laws (is_active === true)
    // Legacy/archived laws are strictly filtered out from the context window.
    // =========================================================================
    const activeKnowledgeFiles = await prisma.knowledgeBaseFile.findMany({
      where: {
        isActive: true, // STRICT CONSTRAINT: Only active laws
      },
      orderBy: [
        { documentCategory: "asc" },
        { versionNumber: "desc" },
      ],
    });

    // Build the dynamic legal context strictly from active files
    const activeLawsContext = activeKnowledgeFiles
      .map((doc) => {
        const meta = getCategoryMeta(doc.documentCategory);
        return `
[مستند تنظيمي نشط ومعتمد حالياً]:
- التصنيف: ${meta.nameAr} (${doc.documentCategory})
- المرجع التشريعي: ${meta.decreeNumber}
- رقم الإصدار المعتمد: الإصدار ${doc.versionNumber} (Active Version ${doc.versionNumber})
- حالة الوثيقة: نشطة رسمياً وسارية المفعول (Is Active: True)
- ملخص المستند واللوائح: ${doc.summary || meta.descriptionAr}
- رابط المصدر: ${doc.fileUrl || "مستند رسمي معتمد في قاعدة المعرفة"}
`.trim();
      })
      .join("\n\n---\n\n");

    const systemPrompt = `
أنت "وكيل ريادة الذكي للامتثال الضريبي والمالي" في سلطنة عُمان.
مهمتك: تقديم استشارات وتوجيهات دقيقة لأصحاب المؤسسات الصغيرة والمتوسطة (SMEs) والشركات في سلطنة عُمان استناداً حصرياً إلى أحدث القوانين واللوائح التنفيذية النافذة.

قواعد الاسترجاع والامتثال الصارمة:
1. أنت تعتمد حصرياً على الإصدارات النشطة الحالية (Active Laws) الواردة أدناه في سياق قاعدة المعرفة. تم استبعاد أي نصوص أو قوانين ملغاة أو مؤرشفة.
2. عند الاستشهاد، اذكر دائماً رقم المادة والمرسوم السلطاني الصادر به (مثل: المرسوم السلطاني 121/2020 لضريبة القيمة المضافة، القرار التنفيذي 53/2021 للائحة التنفيذية، المرسوم السلطاني 53/2023 لقانون العمل).
3. نبرة الرد: مهنية، واضحة، دقيقة ومباشرة، بدون أي رموز تعبيرية (Emojis)، مع استخدام تنسيق Markdown بالنقاط والتسلسل المنطقي.
4. وضح دائماً الآثار المالية (مثل: غرامات التأخير 1% شهرياً بموجب المادة 51، غرامة عدم تقديم الإقرار 500 ر.ع بموجب المادة 100، أو متطلبات الفواتير الضريبية بالمادتين 67 و 68).

قاعدة المعرفة النشطة (الإصدارات القانونية المعتمدة حالياً):
${activeLawsContext.length > 0 ? activeLawsContext : "تطبق القوانين واللوائح الرسمية النافذة في سلطنة عُمان: المرسوم السلطاني 121/2020 ولائحته 53/2021، وقانون العمل 53/2023."}
`.trim();

    const client = getGenAIClient();

    let responseText = "";

    if (client) {
      const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const response = await client.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nسؤال المستخدم:\n${query.trim()}`,
              },
            ],
          },
        ],
      });

      responseText = response.text || "";
    } else {
      // Fallback deterministic response when GEMINI_API_KEY is not configured
      responseText = `بناءً على القوانين واللوائح التنفيذية النشطة حالياً في سلطنة عُمان:

1. الأساس القانوني المعتمد:
- قانون ضريبة القيمة المضافة (المرسوم السلطاني رقم 121/2020 ولائحته التنفيذية بالقرار رقم 53/2021).
- نسبة الضريبة القياسية هي 5% مع إعفاءات وتصنيفات صفرية محددة.

2. متطلبات الامتثال الأساسية:
- الالتزام برفع الإقرارات الضريبية في مواعيدها المحددة فصلياً لتجنب الغرامة الثابتة (500 ر.ع بموجب المادة 100).
- سداد الضريبة المستحقة فوراً لتفادي احتساب غرامة تأخير بنسبة 1% شهرياً عن كل شهر أو جزء منه (المادة 51).
- التحقق من تضمين الرقم الضريبي (TIN) وصحة الحسبة في الفواتير (المادتين 67 و 68).

(ملاحظة: يمكنك إعداد مفتاح GEMINI_API_KEY للحصول على إجابات تفاعلية متقدمة ومحدثة مع كل استفسار).`;
    }

    return NextResponse.json({
      success: true,
      data: {
        response: responseText,
        activeLawsCount: activeKnowledgeFiles.length,
        referencedActiveLaws: activeKnowledgeFiles.map((doc) => ({
          id: doc.id,
          category: doc.documentCategory,
          versionNumber: doc.versionNumber,
          decreeNumber: getCategoryMeta(doc.documentCategory).decreeNumber,
          isActive: doc.isActive,
        })),
      },
    });
  } catch (error) {
    console.error("[POST /api/tax-agent] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء معالجة الاستشارة الضريبية من قاعدة المعرفة النشطة.",
      },
      { status: 500 }
    );
  }
}
