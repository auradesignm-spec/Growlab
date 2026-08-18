import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic,
      storeData,
      marketCategory = "تجارة إلكترونية",
      analysisType = "growth_strategy", // growth_strategy, unit_economics, ad_scaling, pricing_elasticity, objection_matrix
      customPrompt = "",
    } = body;

    if (!topic && !customPrompt) {
      return NextResponse.json({ error: "موضوع التحليل أو السؤال مطلوب" }, { status: 400 });
    }

    const ai = getGeminiClient();

    const analysisTypeGuides: Record<string, string> = {
      growth_strategy: "تحليل استراتيجي عميق لمضاعفة نمو المتجر والمبيعات والتحويل (Conversion Rate & AOV).",
      unit_economics: "تحليل معمق لهوامش الربح، تكلفة الاستحواذ على العميل (CAC)، القيمة الدائمة (LTV)، ونقاط التعادل الإعلاني (Break-even ROAS).",
      ad_scaling: "استراتيجية توسيع حملات ميتا وتيك توك (Vertical & Horizontal Scaling) وتوزيع الميزانية الإعلانية لتجنب احتراق الجماهير.",
      pricing_elasticity: "دراسة مرونة التسعير وحزم المنتجات (Bundles & Upsells) لرفع متوسط قيمة السلة وتقديم عروض لا تُقاوم.",
      objection_matrix: "مصفوفة تفكيك جميع اعتراضات العملاء الخليجيين (السعر، الثقة، الشحن، جودة المنتج) وتدريب وكيل الذكاء على الردود القاطعة.",
    };

    const systemInstruction = `
أنت كبير الخبراء ومستشار النمو الاستراتيجي (Chief Growth Officer) المتخصص في التجارة الإلكترونية وتوسيع العلامات التجارية في السوق الخليجي والعربي.
تستخدم أعلى مستويات التفكير والتحليل المنطقي والرياضي (Deep High-Level Reasoning) لتقديم خطط استراتيجية دقيقة ومحكمة تعتمد على الأرقام الحقيقية وتجارب السوق الفعلية.

طبيعة التحليل المطلوب:
${analysisTypeGuides[analysisType] || analysisTypeGuides.growth_strategy}

هيكل التقرير الاستراتيجي الذي يجب أن تقدمه:
1. 🧠 **التشخيص والتحليل العميق للفرصة والتحديات** (Deep Breakdown & Market Realities).
2. 📊 **النمذجة المالية والأرقام المتوقعة** (ROAS, CAC, AOV, Gross Margin Targets).
3. 🎯 **خطة العمل التنفيذية خطوة بخطوة** (Actionable Execution Playbook).
4. 💡 **زوايا إعلانية وخطافات بصرية حصرية مقترحة** (Viral Ad Hooks & Creative Angles).
5. 🛡️ **إدارة المخاطر وتجنب الهدر المالي** (Risk Mitigation & Budget Protection).
`.trim();

    let userContent = `الموضوع / الاستفسار:\n${topic || customPrompt}\n\nنوع التحليل: ${analysisType}\nمجال المتجر: ${marketCategory}`;

    if (storeData) {
      userContent += `\n\nبيانات المتجر والمنتجات الحالية:\n${JSON.stringify(storeData, null, 2)}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const analysisResult = response.text || "تم التحليل بنجاح.";

    return NextResponse.json({
      analysis: analysisResult,
      modelUsed: "gemini-3.1-pro-preview (Thinking: HIGH)",
      analysisType: analysisType,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Thinking Mode API Error:", error);
    return NextResponse.json(
      {
        error: "فشل التحليل الاستراتيجي عالي التفكير",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
