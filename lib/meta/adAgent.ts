/**
 * Ad Coach (Wave A) — psych + Meta-fit analysis with approval gate.
 * Does NOT spend ad budget. Marketing API launch is Wave C.
 */

import { coachSystemPrompt } from "@/lib/meta/coachPersona";

export type PsychLever =
  | "curiosity_gap"
  | "prediction_break"
  | "scene"
  | "promise"
  | "authority"
  | "fomo"
  | "belonging"
  | "none";

export type AdPlatformId = "reels" | "feed" | "stories" | "tiktok" | "ctwa";

export type AdPlatformFit = {
  id: AdPlatformId;
  score: number;
  fit: string;
};

export type AdFrameInput = {
  mime: string;
  dataBase64: string;
};

export type AdPerformanceContext = {
  leadsTotal: number;
  leadsFromAd: number;
  leadsOrganic: number;
  chatting: number;
  interested: number;
  rejected: number;
  whatsappConnected: boolean;
  productTitle?: string;
  productPrice?: number;
  productCategory?: string;
  productShort?: string;
};

export type AdAnalysisResult = {
  scores: {
    hookStrength: number;
    psychFit: number;
    metaAlgorithmFit: number;
    ctaClarity: number;
    overall: number;
  };
  leversDetected: PsychLever[];
  issues: string[];
  opportunities: string[];
  predicted: {
    /** Relative labels only — not a ROAS promise */
    interestLift: "low" | "medium" | "high";
    confidence: "low" | "medium" | "high";
    note: string;
  };
  suggestedHook: string;
  suggestedCaption: string;
  suggestedScript: string;
  suggestedVisualHook: string;
  suggestedCta: string;
  rationale: string;
  visualRead: string;
  platforms: AdPlatformFit[];
  market: string;
  competitorPatterns: string[];
};

export type MerchantLessonExample = {
  productHint: string;
  hook: string;
  caption: string;
  note: string;
};

export type AdSoundInput = {
  mime: string;
  dataBase64: string;
};

export type AdAnalyzeInput = {
  locale: "ar" | "en";
  hook: string;
  caption: string;
  script: string;
  visualHook: string;
  context: AdPerformanceContext;
  frames?: AdFrameInput[];
  audio?: AdSoundInput;
  /** Approved past creatives — few-shot learning from this merchant. */
  lessons?: MerchantLessonExample[];
};

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

const PLATFORM_IDS: AdPlatformId[] = ["reels", "feed", "stories", "tiktok", "ctwa"];

function defaultPlatforms(ar: boolean, overall: number): AdPlatformFit[] {
  const notes: Record<AdPlatformId, { ar: string; en: string }> = {
    reels: {
      ar: "أول كادر يوقف التمرير؛ نص كبير في 0–3 ثوانٍ.",
      en: "First frame must stop the scroll; big type in 0–3s.",
    },
    feed: {
      ar: "المنتج واضح في مربع/عمودي 4:5 مع سعر أو COD.",
      en: "Product readable in 1:1 or 4:5 with price or COD.",
    },
    stories: {
      ar: "عمودي 9:16، منطقة آمنة تحت الشريط.",
      en: "9:16 vertical with safe area under the UI chrome.",
    },
    tiktok: {
      ar: "إيقاع أسرع؛ الوجه أو اليد في أول ثانية.",
      en: "Faster cut; face or hands in the first second.",
    },
    ctwa: {
      ar: "الهدف محادثة واتساب لا زيارة موقع.",
      en: "Objective is a WhatsApp thread, not a site visit.",
    },
  };
  return PLATFORM_IDS.map((id) => ({
    id,
    score: clampScore(overall + (id === "ctwa" ? 0.4 : 0)),
    fit: ar ? notes[id].ar : notes[id].en,
  }));
}

function visionExtras(input: AdAnalyzeInput, overall: number): Pick<
  AdAnalysisResult,
  "visualRead" | "platforms" | "market" | "competitorPatterns"
