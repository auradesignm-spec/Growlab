import { coachSystemPrompt } from "@/lib/meta/coachPersona";

function ollamaBase(): string {
  return (process.env.OLLAMA_HOST?.trim() || "http://127.0.0.1:11434").replace(/\/$/, "");
}

function ollamaTextModel(): string {
  return process.env.OLLAMA_MODEL?.trim() || "growlab-coach";
}

function ollamaVisionModel(): string {
  return process.env.OLLAMA_VISION_MODEL?.trim() || "qwen2.5vl:3b";
}

type Frame = { dataBase64: string };

async function chat(input: {
  model: string;
  locale: "ar" | "en";
  userPayload: string;
  images?: string[];
}): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  try {
    const user: { role: string; content: string; images?: string[] } = {
      role: "user",
      content: input.userPayload,
    };
    if (input.images?.length) user.images = input.images;

    const res = await fetch(`${ollamaBase()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: input.model,
        stream: false,
        format: "json",
        options: { temperature: 0.35, num_ctx: 2048 },
        messages: [
          { role: "system", content: coachSystemPrompt(input.locale) },
          user,
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { message?: { content?: string } };
    return data.message?.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Local coach: VL model if frames exist, else text Qwen. Audio is not native — use the script field / Whisper later. */
export async function ollamaAnalyzeJson(input: {
  locale: "ar" | "en";
  userPayload: string;
  frames?: Frame[];
}): Promise<string | null> {
  if (process.env.OLLAMA_DISABLED === "1") return null;

  const images = (input.frames ?? [])
    .map((f) => f.dataBase64)
    .filter(Boolean)
    .slice(0, 3);

  if (images.length > 0) {
    const vision = await chat({
      model: ollamaVisionModel(),
      locale: input.locale,
      userPayload: input.userPayload,
      images,
    });
    if (vision) return vision;
  }

  return chat({
    model: ollamaTextModel(),
    locale: input.locale,
    userPayload: input.userPayload,
  });
}
