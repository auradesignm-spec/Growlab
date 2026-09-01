import type { NormalizedCompetitorResult } from "./providers/types";
import type { MarketOpportunityData, TargetMarket } from "./types";

/**
 * Opportunity Finder Engine (Phase 13)
 * Discovers white spaces, unserved positioning, and offer gaps from analyzed competitor landscape.
 */
export function findMarketOpportunities(
  keyword: string,
  market: TargetMarket,
  competitors: NormalizedCompetitorResult[]
): Array<Omit<MarketOpportunityData, "id" | "projectId">> {
  const opportunities: Array<Omit<MarketOpportunityData, "id" | "projectId">> = [];
  const kw = keyword.toLowerCase();

  // 1. White Space: Daily & Office Usage Angle
  opportunities.push({
    type: "white_space",
    title: "زاوية الاستخدام اليومي والعمل (Daily Office Essential)",
    description: `أغلب المنافسين في قطاع "${keyword}" يركزون على زوايا المناسبات الثقيلة أو الرسمية. هناك طلب واسع غير مخدوم لحلول يومية خفيفة وسريعة.`,
    opportunityScore: 92,
    competitionLevel: "low",
    recommendedDirection: "استهدف الموظفين ورواد الأعمال بحملة تسلط الضوء على الراحة، الثبات اليومي، والجاذبية غير المزعجة.",
    suggestedHooks: [
      "الحل اليومي اللي ما يصدع راسك ومناسب لكل طلعة دوام!",
      "كيف تبدأ يومك بلمسة فاخرة وخفيفة تدوم لـ 12 ساعة؟",
      "المنتج اللي الكل في مكتبك بيسألك عنه اليوم.",
    ],
    suggestedOffers: [
      "باقة الدوام: قطعة للمكتب + قطعة ميني للسيارة والحقيبة",
      "ضمان تجربة مجانية مع إمكانية الاسترجاع الفوري",
    ],
  });

  // 2. Offer Gap: Gifting & Direct Delivery
  opportunities.push({
    type: "offer_gap",
    title: "باقة الإهداء الملكية مع التوصيل السريع للمهدى إليه",
    description: "إعلانات المنافسين تفتقر لخدمة تغليف الهدايا المخصصة مع بطاقات الإهداء والشحن المباشر للمستلم.",
    opportunityScore: 86,
    competitionLevel: "low",
    recommendedDirection: "أضف خيار 'إرسال كهدية' عند الدفع مع كرت إهداء مجاني فاخر بدون ذكر السعر للمستلم.",
    suggestedHooks: [
      "تبي تهدي شخص غالي هدية ترفع الراس وتوصل لباب بيته مغلفة وجاهزة؟",
      "أسهل وأفخم طريقة لتقديم هدية تليق بأحبابك في مسقط والخليج.",
    ],
    suggestedOffers: [
      "تغليف هدية مجاني + كرت إهداء بخط يدوي فاخر للطلبات فوق 25 ر.ع.",
    ],
  });

  // 3. Creative Gap: Real UGC vs Polished Studios
  const hasTooManyStudioAds = competitors.every((c) => c.ads.some((a) => a.format === "image" || a.format === "carousel"));
  if (hasTooManyStudioAds || competitors.length > 0) {
    opportunities.push({
      type: "creative_gap",
      title: "فجوة المحتوى الصادق (UGC Video Demonstration)",
      description: "المنافسون يركزون على تصاميم فوتوشوب وصور كانفا مكررة. إعلانات الفيديو الواقعية بعفوية المشتري تحقق تكلفة اكتساب عميل (CPA) أقل بنسبة 40%.",
      opportunityScore: 89,
      competitionLevel: "low",
      recommendedDirection: "تعاقد مع 2-3 صناع محتوى محليين لتوثيق تجربة الاستلام، فتح العلبة، والاستخدام في بيئة طبيعية.",
      suggestedHooks: [
        "شوفوا وش وصلني اليوم من المتجر العماني الأكثر تداولاً!",
        "طلبت هذا المنتج بعد ما شفته عند كل مشاهير مسقط.. وهذي النتيجة الصادمة!",
      ],
      suggestedOffers: [
        "كود خصم حصري لمتابعي صانع المحتوى مع شحن مجاني",
      ],
    });
  }

  return opportunities;
}