> {
  const ar = input.locale === "ar";
  const hasFrames = Boolean(input.frames?.length);
  const cat = input.context.productCategory?.trim() || (ar ? "منتجات COD" : "COD goods");
  const title = input.context.productTitle?.trim() || (ar ? "المنتج" : "the product");
  return {
    visualRead: hasFrames
      ? ar
        ? "رفعنا الكادر. التحليل البصري الكامل يحتاج مفتاح الذكاء الاصطناعي — هذا تقدير أولي."
        : "Frames received. Full visual read needs the AI key — this is a first-pass estimate."
      : ar
        ? "لا صورة ولا فيديو — التحليل من النص فقط."
        : "No image or video — analysis is copy-only.",
    platforms: defaultPlatforms(ar, overall),
    market: ar
      ? `سوق ${cat} في عُمان يعتمد الثقة والدفع عند الاستلام. الإعلان الذي يبيع قبل أن يُظهر المنتج والنقد عند الاستلام يضيّع التحويل.`
      : `Oman ${cat} buyers still need trust and COD. Ads that sell before showing the product and doorstep cash lose the click-to-chat.`,
    competitorPatterns: ar
      ? [
          `الفئة (${cat}) غالباً تبدأ بوجه أو منتج قريب الكاميرا خلال ثانية.`,
          "الكابشن الناجح يذكر السعر أو COD قبل الهاشتاق.",
          `اربط ${title} بمشكلة يومية لا بمواصفات عامة.`,
          "CTA واتساب أقصر من «زوروا الموقع».",
        ]
      : [
          `This category (${cat}) usually opens on a face or a tight product shot in the first second.`,
          "Winning captions name price or COD before hashtags.",
          `Tie ${title} to a daily job, not generic specs.`,
          "WhatsApp CTAs beat “visit the website”.",
        ],
  };
}

function detectLevers(text: string): PsychLever[] {
  const t = text.toLowerCase();
  const found: PsychLever[] = [];
  if (/لماذا|ليش|هل تعلم|؟|\?|secret|why /.test(t)) found.push("curiosity_gap");
  if (/خطأ|غلط|مو|ليس|most people|wrong|myth/.test(t)) found.push("prediction_break");
  if (/أمس|اليوم|شفت|imagine|suddenly|اليوم الصبح/.test(t)) found.push("scene");
  if (/خلال|ضمان|نتيجة|result|get |احصل/.test(t)) found.push("promise");
  if (/\d+%|\d+ ر\.ع|دراسة|proven|experts/.test(t)) found.push("authority");
  if (/محدود|ينتهي|آخر|last chance|فوراً|الآن فقط/.test(t)) found.push("fomo");
  if (/مثل غيرك|الجميع|كل بيت|belong|community/.test(t)) found.push("belonging");
  return found.length ? found : ["none"];
}

