export const NEED_SURVEY_KEY = "gl.needSurvey.v6";

export function surveyIsDone(): boolean {
  try {
    return localStorage.getItem(NEED_SURVEY_KEY) === "done";
  } catch {
    return false;
  }
}

export function markSurveyDone() {
  try {
    localStorage.setItem(NEED_SURVEY_KEY, "done");
  } catch {
    /* ignore */
  }
}

export function resetSurvey() {
  try {
    localStorage.removeItem(NEED_SURVEY_KEY);
  } catch {
    /* ignore */
  }
}

export type SurveyMode = "real" | "demo";
export type SurveyCR = "cr_yes" | "cr_no" | "creator";
export type SurveyProduct = "physical" | "food_homemade" | "digital_services";
export type SurveyChannel = "whatsapp_chat" | "existing_store" | "starting_fresh";
export type SurveyGoal =
  | "competitor_radar"
  | "silent_leaks"
  | "stop_returns"
  | "pay_after_cash"
  | "launch_fast_store";

export const SURVEY_MODES = [
  {
    id: "real" as const,
    ar: "تجربة فعلية حية (Real Setup)",
    en: "Real Production Mode",
    descAr: "أريد إعداد متجري الفعلي، إضافة منتجاتي وروابط حساباتي، والبدء في البيع الفعلي واستقبال الطلبات.",
    descEn: "Setup my live store, add real products & social accounts, and start taking real customer orders.",
  },
  {
    id: "demo" as const,
    ar: "تجربة الديمو الاستكشافية (Interactive Sandbox)",
    en: "Interactive Demo Sandbox",
    descAr: "أريد تجربة استكشافية تفاعلية ببيانات محاكاة حية، طلبات وهمية، وتجربة الشراء قبل إدخال بياناتي.",
    descEn: "Test the platform with simulated live orders, preloaded catalog, and interactive buyer checkout first.",
  },
];

export const SURVEY_CR = [
  {
    id: "cr_yes" as const,
    ar: "منشأة تجارية بسجل تجاري رسمي (CR)",
    en: "Registered Business with Commercial Register (CR)",
    descAr: "لدي سجل تجاري معتمد وشركة قائمة أريد ربطها بالمنصة مع إمكانية إصدار الفواتير الرسمية.",
    descEn: "I have an officially registered business entity with CR certificate and company bank account.",
  },
  {
    id: "cr_no" as const,
    ar: "مشروع منزلي / عمل حر (بدون سجل تجاري)",
    en: "Home Business / Freelancer (No CR required)",
    descAr: "أعمل من المنزل أو بشكل حر، وأريد مسار توثيق مبسط بالبطاقة الشخصية وربط حسابات Instagram / TikTok.",
    descEn: "Home-based or indie business, using simplified ID verification and Instagram/TikTok accounts.",
  },
  {
    id: "creator" as const,
    ar: "صانع محتوى / مسوّق بالعمولة (Creator)",
    en: "Creator / Influencer Marketer",
    descAr: "أريد استكشاف المنتجات، طلب العينات، تسويقها لمتابعيني وكسب عمولات مؤكدة بعد التحصيل.",
    descEn: "I want to discover products, request samples, promote to my audience, and earn commissions.",
  },
];

export const SURVEY_PRODUCTS = [
  {
    id: "physical" as const,
    ar: "منتجات ملموسة (عطور، أزياء، إلكترونيات، كماليات...)",
    en: "Physical Products (Fragrances, Fashion, Electronics...)",
    descAr: "منتجات تحتاج شحن وتوصيل، دفع عند الاستلام (COD)، وتتبع دقيق للمندوبين.",
    descEn: "Physical goods needing shipping, Cash-on-Delivery (COD), and courier tracking.",
  },
  {
    id: "food_homemade" as const,
    ar: "أطعمة ومخبوزات ومشروبات ومنتجات أسرية",
    en: "Homemade Food, Bakery & Artisanal Products",
    descAr: "منتجات طازجة تحتاج توصيل محلي سريع وطلب مباشر وسلس من الإنستجرام.",
    descEn: "Fresh or artisanal items needing quick local delivery and fast social ordering.",
  },
  {
    id: "digital_services" as const,
    ar: "منتجات رقمية / خدمات واستشارات",
    en: "Digital Products / Consultations & Services",
    descAr: "تسليم رقمي فوري، دفع إلكتروني آمن، وتحصيل مباشر.",
    descEn: "Instant digital delivery, secure online payments, and direct payout.",
  },
];

