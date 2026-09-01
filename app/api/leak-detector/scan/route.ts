import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const monthlySales = Number(body.monthlySales || 3500);
    const monthlyAdSpend = Number(body.monthlyAdSpend || 900);
    const avgCogsPercent = Number(body.avgCogsPercent || 30) / 100;
    const avgShippingFee = Number(body.avgShippingFee || 2.0);
    const returnRate = Number(body.returnRate || 12) / 100;
    const paymentMethod = String(body.paymentMethod || "COD");
    const currency = String(body.currency || "ر.ع.");

    // Calculations based on GCC E-Commerce Benchmark rules
    // 1. Estimated Ad Waste: typically 15-28% of ad spend is burned on losing adsets / negative ROAS campaigns
    const estimatedAdWaste = monthlyAdSpend * 0.22;

    // 2. Estimated Negative Margin Product Leaks: approx 4-7% of gross sales are eroded by underpriced SKU variants
    const estimatedProductMarginLeaks = monthlySales * 0.054;

    // 3. Estimated COD Remittance & Courier Discrepancies (if COD used)
    // In GCC COD logistics, 3.5% to 6.2% of delivered shipments suffer remittance delays, shortfalls, or erroneous return fees
    const isCod = paymentMethod === "COD" || paymentMethod === "MIXED";
    const estimatedCourierLeaks = isCod ? monthlySales * 0.048 : 0;

    // 4. Return handling & RTO leaks (shipping paid twice with zero revenue)
    const estimatedRtoLosses = monthlySales * returnRate * 0.18;

    const totalEstimatedLeaks =
      estimatedAdWaste + estimatedProductMarginLeaks + estimatedCourierLeaks + estimatedRtoLosses;

    const netProfitBefore =
      monthlySales - (monthlySales * avgCogsPercent + monthlySales * 0.08 + monthlyAdSpend + estimatedRtoLosses);
    const netProfitAfterRecovery = netProfitBefore + totalEstimatedLeaks * 0.85; // 85% recoverable

    const response = {
      success: true,
      monthlySales,
      currency,
      totalEstimatedLeaks: Math.round(totalEstimatedLeaks),
      recoverableAmount: Math.round(totalEstimatedLeaks * 0.85),
      headlineSummaryAr: `لو كنت مشتركاً معنا، كنا لقينا لك تقريباً ${Math.round(totalEstimatedLeaks)} ${currency} تسريبات ربح شهرية تحتاج مراجعة واسترجاع.`,
      headlineSummaryEn: `If you were subscribed with us, we would have discovered approximately ${Math.round(totalEstimatedLeaks)} ${currency} in monthly profit leaks for review.`,
      breakdown: [
        {
          source: "AD_CAMPAIGN",
          titleAr: "حملات إعلانية خاسرة تستنزف الميزانية",
          titleEn: "Losing Ad Campaigns",
          amount: Math.round(estimatedAdWaste),
          percentage: Math.round((estimatedAdWaste / totalEstimatedLeaks) * 100),
          tipAr: "إيقاف المجموعات الإعلانية التي يقل فيها هامش الربح الصافي عن نقطة التعادل.",
        },
        {
          source: "PRODUCT_MARGIN",
          titleAr: "منتجات تُباع بهامش ربح سالب بعد الشحن والإعلانات",
          titleEn: "Negative Margin Products",
          amount: Math.round(estimatedProductMarginLeaks),
          percentage: Math.round((estimatedProductMarginLeaks / totalEstimatedLeaks) * 100),
          tipAr: "تعديل تسعير القطع أو تجميعها في عروض باقات تغطي تكلفة التوصيل.",
        },
        ...(isCod
          ? [
              {
                source: "SHIPPING_RECONCILIATION",
                titleAr: "فروقات تسوية مع شركات الشحن ومبالغ COD غير محولة",
                titleEn: "COD Courier Settlement Discrepancies",
                amount: Math.round(estimatedCourierLeaks),
                percentage: Math.round((estimatedCourierLeaks / totalEstimatedLeaks) * 100),
                tipAr: "مطابقة آلية فورية لكشف حساب شركة الشحن مع كل طلب تم تسليمه.",
              },
            ]
          : []),
        {
          source: "RETURN_RTO",
          titleAr: "تكلفة مرتجعات غير محسوبة ورسوم شحن مهدورة",
          titleEn: "Unaccounted Return & RTO Logistics Costs",
          amount: Math.round(estimatedRtoLosses),
          percentage: Math.round((estimatedRtoLosses / totalEstimatedLeaks) * 100),
          tipAr: "إعادة استهداف العملاء وتأكيد عناوين التوصيل بدقة لتقليل الإرجاع.",
        },
      ],
      netProfitComparison: {
        currentEstimatedProfit: Math.round(netProfitBefore),
        optimizedProfit: Math.round(netProfitAfterRecovery),
        profitIncreasePercent: netProfitBefore > 0 ? Math.round(((netProfitAfterRecovery - netProfitBefore) / netProfitBefore) * 100) : 100,
      },
      guarantee: "ضمان بدون اكتشاف، بدون رسوم (No-Find, No-Fee Guarantee) — لن تدفع أي رسوم أداء إلا إذا ساعدناك بتوفير فلوس حقيقية.",
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate leak scan" }, { status: 500 });
  }
}