function heuristicAnalyze(input: AdAnalyzeInput): AdAnalysisResult {
  const ar = input.locale === "ar";
  const combined = `${input.hook}\n${input.caption}\n${input.script}\n${input.visualHook}`;
  const levers = detectLevers(combined);
  const issues: string[] = [];
  const opportunities: string[] = [];

  let hookStrength = 5;
  if (!input.hook.trim() && input.frames?.length) {
    hookStrength = 6;
  } else if (input.hook.trim().length < 8) {
    hookStrength = 2;
    issues.push(ar ? "الهوك قصير جداً — أول 3 ثوانٍ ضعيفة." : "Hook is too short for the first 3 seconds.");
  } else if (input.hook.trim().length > 12) {
    hookStrength = 7;
  }
  if (!/[؟?\u061f]|\d/.test(input.hook) && levers.includes("none")) {
    hookStrength -= 1;
    opportunities.push(
      ar ? "جرّب فجوة فضول أو رقم ملموس في أول سطر." : "Try a curiosity gap or concrete number in the first line.",
    );
  }

  let psychFit = levers.includes("none") ? 4 : 7;
  if (levers.length >= 2) psychFit = 8;

  let metaFit = 6;
  if (!/واتساب|whatsapp|نعم|راسل|تواصل/i.test(combined)) {
    metaFit -= 2;
    issues.push(
      ar
        ? "لا يوجد CTA واضح لمحادثة واتساب — خوارزمية CTWA تحتاج هدفاً واضحاً."
        : "No clear WhatsApp conversation CTA — CTWA needs an explicit ask.",
    );
  }
  if (!/استلام|cod|نقد/i.test(combined) && ar) {
    opportunities.push("اذكر الدفع عند الاستلام مبكراً لتقليل تردد الثقة.");
  }
  if (input.script.trim().length > 0 && input.script.trim().length < 40) {
    metaFit -= 1;
    issues.push(ar ? "السكريبت قصير — ابنِ 15–30 ثانية: ألم → عرض → CTA." : "Script is thin — aim for 15–30s: pain → offer → CTA.");
  }

  let ctaClarity = /واتساب|whatsapp|نعم|راسل/i.test(combined) ? 8 : 3;
  if (!input.visualHook.trim()) {
    opportunities.push(
      ar ? "أضف هوكاً بصرياً على الشاشة في 0–3 ثوانٍ (نص كبير فوق الفيديو)." : "Add an on-screen visual hook for seconds 0–3.",
    );
    metaFit -= 0.5;
  }

  const ctx = input.context;
  if (ctx.leadsFromAd > 0 && ctx.rejected > ctx.interested) {
    opportunities.push(
      ar
        ? "نسبة الرفض أعلى من الاهتمام — راجع السعر/الثقة في الكابشن وليس فقط الهوك."
        : "Rejects exceed interested — revisit price/trust in the caption, not only the hook.",
    );
  }
  if (ctx.whatsappConnected) {
    opportunities.push(
      ar ? "واتساب مربوط — اجعل هدف الإعلان رسالة واتساب وليس زيارة موقع فقط." : "WhatsApp is connected — optimize for message objective, not bare traffic.",
    );
  }

  const overall = clampScore((hookStrength + psychFit + metaFit + ctaClarity) / 4);
  const extras = visionExtras(input, overall);
  const product = input.context.productTitle?.trim() || (ar ? "المنتج" : "the product");
  const price =
    typeof input.context.productPrice === "number" && input.context.productPrice > 0
      ? ar
        ? `${input.context.productPrice.toFixed(2)} ر.ع`
        : `${input.context.productPrice.toFixed(2)} OMR`
      : "";

  const suggestedHook = ar
    ? input.hook.trim().length > 8
      ? `وقف… ${input.hook.trim().slice(0, 60)}`
      : `لماذا تدفع أكثر و${product} يصلك والدفع عند الاستلام؟`
    : input.hook.trim().length > 8
      ? `Wait — ${input.hook.trim().slice(0, 60)}`
      : `Why overpay when ${product} arrives COD on delivery?`;

  const suggestedCaption = ar
    ? `${suggestedHook}\n\n${product}${price ? ` — ${price}` : ""}.\nالدفع عند الاستلام. راسلنا على واتساب واكتب: نعم`
    : `${suggestedHook}\n\n${product}${price ? ` — ${price}` : ""}.\nCash on delivery. Tap WhatsApp and reply: YES`;

  const suggestedScript = ar
    ? `0–3ث: ${suggestedHook}\n3–10ث: المشكلة اليومية باختصار.\n10–20ث: اعرض ${product}${price ? ` بسعر ${price}` : ""} والدفع عند الاستلام.\n20–30ث: "اضغط واتساب الآن واكتب نعم — نأكّد طلبك."`
    : `0–3s: ${suggestedHook}\n3–10s: Name the daily pain.\n10–20s: Show ${product}${price ? ` at ${price}` : ""} with COD.\n20–30s: "Tap WhatsApp now and reply YES — we confirm your order."`;

  const suggestedVisualHook = ar
    ? input.visualHook.trim() || `نص كبير على الشاشة: «${suggestedHook.slice(0, 40)}»`
    : input.visualHook.trim() || `Big on-screen text: “${suggestedHook.slice(0, 40)}”`;

  const suggestedCta = ar ? "راسلنا واتساب — اكتب نعم" : "WhatsApp us — reply YES";

  const interestLift: AdAnalysisResult["predicted"]["interestLift"] =
    overall >= 7.5 ? "high" : overall >= 5 ? "medium" : "low";
  const confidence: AdAnalysisResult["predicted"]["confidence"] =
    ctx.leadsTotal >= 30 ? "medium" : ctx.leadsTotal >= 5 ? "low" : "low";

  return {
    scores: {
      hookStrength: clampScore(hookStrength),
      psychFit: clampScore(psychFit),
      metaAlgorithmFit: clampScore(metaFit),
      ctaClarity: clampScore(ctaClarity),
      overall,
    },
    leversDetected: levers,
    issues,
    opportunities,
    predicted: {
      interestLift,
      confidence,
      note: ar
        ? "التوقع نسبي من جودة النص + إشارات محادثاتكم — ليس ضمان ROAS."
        : "Relative forecast from copy quality + your chat signals — not a ROAS guarantee.",
    },
    suggestedHook: suggestedHook.slice(0, 200),
    suggestedCaption: suggestedCaption.slice(0, 2000),
    suggestedScript: suggestedScript.slice(0, 2000),
    suggestedVisualHook: suggestedVisualHook.slice(0, 300),
    suggestedCta: suggestedCta.slice(0, 120),
    rationale: ar
      ? `رصدنا روافع: ${levers.join(", ")}. ركّزنا على هوك أول 3 ثوانٍ + CTA واتساب + COD لأن هذا ما يخدم Click-to-WhatsApp والتحصيل لاحقاً.`
      : `Levers seen: ${levers.join(", ")}. We prioritized a 0–3s hook + WhatsApp CTA + COD to fit CTWA and later cash collection.`,
    ...extras,
  };
}

