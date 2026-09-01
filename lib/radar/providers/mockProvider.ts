import type {
  CompetitorDataProvider,
  ProviderSearchQuery,
  ProviderSearchResult,
  NormalizedCompetitorResult,
  NormalizedAdResult,
} from "./types";
import type { TargetMarket, AdPlatform } from "../types";

export class MockCompetitorProvider implements CompetitorDataProvider {
  readonly id = "mock";
  readonly name = "Growlab Intelligence Sandbox & GCC Historical DB";
  readonly supportedPlatforms: AdPlatform[] = ["meta", "tiktok", "snapchat", "google"];

  async search(query: ProviderSearchQuery): Promise<ProviderSearchResult> {
    const kw = query.keyword.toLowerCase();
    const market = query.market;

    const competitors = this.generateRealisticCompetitors(kw, market);

    return {
      providerId: this.id,
      providerName: this.name,
      status: "ready",
      message: "Data retrieved from Growlab GCC historical index (Deterministic sandbox).",
      competitors,
      lastUpdated: new Date(),
    };
  }

  async getAdsForCompetitor(competitorName: string, market: TargetMarket): Promise<NormalizedAdResult[]> {
    const found = this.generateRealisticCompetitors(competitorName, market).find(
      (c) => c.name.toLowerCase().includes(competitorName.toLowerCase()) || competitorName.toLowerCase().includes(c.name.toLowerCase())
    );
    return found ? found.ads : [];
  }

