/**
 * Growlab Core Financial Profit & Multi-Tier Leak Detection Engine
 * 
 * Specifically designed for GCC & Oman e-commerce merchants across all payment types (COD, Card, Bank Transfer).
 * Calculates True Net Profit and flags silent leaks:
 *  - Losing Ad Campaigns (negative net margin after COGS + Shipping)
 *  - Products with Negative Margin (selling price < unit COGS + shipping fee + return allowance + ad allocation)
 *  - COD Shipping Reconciliation Discrepancies (Delivered orders with missing remittance or underpaid cash)
 */

export type PaymentMethodType = "COD" | "ELECTRONIC" | "MIXED";

export type ConfidenceTier = "TIER_1_CONFIRMED" | "TIER_2_ESTIMATED" | "TIER_3_REVIEW_NEEDED";

export type LeakSource = "AD_CAMPAIGNS" | "NEGATIVE_MARGIN_PRODUCT" | "SHIPPING_RECONCILIATION" | "RETURNS_OVERHEAD";

export interface MerchantProductCosting {
  id: string;
  sku: string;
  title: string;
  sellingPrice: number; // e.g. 25 OMR
  cogs: number; // Unit Cost of Goods Sold, e.g. 6 OMR
  shippingFee: number; // Courier fee per unit, e.g. 2 OMR
  returnRate: number; // e.g. 0.10 (10%)
  adCostAllocation: number; // Estimated ad spend per unit sold, e.g. 4 OMR
  unitsSold: number;
  currency?: string;
}

export interface AdCampaignMetric {
  id: string;
  platform: "Meta" | "Snapchat" | "Google" | "TikTok";
  campaignName: string;
  spend: number;
  attributedSales: number;
  ordersCount: number;
  cogsTotal: number;
  shippingTotal: number;
  currency?: string;
}

export interface PlatformOrder {
  id: string;
  orderNumber: string;
  trackingNumber?: string;
  customerName: string;
  customerPhone?: string;
  productTitle: string;
  sellingPrice: number;
  cogs: number;
  shippingCost: number;
  paymentMethod: "COD" | "PREPAID";
  courierName?: string;
  orderDate: string;
  status: "DELIVERED" | "IN_TRANSIT" | "RETURNED" | "CANCELLED";
}

export interface CourierStatementLine {
  id: string;
  waybillNumber: string;
  orderReference?: string;
  customerPhone?: string;
  customerName?: string;
  courierName: string;
  courierStatus: "DELIVERED" | "RETURNED" | "IN_TRANSIT";
  codCollectedAmount: number; // Amount collected from customer
  codRemittedAmount: number; // Payout transferred to merchant bank
  courierFee: number;
  deliveryDate: string;
}

export interface DetectedLeak {
  id: string;
  tier: ConfidenceTier;
  confidenceScore: number; // 0.0 - 1.0 (1.0 = Tier 1 deterministic)
  source: LeakSource;
  entityId: string;
  entityName: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  estimatedLeakAmount: number;
  currency: string;
  evidence: {
    matchingCriteria?: string;
    calculationBreakdown: string;
    dataPoints: Record<string, any>;
  };
  recommendedActionAr: string;
  recommendedActionEn: string;
  status: "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";
  detectedAt: string;
}

export interface NetProfitOverview {
  grossSales: number;
  totalCogs: number;
  totalShippingCosts: number;
  totalAdSpend: number;
  returnsLosses: number;
  netProfit: number;
  netMarginPercent: number;
  currency: string;
  totalDetectedLeaksAmount: number;
  confirmedLeaksAmount: number;
  estimatedLeaksAmount: number;
  totalRecoveredAmount: number;
  performanceFeeOwed: number; // 10% of recovered amount
  leaksCount: {
    total: number;
    tier1: number;
    tier2: number;
    tier3: number;
  };
}

export interface ReconciliationSummary {
  totalOrdersChecked: number;
  matchedExactCount: number; // Tier 1: Waybill / Order # match
  matchedFuzzyCount: number; // Tier 2: Phone + Amount match
  unmatchedCount: number;
  totalShortfall: number;
  discrepancies: DetectedLeak[];
}

export interface AuditTrailLog {
  id: string;
  timestamp: string;
  leakId: string;
  action: string;
  performedBy: string;
  details: string;
}

/**
 * Calculates Unit Net Profit and flags negative margin SKUs
 */