function parseAiJson(content: string): Partial<AdAnalysisResult> | null {
  try {
    return JSON.parse(content) as Partial<AdAnalysisResult>;
  } catch {
    return null;
  }
}

function parsePlatforms(raw: unknown, fallback: AdPlatformFit[]): AdPlatformFit[] {
  if (!Array.isArray(raw)) return fallback;
  const byId = new Map<string, AdPlatformFit>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const rec = row as { id?: string; score?: number; fit?: string };
    if (!PLATFORM_IDS.includes(rec.id as AdPlatformId)) continue;
    byId.set(rec.id as string, {
      id: rec.id as AdPlatformId,
      score: clampScore(Number(rec.score)),
      fit: String(rec.fit ?? "").slice(0, 180),
    });
  }
  return PLATFORM_IDS.map((id) => byId.get(id) ?? fallback.find((p) => p.id === id)!);
}

function analysisBrief(input: AdAnalyzeInput): string {
  return JSON.stringify({
    hook: input.hook,
    caption: input.caption,
    script: input.script,
    visualHook: input.visualHook,
    performanceContext: input.context,
    frameCount: input.frames?.length ?? 0,
    hasAudio: Boolean(input.audio?.dataBase64),
    merchantLessons: (input.lessons ?? []).slice(0, 8),
  });
}

function mergeParsed(parsed: Partial<AdAnalysisResult>, fallback: AdAnalysisResult): AdAnalysisResult | null {
  if (!parsed.suggestedHook || !parsed.scores) return null;
  return {
    scores: {
      hookStrength: clampScore(Number(parsed.scores?.hookStrength ?? fallback.scores.hookStrength)),
      psychFit: clampScore(Number(parsed.scores?.psychFit ?? fallback.scores.psychFit)),
      metaAlgorithmFit: clampScore(
        Number(parsed.scores?.metaAlgorithmFit ?? fallback.scores.metaAlgorithmFit),
      ),
      ctaClarity: clampScore(Number(parsed.scores?.ctaClarity ?? fallback.scores.ctaClarity)),
      overall: clampScore(Number(parsed.scores?.overall ?? fallback.scores.overall)),
    },
    leversDetected: Array.isArray(parsed.leversDetected)
      ? (parsed.leversDetected as PsychLever[])
      : fallback.leversDetected,
    issues: Array.isArray(parsed.issues) ? parsed.issues.map(String).slice(0, 8) : fallback.issues,
    opportunities: Array.isArray(parsed.opportunities)
      ? parsed.opportunities.map(String).slice(0, 8)
      : fallback.opportunities,
    predicted: {
      interestLift:
        parsed.predicted?.interestLift === "high" ||
        parsed.predicted?.interestLift === "medium" ||
        parsed.predicted?.interestLift === "low"
          ? parsed.predicted.interestLift
          : fallback.predicted.interestLift,
      confidence:
        parsed.predicted?.confidence === "high" ||
        parsed.predicted?.confidence === "medium" ||
        parsed.predicted?.confidence === "low"
          ? parsed.predicted.confidence
          : fallback.predicted.confidence,
      note: String(parsed.predicted?.note ?? fallback.predicted.note).slice(0, 400),
    },
    suggestedHook: String(parsed.suggestedHook).slice(0, 200),
    suggestedCaption: String(parsed.suggestedCaption ?? fallback.suggestedCaption).slice(0, 2000),
    suggestedScript: String(parsed.suggestedScript ?? fallback.suggestedScript).slice(0, 2000),
    suggestedVisualHook: String(parsed.suggestedVisualHook ?? fallback.suggestedVisualHook).slice(0, 300),
    suggestedCta: String(parsed.suggestedCta ?? fallback.suggestedCta).slice(0, 120),
    rationale: String(parsed.rationale ?? fallback.rationale).slice(0, 1200),
    visualRead: String(parsed.visualRead ?? fallback.visualRead).slice(0, 600),
    platforms: parsePlatforms(parsed.platforms, fallback.platforms),
    market: String(parsed.market ?? fallback.market).slice(0, 500),
    competitorPatterns: Array.isArray(parsed.competitorPatterns)
      ? parsed.competitorPatterns.map(String).slice(0, 5)
      : fallback.competitorPatterns,
  };
}

