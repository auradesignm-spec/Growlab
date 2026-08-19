import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function GET() {
  return NextResponse.json({ status: "active", endpoint: "/api/gemini/image" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      aspectRatio = "1:1",
      imageSize = "1K",
      sourceImageBase64,
      sourceMimeType = "image/jpeg",
      action = "generate",
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: "الوصف النصي للصورة مطلوب" }, { status: 400 });
    }

    const ai = getGeminiClient();

    let parts: any[] = [];

    if (action === "edit" && sourceImageBase64) {
      const cleanData = sourceImageBase64.replace(/^data:[^;]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: sourceMimeType.split(";")[0],
          data: cleanData,
        },
      });
      parts.push({
        text: `قم بتعديل هذه الصورة وفقاً للطلب التالي باحترافية تسويقية فائقة وجودة إعلانية عالية: ${prompt}`,
      });
    } else {
      parts.push({
        text: `High-end commercial eCommerce product & marketing photography. Premium lighting, ultra-realistic textures, clean aesthetic, Instagram / Meta Ads high-converting visual style: ${prompt}`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any,
        },
      },
    });

    let imageUrl: string | null = null;
    let textDescription = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${base64Data}`;
        } else if (part.text) {
          textDescription += part.text;
        }
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        {
          error: "لم يتم إنشاء صورة بواسطة النموذج، يرجى تجربة وصف آخر.",
          textDescription,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      imageUrl,
      textDescription,
      aspectRatio,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Gemini Image Generation Error:", error);
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء إنشاء الصورة بالذكاء الاصطناعي",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
