import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { sanitizePlainText } from "@/lib/security/inputSanitizer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
}

export interface AssistantActionPayload {
  type:
    | "navigate"
    | "open_products"
    | "open_store_builder"
    | "trigger_simulation"
    | "calculate_profit"
    | "open_kyc"
    | "open_storefront"
    | "open_creator_hub"
    | "open_wallet"
    | "open_ads"
    | "open_admin"
    | "open_free_plan"
    | "open_pro_plan"
    | "open_pricing"
    | "open_compare"
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
You are the official conversational AI Assistant, Lead Advisor, and Autonomous Operator for "Growlab" (شبكة Growlab الذكية للتجارة الإلكترونية والتوزيع بالدفع عند الاستلام COD في سلطنة عُمان ودول الخليج).

Your core persona:
- Highly articulate, persuasive, friendly, professional, and commercial-minded.
- Fluent and natural in Arabic (default) or English if the user prompts in English.
- You deeply understand every single aspect of Growlab, its unique value proposition, competitive advantages, pricing plans, and workflows.
- Always provide structured, compelling, and actionable responses (using bullet points and emojis where suitable) that inform and convince the merchant or creator.
- When explaining the platform concept or making comparisons, highlight the pain points Growlab solves (no upfront ad waste, free clicks, payment only upon cash delivery, viral customer referral loop).
- When the user expresses interest in subscribing or testing:
  * If they want the FREE plan (الباقة المجانية 0 ر.ع.): praise their start, explain what is included (3 products, 1 active campaign, 100 OMR budget cap), and provide an action card pointing to the free signup (/enter/merchant or /dashboard).
  * If they want the PRO plan (باقة Pro بـ 15 ر.ع./شهر): highlight the unlimited power (unlimited products & campaigns, 2000 OMR cap, full AI Assistant), and provide an action card to upgrade (/dashboard/settings?tab=subscription).
  * If they ask about prices in general: clearly compare the Free vs Pro plan and provide buttons/suggestions.

==============================================
DEEP KNOWLEDGE BASE OF GROWLAB:
==============================================

1. **CORE PLATFORM CONCEPT (فكرة المنصة)**:
   - Growlab is an innovative performance-based commerce and distribution network built specifically for Cash on Delivery (COD) markets in Oman and the GCC.
   - **The Big Problem it solves**: Traditional merchants spend hundreds/thousands of Rials upfront on social media ads, clicks, and marketing agencies, only to suffer high Return-to-Origin (RTO) cancellation rates where couriers return packages and the merchant loses all ad spend.
   - **The Growlab Breakthrough**:
     * **Clicks are 100% FREE (النقرة مجاناً)**: You never pay for impressions or empty clicks.
     * **Pay Only on Verified Cash Collection (دفع بعد تحصيل النقد)**: Performance commission is deducted from your budget cap ONLY after the customer receives the goods, pays the courier in cash, and the merchant confirms the cash in the ledger.
     * **Smart Budget Cap (سقف ميزانية ذكي)**: You set the maximum spend limit. When exhausted, campaigns pause automatically with zero surprise bills.
     * **Viral Customer Referral Loop (حلقة التوزيع الفيروسي)**: Satisfied buyers receive a unique tracking link and can share UGC videos or links with friends to earn a commission, driving the next sale for the merchant.
     * **Zero-Code Visual Block Builder**: Build a stunning storefront in minutes with 1-click COD checkout.
     * **Net Bank Profit Tracking (شلال الأرباح الصافية)**: Real-time calculation of net profit = Selling Price - (COGS + Meta/TikTok Ad Spend + RTO Protection + Delivery Fees).

2. **COMPETITIVE COMPARISONS (المقارنات التنافسية ولماذا تختار Growlab)**:
   - **Growlab vs Traditional Store Platforms (Salla / Zid / Shopify)**:
     * *Other platforms*: Give you an empty store template; you must independently spend heavily on outside ads and manage agencies with zero distribution help.
     * *Growlab*: Provides the store + an active performance distribution network of creators and referring buyers, tied directly to COD cash collection and RTO risk mitigation.
   - **Growlab vs Direct Meta & TikTok Ads**:
     * *Direct Ads*: Charge you for impressions/clicks even if nobody orders or the courier is rejected at the doorstep.
     * *Growlab*: Clicks are free; marketing fees are deducted strictly after cash delivery.
   - **Growlab vs Marketing Agencies & Influencers**:
     * *Agencies*: Expensive upfront retainers with vague vanity metrics.
     * *Growlab*: Transparent open ledger where every Rial is tied to verified bank collections, and UGC content requires your approval before release.

3. **PLANS & PRICING (الباقات والأسعار)**:
   - **Free Plan (الباقة المجانية - 0 ر.ع./شهر)**:
     * Price: 0 OMR / month forever, no credit card required.
     * Features: Complete online store, up to 3 products, 1 active campaign, budget cap up to 100 OMR, 8 media files per product, manual visual store builder.
     * Best for: New merchants & entrepreneurs wanting to test their product and achieve initial sales with zero financial risk.
     * Target URL: /enter/merchant or /dashboard
   - **Pro Plan (باقة Pro الاحترافية - 15 ر.ع./شهر)**:
     * Price: 15 OMR / month (cancel anytime).
     * Features: Unlimited products, unlimited active campaigns, expanded budget cap up to 2,000 OMR, full AI Smart Assistant & store offers engine, unlimited media uploads, priority in creator sample catalog.
     * Best for: Scaling businesses, brands with multiple product lines, and high-volume COD merchants.
     * Target URL: /dashboard/settings?tab=subscription

4. **KEY MODULES & NAVIGATION**:
   - Products Management: /dashboard/products
   - Visual Block Store Builder: /dashboard/store/edit
   - Live Sales Stream & Order Simulator: /dashboard?tab=simulator
   - Financial Command Center & Net Profit: /dashboard?tab=command
   - Identity & KYC Verification (Blue Badge): /dashboard/verification
   - Creator & Affiliate Samples Catalog: /dashboard/browse
   - Wallet, Escrow & Payouts: /dashboard/wallet
   - Ads & Pixel Tracking: /dashboard/ads
   - Subscription & Billing: /dashboard/settings?tab=subscription
   - Public Demo COD Storefront: /m/muttrah-attars

==============================================
RESPONSE GUIDELINES:
==============================================
Output MUST BE STRICT JSON with the following structure:
{
  "text": "Your persuasive, clear, structured Arabic reply...",
  "action": {
    "type": "open_free_plan" | "open_pro_plan" | "open_pricing" | "open_compare" | "open_products" | "open_store_builder" | "trigger_simulation" | "calculate_profit" | "open_kyc" | "open_storefront" | "open_creator_hub" | "open_wallet" | "open_ads" | "navigate",
    "titleAr": "عنوان الإجراء بالعربية",
    "titleEn": "Action Title in English",
    "descriptionAr": "وصف موجز لما سيتم فتحه أو تنفيذه فوراً",
    "descriptionEn": "Brief description of the action",
    "targetUrl": "/url-path",
    "targetTab": "simulator" (optional),
    "autoExecute": false,
    "metadata": { ... }
  },
  "suggestions": ["سؤال مقترح 1", "سؤال مقترح 2", "سؤال مقترح 3"]
}

Always return valid JSON only without enclosing backticks or markdown fences.
`;

function buildSmartFallback(message: string): AssistantChatResponse {
  const q = message.trim().toLowerCase();

  // 1. Core Platform Concept & Vision (ايش فكرة المنصة، ما هي growlab، كيف تعمل، فكرة المشروع...)
  if (
    /فكرة|ايش المنصة|ماهي المنصة|ما هي المنصة|عن المنصة|عن growlab|ماذا تقدم|ايش تسوي|كيف تشتغل المنصة|نبذة|concept|about/i.test(
      q
    )
  ) {
    return {
      text: `منصة **Growlab** هي أول شبكة تجارة وتوزيع أدائي ذكية قائمة على الدفع عند الاستلام (COD) في سلطنة عُمان ودول الخليج. 🚀\n\n💡 **المشكلة التي نحلها**:\nفي التجارة التقليدية، يدفع التاجر مبالغ طائلة مقدماً على إعلانات السوشيال ميديا والنقرات، ثم يتفاجأ برفض الزبائن استلام الطلبات عند وصول المندوب (خسائر المرتجع RTO).\n\n✨ **حل Growlab المبتكر**:\n1️⃣ **النقرة مجاناً تماماً**: لا تدفع أي مبالغ مقابل الزيارات أو النقرات.\n2️⃣ **الدفع بعد التحصيل الفعلي**: عمولة التسويق تُخصم فقط بعد استلام العميل للطلب ودفع قيمته نقداً للمندوب وتأكيدك لدخول النقد.\n3️⃣ **سقف ميزانية ذكي (Budget Cap)**: تحدد سقف الصرف بنفسك، ويتوقف تلقائياً عند انتهائه دون أي فواتير مفاجئة.\n4️⃣ **حلقة التوزيع الفيروسي**: بعد كل عملية شراء ناجحة، يحصل الزبون على رابط تتبع فريد لمشاركته مع أصدقائه لكسب عمولة، مما يجلب لك المبيعة التالية تلقائياً.\n5️⃣ **كل الأدوات في مكان واحد**: محرر متجر بالبلوكات، دفع سريع بضغطة زر، محاكي مبيعات حي، وتوثيق موثوق بالشارة الزرقاء.`,
      action: {
        type: "open_free_plan",
        titleAr: "البدء مجاناً وتجربة المنصة (0 ر.ع.)",
        titleEn: "Start for Free (0 OMR)",
        descriptionAr: "إنشاء حسابك وتجربة المتجر والحملات بدون أي رسوم تسجيل",
        descriptionEn: "Create account and test features with zero fees",
        targetUrl: "/enter/merchant",
        autoExecute: false,
      },
      suggestions: [
        "ما الفرق بين Growlab ومنصات مثل سلة وشوبيفاي؟",
        "كم أسعار الباقات وما الفرق بين المجانية و Pro؟",
        "كيف أضيف منتج جديد لمتجري؟",
        "شغّل محاكي المبيعات الحية",
      ],
    };
  }

  // 2. Competitor Comparisons & Persuasion (مقارنة مع سلة، زد، شوبيفاي، إعلانات ميتا، ليش اختاركم...)
  if (
    /مقارن|سلة|زد|شوبيفاي|shopify|salla|zid|ليش اختاركم|لماذا growlab|مقارنة|الفرق بينكم/i.test(
      q
    )
  ) {
    return {
      text: `إليك مقارنة صريحة توضح لماذا يفضل التجار Growlab:\n\n🏬 **مقابل منصات المتاجر التقليدية (مثل سلة، زد، شوبيفاي)**:\n• **تلك المنصات**: تمنحك قالباً فارغاً فقط، وتتركك وحدك تموّل إعلانات باهظة وتلاحق وكالات التسويق ومخاطر إلغاء الطلبات.\n• **Growlab**: تمنحك المتجر + شبكة توزيع أدائي نشطة من المسوقين وصناع المحتوى وزبائنك الراضين، مع نظام حماية مدمج للدفع عند الاستلام.\n\n📱 **مقابل إعلانات السوشيال ميديا المباشرة (Meta & TikTok Ads)**:\n• **الإعلانات التقليدية**: تخصم فلوسك مقدماً على مجرد المشاهدات والنقرات حتى لو لم يشترِ أحد.\n• **Growlab**: النقرة مجاناً، ولا تدفع عمولة تسويق إلا بعد تحصيل الكاش في يد المندوب.\n\n🛡️ **أمان مالي كامل**: سقف ميزانية ثابت + دفتر محاسبي شفاف يضمن عدم ضياع أي بيسة.`,
      action: {
        type: "open_compare",
        titleAr: "معاينة جدول المقارنة والضمانات المالية",
        titleEn: "View Detailed Platform Comparison",
        descriptionAr: "اكتشف الفروقات الجوهرية وكيف توفر ميزانيتك مع Growlab",
        descriptionEn: "See why performance-based distribution wins",
        targetUrl: "/#compare",
        autoExecute: false,
      },
      suggestions: [
        "أريد الاشتراك في الباقة المجانية",
        "ما هي ميزات باقة Pro المدفوعة؟",
        "احسب لي صافي أرباح حملة إعلانية",
        "جرّب متجر المشتري الحقيقي",
      ],
    };
  }

  // 3. Subscription Plans & Pricing - General (الأسعار، الباقات، الاشتراكات، كم يكلف...)
  if (
    /باقات|باقة|سعر|أسعار|اسعار|اشتراك|تكلفة|كم السعر|plans|pricing|subscription|cost/i.test(
      q
    ) &&
    !/مجاني|free/i.test(q) &&
    !/برو|مدفوع|pro/i.test(q)
  ) {
    return {
      text: `توفر Growlab خطتين واضحتين تناسبان جميع أحجام الأعمال:\n\n🟢 **1. الباقة المجانية (Free Plan - 0 ر.ع./شهر)**:\n• التكلفة: **0 ريال عماني** بدون رسوم تسجيل وبدون بطاقة ائتمانية.\n• متجر متكامل بالبلوكات المرئية.\n• حتى 3 منتجات في الكتالوج.\n• حملة توزيع نشطة واحدة بسقف صرف حتى 100 ر.ع.\n• 8 وسائط لكل منتج.\n• *مثالية للبدء واختبار إقبال الزبائن بدون مخاطرة.*\n\n⭐ **2. باقة Pro الاحترافية (15 ر.ع./شهر)**:\n• التكلفة: **15 ر.ع. شهرياً** (إلغاء في أي وقت).\n• منتجات غير محدودة.\n• حملات توزيع نشطة غير محدودة.\n• سقف صرف يرتفع حتى 2,000 ر.ع.\n• المساعد الذكي بالذكاء الاصطناعي لكتابة النصوص وتحسين المتجر.\n• وسائط غير محدودة وأولوية في كتالوج عينات المسوقين.\n• *مثالية للشركات والمتاجر المتنامية لتوسيع المبيعات بأعلى طاقة.*`,
      action: {
        type: "open_pricing",
        titleAr: "الانتقال لصفحة الباقات والاشتراكات",
        titleEn: "View Pricing Plans",
        descriptionAr: "اختر الباقة المناسبة لمتجرك وابدأ فوراً",
        descriptionEn: "Select Free or Pro plan to launch",
        targetUrl: "/#pricing",
        autoExecute: false,
      },
      suggestions: [
        "أريد الاشتراك في الباقة المجانية (0 ر.ع.)",
        "أريد الترقية لباقة Pro (15 ر.ع./شهر)",
        "كيف أضيف منتج جديد لمتجري؟",
        "كيف تعمل عمولة المشاركة؟",
      ],
    };
  }

  // 4. Free Plan Subscription (اريد اشترك مجانا، الباقة المجانية، ابدأ مجانا...)
  if (
    /مجاني|باقة مجانية|اشتراك مجاني|ابدأ مجانا|free plan|free/i.test(q)
  ) {
    return {
      text: `اختيار ممتاز! 🎉 يمكنك بدء تجارتك على Growlab الآن عبر **الباقة المجانية (0 ر.ع./شهر)** مدى الحياة بدون أي رسوم خفية وبدون طلب بطاقة بنكية.\n\n📦 **ما تتضمنه باقتك المجانية فوراً**:\n• متجرك الإلكتروني المخصص الجاهز للدفع عند الاستلام COD.\n• إضافة حتى 3 منتجات مع صور وتفاصيل كاملة.\n• إطلاق أول حملة توزيع أدائي بسقف صرف حتى 100 ر.ع.\n• لوحة تحكم لمتابعة الطلبات والأرباح الصافية.\n\nاضغط على الزر أدناه لتفعيل حسابك المجاني والبدء فوراً! 🚀`,
      action: {
        type: "open_free_plan",
        titleAr: "تفعيل الباقة المجانية والبدء الآن (0 ر.ع.)",
        titleEn: "Activate Free Plan (0 OMR)",
        descriptionAr: "إنشاء حساب تاجر مجاني والبدء بإضافة أول منتج",
        descriptionEn: "Create free merchant account instantly",
        targetUrl: "/enter/merchant",
        autoExecute: false,
      },
      suggestions: [
        "كيف أضيف منتج جديد بعد التسجيل؟",
        "كيف أصمم متجري بالبلوكات؟",
        "ما الفرق لو قررت الترقية لباقة Pro مستقبلاً؟",
        "شغّل محاكي المبيعات",
      ],
    };
  }

  // 5. Pro Plan Subscription / Upgrade (اريد باقة برو، باقة pro، الباقة المدفوعة، الترقية...)
  if (
    /برو|مدفوع|باقة pro|باقة برو|ترقية|اشتراك برو|pro plan|upgrade/i.test(q)
  ) {
    return {
      text: `رائع جداً! 🌟 **باقة Pro (15 ر.ع./شهر)** تمنح متجرك القوة الكاملة لزيادة المبيعات والتوسع السريع:\n\n💎 **مزايا باقة Pro الحصرية**:\n• **منتجات غير محدودة**: أضف كل كتالوج منتجاتك بلا أي قيود.\n• **حملات غير محدودة**: أطلق حملات متعددة لجميع خطوط إنتاجك.\n• **سقف صرف مضاعف**: يصل إلى 2,000 ر.ع. لاستقبال مئات الطلبات اليومية.\n• **مساعد الذكاء الاصطناعي**: إنشاء أوصاف المنتجات وعروض المتجر تلقائياً.\n• **أولوية الظهور للمسوقين**: إبراز منتجاتك في صدارة كتالوج العينات لصناع المحتوى.\n• **وسائط غير محدودة**: رفع فيديوهات وصور عالية الدقة لكل منتج.\n\nيمكنك الاشتراك أو الترقية لباقة Pro مباشرة بضغطة زر أدناه (مع إمكانية الإلغاء في أي وقت).`,
      action: {
        type: "open_pro_plan",
        titleAr: "الترقية إلى باقة Pro الاحترافية (15 ر.ع./شهر)",
        titleEn: "Upgrade to Pro Plan (15 OMR/mo)",
        descriptionAr: "فتح كافة الميزات والمنتجات غير المحدودة والذكاء الاصطناعي",
        descriptionEn: "Unlock unlimited products, campaigns, and full AI tools",
        targetUrl: "/dashboard/settings?tab=subscription",
        autoExecute: false,
      },
      suggestions: [
        "ما هي طرق الدفع المتاحة للاشتراك؟",
        "كيف أحسب صافي أرباحي مع زيادة المبيعات؟",
        "كيف أتيح عينات مجانية للمسوقين؟",
        "افتح مركز قيادة الأرباح",
      ],
    };
  }

  // 6. Greetings & Friendly Small Talk (مرحبا، أهلاً، سلام، صباح الخير...)
  if (
    /^(مرحبا|مرحباً|هلا|أهلا|أهلاً|سلام|السلام عليكم|صباح الخير|مساء الخير|هاي|hi|hello|hey|welcome|howdy)\b/i.test(
      q
    ) ||
    /^(من انت|من أنت|شو تسوي|ماذا تفعل|كيف تساعدني|مين انت|who are you)/i.test(
      q
    )
  ) {
    return {
      text: "أهلاً وسهلاً بك! 👋 يسعدني جداً التحدث معك. أنا مساعد Growlab الذكي ومستشارك التجاري والمنفّذ المباشر لمهامك على المنصة.\n\nيمكنني مساعدتك في كل ما يخص تجارتك: شرح فكرة المنصة ومقارنتها بالبدائل، اختيار الباقة الأنسب لك (المجانية أو Pro)، بناء متجرك بالبلوكات، إضافة المنتجات، تشغيل محاكي المبيعات، توثيق الحساب بالشارة الزرقاء، أو احتساب صافي أرباحك الحقيقية. كيف تحب أن نبدأ اليوم؟",
      action: {
        type: "open_free_plan",
        titleAr: "استكشاف المنصة والبدء مجاناً",
        titleEn: "Explore Platform & Start Free",
        descriptionAr: "تجربة ميزات Growlab المبتكرة بدون أي تكلفة",
        descriptionEn: "Experience next-gen performance distribution",
        targetUrl: "/enter/merchant",
        autoExecute: false,
      },
      suggestions: [
        "ايش فكرة المنصة وكيف تختلف عن سلة وشوبيفاي؟",
        "ما هي باقات الاشتراك والأسعار؟",
        "كيف أضيف منتج جديد لمتجري؟",
        "احسب لي صافي أرباح حملة إعلانية",
      ],
    };
  }

  // 7. How to add a product (كيف أضيف منتج، إضافة منتج، منتجات...)
  if (
    /كيف.*(أضيف|اضيف|نضيف|احط|انزل|انشر).*(منتج|بضاعة|سلعة)/i.test(q) ||
    /إضافة منتج|اضافة منتج|اضف منتج|أضف منتج|رفع منتج|منتج جديد|add.*product/i.test(
      q
    )
  ) {
    return {
      text: "لإضافة منتج جديد إلى متجرك في Growlab، اتبع الخطوات البسيطة التالية:\n\n1️⃣ **الدخول لصفحة المنتجات**: من القائمة الجانبية أو بالضغط على الزر أدناه.\n2️⃣ **الضغط على «إضافة منتج جديد»** في أعلى الصفحة.\n3️⃣ **إدخال البيانات الأساسية**: اسم المنتج، الوصف الجذاب، والتصنيف المناسب.\n4️⃣ **رفع الوسائط**: أضف صوراً واضحة وفيديوهات قصيرة للمنتج لزيادة ثقة المشتري.\n5️⃣ **تسعير المنتج وتكلفة البضاعة (COGS)**: حدد سعر البيع وسعر التكلفة ليقوم النظام بحساب هامش الربح وصافي الأرباح التلقائي بعد خصم الإعلانات.\n6️⃣ **تحديد المخزون وتفعيل خيار الدفع عند الاستلام (COD)** ثم اضغط **حفظ ونشر** ليظهر فوراً في واجهة متجرك وكتالوج المسوقين.",
      action: {
        type: "open_products",
        titleAr: "فتح شاشة إدارة وإضافة المنتجات",
        titleEn: "Open Products Management",
        descriptionAr: "الانتقال المباشر لصفحة المنتجات لإضافة وتعديل مخزونك",
        descriptionEn: "Direct navigation to add and manage your product catalog",
        targetUrl: "/dashboard/products",
        autoExecute: false,
      },
      suggestions: [
        "كيف أربط المنتج بمحرر المتجر بالبلوكات؟",
        "كيف أحدد السعر المناسب وتكلفة الإعلانات؟",
        "كيف أحمي منتجاتي من خسائر المرتجع RTO؟",
        "كيف أتيح المنتج للمسوقين لطلب عينات؟",
      ],
    };
  }

  // 8. Build Store / Storefront Block Editor
  if (
    /متجر|ابن|بناء|تصميم|محرر|بلوك|store|builder|storefront|shop/i.test(q)
  ) {
    return {
      text: "محرر المتاجر في Growlab يتيح لك بناء واجهة متجر عصرية بالبلوكات المرئية بدون الحاجة لأي كود برمجي! يمكنك:\n\n• إضافة بانرات متحركة وعروض ترويجية.\n• ترتيب شبكات المنتجات والأقسام.\n• إضافة عداد تنازلي ومؤقت عروض (FOMO).\n• عرض آراء وتقييمات العملاء الموثقة.\n• تفعيل زر الشراء السريع بالدفع عند الاستلام (COD) بنقرة واحدة.",
      action: {
        type: "open_store_builder",
        titleAr: "فتح محرر المتجر الذكي بالبلوكات",
        titleEn: "Open Visual Block Store Builder",
        descriptionAr: "الانتقال الفوري لمحرر المتجر وتخصيص البلوكات بلمسة واحدة",
        descriptionEn: "Instant redirect to visual storefront editor",
        targetUrl: "/dashboard/store/edit?fresh=1",
        autoExecute: false,
      },
      suggestions: [
        "كيف أضيف منتج جديد لمتجري؟",
        "كيف أفعل الدفع عند الاستلام COD؟",
        "جرّب متجر المشتري الحقيقي (مطرح للعطور)",
      ],
    };
  }

  // 9. Sales Simulation & Live Stream
  if (
    /محاكي|محاكاة|مبيعات|طلبات|طلب تجريبي|simulate|simulator|orders|stream/i.test(
      q
    )
  ) {
    return {
      text: "تم تجهيز محاكي المبيعات اللحظية! من خلاله يمكنك مشاهدة تدفق الطلبات الحية القادمة من مختلف المدن (مسقط، صلالة، الرياض، دبي...) ومعاينة احتساب صافي الأرباح البنكية فورياً بعد خصم تكلفة البضاعة ومصاريف إعلانات Meta وTikTok ونسبة المرتجعات.",
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
        "كيف يتم تحصيل مبالغ COD من شركات الشحن؟",
        "كيف أربط قنوات إعلانات Meta و TikTok؟",
      ],
    };
  }

  // 10. KYC & Verification / Blue Badge
  if (
    /توثيق|تحقق|سجل|هوية|شارة|ازرق|زرقاء|kyc|verify|verification|cr|badge/i.test(
      q
    )
  ) {
    const isCr = /سجل|cr|شركة|منشأة/i.test(q);
    return {
      text: `مركز التوثيق الذكي في Growlab يدعم مسارين سريعين:\n\n1️⃣ **مسار السجل التجاري (CR Track)**: للمنشآت والشركات المسجلة رسمياً.\n2️⃣ **مسار العمل الحر والمشاريع المنزلية (Home Business)**: يتطلب البطاقة الشخصية + مسح بيومتري للوجه (3D Face Liveness) + حساب التواصل الاجتماعي.\n\nتمنحك عملية التوثيق الشارة الزرقاء الموثوقة خلال 24 ساعة لرفع ثقة المشترين والمسوقين في متجرك.`,
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

  // 11. Net Profit Calculation / Financial Waterfall
  if (
    /ربح|أرباح|حساب|احسب|تكلفة|هامش|مصاريف|cogs|profit|margin|calculate/i.test(
      q
    )
  ) {
    return {
      text: "معادلة صافي الربح الحقيقي في Growlab تقوم باحتساب كل مليم يدخل حسابك البنكي بدقة:\n\n**صافي الربح = سعر البيع - (تكلفة البضاعة COGS + تكلفة إعلان Meta/TikTok لكل طلب + مخصص حماية المرتجع RTO + رسوم الشحن)**\n\nيمكنك تجربة الحاسبة المدمجة مباشرة بالأسفل لإدخال أرقام منتجك ومعاينة الربح المتوقع.",
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
        "كيف أضيف منتج جديد لمتجري؟",
      ],
    };
  }

  // 12. Creator Hub & Free Samples
  if (
    /مسوق|صانع محتوى|عينات|عينة|عمولة|تسويق بالعمولة|creator|affiliate|samples|browse/i.test(
      q
    )
  ) {
    return {
      text: "بصفتك صانع محتوى أو مسوّق بالعمولة في Growlab:\n\n• يمكنك تصفح كتالوج المنتجات وطلب عينات مجانية تصلك لباب بيتك.\n• توليد روابط إسناد وتتبع ذكية خاصة بك لمشاركتها على TikTok و Instagram.\n• تتبع عمولاتك المؤكدة التي تودع في محفظتك تلقائياً بمجرد استلام الزبون للطلب.",
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

  // 13. Buyer COD Experience
  if (
    /مشتري|زبون|شراء|طلب كعميل|checkout|cod|buyer|مشتريات/i.test(q)
  ) {
    return {
      text: "يمكنك الآن تجربة واجهة متجر المشتري الفعلي (متجر مطرح للعطور) واختبار سرعة تسجيل طلب بالدفع عند الاستلام COD بضغطة زر واحدة بدون تعقيدات أو بطاقات بنكية.",
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
        "كيف أضيف منتجات إلى متجري؟",
        "وجّهني لتوثيق الهوية",
      ],
    };
  }

  // 14. Ads & Integrations (Pixel, Meta, TikTok)
  if (
    /إعلانات|اعلان|بكسل|تيك توك|ميتا|فيسبوك|تتبع|ads|pixel|tiktok|meta|pixel/i.test(
      q
    )
  ) {
    return {
      text: "في منصة Growlab، يمكنك ربط بكسل تيك توك وMeta Events API بنقرة واحدة لتتبع دقيق للأحداث (ViewContent, AddToCart, Purchase) وقياس العائد الحقيقي على الإنفاق الإعلاني (ROAS) مباشرة في لوحة التحكم.",
      action: {
        type: "open_ads",
        titleAr: "فتح مركز تكامل الإعلانات والبكسل",
        titleEn: "Open Ads & Pixels Center",
        descriptionAr: "ربط بكسل Meta و TikTok وتتبع العائد الإعلاني بدقة",
        descriptionEn: "Integrate advertising pixels and track ad ROAS",
        targetUrl: "/dashboard/ads",
        autoExecute: false,
      },
      suggestions: [
        "كيف أحسب تكلفة الإعلانات لكل طلب؟",
        "احسب لي صافي أرباح حملة إعلانية",
        "كيف أضيف منتج جديد لمتجري؟",
      ],
    };
  }

  // 15. Wallet & Payouts
  if (
    /محفظة|سحب|فلوس|تحويل|بنك|أرباحي|تسوية|wallet|payout|balance/i.test(q)
  ) {
    return {
      text: "محفظة Growlab توفر لك تسوية مالية شفافة:\n\n• تحصيل مبالغ الدفع عند الاستلام COD من شركات الشحن ومطابقتها آلياً.\n• نظام الضمان المالي الموثوق (Escrow) لضمان حقوق التاجر والمسوق والمشتري.\n• إمكانية سحب الأرباح لحسابك البنكي المحلي في سلطنة عمان ودول الخليج بضغطة زر.",
      action: {
        type: "open_wallet",
        titleAr: "فتح المحفظة وسجل المعاملات المالية",
        titleEn: "Open Wallet & Financial Hub",
        descriptionAr: "معاينة الرصيد المتاح وسحب الأرباح لحسابك البنكي",
        descriptionEn: "View available balance and withdraw earnings",
        targetUrl: "/dashboard/wallet",
        autoExecute: false,
      },
      suggestions: [
        "كيف يتم تحصيل مبالغ COD؟",
        "احسب صافي الأرباح المتوقعة",
        "كيف أوثق حسابي البنكي؟",
      ],
    };
  }

  // Default Conversational Guidance
  return {
    text: "أهلاً بك! أنا هنا لمساعدتك في أي استفسار أو مهمة في Growlab.\n\nيمكنك سؤالي عن فكرة المنصة ومقارنتها بالبدائل، باقات الأسعار (المجانية أو Pro)، طريقة إضافة المنتجات، بناء المتجر بالبلوكات، أو احتساب صافي أرباحك بدقة. كيف تحب أن أساعدك الآن؟",
    action: {
      type: "open_free_plan",
      titleAr: "البدء مجاناً واستكشاف المنصة",
      titleEn: "Start for Free",
      descriptionAr: "تجربة كافة ميزات Growlab بدون رسوم تسجيل",
      descriptionEn: "Explore Growlab performance commerce",
      targetUrl: "/enter/merchant",
      autoExecute: false,
    },
    suggestions: [
      "ايش فكرة المنصة وكيف تختلف عن سلة وشوبيفاي؟",
      "ما هي باقات الاشتراك والأسعار؟",
      "كيف أضيف منتج جديد لمتجري؟",
      "شغّل محاكي المبيعات الحية",
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawMessage = body.message;
    const history = body.history;

    if (!rawMessage || typeof rawMessage !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const message = sanitizePlainText(rawMessage, 1000);
    if (!message) {
      return NextResponse.json(
        { error: "Invalid message content" },
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
            .slice(-8)
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

تعليمات الرد:
1. أجب بشكل دقيق، ودود، وواضح باللغة العربية خطوة بخطوة إذا كان السؤال استفساراً مفتوحاً (مثل: كيف أضيف منتج، كيف أبدأ، كيف أسحب أرباحي...).
2. إذا كان المستخدم يلقي التحية (مرحبا، سلام، صباح الخير)، رد عليه بلطف وحرارة واعرض عليه المجالات التي تستطيع مساعدته فيها.
3. قم بتوليد خيارات متابعة ملائمة تماماً للسياق في مصفوفة "suggestions".
4. قم بإرفاق بطاقة "action" المناسبة إن وجدت لتسهيل الانتقال بنقرة واحدة للشاشة المطلوبة.
5. الإخراج يجب أن يكون كائن JSON صالح فقط دون أي نصوص إضافية قبله أو بعده.
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
        // Validate minimum structure
        if (parsed && typeof parsed.text === "string") {
          return NextResponse.json({
            text: parsed.text,
            action: parsed.action || null,
            suggestions: Array.isArray(parsed.suggestions)
              ? parsed.suggestions
              : [
                  "كيف أضيف منتج جديد لمتجري؟",
                  "شغّل محاكي المبيعات",
                  "احسب صافي أرباح منتج",
                ],
          });
        }
        throw new Error("Invalid schema");
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