export const SURVEY_CHANNELS = [
  {
    id: "whatsapp_chat" as const,
    ar: "عبر محادثات الواتساب والإنستجرام دايركت (شات)",
    en: "WhatsApp Chat & Instagram Direct Messages",
    descAr: "الطلبات الحالية تضيع بين الرسائل والدفاتر وأريد صفحة منظمة تجمع الاسم والعنوان وتؤكد الدفع.",
    descEn: "Orders currently get buried in chats; I need a streamlined page capturing address & details.",
  },
  {
    id: "existing_store" as const,
    ar: "لدي متجر إلكتروني قائم (سلة / زد / شوبيفاي)",
    en: "Existing Online Store (Salla / Zid / Shopify...)",
    descAr: "أريد ربط منتجاتي الحالية بشبكة المسوقين ونظام الدفع الآمن دون نقل الكتالوج.",
    descEn: "I want to link my current catalog to creators and performance network without rebuilding.",
  },
  {
    id: "starting_fresh" as const,
    ar: "أبدأ من الصفر تماماً لأول مرة",
    en: "Starting fresh from scratch",
    descAr: "أريد إنشاء متجري الأول بالذكاء الاصطناعي وتجهيز كل شيء في دقائق.",
    descEn: "I want to generate my first online store with AI and launch ready-to-sell in minutes.",
  },
];

export const SURVEY_GOALS = [
  {
    id: "competitor_radar" as const,
    ar: "رادار المنافسين واستخبارات الإعلانات الرابحة في الخليج",
    en: "Competitor Radar & GCC Ad Intelligence",
    descAr: "كشف إعلانات المنافسين النشطة لأكثر من 30 يوماً، مؤشر التهديد، صياد نقاط الضعف، وخطة الهجوم المضاد.",
    descEn: "Track rival ads active for 30+ days, Threat Scores, Weakness Hunter, and generate counter-attack battleplans.",
  },
  {
    id: "silent_leaks" as const,
    ar: "كشف تسريبات الأرباح الصامتة وتدقيق كشوفات الشحن و COD",
    en: "Uncover Silent Profit Leaks & Audit COD Logistics",
    descAr: "معرفة صافي الربح الحقيقي لكل منتج، رصد الحملات الخاسرة، ومطابقة بوالص الشحن غير المحولة.",
    descEn: "Calculate true unit net margins, kill bleeding ad campaigns, and reconcile unremitted courier cash.",
  },
  {
    id: "stop_returns" as const,
    ar: "منع الإلغاءات ورفض الاستلام عند وصول المندوب (RTO)",
    en: "Stop cancellations and refused COD deliveries",
    descAr: "نظام Growlab يطلب دفع الشحن مقدماً لضمان جدية المشتري وثمن السلعة عند الاستلام.",
    descEn: "Growlab secures upfront shipping to guarantee buyer commitment, product fee upon delivery.",
  },
  {
    id: "pay_after_cash" as const,
    ar: "زيادة المبيعات بدون هدر إعلاني (دفع بعد التحصيل فقط)",
    en: "Scale sales with zero ad waste (pay only after cash)",
    descAr: "لا تدفع أي عمولة للمسوقين أو المنصة إلا بعد ما يدفع المشتري نقداً للمندوب.",
    descEn: "Never pay marketing commissions until cash is physically collected in your hands.",
  },
  {
    id: "launch_fast_store" as const,
    ar: "متجر فائق السرعة وجذاب للهواتف يزيد معدل التحويل",
    en: "Lightning-fast mobile store with high conversion",
    descAr: "صفحة طلب مخصصة تطلب فقط الاسم والهاتف والعنوان بنقرة واحدة بدون تعقيد.",
    descEn: "One-click order page asking only name, phone, and address to maximize conversion.",
  },
];

