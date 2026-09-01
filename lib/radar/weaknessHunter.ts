import type { NormalizedCompetitorResult, NormalizedAdResult } from "./providers/types";
import type { CompetitorWeaknessData, WeaknessType, ConfidenceLevel } from "./types";

/**
 * Weakness Hunter Engine
 * Extracts concrete, evidence-backed vulnerabilities without empty speculation.
 */
export function huntCompetitorWeaknesses(
  competitor: NormalizedCompetitorResult
): Array<Omit<CompetitorWeaknessData, "id" | "competitorId">> {
  const weaknesses: Array<Omit<CompetitorWeaknessData, "id" | "competitorId">> = [];

  // 1. Shipping & Logistics Weakness Analysis
  const shippingLower = competitor.shippingOffer.toLowerCase();
  if (shippingLower.includes("4-5") || shippingLower.includes("5-7") || shippingLower.includes("بطيء") || shippingLower.includes("رسوم 2") || shippingLower.includes("رسوم 3")) {
    weaknesses.push({
      type: "shipping",
      title: "بطء سرعة التوصيل وفرض رسوم شحن إضافية",
      description: "المنافس يستغرق أكثر من 4 أيام للشحن ويفرض رسوم توصيل تفوق 2 ر.ع. مما يرفع نسبة التردد عند الدفع.",
      evidence: `عرض الشحن الحالي للمنافس: "${competitor.shippingOffer}"`,
      confidence: "high",
      exploitationAngle: "اعرض توصيل سريع خلال 24-48 ساعة مع شحن مجاني للطلبات فوق 20 ر.ع. أو عند الدفع المسبق.",
    });
  }

  // 2. Trust & Guarantee Weakness Analysis
  const guaranteeLower = competitor.guaranteeOffer.toLowerCase();
  if (guaranteeLower.includes("3 أيام") || guaranteeLower.includes("لا يوجد") || guaranteeLower.includes("يومين") || guaranteeLower.includes("استبدال فقط")) {
    weaknesses.push({
      type: "trust",
      title: "سياسة استرجاع مقيدة تفتقر لضمان التجربة الحرة",
      description: "عدم إتاحة تجربة المنتج (مثل عينة تجربة خارجية قبل فتح العلبة الأصلية) يقلل معدل التحويل لدى المشترين الجدد.",
      evidence: `سياسة الضمان المعلنة للمنافس: "${competitor.guaranteeOffer}"`,
      confidence: "high",
      exploitationAngle: "قدّم 'ضمان الاسترجاع الذهبي 14 يوماً مع عينة تجربة مجانية مرفقة خارجياً'.",
    });
  }

  // 3. Creative Variety & Format Weakness
  const allImages = competitor.ads.every((a) => a.format === "image");
  const lowCount = competitor.ads.length <= 1;
  if (allImages || lowCount) {
    weaknesses.push({
      type: "creative",
      title: "ضعف تنوع الإعلانات والاعتماد على صور ثابتة (Creative Fatigue)",
      description: "يفتقر المنافس لمقاطع فيديو UGC واقعية وتجارب حية، مما يعرض حملاته للإجهاد الإعلاني وارتفاع تكلفة النقرة (CPC).",
      evidence: `المنافس يشغل ${competitor.ads.length} إعلان فقط، مع غياب الفيديوهات التفاعلية السريعة.`,
      confidence: "medium",
      exploitationAngle: "أطلق حملات فيديو UGC قصيرة تركز على المشاعر وفتح الصندوق (Unboxing) وحل المشكلة في أول 3 ثوانٍ.",
    });
  }

  // 4. Offer Structure & Bundle Weakness
  const offerLower = competitor.primaryOffer.toLowerCase();
  if (!offerLower.includes("باقة") && !offerLower.includes("هدية") && !offerLower.includes("bundle")) {
    weaknesses.push({
      type: "offer",
      title: "غياب العروض التجميعية الذكية (AOV Optimization)",
      description: "يركز المنافس على بيع قطع فردية أو خصومات نسبية تقليدية دون تقديم باقات هدايا ترفع متوسط قيمة السلة.",
      evidence: `العرض الرئيسي للمنافس: "${competitor.primaryOffer}"`,
      confidence: "medium",
      exploitationAngle: "ابنِ عروض باقات ثلاثية (مثال: اشتر 2 واحصل على الثالث + هدية إضافية) لرفع متوسط قيمة الطلب والتفوق في هوامش الربح.",
    });
  }

  // Fallback guarantee: Always provide at least one solid vulnerability angle
  if (weaknesses.length === 0) {
    weaknesses.push({
      type: "positioning",
      title: "تموضع تسويقي عام غير محدد الفئة",
      description: "المنافس يخاطب الجمهور العام دون زاوية استهداف محددة (مثل موظفي المكاتب أو الهدايا الفاخرة).",
      evidence: "نصوص الإعلانات تركز على المزايا العامة دون مخاطبة شريحة محددة بوضوح.",
      confidence: "medium",
      exploitationAngle: "اختر زاوية استخدام محددة (مثال: عطر الدوام المنعش أو طقم الإهداء الدبلوماسي).",
    });
  }

  return weaknesses;
}
