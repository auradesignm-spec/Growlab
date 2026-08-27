import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
}

export interface AssistantActionPayload {
  type:
    | "navigate"
    | "open_store_builder"
    | "trigger_simulation"
    | "calculate_profit"
    | "open_kyc"
    | "open_storefront"
    | "open_creator_hub"
    | "open_admin"
    | "custom_task";
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  targetUrl?: string;
  targetTab?: string;
  autoExecute?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AssistantChatResponse {
  text: string;
  action?: AssistantActionPayload | null;
  suggestions?: string[];
}

const SYSTEM_PROMPT = `
You are the official AI Assistant and Autonomous Operator for "Growlab" (شبكة Growlab الذكية للتجارة الإلكترونية والتوزيع بالدفع عند الاستلام COD في عُمان ودول الخليج).

Your mission is two-fold:
1. GUIDANCE & ADVICE: Answer merchant, creator, and buyer questions with clear, friendly, and expert advice in fluent Arabic (default) or English if addressed in English.
2. AUTONOMOUS TASK EXECUTION: When the user asks you to perform a task on their behalf (e.g. build a store, launch sales simulation, verify KYC, calculate net profit, browse affiliate samples, place a test order), you must NOT hesitate. Confirm the execution enthusiastically and provide the structured action parameters.

Key Knowledge Base of Growlab:
- **Brandstack AI & Command Center (/dashboard?tab=command)**: Displays real bank-collected net profit after COGS, Meta/TikTok ad spend, and RTO (Return-to-Origin) losses.
- **Live Sales Simulator (/dashboard?tab=simulator)**: Real-time stream of incoming orders from Muscat, Salalah, Riyadh, Dubai, etc., updating profit metrics live.
- **Smart Visual Store Builder (/dashboard/store/edit)**: Block-based storefront editor. Zero-code customization with products, banners, reviews, and countdown timers.
- **Customer COD Storefront (/m/muttrah-attars)**: Ultra-fast 1-click Cash on Delivery checkout with zero friction.
- **KYC & Identity Verification (/dashboard/verification)**: Two tracks:
  1. Commercial Register (CR) track for registered entities.
  2. Home Business / Freelance track (National ID + 3D Biometric Face Liveness + Instagram/TikTok handles) with a 24-hour verified blue badge SLA.
- **Creator / Marketer Affiliate Hub (/dashboard/browse)**: Free sample catalog, instant unique attribution links, commission tracking upon customer delivery.
- **Escrow & Wallet System**: Instant bank payouts, COD cash reconciliation, and transparent financial ledger.

Response Format Guidelines:
- Keep your tone confident, helpful, professional, and agile.
- Whenever an action can be triggered or executed, return a structured JSON response with this exact schema:
{
  "text": "Your conversational answer in Arabic (or English)",
  "action": {
    "type": "navigate" | "open_store_builder" | "trigger_simulation" | "calculate_profit" | "open_kyc" | "open_storefront" | "open_creator_hub" | "open_admin",
    "titleAr": "عنوان الإجراء بالعربية",
    "titleEn": "Action Title in English",
    "descriptionAr": "وصف موجز لما سيتم تنفيذه فوراً",
    "descriptionEn": "Brief description of the executed action",
    "targetUrl": "/the-url-path",
    "targetTab": "simulator" (optional),
    "autoExecute": true or false,
    "metadata": { ... }
  },
  "suggestions": ["سؤال مقترح 1", "سؤال مقترح 2", "سؤال مقترح 3"]
}

If no specific tool/action is needed, you can set "action": null and still return valid JSON.
Always output valid JSON only.
`;

function buildSmartFallback(message: string): AssistantChatResponse {
  const q = message.toLowerCase();

  // 1. Build Store / Storefront Block Editor
  if (
    /متجر|ابن|بناء|تصميم|محرر|بلوك|store|builder|storefront|shop|منتج جديد/i.test(
      q
    )
  ) {
    return {
      text: "بالتأكيد! قمت بتجهيز محرر المتاجر الذكي لك بالبلوكات المرئية بدون الحاجة لكتابة كود. يمكنك إضافة البانرات، صور المنتجات، وتفعيل الدفع عند الاستلام فوراً.",
      action: {
        type: "open_store_builder",
        titleAr: "فتح محرر المتجر الذكي بالبلوكات",
        titleEn: "Open Visual Store Builder",
        descriptionAr:
          "الانتقال الفوري لمحرر المتجر وتخصيص البلوكات بلمسة واحدة",
        descriptionEn: "Instant redirect to visual storefront editor",
        targetUrl: "/dashboard/store/edit?fresh=1",
        autoExecute: false,
      },
      suggestions: [
        "كيف أضيف منتج جديد لمتجري؟",
        "كيف أفعل الدفع عند الاستلام COD؟",
        "جرّب متجر المشتري الحقيقي",
      ],
    };
  }

  // 2. Sales Simulation & Live Stream
  if (
    /محاكي|محاكاة|مبيعات|طلبات|طلب تجريبي|simulate|simulator|orders|stream/i.test(
      q
    )
  ) {
    return {
      text: "تم تفعيل محاكي المبيعات اللحظية بنجاح! سينقلك النظام الآن إلى شاشة تدفق الطلبات الحية واحتساب صافي الأرباح بعد خصم تكلفة البضاعة ومصاريف الإعلانات فوراً.",
      action: {
        type: "trigger_simulation",
        titleAr: "تشغيل محاكي المبيعات والطلبات الحية",
        titleEn: "Launch Live Sales Simulator",
        descriptionAr: "معاينة تدفق الطلبات واحتساب صافي الربح الحقيقي لحظة بلحظة",
        descriptionEn: "Simulate incoming orders and real-time net margins",
        targetUrl: "/dashboard?tab=simulator",
        targetTab: "simulator",
        autoExecute: true,
      },
      suggestions: [
        "احسب لي صافي أرباح حملة إعلانية",
        "كيف يتم تحصيل مبالغ COD؟",
        "كيف أربط قنوات إعلانات Meta و TikTok؟",
      ],
    };
  }

  // 3. KYC & Verification / Blue Badge
  if (
    /توثيق|تحقق|سجل|هوية|شارة|ازرق|زرقاء|kyc|verify|verification|cr|badge/i.test(
      q
    )
  ) {
    const isCr = /سجل|cr|شركة|منشأة/i.test(q);
    return {
      text: `يسعدني توجيهك إلى مركز التوثيق والتحقق الذكي! منصة Growlab تدعم مسارين: ${
        isCr
          ? "مسار المنشآت بالسجل التجاري الرسمي (CR)"
          : "مسار المشاريع المنزلية والعمل الحر بالبطاقة والمسح البيومتري للوجه"
      }. الشارة الزرقاء تصدر خلال 24 ساعة.`,
      action: {
        type: "open_kyc",
        titleAr: isCr
          ? "توثيق بالسجل التجاري الرسمي (CR Track)"
          : "توثيق المشاريع المنزلية والعمل الحر (Home Business)",
        titleEn: "Open KYC Verification Center",
        descriptionAr:
          "رفع وثائق الهوية والمسح البيومتري للحصول على الشارة الزرقاء",
        descriptionEn: "Complete verification to unlock verified blue badge",
        targetUrl: `/dashboard/verification?tab=${isCr ? "cr" : "home_business"}`,
        autoExecute: false,
      },
      suggestions: [
        "ما الفرق بين مسار السجل التجاري والعمل الحر؟",
        "هل أحتاج سجل تجاري لبدء البيع؟",
        "كم يستغرق اعتماد التوثيق؟",
      ],
    };
  }

  // 4. Net Profit Calculation / Financial Waterfall
  if (
    /ربح|أرباح|حساب|احسب|تكلفة|هامش|مصاريف|cogs|profit|margin|calculate/i.test(
      q
    )
  ) {
    return {
      text: "حاضر فوراً! إليك نموذج احتساب صافي الربح الحقيقي في Growlab: نقوم بطرح (تكلفة البضاعة COGS + تكلفة إعلانات Meta/TikTok لكل طلب + رسوم شحن المرتجع RTO) من سعر البيع الإجمالي.",
      action: {
        type: "calculate_profit",
        titleAr: "تشغيل حاسبة الأرباح الصافية التفاعلية",
        titleEn: "Launch Interactive Net Margin Calculator",
        descriptionAr: "تحديد سعر البيع والتكلفة لرؤية صافي الربح المحصل بالبنك",
        descriptionEn: "Calculate bank-collected profit after ad & delivery costs",
        targetUrl: "/dashboard?tab=command",
        targetTab: "command",
        metadata: {
          samplePrice: 25,
          sampleCogs: 7,
          sampleAdSpend: 4.5,
          sampleNetMargin: 11.2,
        },
      },
      suggestions: [
        "كيف أحمي متجري من خسائر المرتجع RTO؟",
        "افتح مركز قيادة الأرباح الصافية",
        "كيف أطلب عينة مجانية لمنتج؟",
      ],
    };
  }

  // 5. Creator Hub & Free Samples
  if (
    /مسوق|صانع محتوى|عينات|عينة|عمولة|تسويق بالعمولة|creator|affiliate|samples|browse/i.test(
      q
    )
  ) {
    return {
      text: "بصفتك صانع محتوى أو مسوّق، يمكنك تصفح كتالوج المنتجات وطلب عينات مجانية، وتوليد روابط تتبع وإسناد ذكية لمشاركتها على TikTok وInstagram وكسب عمولات مؤكدة بعد تسليم الطلب.",
      action: {
        type: "open_creator_hub",
        titleAr: "تصفح كتالوج العينات وروابط المسوقين",
        titleEn: "Browse Affiliate Samples Catalog",
        descriptionAr: "طلب عينات مجانية وتوليد روابط التتبع المباشرة",
        descriptionEn: "Request samples and generate custom attribution links",
        targetUrl: "/dashboard/browse",
        autoExecute: false,
      },
      suggestions: [
        "كيف أحصل على عمولتي بعد تسليم الطلب؟",
        "أريد بناء متجري الخاص كتاجر",
        "شغّل محاكي المبيعات",
      ],
    };
  }

  // 6. Buyer COD Experience
  if (
    /مشتري|زبون|شراء|طلب كعميل|checkout|cod|buyer|مشتريات/i.test(
      q
    )
  ) {
    return {
      text: "يمكنك الآن تجربة واجهة متجر المشتري الفعلي (متجر مطرح للعطور) واختبار سرعة تسجيل طلب بالدفع عند الاستلام COD بضغطة زر واحدة ومتابعة تجربة ما بعد الشراء.",
      action: {
        type: "open_storefront",
        titleAr: "فتح واجهة متجر المشتري (تجربة COD)",
        titleEn: "Open Buyer COD Storefront",
        descriptionAr: "معاينة صفحة الشراء السريعة وتجربة الطلب كزبون",
        descriptionEn: "Experience frictionless buyer COD checkout",
        targetUrl: "/m/muttrah-attars",
        autoExecute: false,
      },
      suggestions: [
        "كيف يمنع Growlab إلغاء طلبات الدفع عند الاستلام؟",
        "ابنِ متجري الخاص الآن",
        "وجّهني لتوثيق الهوية",
      ],
    };
  }

  // Default Guidance
  return {
    text: "أهلاً بك! أنا مساعد Growlab الذكي والمنفّذ المباشر لمهامك. يمكنني توجيهك في أي خطوة، أو تنفيذ مهام كاملة نيابة عنك مثل: بناء متجرك بالبلوكات، محاكاة المبيعات الحية، توثيق حسابك، أو احتساب صافي أرباحك.",
    action: {
      type: "navigate",
      titleAr: "الانتقال إلى لوحة التحكم الرئيسية",
      titleEn: "Go to Main Dashboard Hub",
      descriptionAr: "استكشاف كافة ميزات المنصة والأرباح والمخزون",
      descriptionEn: "Explore platform features, profits, and inventory",
      targetUrl: "/dashboard?tab=command",
      autoExecute: false,
    },
    suggestions: [
      "شغّل محاكي المبيعات اللحظية",
      "ابنِ لي متجر عطور بالبلوكات",
      "وجّهني لتوثيق الهوية والشارة الزرقاء",
      "احسب لي صافي أرباح منتج",
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallback = buildSmartFallback(message);
      return NextResponse.json(fallback);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Format recent history if provided
      const conversationContext = Array.isArray(history)
        ? history
            .slice(-6)
            .map(
              (h: ChatMessage) =>
                `${h.role === "user" ? "المستخدم" : "المساعد"}: ${h.content}`
            )
            .join("\n")
        : "";

      const prompt = `
${SYSTEM_PROMPT}

سياق المحادثة السابقة:
${conversationContext}

رسالة المستخدم الحالية:
${message}

قم بالرد بصيغة JSON مطابقة تماماً للمواصفات السابقة.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const responseText = response.text?.trim() || "";

      try {
        const parsed = JSON.parse(responseText);
        return NextResponse.json(parsed);
      } catch {
        // If JSON parsing fails, wrap the text into standard structure
        const fallback = buildSmartFallback(message);
        return NextResponse.json({
          text: responseText || fallback.text,
          action: fallback.action,
          suggestions: fallback.suggestions,
        });
      }
    } catch {
      // Graceful fallback to deterministic assistant response
      const fallback = buildSmartFallback(message);
      return NextResponse.json(fallback);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
