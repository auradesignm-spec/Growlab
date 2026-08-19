export type Language = "ar" | "en";

export interface Translations {
  nav: {
    features: string;
    showcase: string;
    calculator: string;
    comparison: string;
    testimonials: string;
    faq: string;
    launchDemo: string;
    openDashboard: string;
  };
  hero: {
    badge: string;
    badgeHighlight: string;
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    liveStats: {
      uptime: string;
      uptimeLabel: string;
      avgRoas: string;
      avgRoasLabel: string;
      responseSpeed: string;
      responseSpeedLabel: string;
    };
    floatingCard1: {
      title: string;
      desc: string;
      tag: string;
    };
    floatingCard2: {
      title: string;
      desc: string;
      tag: string;
    };
  };
  metrics: {
    revenueGenerated: string;
    revenueLabel: string;
    messagesProcessed: string;
    messagesLabel: string;
    avgConversionLift: string;
    conversionLabel: string;
    activeStores: string;
    activeStoresLabel: string;
  };
  features: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      tag: string;
      metric: string;
      metricLabel: string;
    }>;
  };
  showcase: {
    badge: string;
    title: string;
    subtitle: string;
    tabs: {
      salesCloser: string;
      creativeEngine: string;
      negotiator: string;
      analytics: string;
    };
    salesCloserSim: {
      status: string;
      customerName: string;
      customerRole: string;
      initialMessage: string;
      quickPrompts: string[];
      agentTyping: string;
      orderDetected: string;
      dealClosedBadge: string;
      total: string;
      sendPlaceholder: string;
    };
    creativeEngineSim: {
      productLabel: string;
      generateBtn: string;
      generating: string;
      hooksTitle: string;
      copyTitle: string;
      copyBtn: string;
      copied: string;
    };
    negotiatorSim: {
      title: string;
      desc: string;
      minMarginLabel: string;
      maxDiscountLabel: string;
      aiDecision: string;
      sampleRule: string;
    };
    analyticsSim: {
      title: string;
      liveFeedTitle: string;
      salesToday: string;
      roasToday: string;
      chatsClosed: string;
    };
  };
  calculator: {
    badge: string;
    title: string;
    subtitle: string;
    monthlySpendLabel: string;
    aovLabel: string;
    crLabel: string;
    resultsTitle: string;
    projectedRevenue: string;
    additionalProfit: string;
    roiEstimate: string;
    hoursSaved: string;
    ctaButton: string;
  };
  comparison: {
    badge: string;
    title: string;
    subtitle: string;
    headers: {
      feature: string;
      senthora: string;
      traditional: string;
      inHouse: string;
    };
    rows: Array<{
      name: string;
      senthora: string;
      traditional: string;
      inHouse: string;
      highlight?: boolean;
    }>;
  };
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{
      quote: string;
      author: string;
      role: string;
      company: string;
      metric: string;
      metricLabel: string;
      avatar: string;
    }>;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{
      q: string;
      a: string;
    }>;
  };
  cta: {
    badge: string;
    title: string;
    subtitle: string;
    primaryBtn: string;
    secondaryBtn: string;
    guarantee: string;
  };
  footer: {
    tagline: string;
    productHeading: string;
    solutionsHeading: string;
    companyHeading: string;
    systemStatus: string;
    rights: string;
  };
}

