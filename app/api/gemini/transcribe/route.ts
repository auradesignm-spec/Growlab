import { GoogleGenAI } from "@google/genai";
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
    const { audioBase64, mimeType = "audio/webm", prompt = "" } = body;

    if (!audioBase64) {
      return NextResponse.json({ error: "بيانات الصوت مطلوبة للتفريغ" }, { status: 400 });
    }

    // Clean base64 string if it contains data URI header
    const cleanData = audioBase64.replace(/^data:[^;]+;base64,/, "");

    const ai = getGeminiClient();

    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(";")[0], // e.g. "audio/webm"
        data: cleanData,
      },
    };

    const textPart = {
      text: `
أنت متخصص خبير في تفريغ ومعالجة التسجيلات الصوتية والملاحظات الصوتية (Voice Notes) بدقة فائقة.
قم بتفريغ المقطع الصوتي المرفق كلمة بكلمة بدقة بالغة مع دعم كامل للهجات الخليجية (العمانية، السعودية، الإماراتية، الكويتية) واللغة العربية الفصحى والإنجليزية.
إذا كان هناك أي مصطلحات تسويقية أو أسماء منتجات أو أرقام، اكتبها بوضوح.

المطلوب:
1. التفريغ النصي الدقيق والكامل للكلام المنطوق.
2. إذا كان الصوت عبارة عن استفسار عميل أو فكرة إعلان، استخرج ملخصاً سريعاً للنقاط الجوهرية.
${prompt ? `سياق إضافي من المستخدم: ${prompt}` : ""}
`.trim(),
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [audioPart, textPart],
      },
    });

    const transcription = response.text || "";

    return NextResponse.json({
      transcription: transcription,
      modelUsed: "gemini-3.5-flash",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      {
        error: "فشل تفريغ المقطع الصوتي",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
