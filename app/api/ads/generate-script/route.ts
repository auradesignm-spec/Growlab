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
    const {
      productName,
      category,
      price,
      sellingPoints = [],
      targetAudience = "الجمهور الخليجي وسيدات/رجال الأعمال والمهتمين بالجودة",
      adFormat = "UGC Video Reel (9:16)",
    } = body;

    const ai = getGeminiClient();

    const prompt = `
أنت خبير تسويق إعلانات ميتا (Instagram Reels & TikTok) وصانع محتوى إعلاني UGC عالي التحويل (High-Converting UGC Video Ads) للأسواق الخليجية (عُمان، السعودية، الإمارات).
المنتج المطلوب: "${productName}"
الفئة: "${category}"
السعر: "${price}"
المميزات ونقاط القوة: "${sellingPoints.join(" - ")}"
الجمهور المستهدف: "${targetAudience}"
صيغة الإعلان: "${adFormat}"

المطلوب إعداد خطة وسيناريو إعلان فيديو متكامل باللغة العربية مع نبرة خليجية طبيعية ومقنعة (مدة 30-45 ثانية):
1. **٣ خيارات لخطافات البداية (3 Viral Hooks - أول 3 ثوانٍ)**: المشهد البصري + الجملة المنطوقة لتوقيف التمرير (Stop the Scroll).
2. **سيناريو المشاهد التفصيلية (Story & Scenes)**:
   - المشهد 1: عرض المشكلة أو الحاجة (Problem).
   - المشهد 2: كشف المنتج وكيف يحل المشكلة بأسلوب تجربة عفوية واقعية (Solution & Demo).
   - المشهد 3: الضمان والجودة وتوصيل لباب البيت (Trust & Social Proof).
3. **الدعوة لاتخاذ إجراء (Strong CTA + Offer)**: عرض الحبة الثانية أو الشحن المجاني وحث المشاهد على مراسلة الواتساب الآن.
4. **نص الإعلان المكتوب لمنصة ميتا (Primary Text & Headline)** مع الرموز التعبيرية المناسبة.

قم بتنسيق الإجابة بشكل أنيق ومنظم مع عناوين واضحة وجداول أو نقاط يسهل نسخها وتصويرها فوراً.
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.75,
      },
    });

    return NextResponse.json({
      script: response.text,
      productName,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI Ad Script Generation Error:", error);
    return NextResponse.json(
      {
        error: "فشل توليد سكريبت الإعلان",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