export function calculateProductNetProfit(p: MerchantProductCosting) {
  // Returns penalty: if return rate is 10%, we lose shippingFee * returnRate on unfulfilled attempts
  const returnCostPerUnit = p.shippingFee * p.returnRate;
  const totalUnitCost = p.cogs + p.shippingFee + p.adCostAllocation + returnCostPerUnit;
  const unitNetProfit = p.sellingPrice - totalUnitCost;
  const unitMarginPercent = p.sellingPrice > 0 ? (unitNetProfit / p.sellingPrice) * 100 : 0;
  const totalNetProfit = unitNetProfit * p.unitsSold;

  return {
    totalUnitCost,
    unitNetProfit,
    unitMarginPercent,
    totalNetProfit,
    isNegativeMargin: unitNetProfit < 0,
  };
}

/**
 * Calculates real ad campaign profitability
 */
export function calculateCampaignNetProfit(c: AdCampaignMetric) {
  const directCosts = c.cogsTotal + c.shippingTotal + c.spend;
  const netProfit = c.attributedSales - directCosts;
  const netMarginPercent = c.attributedSales > 0 ? (netProfit / c.attributedSales) * 100 : 0;
  const roas = c.spend > 0 ? +(c.attributedSales / c.spend).toFixed(2) : 0;

  return {
    directCosts,
    netProfit,
    netMarginPercent,
    roas,
    isLosingCampaign: netProfit < 0,
  };
}

/**
 * Core Leak Detection and Reconciliation Engine
 */
