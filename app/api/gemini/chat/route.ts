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
      message,
      history = [],
      model = "gemini-3.5-flash",
      role = "general",
      customSystemInstruction,
      companyContext,
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });
    }

    // Role-specific System Instructions
    const roleInstructions: Record<string, string> = {
      general: "أنت مساعد ذكاء اصطناعي خبير ومستشار لمنصة Growlab، تقدم نصائح عملية دقيقة وتساعد رواد الأعمال في نمو متاجرهم.",
      sales_closer: "أنت خبير إغلاق صفقات ومبيعات استثنائي في منطقة الخليج والشرق الأوسط. أسلوبك مقنع وواثق ويركز على إبراز القيمة وحل تردد العميل وتحويل الزوار لمشترين فوريين.",
      ad_strategist: "أنت مدير إعلانات ميتا وتيك توك محترف (Media Buyer & Creative Strategist). تقدم زوايا تسويقية وخطافات بصرية (Hooks) واستراتيجيات استهداف وتحسين ROAS وتخفيض CAC.",
      copywriter: "أنت كاتب نصوص إعلانية وتسويقية عالمي. تصيغ نصوص إعلانات جذابة باللغة العربية والخليجية تستحوذ على الانتباه وتدفع العميل للنقر والشراء فوراً.",
      retention_expert: "أنت خبير ولاء العملاء وزيادة القيمة الدائمة للعميل (LTV & Retention). تصمم رسائل متابعة، عروض إعادة استهداف، وتجارب ما بعد البيع عبر واتساب.",
    };

    let baseSystemInstruction = roleInstructions[role] || roleInstructions.general;
    if (customSystemInstruction) {
      baseSystemInstruction += `\n\nتعليمات إضافية مخصصة:\n${customSystemInstruction}`;
    }

    if (companyContext) {
      baseSystemInstruction += `\n\nسياق الشركة والمتجر الحالي:\n- اسم المتجر: ${companyContext.name || ""}\n- المجال: ${companyContext.category || ""}\n- المنتجات الرئيسية: ${companyContext.productsSummary || ""}`;
    }

    // Prepare contents
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.role === "user" || item.sender === "user") {
          contents.push({ role: "user", parts: [{ text: item.text || item.content }] });
        } else if (item.role === "model" || item.role === "assistant" || item.sender === "agent" || item.sender === "assistant") {
          contents.push({ role: "model", parts: [{ text: item.text || item.content }] });
        }
      }
    }

    contents.push({ role: "user", parts: [{ text: message }] });

    // Validate model selection
    let selectedModel = "gemini-3.5-flash";
    if (model === "gemini-3.1-pro-preview") {
      selectedModel = "gemini-3.1-pro-preview";
    } else if (model === "gemini-3.1-flash-lite") {
      selectedModel = "gemini-3.1-flash-lite";
    } else if (model === "gemini-3.7-flash") {
      selectedModel = "gemini-3.7-flash";
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: contents,
      config: {
        systemInstruction: baseSystemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const replyText = response.text || "عذراً، لم أستطع توليد إجابة في هذه اللحظة.";

    return NextResponse.json({
      reply: replyText,
      modelUsed: selectedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Gemini Chat Route Error:", error);
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء معالجة المحادثة",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