export interface SurveySummaryResult {
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  badgeEn: string;
  pathDescriptionAr: string;
  pathDescriptionEn: string;
  keyStepsAr: string[];
  keyStepsEn: string[];
  recommendedAction: "launch_demo" | "start_real_merchant" | "start_creator" | "launch_radar";
  actionLabelAr: string;
  actionLabelEn: string;
  actionUrl: string;
}

export function generateDiagnosticResult(answers: {
  mode: SurveyMode | null;
  cr: SurveyCR | null;
  product: SurveyProduct | null;
  channel: SurveyChannel | null;
  goal: SurveyGoal | null;
}): SurveySummaryResult {
  const isDemo = answers.mode === "demo";
  const isCR = answers.cr === "cr_yes";
  const isCreator = answers.cr === "creator";
  const isCompetitorRadar = answers.goal === "competitor_radar";
  const isSilentLeaks = answers.goal === "silent_leaks";

  if (isCreator) {
    return {
      titleAr: "مسار صانع المحتوى والمسوّق المعتمد",
      titleEn: "Creator & Affiliate Marketer Pathway",
      badgeAr: "صانع محتوى",
      badgeEn: "Creator Track",
      pathDescriptionAr:
        "بناءً على اختيارك: سنرشدك مباشرة إلى كتالوج العينات المجانية، كيفية اختيار المنتجات الرابحة، وتوليد روابط الإسناد لمشاركتها على TikTok و Instagram مع احتساب العمولات بعد كل عملية تحصيل ناجحة.",
      pathDescriptionEn:
        "Based on your profile: we will guide you to free sample catalog, high-converting products, attribution links for TikTok/IG, and automatic commissions upon delivery.",
      keyStepsAr: [
        "1. تصفح كتالوج المنتجات وطلب العينات المجانية من التجار",
        "2. توليد رابط الإسناد الذكي ونشره في البايو أو في مقطع الريلز",
        "3. استلام إشعار لحظي فور تسليم الطلب وتحويل العمولة لمحفظتك",
      ],
      keyStepsEn: [
        "1. Browse products & request free samples from verified merchants",
        "2. Generate tracked affiliate links for your TikTok / IG bio & reels",
        "3. Receive instant notifications and payout upon successful COD delivery",
      ],
      recommendedAction: isDemo ? "launch_demo" : "start_creator",
      actionLabelAr: isDemo ? "ابدأ جولة الديمو لصناع المحتوى" : "فتح حساب صانع محتوى",
      actionLabelEn: isDemo ? "Launch Creator Demo Tour" : "Open Creator Account",
      actionUrl: isDemo ? "/dashboard/browse" : "/enter?role=creator",
    };
  }

  if (isCompetitorRadar) {
    return {
      titleAr: "مسار استخبارات المنافسين ورادار الإعلانات في الخليج",
      titleEn: "GCC Competitor Radar & Ad Intelligence Pathway",
      badgeAr: "رادار المنافسين",
      badgeEn: "Competitor Radar",
      pathDescriptionAr:
        "تشخيص استراتيجي فوري: تم تهيئة رادار الاستخبارات لمراقبة منافسيك في دول الخليج، كشف الحملات الإعلانية الصامدة لأكثر من 30 يوماً، واقتناص نقاط الضعف وصياغة خطة هجوم مضاد فورية.",
      pathDescriptionEn:
        "Instant strategic diagnostics: Ad Intelligence Radar is primed to monitor GCC rivals, detect winning campaigns active for 30+ days, exploit competitor weaknesses, and deploy counter-strategy battleplans.",
      keyStepsAr: [
        "1. فحص إعلانات المنافسين المستمرة ومعدل الصمود (Days Active > 30 Days)",
        "2. تحليل مؤشر التهديد (Threat Score) ونقاط ضعف الشحن والتسعير",
        "3. توليد خطة هجوم مضاد (Counter-Strategy) وخطافات إعلانية تتفوق عليهم",
        "4. اقتناص الفرص السوقية المتاحة (White Spaces) قبل تشبع السوق",
      ],
      keyStepsEn: [
        "1. Audit active rival campaigns & longevity index (Days Active > 30 Days)",
        "2. Analyze Threat Scores, shipping friction, and price gaps",
        "3. Generate Counter-Strategy Battleplans with high-converting hooks",
        "4. Capitalize on unexploited market white spaces across the GCC",
      ],
      recommendedAction: "launch_radar",
      actionLabelAr: "دخول رادار استخبارات المنافسين الآن",
      actionLabelEn: "Launch Competitor Radar Hub",
      actionUrl: "/dashboard/competitor-radar",
    };
  }

  if (isSilentLeaks) {
    return {
      titleAr: "مسار كشف تسريبات الأرباح وتدقيق صافي الربح الحقيقي",
      titleEn: "True Net Margin & Silent Leak Audit Pathway",
      badgeAr: "كشف التسريبات",
      badgeEn: "Leak Detection",
      pathDescriptionAr:
        "تشخيص مالي مخصص: ربط وتدقيق كافة معادلات صافي الربح الحقيقي (COGS + الإعلانات + الشحن + مرتجعات RTO + تسوية COD)، مع ضمان بدون اكتشاف بدون رسوم.",
      pathDescriptionEn:
        "Tailored financial diagnostic: audit unit economics (COGS + Ads + Shipping + RTO Returns + COD reconciliation) backed by our No-Find No-Fee guarantee.",
      keyStepsAr: [
        "1. إدخال تكلفة المنتج وحساب صافي الربح الحقيقي في الجيب",
        "2. رصد وتوقيف الحملات الإعلانية ذات العائد الخاسر على الصافي",
        "3. تدقيق كشوفات الشحن واسترداد المبالغ غير المحولة من المندوبين",
        "4. تفعيل نظام حماية الأرباح الصافية بضمان استرجاع الأموال",
      ],
      keyStepsEn: [
        "1. Calculate true unit net margins beyond gross vanity GMV",
        "2. Halt bleeding ad sets operating at negative true net return",
        "3. Reconcile courier COD waybills and recover unremitted payouts",
        "4. Activate net margin guard with No-Find No-Fee guarantee",
      ],
      recommendedAction: isDemo ? "launch_demo" : "start_real_merchant",
      actionLabelAr: isDemo ? "تجربة محاكي الأرباح والتسريبات" : "بدء الفحص واسترجاع الأموال",
      actionLabelEn: isDemo ? "Try Profit Leak Simulator" : "Start Audit & Recover Cash",
      actionUrl: isDemo ? "/dashboard?tab=simulator" : "/enter?role=merchant",
    };
  }

  if (isDemo) {
    return {
      titleAr: "المسار الاستكشافي الشامل — جولة الديمو التفاعلية",
      titleEn: "Comprehensive Sandbox Tour — Interactive Demo",
      badgeAr: "تجربة ديمو تفاعلية",
      badgeEn: "Interactive Demo",
      pathDescriptionAr:
        "سنأخذك في جولة توضيحية حية خطوة بخطوة: نضيء لك الأزرار ونوضح أين تضغط بالتحديد لتجربة محاكي المبيعات، بناء متجرك بالبلوكات، رادار المنافسين، وتجربة الشراء كزبون مع فحص الأرباح الصافية حتى آخر نقطة في المنصة!",
      pathDescriptionEn:
        "We will guide you step-by-step with interactive spotlights and click hints to test live sales simulator, visual store block builder, competitor ad intelligence, and full profit engine!",
      keyStepsAr: [
        "1. تجربة محاكي المبيعات اللحظية واحتساب صافي الربح الحقيقي",
        "2. استكشاف رادار المنافسين وتحليل إعلانات الخليج الرابحة",
        "3. تجربة محرر وتخصيص المتجر الذكي بالبلوكات",
        "4. تنفيذ طلب شراء تجريبي كعميل وفحص سرعة استقبال الطلب",
      ],
      keyStepsEn: [
        "1. Test the live order stream simulator & real net margin hub",
        "2. Explore Competitor Radar & winning GCC ad hooks",
        "3. Customize storefront with smart visual blocks",
        "4. Place a simulated COD order and see instant dashboard notification",
      ],
      recommendedAction: "launch_demo",
      actionLabelAr: "ابدأ الجولة التوضيحية وتجربة الديمو الآن",
      actionLabelEn: "Start Guided Demo Tour Now",
      actionUrl: "/dashboard?tab=simulator",
    };
  }

  // Real Production Merchant Track
  if (isCR) {
    return {
      titleAr: "مسار المنشأة التجارية المعتمدة (سجل تجاري CR)",
      titleEn: "Certified Commercial Enterprise Pathway (CR)",
      badgeAr: "منشأة تجارية معتمدة",
      badgeEn: "Commercial Entity",
      pathDescriptionAr:
        "خطة مخصصة لشركتك: إعداد متجر رسمي متكامل، تفعيل مسار التحقق للسجلات التجارية مع شارة التوثيق الزرقاء، ربط الحساب البنكي التجاري، وتفعيل حماية الأرباح الصافية وإعلانات Meta ورادار المنافسين.",
      pathDescriptionEn:
        "Tailored plan for your registered enterprise: complete store setup, CR verification with Blue Badge, corporate bank link, Brandstack AI profit protection, and Competitor Radar.",
      keyStepsAr: [
        "1. إدخال اسم المنشأة ورفع رقم السجل التجاري للاعتماد السريع",
        "2. إعداد كتالوج المنتجات وتحديد تكلفة البضاعة وهامش الربح المطلوب",
        "3. إطلاق الحملة التسويقية وتفعيل رادار مراقبة المنافسين وحماية الميزانية",
        "4. استقبال طلبات COD مؤكدة مع تحصيل المبالغ آلياً لحسابك",
      ],
      keyStepsEn: [
        "1. Submit business details & CR number for fast SLA verification",
        "2. Setup product catalog, COGS, and targeted profit margin",
        "3. Launch marketing campaigns with Competitor Radar and budget guards",
        "4. Fulfill verified COD orders with automatic settlement",
      ],
      recommendedAction: "start_real_merchant",
      actionLabelAr: "ابدأ إعداد متجرك التجاري الفعلي",
      actionLabelEn: "Start Live Merchant Setup",
      actionUrl: "/enter?role=merchant",
    };
  }

  // Real Home Business / Freelancer Track (No CR)
  return {
    titleAr: "مسار المشاريع المنزلية والعمل الحر (بدون سجل تجاري)",
    titleEn: "Home Business & Indie Brand Pathway (No CR)",
    badgeAr: "مشروع منزلي / عمل حر",
    badgeEn: "Home Business Track",
    pathDescriptionAr:
      "مسار فوري وسهل مصمم خصيصاً لمشروعك: لا تحتاج سجل تجاري معقد! سنوثق حسابك بالبطاقة الشخصية ومسح الوجه، ونربط حسابات Instagram و TikTok لتجهيز صفحة طلبات احترافية تمنع الإلغاءات مع رادار معرفة الإعلانات الأكثر مبيعاً في السوق.",
    pathDescriptionEn:
      "Fast & streamlined path for home brands: no CR needed! Verify with national ID and face scan, connect Instagram/TikTok, launch a frictionless order page, and track winning market trends.",
    keyStepsAr: [
      "1. توثيق الهوية السريع (بطاقة شخصية + مسح بيومتري + رابط Instagram)",
      "2. إعداد صفحة طلب سريعة بالذكاء الاصطناعي باسم مشروعك",
      "3. تحويل زبائن الواتساب والإنستجرام إلى طلبات مؤكدة مع دفع الشحن مسبقاً",
      "4. تحصيل أرباحك الصافية فور تسليم الطلبات للمشترين",
    ],
    keyStepsEn: [
      "1. Fast ID verification (ID Card + biometric scan + Instagram/TikTok link)",
      "2. Generate AI-powered instant order page under your project name",
      "3. Convert Instagram & WhatsApp chats into committed orders with prepaid shipping",
      "4. Collect net profits directly as soon as orders are delivered",
    ],
    recommendedAction: "start_real_merchant",
    actionLabelAr: "ابدأ إعداد متجرك المنزلي الفوري",
    actionLabelEn: "Launch Your Home Store Now",
    actionUrl: "/enter?role=merchant",
  };
}