async function openAiAnalyze(input: AdAnalyzeInput): Promise<AdAnalysisResult | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const system = coachSystemPrompt(input.locale);
  const brief = analysisBrief(input);

  const imageParts = (input.frames ?? []).slice(0, 3).map((frame) => ({
    type: "image_url" as const,
    image_url: { url: `data:${frame.mime};base64,${frame.dataBase64}` },
  }));

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [{ type: "text", text: brief }, ...imageParts],
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = parseAiJson(content);
    if (!parsed) return null;
    return mergeParsed(parsed, heuristicAnalyze(input));
  } catch {
    return null;
  }
}

async function geminiAnalyze(input: AdAnalyzeInput): Promise<AdAnalysisResult | null> {
  const { geminiAnalyzeJson } = await import("@/lib/meta/geminiCoach");
  const content = await geminiAnalyzeJson({
    locale: input.locale,
    userPayload: analysisBrief(input),
    frames: input.frames,
    audio: input.audio,
  });
  if (!content) return null;
  const parsed = parseAiJson(content);
  if (!parsed) return null;
  return mergeParsed(parsed, heuristicAnalyze(input));
}

async function ollamaAnalyze(input: AdAnalyzeInput): Promise<AdAnalysisResult | null> {
  if (process.env.OLLAMA_DISABLED === "1") return null;
  const { ollamaAnalyzeJson } = await import("@/lib/meta/ollamaCoach");
  const content = await ollamaAnalyzeJson({
    locale: input.locale,
    userPayload: analysisBrief(input),
    frames: input.frames,
  });
  if (!content) return null;
  const parsed = parseAiJson(content);
  if (!parsed) return null;
  return mergeParsed(parsed, heuristicAnalyze(input));
}

export async function analyzeAdCreative(input: AdAnalyzeInput): Promise<AdAnalysisResult> {
  const hook = input.hook.trim().slice(0, 300);
  const caption = input.caption.trim().slice(0, 2200);
  const script = input.script.trim().slice(0, 2200);
  const visualHook = input.visualHook.trim().slice(0, 400);
  const frames = (input.frames ?? [])
    .filter((f) => f.dataBase64 && f.dataBase64.length < 400_000)
    .slice(0, 3)
    .map((f) => ({
      mime: f.mime === "image/png" ? "image/png" : "image/jpeg",
      dataBase64: f.dataBase64,
    }));
  const audio =
    input.audio?.dataBase64 && input.audio.dataBase64.length < 1_200_000
      ? { mime: "audio/wav", dataBase64: input.audio.dataBase64 }
      : undefined;

  if (!hook && !caption && !script && frames.length === 0 && !audio) {
    throw new Error(
      input.locale === "ar"
        ? "ارفع صورة أو فيديو، أو اكتب هوك/كابشن."
        : "Upload a photo or video, or write a hook/caption.",
    );
  }

  const normalized: AdAnalyzeInput = {
    ...input,
    hook,
    caption,
    script,
    visualHook,
    frames,
    audio,
  };

  const preferGemini = Boolean(audio);
  const ai = preferGemini
    ? (await geminiAnalyze(normalized)) ?? (await openAiAnalyze(normalized)) ?? (await ollamaAnalyze(normalized))
    : (await openAiAnalyze(normalized)) ?? (await geminiAnalyze(normalized)) ?? (await ollamaAnalyze(normalized));
  return ai ?? heuristicAnalyze(normalized);
}