  private generateRealisticCompetitors(keyword: string, market: TargetMarket): NormalizedCompetitorResult[] {
    const isPerfume = keyword.includes("عطر") || keyword.includes("لبان") || keyword.includes("عود") || keyword.includes("perfume") || keyword.includes("attar");
    const isAbaya = keyword.includes("عباي") || keyword.includes("ثوب") || keyword.includes("فستان") || keyword.includes("أزياء") || keyword.includes("abaya");
    const isCoffee = keyword.includes("قهو") || keyword.includes("بن") || keyword.includes("محمص") || keyword.includes("coffee");
    const isSkin = keyword.includes("بشر") || keyword.includes("سيروم") || keyword.includes("كريم") || keyword.includes("عناي") || keyword.includes("skin");

    if (isPerfume) {
      return [
        {
          name: "دار الأريج للعطور واللبان الحوجري",
          domain: "alareej-perfumes.com",
          brandHandle: "@alareej_om",
          market: market,
          platform: "meta",
          activeAdsCount: 9,
          primaryOffer: "خصم 20% عند شراء زجاجتين مع شحن سريع",
          priceRange: "28 - 45 ر.ع.",
          shippingOffer: "توصيل خلال 4-5 أيام (2 ر.ع.)",
          guaranteeOffer: "استرجاع خلال 3 أيام فقط",
          confidence: 94,
          ads: [
            {
              externalId: "meta_ad_101",
              platform: "meta",
              format: "video",
              headline: "سر الفخامة العمانية برائحة اللبان الحوجري الملكي",
              bodyCopy: "مستخلص من أجود أشجار لبان ظفار بتركيز وثبات يدوم 48 ساعة. اطلب الآن مع التوصيل لكل المحافظات.",
              hook: "هل جربت لبان ظفار الحقيقي مع العود الملكي؟",
              painPoint: "العطور التجارية تفقد رائحتها بعد ساعتين وتسبب الصداع",
              promise: "ثبات وفواحان ملكي مضمون ليومين كاملين برائحة طبيعية 100%",
              proof: "تقييم 4.9 نجوم من أكثر من 1,200 عميل موثق في مسقط وظفار",
              offer: "احصل على عينة مجانية مع كل طلب",
              cta: "تسوق الآن عبر الرابط",
              daysActive: 42,
              isActive: true,
              spendVelocity: "high",
            },
            {
              externalId: "tiktok_ad_102",
              platform: "tiktok",
              format: "video",
              headline: "تجربة فتح صندوق عطر اللبان الحوجري الفاخر",
              bodyCopy: "تغليف ملكي فاخر وثبات لا يُعلى عليه. هدية تليق بالمناسبات الرسمية.",
              hook: "هذا العطر خلا كل من يقابلني يسألني وش ريحتك!",
              painPoint: "صعوبة العثور على هدية فاخرة وجذابة بسعر معقول",
              promise: "تغليف هدايا ملكي مجاني مع كل طلبية",
              proof: "فيديو UGC حقيقي بمشاهدات تجاوزت 180 ألف",
              offer: "توصيل مجاني للطلبات فوق 30 ر.ع.",
              cta: "اطلب الآن قبل نفاد الكمية",
              daysActive: 28,
              isActive: true,
              spendVelocity: "high",
            },
            {
              externalId: "meta_ad_103",
              platform: "meta",
              format: "carousel",
              headline: "المجموعة الحصرية الثلاثية",
              bodyCopy: "عطر الصباح، عطر المساء، وخمرية الشعر باللبان.",
              hook: "ثلاثية العطور التي لن تستغني عنها بعد اليوم",
              painPoint: "تكرار شراء عطور متعددة بأسعار مرتفعة",
              promise: "تغطية كافة مناسباتك اليومية والمسائية",
              proof: "نفاد الدفعة الأولى خلال 72 ساعة",
              offer: "اشتري 2 واحصل على الثالث مجاناً",
              cta: "احصل على العرض",
              daysActive: 14,
              isActive: true,
              spendVelocity: "medium",
            },
          ],
        },
        {
          name: "عبير الأصالة للعود واللبان",
          domain: "abeer-alasala.om",
          brandHandle: "@abeer_om",
          market: market,
          platform: "meta",
          activeAdsCount: 5,
          primaryOffer: "اشتر 1 واحصل على الثاني بنصف السعر",
          priceRange: "22 - 38 ر.ع.",
          shippingOffer: "توصيل عادي 3 ر.ع. لجميع المناطق",
          guaranteeOffer: "لا يوجد ضمان تجربة مجانية",
          confidence: 88,
          ads: [
            {
              externalId: "meta_ad_201",
              platform: "meta",
              format: "image",
              headline: "باقة اللبان الظفاري اليومية",
              bodyCopy: "3 روائح مميزة تناسب صباحك ومساءك. عطور أصيلة من قلب عمان.",
              hook: "ليش تشتري عطر واحد إذا تقدر تاخذ الباقة كاملة؟",
              painPoint: "الحيرة في اختيار الرائحة المناسبة",
              promise: "تشكيلة متكاملة تناسب كل الأوقات",
              proof: "شهادات عملاء في ستوري الانستغرام",
              offer: "خصم 30% على المجموعة الكاملة",
              cta: "شاهد المجموعة",
              daysActive: 19,
              isActive: true,
              spendVelocity: "medium",
            },
          ],
        },
        {
          name: "ميسك ولبان الخليج",
          domain: "mesk-luban.com",
          brandHandle: "@mesk_luban",
          market: market,
          platform: "tiktok",
          activeAdsCount: 4,
          primaryOffer: "عرض الافتتاح: عطرين بسعر 29 ر.ع.",
          priceRange: "20 - 35 ر.ع.",
          shippingOffer: "شحن مجاني عند الدفع الإلكتروني",
          guaranteeOffer: "استبدال فقط خلال يومين",
          confidence: 82,
          ads: [
            {
              externalId: "tiktok_ad_301",
              platform: "tiktok",
              format: "video",
              headline: "العطر الأكثر طلباً في مسقط هذا الأسبوع",
              bodyCopy: "مزيج منعش من اللبان الطبيعي والتوت البري.",
              hook: "تخيل ريحة نظافة وفخامة تلفت الأنظار طول اليوم!",
              painPoint: "العطور الزيتية الثقيلة التي تبقع الملابس",
              promise: "تركيبة مائية خفيفة وآمنة تماماً على الأقمشة البيضاء",
              proof: "أكثر من 400 طلب في أول أسبوع",
              offer: "هدية لوشن لبان مع أول 100 طلب",
              cta: "اطلب الآن",
              daysActive: 11,
              isActive: true,
              spendVelocity: "medium",
            },
          ],
        },
      ];
    }

    if (isAbaya) {
      return [
        {
          name: "دار رزان للعبايات الراقية",
          domain: "razan-abayas.com",
          brandHandle: "@razan_abaya",
          market: market,
          platform: "meta",
          activeAdsCount: 8,
          primaryOffer: "خصم 15% على كولكشن الشتاء + طرحة مجانية",
          priceRange: "35 - 75 ر.ع.",
          shippingOffer: "توصيل خلال 3-6 أيام عمل",
          guaranteeOffer: "تعديل المقاس مجاناً لمرة واحدة",
          confidence: 91,
          ads: [
            {
              externalId: "meta_ad_abaya_1",
              platform: "meta",
              format: "video",
              headline: "كولكشن عبايات الكريب الملكي المنسدل",
              bodyCopy: "قماش كوري أصلي لا يحتاج كوي مستمر مع قصة واسعة مريحة.",
              hook: "العباية اللي بتنقذك في كل طلعة دوام ومناسبة!",
              painPoint: "العبايات التي تتجعد بسرعة وتكتم الحرارة في الصيف",
              promise: "قماش بارد انسيابي وخياطة يدوية متقنة",
              proof: "أكثر من 2,500 عميلة في سلطنة عمان والإمارات",
              offer: "طرحة وشيلة هدية مع كل عباية",
              cta: "تسوقي الكولكشن",
              daysActive: 35,
              isActive: true,
              spendVelocity: "high",
            },
          ],
        },
      ];
    }

    // Generic GCC E-Commerce Product Competitors
    return [
      {
        name: `براند القمة — ${keyword}`,
        domain: "al-qimma-store.com",
        brandHandle: "@alqimma_store",
        market: market,
        platform: "meta",
        activeAdsCount: 6,
        primaryOffer: "خصم 20% على الطلبات الأولى",
        priceRange: "15 - 45 ر.ع.",
        shippingOffer: "توصيل خلال 2-4 أيام",
        guaranteeOffer: "ضمان استبدال خلال 7 أيام",
        confidence: 89,
        ads: [
          {
            externalId: "meta_gen_1",
            platform: "meta",
            format: "video",
            headline: `الحل الأفضل لـ ${keyword} بجودة مضمونة`,
            bodyCopy: "تصميم متقن وخدمة عملاء على مدار الساعة مع خيارات دفع ميسرة.",
            hook: `هل تبحث عن ${keyword} بجودة تدوم وتستحق كل بيسة؟`,
            painPoint: "المنتجات المقلدة وضعيفة الجودة في السوق",
            promise: "جودة أصلية 100% مع شهادة ضمان معتمدة",
            proof: "أكثر من 1,500 تقييم إيجابي",
            offer: "شحن مجاني للطلبات فوق 25 ر.ع.",
            cta: "اطلب الآن",
            daysActive: 24,
            isActive: true,
            spendVelocity: "high",
          },
          {
            externalId: "tiktok_gen_2",
            platform: "tiktok",
            format: "video",
            headline: `تجربة حقيقية لـ ${keyword}`,
            bodyCopy: "شوف النتيجة قبل وبعد وكيف وفر علينا الكثير من الوقت والجهد.",
            hook: "هذا الشيء غير روتيني اليومي 180 درجة!",
            painPoint: "إهدار الوقت في حلول بديلة غير فعالة",
            promise: "نتيجة ملحوظة من أول استخدام",
            proof: "فيديو تجربة عملية موثق",
            offer: "عرض خاص لفترة محدودة",
            cta: "تسوق الآن",
            daysActive: 16,
            isActive: true,
            spendVelocity: "medium",
          },
        ],
      },
      {
        name: `متجر الريادة — ${keyword}`,
        domain: "riyada-gcc.com",
        brandHandle: "@riyada_gcc",
        market: market,
        platform: "tiktok",
        activeAdsCount: 4,
        primaryOffer: "اشتري 2 واحصل على شحن مجاني",
        priceRange: "18 - 35 ر.ع.",
        shippingOffer: "توصيل خلال 3-5 أيام (رسوم 2 ر.ع.)",
        guaranteeOffer: "استرجاع خلال 3 أيام",
        confidence: 84,
        ads: [
          {
            externalId: "meta_gen_3",
            platform: "meta",
            format: "carousel",
            headline: `أحدث تشكيلة ${keyword} لعام 2026`,
            bodyCopy: "خيارات متنوعة وألوان عصرية تناسب جميع الأذواق.",
            hook: "ليه تكتفي بالتقليدي إذا تقدر تتميز؟",
            painPoint: "قلة التنوع والأسعار المبالغ فيها",
            promise: "أفضل قيمة مقابل السعر في السوق المحلي",
            proof: "تقييمات المتجر 4.8 / 5",
            offer: "خصم 15% عند استخدام كود SAVE15",
            cta: "تصفح العروض",
            daysActive: 12,
            isActive: true,
            spendVelocity: "medium",
          },
        ],
      },
    ];
  }
}