export const translations: Record<Language, Translations> = {
  ar: {
    nav: {
      features: "المميزات والحلول",
      showcase: "المحاكاة التفاعلية",
      calculator: "حاسبة العائد",
      comparison: "المقارنة الذكية",
      testimonials: "قصص النجاح",
      faq: "الأسئلة الشائعة",
      launchDemo: "تجربة الوكيل الحي",
      openDashboard: "لوحة التحكم",
    },
    hero: {
      badge: "الجيل الجديد من الذكاء الاصطناعي للمبيعات",
      badgeHighlight: "Senthora 3.0",
      titleLine1: "وكلاء ذكاء اصطناعي يقفلون صفقاتك",
      titleLine2: "ويضاعفون نمو متجرك",
      titleHighlight: "على مدار الساعة",
      subtitle:
        "منصة نمو رقمي ذاتية التحكم تجمع بين إدارة وتوسيع إعلانات ميتا وتيك توك، ووكيل مبيعات واتساب ذكي يتفاوض ويقفل الطلبات لحظياً وبأعلى معدل تحويل.",
      primaryCta: "ابدأ تجربة الوكيل الآن",
      secondaryCta: "احسب عائد متجرك المتوقع",
      liveStats: {
        uptime: "99.98%",
        uptimeLabel: "استجابة فورية 24/7",
        avgRoas: "4.2x",
        avgRoasLabel: "متوسط عائد الإنفاق الإعلاني",
        responseSpeed: "< 1.2 ثانية",
        responseSpeedLabel: "سرعة إغلاق المحادثة",
      },
      floatingCard1: {
        title: "صفقة مكتملة عبر واتساب",
        desc: "تم قفل طلب بقيمة 48 ر.ع لعميل في مسقط بعد تفاوض ذكي بنسبة 5%",
        tag: "مبيعات فورية",
      },
      floatingCard2: {
        title: "تحسين ميزانية ميتا تلقائياً",
        desc: "نقل الميزانية للإعلان الأعلى تحويلاً بمعدل ROAS 5.8x",
        tag: "تحسين خوارزمي",
      },
    },
    metrics: {
      revenueGenerated: "+4,850,000 $",
      revenueLabel: "مبيعات تمت عبر وكلاء الذكاء",
      messagesProcessed: "+1.2M",
      messagesLabel: "محادثة مبيعات ومفاوضة مؤتمتة",
      avgConversionLift: "+185%",
      conversionLabel: "متوسط رفع معدل التحويل",
      activeStores: "+120",
      activeStoresLabel: "متجر وعلامة تجارية في الخليج",
    },
    features: {
      badge: "القدرات الأساسية",
      title: "منظومة نمو متكاملة صُممت للتجارة الحديثة",
      subtitle: "استبدل الردود البطيئة والوكالات التقليدية بوكلاء ذكاء اصطناعي مؤهلين للبيع والإقناع والتوسع الرقمي.",
      items: [
        {
          id: "sales-closer",
          title: "وكيل مبيعات واتساب خبير (AI Sales Closer)",
          description:
            "يتحدث باللهجة العمانية والخليجية الطبيعية، يفهم تردد العميل، يبرز القيمة، ويغلق الصفقة ويجمع تفاصيل الشحن فوراً.",
          tag: "إغلاق مبيعات",
          metric: "94.2%",
          metricLabel: "نسبة رضا العملاء",
        },
        {
          id: "negotiation",
          title: "محرك التفاوض الذكي وحماية الهوامش",
          description:
            "يتفاوض على الخصم بذكاء ضمن حدودك الآمنة، ويستخدم العروض وحزم المنتجات كحافز أخير لضمان أعلى ربحية ممكنة.",
          tag: "هوامش ربح",
          metric: "+32%",
          metricLabel: "متوسط قيمة السلة (AOV)",
        },
        {
          id: "meta-scaling",
          title: "خوارزمية إدارة وتوسيع إعلانات ميتا وتيك توك",
          description:
            "توليد خطافات بصرية (Hooks) إعلانية، كتابة نصوص UGC مقنعة، وتوزيع الميزانية الإعلانية بدقة لحرق أقل وعائد أعلى.",
          tag: "إعلانات مدفوعة",
          metric: "4.2x",
          metricLabel: "متوسط ROAS المستهدف",
        },
        {
          id: "high-thinking",
          title: "مستشار التفكير العميق والنمذجة المالية",
          description:
            "تشخيص تكلفة الاستحواذ (CAC)، القيمة الدائمة للعميل (LTV)، ونقاط التعادل الإعلاني باستخدام خوارزميات الاستنتاج المنطقي.",
          tag: "تحليل استراتيجي",
          metric: "100%",
          metricLabel: "قرارات قائمة على البيانات",
        },
        {
          id: "voice-audio",
          title: "الذكاء الصوتي والتفريغ الفوري (Voice & Audio)",
          description:
            "الاستماع للرسائل الصوتية وتفريغها بدقة فائقة لكافة اللهجات، والرد برسائل صوتية نقية لتجربة تسوق واقعية وإنسانية.",
          tag: "تفاعل صوتي",
          metric: "< 800ms",
          metricLabel: "زمن المعالجة الصوتية",
        },
        {
          id: "creative-studio",
          title: "أستوديو الصور الإعلانية فائق الجودة",
          description:
            "توليد صور منتجات سينمائية وخلفيات تجارية جذابة متوافقة تماماً مع أبعاد إعلانات انستغرام وتيك توك بدون مصورين مكلفين.",
          tag: "توليد بصري",
          metric: "4K / HD",
          metricLabel: "دقة وجودة الإعلانات",
        },
      ],
    },
    showcase: {
      badge: "المختبر التفاعلي الحي",
      title: "جرّب بنفسك كيف يفكر ويتفاوض الوكيل",
      subtitle: "انقر على السيناريوهات أدناه لتشاهد كيف يحول الزوار المتشككين إلى مشترين مؤكدين في ثوانٍ.",
      tabs: {
        salesCloser: "💬 وكيل المبيعات والتفاوض",
        creativeEngine: "✨ صانع خطافات الإعلانات",
        negotiator: "⚙️ حاسبة الهوامش وقواعد الخصم",
        analytics: "📊 لوحة العمليات والطلبات الحية",
      },
      salesCloserSim: {
        status: "متصل الآن — مستشار المبيعات الذكي",
        customerName: "أحمد المعمري (مسقط)",
        customerRole: "عميل متردد يبحث عن تخفيض",
        initialMessage: "مرحباً.. شفت إعلان الساعة الفاخرة، هل عليها خصم إذا أخذت حبتين؟ وكم يأخذ التوصيل؟",
        quickPrompts: [
          "هل في ضمان لو خربت؟",
          "السعر غالي شوي ممكن 20 ر.ع؟",
          "خلاص تمام، احجز لي حبتين للغبرة",
        ],
        agentTyping: "سالم يكتب رداً ذكياً...",
        orderDetected: "🎯 تم استخراج وتثبيت الطلب تلقائياً بنجاح!",
        dealClosedBadge: "صفقة مقفلة — 42 ر.ع",
        total: "الإجمالي بعد الخصم الآمن:",
        sendPlaceholder: "اكتب رسالة تجريبية للوكيل...",
      },
      creativeEngineSim: {
        productLabel: "اختر المنتج لتوليد خطة إعلانية كاملة:",
        generateBtn: "توليد سيناريو الإعلان والخطافات",
        generating: "الذكاء يصمم خطافات ميتا الفيروسية...",
        hooksTitle: "٣ خطافات بصرية لتوقيف التمرير (Stop the Scroll):",
        copyTitle: "نص الإعلان المقترح لمنصة ميتا (Primary Text):",
        copyBtn: "نسخ النص الإعلاني",
        copied: "تم النسخ بنجاح!",
      },
      negotiatorSim: {
        title: "نظام الأمان المالي وضبط الخصم التلقائي",
        desc: "حدد سقف الخصم وهوامش الربح الدنيا. الوكيل لن يتجاوز هذه الحدود مهما تفاوض العميل.",
        minMarginLabel: "الحد الأدنى لهامش الربح المطلوب:",
        maxDiscountLabel: "الحد الأقصى للخصم التلقائي للوكيل:",
        aiDecision: "قرارات الذكاء الاصطناعي الحية:",
        sampleRule: "إذا كان الطلب > 2 قطعة: مسموح بخصم 10% + شحن مجاني للمحافظة.",
      },
      analyticsSim: {
        title: "تحديثات حية للطلبات المنفذة بواسطة الذكاء",
        liveFeedTitle: "سجل الصفقات اللحظية:",
        salesToday: "1,420 ر.ع",
        roasToday: "4.82x",
        chatsClosed: "48 محادثة مقفلة",
      },
    },
    calculator: {
      badge: "حاسبة العائد الاستثماري (ROI)",
      title: "احسب قفزة أرباح متجرك مع Senthora",
      subtitle: "حرّك المؤشرات بناءً على بيانات متجرك الحالية وشاهد كيف تنعكس الردود اللحظية والتفاوض الذكي على صافي أرباحك.",
      monthlySpendLabel: "ميزانية الإعلانات الشهرية (USD):",
      aovLabel: "متوسط قيمة الطلب (AOV - USD):",
      crLabel: "معدل التحويل الحالي التقريبي:",
      resultsTitle: "النمو المتوقع لمتجرك شهرياً:",
      projectedRevenue: "الزيادة في المبيعات الشهرية:",
      additionalProfit: "صافي الربح الإضافي التقديري:",
      roiEstimate: "العائد على الاستثمار المتوقع:",
      hoursSaved: "ساعات عمل موفرة لفريقك:",
      ctaButton: "تفعيل هذا النمو لمتجري الآن",
    },
    comparison: {
      badge: "المقارنة الموضوعية",
      title: "لماذا يتفوق Senthora على الوكالات التقليدية؟",
      subtitle: "مقارنة مباشرة بين نموذج شريك النمو المدعوم بالذكاء الاصطناعي والخيارات الأخرى في السوق.",
      headers: {
        feature: "المعيار / الخاصية",
        senthora: "منصة Senthora AI",
        traditional: "الوكالات التسويقية التقليدية",
        inHouse: "توظيف فريق مبيعات داخلي",
      },
      rows: [
        {
          name: "سرعة الرد على عميل الإعلان",
          senthora: "أقل من ثانية واحدة (24/7 دون انقطاع)",
          traditional: "ساعات طويلة أو اليوم التالي",
          inHouse: "دقائق إلى ساعات (أوقات الدوام فقط)",
          highlight: true,
        },
        {
          name: "مهارات التفاوض وإغلاق الصفقات",
          senthora: "خوارزمية ذكية مدربة على اللهجة وسيكولوجية البيع",
          traditional: "غير متوفر (يرسلون لك ليدز فقط)",
          inHouse: "متفاوتة وتتطلب تدريباً مستمراً",
          highlight: true,
        },
        {
          name: "التكلفة ونموذج الدفع",
          senthora: "اشتراك شفاف + مشاركة في النتيجة الحقيقية",
          traditional: "أتعاب شهرية ثابتة مرتفعة بغض النظر عن النتيجة",
          inHouse: "رواتب ثابتة، إقامات، تأمينات وإجازات",
        },
        {
          name: "توسيع إعلانات ميتا وتيك توك",
          senthora: "تحليل لحظي وابتكار خطافات UGC مستمرة",
          traditional: "تقارير أسبوعية متأخرة وبطء في التعديل",
          inHouse: "محدود بقدرة وخبرة شخص واحد",
        },
        {
          name: "القدرة على استيعاب ضغط الحملات",
          senthora: "غير محدودة (آلاف المحادثات في نفس الثانية)",
          traditional: "تتراكم الرسائل ويضيع العملاء",
          inHouse: "انهيار سريع عند زيادة تدفق الإعلانات",
        },
      ],
    },
    testimonials: {
      badge: "تجارب حقيقية",
      title: "ماذا يقول رواد الأعمال وملاك المتاجر؟",
      subtitle: "شركات وعلامات تجارية خليجية ضاعفت مبيعاتها ووفرت مئات ساعات العمل.",
      items: [
        {
          quote:
            "قبل Senthora، كنا نخسر أكثر من 60% من زوار إعلانات سناب وانستغرام بسبب تأخر الموظف في الرد على الواتساب بعد منتصف الليل. الآن الوكيل يقفل الصفقات فوراً وارتفعت مبيعاتنا 3 أضعاف!",
          author: "سلطان الحوسني",
          role: "مؤسس ومدير تنفيذي",
          company: "علامة العطور الفاخرة — مسقط",
          metric: "+240%",
          metricLabel: "نمو المبيعات خلال 60 يوماً",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        },
        {
          quote:
            "ميزة التفاوض الذكي خرافية! العميل يطلب خصم فالذكاء يقدم له عرض شراء قطعتين بسعر مخفض، فارتفع متوسط قيمة السلة من 18 ر.ع إلى 34 ر.ع بكل سلاسة.",
          author: "فاطمة الشحي",
          role: "مديرة التجارة الإلكترونية",
          company: "متجر أزياء وإكسسوارات — دبي",
          metric: "+88%",
          metricLabel: "زيادة في متوسط قيمة السلة",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        },
        {
          quote:
            "الجمع بين إدارة إعلانات ميتا بالذكاء وتجهيز الردود البيعية المباشرة وفر علينا تكلفة وكالة كاملة مع تحقيق أعلى ROAS وصلنا له في تاريخ المتجر.",
          author: "محمد البلوشي",
          role: "الشريك الإداري",
          company: "متجر الإلكترونيات الذكية — الرياض ومسقط",
          metric: "4.6x",
          metricLabel: "متوسط عائد الإنفاق الإعلاني (ROAS)",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        },
      ],
    },
    faq: {
      badge: "إجابات واضحة",
      title: "الأسئلة الأكثر تكراراً",
      subtitle: "كل ما تحتاج معرفته عن كيفية عمل الوكيل وربطه مع متجرك وإعلاناتك.",
      items: [
        {
          q: "كيف يتحدث الوكيل باللهجة المحلية وهل يلاحظ العميل أنه ذكاء اصطناعي؟",
          a: "تم تدريب نماذجنا المتطورة على اللهجة العمانية والخليجية المحكية وسيكولوجية البيع الطبيعية، مستخدماً عبارات ترحيبية مهذبة وطبيعية تجعل تجربة المحادثة انسيابية وإنسانية لأقصى درجة.",
        },
        {
          q: "كم يستغرق ربط الوكيل بمتجري ورقم الواتساب الخاص بي؟",
          a: "عملية التفعيل فورية ولا تتجاوز دقائق معدودة. نقوم بربط رقمك المعتمد أو توفير رقم رسمي مفعل عبر مزودي واتساب للأعمال، مع استيراد قائمة منتجاتك وسياساتك فوراً.",
        },
        {
          q: "ماذا يحدث إذا سأل العميل سؤالاً غير موجود في قاعدة بيانات المنتجات؟",
          a: "إذا واجه الوكيل استفساراً خاصاً أو خارج الصلاحيات المحددة، يقوم بلطف بطلب مهلة وتوجيه المحادثة لفريقك البشري مع تنبيه فوري عبر لوحة التحكم.",
        },
        {
          q: "كيف تضمن المنصة عدم تقديم خصومات مبالغ فيها قد تضر بالربحية؟",
          a: "أنت من يحدد بدقة الحد الأقصى للخصم (مثل 5% أو 10%) والحد الأدنى لهامش الربح. خوارزميات المنصة لا تتجاوز هذه القواعد الصارمة تحت أي ظرف.",
        },
      ],
    },
    cta: {
      badge: "جاهز لمضاعفة نمو متجرك؟",
      title: "دع الذكاء الاصطناعي يقفل صفقاتك بينما تتفرغ للتوسع",
      subtitle: "انضم لأكثر من 120 متجراً ناجحاً في الخليج يعتمدون على Senthora لتحويل زوار الإعلانات إلى أرباح حقيقية.",
      primaryBtn: "ابدأ التجربة المجانية الفورية",
      secondaryBtn: "تحدث مع مستشار النمو عبر واتساب",
      guarantee: "✓ تجربة مباشرة بدون التزامات طويلة الأمد • دعم فني وإعداد كامل خلال 24 ساعة",
    },
    footer: {
      tagline: "المنصة الذاتية الأولى في الشرق الأوسط لإغلاق مبيعات التجارة الإلكترونية وتوسيع إعلانات ميتا بالذكاء الاصطناعي.",
      productHeading: "المنتج والحلول",
      solutionsHeading: "حالات الاستخدام",
      companyHeading: "الشركة والدعم",
      systemStatus: "جميع أنظمة الذكاء تعمل بكفاءة 99.98%",
      rights: "جميع الحقوق محفوظة © 2026 Senthora / Growlab Inc.",
    },
  },
  en: {
    nav: {
      features: "Features & Solutions",
      showcase: "Interactive Demo",
      calculator: "ROI Calculator",
      comparison: "Comparison",
      testimonials: "Success Stories",
      faq: "FAQ",
      launchDemo: "Live AI Agent",
      openDashboard: "Dashboard",
    },
    hero: {
      badge: "Next-Gen Autonomous Sales AI",
      badgeHighlight: "Senthora 3.0",
      titleLine1: "Autonomous AI Agents That Close Deals",
      titleLine2: "And Scale Your Store",
      titleHighlight: "24/7 in Real-Time",
      subtitle:
        "The all-in-one digital growth operating system combining predictive Meta & TikTok Ads optimization with intelligent WhatsApp sales agents that negotiate, persuade, and capture orders instantaneously.",
      primaryCta: "Launch Live Agent Demo",
      secondaryCta: "Calculate Expected ROI",
      liveStats: {
        uptime: "99.98%",
        uptimeLabel: "24/7 Zero-Downtime Sales",
        avgRoas: "4.2x",
        avgRoasLabel: "Average Meta Ad ROAS",
        responseSpeed: "< 1.2s",
        responseSpeedLabel: "Instant Deal Resolution",
      },
      floatingCard1: {
        title: "Deal Closed via WhatsApp",
        desc: "Captured $125 order after autonomous 5% discount negotiation",
        tag: "Live Conversion",
      },
      floatingCard2: {
        title: "Meta Budget Re-allocated",
        desc: "Auto-scaled top UGC creative delivering 5.8x ROAS",
        tag: "Algorithm Optimizer",
      },
    },
    metrics: {
      revenueGenerated: "$4,850,000+",
      revenueLabel: "Revenue Closed by AI Agents",
      messagesProcessed: "1.2M+",
      messagesLabel: "Automated Sales & Deals Handled",
      avgConversionLift: "+185%",
      conversionLabel: "Average Conversion Rate Lift",
      activeStores: "120+",
      activeStoresLabel: "High-Growth Gulf Brands",
    },
    features: {
      badge: "Core Capabilities",
      title: "An Integrated Growth Engine Built for Modern Commerce",
      subtitle: "Replace slow response times and bloated traditional agencies with autonomous AI agents engineered to sell, convert, and scale.",
      items: [
        {
          id: "sales-closer",
          title: "Autonomous WhatsApp AI Sales Closer",
          description:
            "Converses in native, empathetic Arabic & English dialects, overcomes objections, highlights value, and seals delivery details instantly.",
          tag: "Sales Conversion",
          metric: "94.2%",
          metricLabel: "Customer Satisfaction",
        },
        {
          id: "negotiation",
          title: "Smart Negotiation & Margin Guardrail Engine",
          description:
            "Dynamically offers win-win discounts within strict profitability thresholds, using custom bundles as the final closing trigger.",
          tag: "Margin Control",
          metric: "+32%",
          metricLabel: "Average Order Value (AOV)",
        },
        {
          id: "meta-scaling",
          title: "Predictive Meta & TikTok Ad Scaling",
          description:
            "Generates viral UGC video hooks, writes high-converting ad copies, and optimizes ad sets dynamically for peak performance.",
          tag: "Paid Acquisition",
          metric: "4.2x",
          metricLabel: "Target Benchmark ROAS",
        },
        {
          id: "high-thinking",
          title: "Deep High-Thinking Strategic Reasoning",
          description:
            "Audits CAC, LTV, unit economics, and break-even ROAS benchmarks powered by multi-step logical deduction models.",
          tag: "Strategic BI",
          metric: "100%",
          metricLabel: "Data-Driven Decisions",
        },
        {
          id: "voice-audio",
          title: "Multimodal Voice & Audio Intelligence",
          description:
            "Transcribes complex incoming voice notes across any dialect and replies with ultra-clear voice synthesis for realistic human interactions.",
          tag: "Voice Interaction",
          metric: "< 800ms",
          metricLabel: "Voice Processing Speed",
        },
        {
          id: "creative-studio",
          title: "Commercial AI Product Creative Studio",
          description:
            "Generates studio-grade 4K product visuals, cinematic lifestyle backgrounds, and social ad formats without costly photo shoots.",
          tag: "Visual Synthesis",
          metric: "4K / HD",
          metricLabel: "Creative Output Quality",
        },
      ],
    },
    showcase: {
      badge: "Live Interactive Sandbox",
      title: "Test How the Autonomous Agent Thinks & Negotiates",
      subtitle: "Click the scenarios below to see how hesitating leads transform into verified paid orders in seconds.",
      tabs: {
        salesCloser: "💬 AI Sales Closer & Negotiator",
        creativeEngine: "✨ Viral Ad Hook Studio",
        negotiator: "⚙️ Margin Guardrails & Rules",
        analytics: "📊 Live Real-Time Operations Feed",
      },
      salesCloserSim: {
        status: "Online Now — Autonomous AI Closer",
        customerName: "Ahmed Al-Maamari (Muscat)",
        customerRole: "Hesitant buyer looking for a bundle discount",
        initialMessage: "Hey! Saw your luxury watch ad. Is there any discount if I order 2 pieces? How fast is delivery?",
        quickPrompts: [
          "Is there a warranty if it breaks?",
          "Can you do $55 for both pieces?",
          "Deal! Book 2 units to my address now.",
        ],
        agentTyping: "Salem is typing a high-conversion reply...",
        orderDetected: "🎯 Order captured & structured automatically!",
        dealClosedBadge: "Deal Sealed — $110.00",
        total: "Final Agreed Total (Protected Margin):",
        sendPlaceholder: "Type a live test message to the AI agent...",
      },
      creativeEngineSim: {
        productLabel: "Select product to generate complete viral campaign plan:",
        generateBtn: "Generate Viral Hooks & Ad Script",
        generating: "AI is crafting stop-the-scroll video hooks...",
        hooksTitle: "3 Stop-The-Scroll Visual Hooks (First 3s):",
        copyTitle: "Primary Meta Ad Text & Headline:",
        copyBtn: "Copy Ad Text",
        copied: "Copied to Clipboard!",
      },
      negotiatorSim: {
        title: "Profit Protection & Auto-Discount Rules",
        desc: "Define maximum allowable discount ceilings and minimum margin buffers. The AI strictly respects your financial thresholds.",
        minMarginLabel: "Minimum Target Gross Margin:",
        maxDiscountLabel: "Maximum Automated AI Discount Ceiling:",
        aiDecision: "Live Autonomous Decision Rules:",
        sampleRule: "If Quantity ≥ 2 Units: AI granted 10% discount + complimentary express courier dispatch.",
      },
      analyticsSim: {
        title: "Live Autonomous Closed Orders Stream",
        liveFeedTitle: "Real-time Sales Log:",
        salesToday: "$3,680",
        roasToday: "4.82x",
        chatsClosed: "48 Deals Closed",
      },
    },
    calculator: {
      badge: "ROI & Revenue Expansion Calculator",
      title: "Calculate Your Store's Profit Leap with Senthora",
      subtitle: "Adjust the interactive sliders to match your current metrics and discover the bottom-line impact of instant 24/7 deal closing.",
      monthlySpendLabel: "Monthly Ad Spend (USD):",
      aovLabel: "Average Order Value (AOV - USD):",
      crLabel: "Estimated Conversion Rate (%):",
      resultsTitle: "Projected Monthly Growth:",
      projectedRevenue: "Projected Monthly Revenue Lift:",
      additionalProfit: "Estimated Additional Net Profit:",
      roiEstimate: "Expected Return on Investment (ROI):",
      hoursSaved: "Team Work Hours Saved Weekly:",
      ctaButton: "Unlock This Growth for My Store",
    },
    comparison: {
      badge: "Side-by-Side Analysis",
      title: "Why Senthora Outperforms Traditional Agencies",
      subtitle: "A direct breakdown between autonomous AI growth architecture and legacy alternatives.",
      headers: {
        feature: "Capability / Dimension",
        senthora: "Senthora AI Operating System",
        traditional: "Traditional Marketing Agencies",
        inHouse: "Hiring In-House Reps",
      },
      rows: [
        {
          name: "Lead Response Time",
          senthora: "< 1.2s Instant Response (24/7/365)",
          traditional: "Hours or Next Business Day",
          inHouse: "Minutes to Hours (Working Hours Only)",
          highlight: true,
        },
        {
          name: "Autonomous Deal Negotiation",
          senthora: "Trained on buyer psychology & margin rules",
          traditional: "None (Deliver raw leads only)",
          inHouse: "Variable and requires ongoing coaching",
          highlight: true,
        },
        {
          name: "Pricing & Alignment",
          senthora: "Transparent SaaS + Shared Outcome Alignment",
          traditional: "High fixed retainers regardless of sales",
          inHouse: "Fixed payroll, benefits, overhead & training",
        },
        {
          name: "Meta & TikTok Ad Iterations",
          senthora: "Real-time automated UGC hooks & copy testing",
          traditional: "Slow weekly slide decks & delayed edits",
          inHouse: "Limited to single-person bandwidth",
        },
        {
          name: "Scalability Under Peak Ad Traffic",
          senthora: "Infinite (Simultaneous thousands of chats)",
          traditional: "Bottlenecks occur; leads go cold",
          inHouse: "High burnout & missed conversations",
        },
      ],
    },
    testimonials: {
      badge: "Verified Proof",
      title: "Trusted by Modern Commerce Leaders",
      subtitle: "Gulf & Middle East brand founders scaling faster with automated conversational selling.",
      items: [
        {
          quote:
            "Before Senthora, we were losing over 60% of our late-night Instagram and Snapchat ad traffic. Now the AI closes orders immediately, and our revenue tripled within two months.",
          author: "Sultan Al-Housani",
          role: "Founder & CEO",
          company: "Luxury Perfumes Brand — Muscat",
          metric: "+240%",
          metricLabel: "Revenue Growth in 60 Days",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        },
        {
          quote:
            "The smart negotiation feature is brilliant. When a customer asks for a discount, the AI offers a bundle with a modest incentive, boosting our AOV from $48 to $89 effortlessly.",
          author: "Fatima Al-Shehhi",
          role: "Head of eCommerce",
          company: "Fashion & Accessories — Dubai",
          metric: "+88%",
          metricLabel: "Average Order Value Lift",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        },
        {
          quote:
            "Combining automated Meta ad optimization with instant conversational sales replaced our entire previous agency stack while delivering the highest ROAS we have ever recorded.",
          author: "Mohammed Al-Balushi",
          role: "Managing Partner",
          company: "Smart Gadgets Store — Riyadh & Muscat",
          metric: "4.6x",
          metricLabel: "Average Meta Ad ROAS",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        },
      ],
    },
    faq: {
      badge: "Clear Answers",
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about setting up and scaling with our autonomous AI agents.",
      items: [
        {
          q: "How natural does the AI sound, and will customers realize it's an AI?",
          a: "Our models are fine-tuned on conversational Arabic and English dialects with empathetic, natural customer phrasing. The conversation feels fluid, ultra-responsive, and genuinely helpful.",
        },
        {
          q: "How fast is the integration with our WhatsApp number and product catalog?",
          a: "Setup takes only minutes. We connect directly to your verified WhatsApp Business API or provision one, importing your inventory, policies, and prices instantly.",
        },
        {
          q: "What happens if a customer asks something outside the product scope?",
          a: "The agent gracefully acknowledges the inquiry and routes the ticket to your human team with an instant push notification on your dashboard.",
        },
        {
          q: "How do you guarantee the AI won't give away excessive discounts?",
          a: "You retain full control. You specify the hard discount ceiling (e.g. 5% or 10%) and minimum gross margin. The AI algorithm strictly adheres to these boundary constraints.",
        },
      ],
    },
    cta: {
      badge: "Ready to Scale Your Commerce Engine?",
      title: "Let Autonomous AI Close Deals While You Focus on Strategy",
      subtitle: "Join 120+ leading brands across the Middle East leveraging Senthora to turn paid traffic into verifiable profits.",
      primaryBtn: "Start Instant Free Sandbox",
      secondaryBtn: "Chat with Growth Specialist",
      guarantee: "✓ Instant Sandbox • Zero Long-Term Lock-in • Full Onboarding Within 24 Hours",
    },
    footer: {
      tagline: "The premier autonomous AI platform for high-converting conversational commerce and predictive Meta Ads scaling.",
      productHeading: "Platform & Solutions",
      solutionsHeading: "Use Cases",
      companyHeading: "Company & Support",
      systemStatus: "All AI Agents 99.98% Operational",
      rights: "All rights reserved © 2026 Senthora / Growlab Inc.",
    },
  },
};