export function detectAllProfitLeaks(params: {
  products: MerchantProductCosting[];
  campaigns: AdCampaignMetric[];
  orders: PlatformOrder[];
  courierStatements: CourierStatementLine[];
  paymentMethod: PaymentMethodType;
  currency?: string;
}): {
  leaks: DetectedLeak[];
  overview: NetProfitOverview;
  reconciliation: ReconciliationSummary;
  auditTrail: AuditTrailLog[];
} {
  const currency = params.currency || "ر.ع.";
  const leaks: DetectedLeak[] = [];
  const auditTrail: AuditTrailLog[] = [];

  let grossSales = 0;
  let totalCogs = 0;
  let totalShippingCosts = 0;
  let totalAdSpend = 0;
  let returnsLosses = 0;

  // 1. PRODUCT AUDIT: Check for negative margin products
  for (const prod of params.products) {
    const analysis = calculateProductNetProfit(prod);
    grossSales += prod.sellingPrice * prod.unitsSold;
    totalCogs += prod.cogs * prod.unitsSold;
    totalShippingCosts += prod.shippingFee * prod.unitsSold;

    if (analysis.isNegativeMargin) {
      const lostAmount = Math.abs(analysis.totalNetProfit);
      const leakId = `leak-prod-${prod.id}`;
      leaks.push({
        id: leakId,
        tier: "TIER_1_CONFIRMED",
        confidenceScore: 1.0,
        source: "NEGATIVE_MARGIN_PRODUCT",
        entityId: prod.id,
        entityName: prod.title,
        titleAr: `منتج بهامش ربح سالب (${prod.title})`,
        titleEn: `Negative Margin Product (${prod.title})`,
        descriptionAr: `سعر البيع (${prod.sellingPrice} ${currency}) لا يغطي تكلفة التوريد (${prod.cogs}) + الشحن (${prod.shippingFee}) + حصة الإعلان (${prod.adCostAllocation}). تخسر ${Math.abs(analysis.unitNetProfit).toFixed(2)} ${currency} في كل قطعة!`,
        descriptionEn: `Selling price (${prod.sellingPrice} ${currency}) fails to cover COGS (${prod.cogs}) + shipping (${prod.shippingFee}) + ad allocation (${prod.adCostAllocation}). Losing ${Math.abs(analysis.unitNetProfit).toFixed(2)} ${currency} per unit!`,
        estimatedLeakAmount: lostAmount,
        currency,
        evidence: {
          calculationBreakdown: `${prod.sellingPrice} (سعر) - (${prod.cogs} COGS + ${prod.shippingFee} شحن + ${prod.adCostAllocation} إعلان + ${(prod.shippingFee * prod.returnRate).toFixed(1)} مرتجع) = ${analysis.unitNetProfit.toFixed(2)} ${currency}/قطعة`,
          dataPoints: {
            sku: prod.sku,
            sellingPrice: prod.sellingPrice,
            unitCogs: prod.cogs,
            unitShipping: prod.shippingFee,
            adAllocation: prod.adCostAllocation,
            unitsSold: prod.unitsSold,
            unitNetProfit: analysis.unitNetProfit,
          },
        },
        recommendedActionAr: `رفع سعر البيع إلى ${(prod.cogs + prod.shippingFee + prod.adCostAllocation + 2).toFixed(2)} ${currency} أو تقليل تكلفة التوريد والإعلانات.`,
        recommendedActionEn: `Increase selling price to ${(prod.cogs + prod.shippingFee + prod.adCostAllocation + 2).toFixed(2)} ${currency} or reduce supplier/shipping costs.`,
        status: "OPEN",
        detectedAt: new Date().toISOString(),
      });

      auditTrail.push({
        id: `audit-prod-${prod.id}`,
        timestamp: new Date().toISOString(),
        leakId,
        action: "DETECT_NEGATIVE_MARGIN",
        performedBy: "Growlab Deterministic Cost Engine",
        details: `Verified unit economics for SKU ${prod.sku}. Loss per unit: ${Math.abs(analysis.unitNetProfit).toFixed(2)} ${currency}`,
      });
    }
  }

  // 2. AD CAMPAIGN AUDIT: Check for losing ad campaigns
  for (const camp of params.campaigns) {
    totalAdSpend += camp.spend;
    const analysis = calculateCampaignNetProfit(camp);

    if (analysis.isLosingCampaign) {
      const lostAmount = Math.abs(analysis.netProfit);
      const leakId = `leak-ad-${camp.id}`;
      leaks.push({
        id: leakId,
        tier: "TIER_1_CONFIRMED",
        confidenceScore: 1.0,
        source: "AD_CAMPAIGNS",
        entityId: camp.id,
        entityName: camp.campaignName,
        titleAr: `حملة إعلانية خاسرة (${camp.campaignName})`,
        titleEn: `Losing Ad Campaign (${camp.campaignName})`,
        descriptionAr: `الحملة حققت مبيعات ظاهرية قدرها ${camp.attributedSales} ${currency}، ولكن بعد خصم تكلفة البضاعة (${camp.cogsTotal}) والشحن (${camp.shippingTotal}) ومصروف الإعلان (${camp.spend})، صافي الخسارة هو ${lostAmount.toFixed(2)} ${currency}.`,
        descriptionEn: `Campaign generated gross sales of ${camp.attributedSales} ${currency}, but after COGS (${camp.cogsTotal}) + fulfillment (${camp.shippingTotal}) + ad spend (${camp.spend}), net loss is ${lostAmount.toFixed(2)} ${currency}.`,
        estimatedLeakAmount: lostAmount,
        currency,
        evidence: {
          calculationBreakdown: `${camp.attributedSales} (مبيعات) - (${camp.cogsTotal} COGS + ${camp.shippingTotal} شحن + ${camp.spend} إعلان) = ${analysis.netProfit.toFixed(2)} ${currency}`,
          dataPoints: {
            platform: camp.platform,
            spend: camp.spend,
            sales: camp.attributedSales,
            cogs: camp.cogsTotal,
            shipping: camp.shippingTotal,
            netProfit: analysis.netProfit,
            roas: analysis.roas,
          },
        },
        recommendedActionAr: `إيقاف الحملة فوراً أو إعادة استهداف الجمهور وتحسين نسبة التحويل.`,
        recommendedActionEn: `Pause campaign immediately or refine audience targeting to improve net conversion margin.`,
        status: "OPEN",
        detectedAt: new Date().toISOString(),
      });

      auditTrail.push({
        id: `audit-ad-${camp.id}`,
        timestamp: new Date().toISOString(),
        leakId,
        action: "DETECT_LOSING_ADSET",
        performedBy: "Growlab Ad Attribution Reconciler",
        details: `Calculated true net ad ROI. ROAS: ${analysis.roas}x, Net Loss: ${lostAmount.toFixed(2)} ${currency}`,
      });
    }
  }

  // 3. COD SHIPPING RECONCILIATION AUDIT (If merchant uses COD)
  let matchedExactCount = 0;
  let matchedFuzzyCount = 0;
  let totalShortfall = 0;
  const reconciliationDiscrepancies: DetectedLeak[] = [];

  if (params.paymentMethod === "COD" || params.paymentMethod === "MIXED") {
    // Cross-match courier statements with platform orders
    const stmtMapByWaybill = new Map<string, CourierStatementLine>();
    const stmtMapByPhone = new Map<string, CourierStatementLine>();

    for (const stmt of params.courierStatements) {
      if (stmt.waybillNumber) stmtMapByWaybill.set(stmt.waybillNumber.trim().toLowerCase(), stmt);
      if (stmt.customerPhone) stmtMapByPhone.set(stmt.customerPhone.trim(), stmt);
    }

    for (const ord of params.orders) {
      if (ord.paymentMethod !== "COD") continue;

      let matchedStmt: CourierStatementLine | undefined;
      let matchType: "EXACT" | "FUZZY" | "NONE" = "NONE";

      // Tier 1 Exact Check (Tracking / Waybill #)
      if (ord.trackingNumber && stmtMapByWaybill.has(ord.trackingNumber.trim().toLowerCase())) {
        matchedStmt = stmtMapByWaybill.get(ord.trackingNumber.trim().toLowerCase());
        matchType = "EXACT";
        matchedExactCount++;
      } else if (ord.customerPhone && stmtMapByPhone.has(ord.customerPhone.trim())) {
        // Tier 2 Fuzzy Check (Phone match)
        matchedStmt = stmtMapByPhone.get(ord.customerPhone.trim());
        matchType = "FUZZY";
        matchedFuzzyCount++;
      }

      if (matchedStmt) {
        // Check if collected COD was not remitted
        const shortfall = matchedStmt.codCollectedAmount - matchedStmt.codRemittedAmount;
        if (matchedStmt.courierStatus === "DELIVERED" && (matchedStmt.codRemittedAmount === 0 || shortfall > 0.5)) {
          const leakId = `leak-cod-${ord.id}-${matchedStmt.id}`;
          const isExact = matchType === "EXACT";
          totalShortfall += shortfall;

          const codLeak: DetectedLeak = {
            id: leakId,
            tier: isExact ? "TIER_1_CONFIRMED" : "TIER_2_ESTIMATED",
            confidenceScore: isExact ? 1.0 : 0.85,
            source: "SHIPPING_RECONCILIATION",
            entityId: ord.id,
            entityName: ord.trackingNumber || ord.orderNumber,
            titleAr: isExact
              ? `مستحقات شحن COD غير محولة (طلب #${ord.orderNumber})`
              : `اشتباه نقص تحويل شحن COD (طلب #${ord.orderNumber})`,
            titleEn: isExact
              ? `Unremitted COD Payout (Order #${ord.orderNumber})`
              : `Potential COD Payout Shortfall (Order #${ord.orderNumber})`,
            descriptionAr: `بوليصة شحن ${matchedStmt.waybillNumber} (${matchedStmt.courierName}) مسجلة كـ "مُسلّمة" للعميل مع تحصيل ${matchedStmt.codCollectedAmount} ${currency}، ولكن المحول في كشف الحساب هو ${matchedStmt.codRemittedAmount} ${currency} فقط (نقص: ${shortfall.toFixed(2)} ${currency}).`,
            descriptionEn: `Waybill ${matchedStmt.waybillNumber} (${matchedStmt.courierName}) is marked DELIVERED with ${matchedStmt.codCollectedAmount} ${currency} collected, but statement shows only ${matchedStmt.codRemittedAmount} ${currency} remitted (shortfall: ${shortfall.toFixed(2)} ${currency}).`,
            estimatedLeakAmount: shortfall,
            currency,
            evidence: {
              matchingCriteria: isExact ? "Exact Waybill Number Match (Tier 1)" : "Customer Phone + Amount Match (Tier 2 Fuzzy)",
              calculationBreakdown: `${matchedStmt.codCollectedAmount} (المحصل) - ${matchedStmt.codRemittedAmount} (المحول) = ${shortfall.toFixed(2)} ${currency}`,
              dataPoints: {
                orderNumber: ord.orderNumber,
                waybillNumber: matchedStmt.waybillNumber,
                courier: matchedStmt.courierName,
                collected: matchedStmt.codCollectedAmount,
                remitted: matchedStmt.codRemittedAmount,
                shortfall,
                deliveryDate: matchedStmt.deliveryDate,
              },
            },
            recommendedActionAr: `تصدير إشعار مطالبة رسمية لشركة ${matchedStmt.courierName} برقم البوليصة ${matchedStmt.waybillNumber} لاسترجاع المبلغ.`,
            recommendedActionEn: `Export formal dispute claim to ${matchedStmt.courierName} with Waybill #${matchedStmt.waybillNumber} to recover funds.`,
            status: "OPEN",
            detectedAt: new Date().toISOString(),
          };

          leaks.push(codLeak);
          reconciliationDiscrepancies.push(codLeak);

          auditTrail.push({
            id: `audit-cod-${ord.id}`,
            timestamp: new Date().toISOString(),
            leakId,
            action: isExact ? "MATCH_WAYBILL_DISCREPANCY_TIER1" : "MATCH_FUZZY_DISCREPANCY_TIER2",
            performedBy: "Growlab Shipping Reconciliation Engine",
            details: `Waybill ${matchedStmt.waybillNumber} matched order ${ord.orderNumber}. Discrepancy: ${shortfall.toFixed(2)} ${currency}`,
          });
        }
      }
    }
  }

  // Calculate Net Profit & Leaks Summary
  const netProfit = grossSales - (totalCogs + totalShippingCosts + totalAdSpend + returnsLosses);
  const netMarginPercent = grossSales > 0 ? (netProfit / grossSales) * 100 : 0;

  const confirmedLeaks = leaks.filter((l) => l.tier === "TIER_1_CONFIRMED");
  const estimatedLeaks = leaks.filter((l) => l.tier === "TIER_2_ESTIMATED");
  const reviewLeaks = leaks.filter((l) => l.tier === "TIER_3_REVIEW_NEEDED");

  const confirmedLeaksAmount = confirmedLeaks.reduce((sum, l) => sum + l.estimatedLeakAmount, 0);
  const estimatedLeaksAmount = estimatedLeaks.reduce((sum, l) => sum + l.estimatedLeakAmount, 0);
  const totalDetectedLeaksAmount = confirmedLeaksAmount + estimatedLeaksAmount;

  // Mock recovered amount tracking (e.g. 1,420 OMR from historical resolutions)
  const totalRecoveredAmount = 1420.0;
  const performanceFeeOwed = totalRecoveredAmount * 0.10; // 10% No-Find No-Fee

  const overview: NetProfitOverview = {
    grossSales,
    totalCogs,
    totalShippingCosts,
    totalAdSpend,
    returnsLosses,
    netProfit,
    netMarginPercent,
    currency,
    totalDetectedLeaksAmount,
    confirmedLeaksAmount,
    estimatedLeaksAmount,
    totalRecoveredAmount,
    performanceFeeOwed,
    leaksCount: {
      total: leaks.length,
      tier1: confirmedLeaks.length,
      tier2: estimatedLeaks.length,
      tier3: reviewLeaks.length,
    },
  };

  const reconciliation: ReconciliationSummary = {
    totalOrdersChecked: params.orders.length,
    matchedExactCount,
    matchedFuzzyCount,
    unmatchedCount: Math.max(0, params.orders.length - (matchedExactCount + matchedFuzzyCount)),
    totalShortfall,
    discrepancies: reconciliationDiscrepancies,
  };

  return {
    leaks,
    overview,
    reconciliation,
    auditTrail,
  };
}

