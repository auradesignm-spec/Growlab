import { coachSystemPrompt } from "@/lib/meta/coachPersona";

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

/** Native audio+image like Gemini Pro: car engines, music, speech, SFX — not Whisper-only. */
export async function geminiAnalyzeJson(input: {
  locale: "ar" | "en";
  userPayload: string;
  frames?: { mime: string; dataBase64: string }[];
  audio?: { mime: string; dataBase64: string };
}): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const listen =
    input.locale === "ar"
      ? "استمع للصوت إن وُجد: محرّك سيارة، بوق، موسيقى، ضوضاء شارع، نبرة المعلق، صمت. اذكر المشهد الصوتي في visualRead. لا تكتفِ بتفريغ الكلام."
      : "If audio is present, listen for car engines, horns, music, street noise, VO tone, silence. Put the soundscape in visualRead. Do not only transcribe speech.";

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    { text: `${listen}\n${input.userPayload}` },
  ];
  if (input.audio?.dataBase64) {
    parts.push({
      inlineData: { mimeType: input.audio.mime || "audio/wav", data: input.audio.dataBase64 },
    });
  }
  for (const frame of (input.frames ?? []).slice(0, 3)) {
    parts.push({
      inlineData: { mimeType: frame.mime || "image/jpeg", data: frame.dataBase64 },
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: coachSystemPrompt(input.locale) }] },
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
          },
        }),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}