/**
 * Ad Coach (Wave A) — psych + Meta-fit analysis with approval gate.
 * Does NOT spend ad budget. Marketing API launch is Wave C.
 */

export type PsychLever =
  | "curiosity_gap"
  | "prediction_break"
  | "scene"
  | "promise"
  | "authority"
  | "fomo"
  | "belonging"
  | "none";

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
};

export type AdAnalyzeInput = {
  locale: "ar" | "en";
  hook: string;
  caption: string;
  script: string;
  visualHook: string;
  context: AdPerformanceContext;
};

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
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
  if (input.hook.trim().length < 8) {
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
      : `ليش تدفع أغلى و${product} يوصلك والدفع عند الباب؟`
    : input.hook.trim().length > 8
      ? `Wait — ${input.hook.trim().slice(0, 60)}`
      : `Why overpay when ${product} arrives COD to your door?`;

  const suggestedCaption = ar
    ? `${suggestedHook}\n\n${product}${price ? ` — ${price}` : ""}.\nدفع عند الاستلام. اضغط الراسلنا على واتساب واكتب: نعم`
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
  };
}

function parseAiJson(content: string): Partial<AdAnalysisResult> | null {
  try {
    return JSON.parse(content) as Partial<AdAnalysisResult>;
  } catch {
    return null;
  }
}

async function openAiAnalyze(input: AdAnalyzeInput): Promise<AdAnalysisResult | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const ar = input.locale === "ar";
  const system = ar
    ? `أنت مدقق إعلانات Meta/Instagram لتجار COD في الخليج. حلّل نفسياً (فجوة فضول، كسر توقع، مشهد، وعد، سلطة، FOMO، انتماء) ووافق خوارزمية ميتا (هوك 0–3ث، CTA واتساب، تنوع إبداعي). أعد JSON فقط بالمفاتيح: scores{hookStrength,psychFit,metaAlgorithmFit,ctaClarity,overall 0-10}, leversDetected[], issues[], opportunities[], predicted{interestLift low|medium|high, confidence low|medium|high, note}, suggestedHook, suggestedCaption, suggestedScript, suggestedVisualHook, suggestedCta, rationale. لا تعد برواد مضمون.`
    : `You are a Meta/Instagram ads auditor for Gulf COD merchants. Analyze psychology levers and Meta algorithm fit (0–3s hook, WhatsApp CTA). Return JSON only with keys: scores{hookStrength,psychFit,metaAlgorithmFit,ctaClarity,overall}, leversDetected[], issues[], opportunities[], predicted{interestLift,confidence,note}, suggestedHook, suggestedCaption, suggestedScript, suggestedVisualHook, suggestedCta, rationale. Never promise ROAS.`;

  const user = JSON.stringify({
    hook: input.hook,
    caption: input.caption,
    script: input.script,
    visualHook: input.visualHook,
    performanceContext: input.context,
  });

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
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = parseAiJson(content);
    if (!parsed?.suggestedHook || !parsed?.scores) return null;

    const fallback = heuristicAnalyze(input);
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
    };
  } catch {
    return null;
  }
}

export async function analyzeAdCreative(input: AdAnalyzeInput): Promise<AdAnalysisResult> {
  const hook = input.hook.trim().slice(0, 300);
  const caption = input.caption.trim().slice(0, 2200);
  const script = input.script.trim().slice(0, 2200);
  const visualHook = input.visualHook.trim().slice(0, 400);

  if (!hook && !caption && !script) {
    throw new Error(input.locale === "ar" ? "أدخل هوك أو كابشن أو سكريبت على الأقل." : "Enter at least a hook, caption, or script.");
  }

  const normalized: AdAnalyzeInput = {
    ...input,
    hook,
    caption,
    script,
    visualHook,
  };

  const ai = await openAiAnalyze(normalized);
  return ai ?? heuristicAnalyze(normalized);
}