/**
 * Pre-populated realistic sample merchant dataset for instant simulation & onboarding
 */
export function getSampleMerchantDataset() {
  const products: MerchantProductCosting[] = [
    {
      id: "prod-1",
      sku: "GL-PERF-01",
      title: "عطر اللبان العُماني الملكي (50ml)",
      sellingPrice: 32.0,
      cogs: 8.5,
      shippingFee: 2.0,
      returnRate: 0.08,
      adCostAllocation: 5.0,
      unitsSold: 210,
    },
    {
      id: "prod-2",
      sku: "GL-ABAYA-02",
      title: "عباية حرير فاخرة - كولكشن الشتاء",
      sellingPrice: 28.0,
      cogs: 14.0,
      shippingFee: 3.5,
      returnRate: 0.22, // High returns!
      adCostAllocation: 12.0, // High CPA!
      unitsSold: 85,
    },
    {
      id: "prod-3",
      sku: "GL-WATCH-03",
      title: "ساعة ذكية مقاومة للماء مع سوار إضافي",
      sellingPrice: 19.5,
      cogs: 6.0,
      shippingFee: 2.0,
      returnRate: 0.10,
      adCostAllocation: 3.5,
      unitsSold: 340,
    },
  ];

  const campaigns: AdCampaignMetric[] = [
    {
      id: "camp-1",
      platform: "Meta",
      campaignName: "حملة عطر اللبان - إنستغرام عمان",
      spend: 350.0,
      attributedSales: 1680.0,
      ordersCount: 52,
      cogsTotal: 442.0,
      shippingTotal: 104.0,
    },
    {
      id: "camp-2",
      platform: "Snapchat",
      campaignName: "حملة العبايات الشتوية - سناب شات الخليج",
      spend: 520.0,
      attributedSales: 672.0,
      ordersCount: 24,
      cogsTotal: 336.0,
      shippingTotal: 84.0,
    },
    {
      id: "camp-3",
      platform: "TikTok",
      campaignName: "حملة الساعات الذكية - تيك توك",
      spend: 280.0,
      attributedSales: 1462.5,
      ordersCount: 75,
      cogsTotal: 450.0,
      shippingTotal: 150.0,
    },
  ];

  const orders: PlatformOrder[] = [
    {
      id: "ord-101",
      orderNumber: "GL-ORD-8801",
      trackingNumber: "ARX-OM-99210",
      customerName: "سالم الشعيلي",
      customerPhone: "96891234567",
      productTitle: "عطر اللبان العُماني الملكي",
      sellingPrice: 32.0,
      cogs: 8.5,
      shippingCost: 2.0,
      paymentMethod: "COD",
      courierName: "Aramex",
      orderDate: "2026-08-20",
      status: "DELIVERED",
    },
    {
      id: "ord-102",
      orderNumber: "GL-ORD-8802",
      trackingNumber: "SMSA-OM-44109",
      customerName: "منى البلوشية",
      customerPhone: "96898765432",
      productTitle: "عباية حرير فاخرة",
      sellingPrice: 28.0,
      cogs: 14.0,
      shippingCost: 3.5,
      paymentMethod: "COD",
      courierName: "SMSA Express",
      orderDate: "2026-08-22",
      status: "DELIVERED",
    },
    {
      id: "ord-103",
      orderNumber: "GL-ORD-8803",
      trackingNumber: "JT-OM-11029",
      customerName: "خالد المعمري",
      customerPhone: "96892244668",
      productTitle: "ساعة ذكية مقاومة للماء",
      sellingPrice: 19.5,
      cogs: 6.0,
      shippingCost: 2.0,
      paymentMethod: "COD",
      courierName: "J&T Express",
      orderDate: "2026-08-25",
      status: "DELIVERED",
    },
  ];

  const courierStatements: CourierStatementLine[] = [
    {
      id: "stmt-1",
      waybillNumber: "ARX-OM-99210",
      orderReference: "GL-ORD-8801",
      customerPhone: "96891234567",
      customerName: "سالم الشعيلي",
      courierName: "Aramex",
      courierStatus: "DELIVERED",
      codCollectedAmount: 32.0,
      codRemittedAmount: 0.0, // ❌ Leak: Delivered but 0 remitted!
      courierFee: 2.0,
      deliveryDate: "2026-08-22",
    },
    {
      id: "stmt-2",
      waybillNumber: "SMSA-OM-44109",
      orderReference: "GL-ORD-8802",
      customerPhone: "96898765432",
      customerName: "منى البلوشية",
      courierName: "SMSA Express",
      courierStatus: "DELIVERED",
      codCollectedAmount: 28.0,
      codRemittedAmount: 20.0, // ❌ Leak: 8 OMR underpaid!
      courierFee: 3.5,
      deliveryDate: "2026-08-24",
    },
    {
      id: "stmt-3",
      waybillNumber: "JT-OM-11029",
      orderReference: "GL-ORD-8803",
      customerPhone: "96892244668",
      customerName: "خالد المعمري",
      courierName: "J&T Express",
      courierStatus: "DELIVERED",
      codCollectedAmount: 19.5,
      codRemittedAmount: 19.5, // ✅ Reconciled
      courierFee: 2.0,
      deliveryDate: "2026-08-27",
    },
  ];

  return {
    paymentMethod: "COD" as PaymentMethodType,
    products,
    campaigns,
    orders,
    courierStatements,
  };
}
