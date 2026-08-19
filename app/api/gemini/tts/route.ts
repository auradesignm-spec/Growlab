import { GoogleGenAI, Modality } from "@google/genai";
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
  return NextResponse.json({ status: "active", endpoint: "/api/gemini/tts" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceName = "Kore" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "النص الصوتي مطلوب" }, { status: 400 });
    }

    const ai = getGeminiClient();
    const cleanText = text.replace(/```[\s\S]*?```/g, "").slice(0, 350);

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return NextResponse.json({ error: "لم يتم توليد الصوت" }, { status: 422 });
    }

    return NextResponse.json({
      audioBase64: base64Audio,
      sampleRate: 24000,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    return NextResponse.json(
      {
        error: "فشل تحويل النص إلى صوت",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
