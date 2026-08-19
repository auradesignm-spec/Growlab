import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/components/dashboard/types";

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
  return NextResponse.json({ status: "active", endpoint: "/api/agent/chat" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      companyName = "متجر مميز",
      category = "تجارة إلكترونية",
      agentName = "سالم — مستشار المبيعات",
      agentDialect = "omani",
      agentAutoDiscountMax = 10,
      products = [] as Product[],
      storePolicies = {
        shippingCost: 2,
        freeShippingAbove: 25,
        returnDays: 7,
        governoratesCovered: ["مسقط", "صلالة", "صحار", "نزوى", "صور", "البريمي", "عبري", "الرستاق"],
      },
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });
    }

    // Format products list for AI context
    const productsContext = (products as Product[])
      .map(
        (p) =>
          `• المنتج: ${p.name} | السعر: ${p.price} OMR/USD (التكلفة: ${p.cost}) | الفئة: ${p.category} | الضمان: ${p.warranty} | التوصيل: ${p.deliveryTime} | نقاط البيع: ${p.sellingPoints?.join("، ") || "جودة عالية"} | ملاحظات خاصة للوكيل: ${p.aiTrainingNotes || "لا توجد"}`
      )
      .join("\n");

    // Dialect guidance
    const dialectGuide: Record<string, string> = {
      omani: "اللهجة العمانية الودية الراقية واللبقة (استخدم كلمات مثل: هلا وغلا، فديتك، ولا يهمك طال عمرك، يوصلك لباب البيت، تستاهل كل خير، الحين نسجل طلبك).",
      gulf: "اللهجة الخليجية البيضاء الودية (هلا والله، من عيوني، أبشر بالسعد، يوصلك سريع، ما يكون خاطرك إلا طيب).",
      saudi: "اللهجة السعودية الحبيبة والمحببة (يا هلا والله، سم طال عمرك، أبشر بالخير، عيوني لك).",
      standard_arabic: "اللغة العربية الفصحى المبسطة والمهنية مع لمسة دفء وترحيب عالي.",
    };

    const selectedDialectPrompt = dialectGuide[agentDialect] || dialectGuide.omani;

    const systemInstruction = `
أنت الوكيل الذكي ومستشار المبيعات المعتمد (${agentName}) لمتجر (${companyName}) المتخصص في (${category}).
مهمتك الأساسية هي:
1. الرد الفوري والذكي على استفسارات العملاء على الواتساب وإقناعهم بالشراء وإغلاق الصفقات بأعلى معدل تحويل.
2. استخدام الأسلوب المحدد: ${selectedDialectPrompt}
3. إبراز مميزات المنتجات ومساعدة العميل في اختيار الأنسب له.
4. الرد بثقة على الأسئلة حول الأسعار، طرق الدفع، التوصيل والضمان.
5. سياسة التوصيل: سعر التوصيل ${storePolicies.shippingCost} والتوصيل مجاني للطلبات فوق ${storePolicies.freeShippingAbove}. المحافظات والمدن المغطاة: ${storePolicies.governoratesCovered.join("، ")}.
6. سياسة الخصم والتفاوض: الحد الأقصى المسموح لك بتقديمه عند تردد العميل أو طلب كميات هو ${agentAutoDiscountMax}% فقط من السعر الأصلي. لا تقدم الخصم مباشرة، بل استخدمه كحافز أخير لإتمام الطلب الآن.
7. تتبع السعر المتفق عليه (Price Negotiation Tracking): راقب سجل المحادثة كاملاً بدقة؛ إذا تفاوض العميل وعرضت عليه سعراً مخفضاً أو وافق الطرفان على سعر محدد (مثلاً: خصم من 25 إلى 22 ر.ع، أو عرض خاص لقطعتين بـ 40 ر.ع)، يجب عليك استنتاج وتسجيل آخر سعر تم الاتفاق عليه بدقة في حقل totalAmount و agreedFinalPrice.
8. طلب بيانات الشحن بلطف لتثبيت الطلب (الاسم الكريم، رقم الهاتف، الولاية/المدينة والحي).

قائمة المنتجات المتوفرة حالياً في المتجر:
${productsContext || "متوفر لدينا تشكيلة راقية من المنتجات مع ضمان ذهبي وتوصيل سريع."}

تعليمات إخراج البيانات في حال تأكيد العميل للطلب أو تقديم بياناته أو الاتفاق على السعر:
في نهاية ردك الحواري الودود، إذا قام العميل بتأكيد رغبته في الشراء أو ذكر اسمه أو مدينته أو وافق على السعر، أضف كود JSON مخفي بصيغة محددة تماماً كما يلي:
\`\`\`json
{
  "isOrderDetected": true,
  "customerName": "اسم العميل إن ذكره أو 'عميل واتساب'",
  "customerPhone": "رقم الهاتف إن ذكره أو ''",
  "city": "المدينة أو الولاية إن ذكرت أو 'مسقط'",
  "address": "تفاصيل العنوان إن ذكرت أو 'توصيل لباب المنزل'",
  "productName": "اسم المنتج المطلوب بدقة",
  "quantity": 1,
  "originalPrice": 25,
  "agreedFinalPrice": 22,
  "totalAmount": 22,
  "discountApplied": 3,
  "negotiationSummary": "تم الاتفاق على السعر النهائي 22 ر.ع بعد موافقة الطرفين",
  "status": "confirmed_by_ai"
}
\`\`\`
ملاحظة هامة جداً: يجب أن تعكس قيمة totalAmount و agreedFinalPrice بدقة آخر سعر تم الاتفاق عليه بينك وبين العميل بعد أي خصم أو تفاوض تم في المحادثة!
إذا لم يكن هناك طلب بعد (مجرد استفسار أو بداية محادثة)، اجعل الرد طبيعياً فقط بدون كود JSON أو اجعل isOrderDetected: false.
`.trim();

    // Build chat history for Gemini
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    // Add previous history
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.sender === "user") {
          contents.push({ role: "user", parts: [{ text: item.text }] });
        } else if (item.sender === "agent") {
          contents.push({ role: "model", parts: [{ text: item.text }] });
        }
      }
    }

    // Add the latest user message
    contents.push({ role: "user", parts: [{ text: message }] });

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const fullText = response.text || "مرحباً بك! يسعدني جداً خدمتك ومساعدتك في اختيار طلبك.";

    // Parse out JSON order if detected
    let extractedOrder: any = null;
    let cleanReply = fullText;

    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed && (parsed.isOrderDetected || parsed.productName)) {
          extractedOrder = parsed;
          // Clean the visible reply for the user
          cleanReply = fullText.replace(/```json[\s\S]*?```/, "").trim();
        }
      } catch (e) {
        console.error("Failed to parse AI order JSON:", e);
      }
    }

    return NextResponse.json({
      reply: cleanReply,
      extractedOrder: extractedOrder,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI Agent Chat Error:", error);
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء معالجة المحادثة",
        details: error?.message || String(error),
        reply: "أهلاً بك! أنا مستشارك هنا لمساعدتك فوراً، ما هو المنتج الذي تود الاستفسار عنه اليوم؟",
      },
      { status: 200 }
    );
  }
}
