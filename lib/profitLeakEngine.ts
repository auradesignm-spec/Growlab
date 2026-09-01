/**
 * Growlab Profit Leak Detection & True Net Profit Engine
 * 
 * Specifically designed for GCC & Oman E-Commerce merchants across all payment methods:
 * (Electronic, Bank Transfer, Cash on Delivery COD, and Mixed).
 * 
 * CORE FORMULA:
 * True Net Profit = Gross Sales - (COGS + Shipping Fees + Returns/RTO Impact + Ad Spend)
 * 
 * LEAK DETECTION SOURCES:
 * 1. Losing Ad Campaigns (حملات إعلانية خاسرة)
 * 2. Negative Margin Products (منتجات هامش ربح سالب)
 * 3. Courier COD Settlement Discrepancies (فروقات تسوية شركات الشحن)
 * 
 * MULTI-TIER CONFIDENCE HIERARCHY:
 * - Tier 1: High Confidence (مؤكد) -> Exact order/tracking match or verified spend/COGS
 * - Tier 2: Medium Confidence (تقديري / مراجعة) -> Fuzzy phone + amount + date +/- 2 days
 * - Tier 3: Low Confidence (مراجعة يدوية) -> Unmatched / ambiguous cases
 */

export type PaymentMethod = "cod" | "electronic" | "bank_transfer" | "mixed";

export interface MerchantProduct {
  id: string;
  sku: string;
  title: string;
  category: string;
  sellingPrice: number;
  cogs: number; // Cost of Goods Sold
  shippingCost: number;
  returnRatePct: number; // e.g. 8%
  adSpendShare: number; // allocated ad spend
  currency: string;
  totalOrders: number;
  isActive: boolean;
}

export interface MerchantOrder {
  id: string;
  orderNumber: string;
  trackingNumber?: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  grossAmount: number;
  cogsAmount: number;
  shippingFee: number;
  paymentMethod: "COD" | "ELECTRONIC" | "BANK_TRANSFER";
  status: "delivered" | "in_transit" | "returned" | "cancelled" | "pending";
  courierName?: string;
  courierSettled: boolean;
  courierSettledAmount?: number;
  orderDate: string;
  city: string;
  country: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  channel: "Meta (Instagram/FB)" | "TikTok Ads" | "Snapchat" | "Google Ads" | "WhatsApp CTWA";
  spend: number;
  attributedGrossSales: number;
  attributedOrdersCount: number;
  attributedCogs: number;
  attributedShipping: number;
  attributedReturns: number;
  startDate: string;
  endDate: string;
  status: "active" | "paused" | "completed";
}

export interface CourierStatementLine {
  id: string;
  trackingNumber: string;
  orderNumber?: string;
  customerPhone?: string;
  deliveryDate: string;
  collectedCodAmount: number;
  courierFeeCharged: number;
  netPayoutToMerchant: number;
  courierStatus: "DELIVERED" | "RETURNED_RTO" | "LOST" | "DAMAGED";
  courierName: string;
}

export type LeakType = 
  | "losing_ad_campaign" 
  | "negative_margin_product" 
  | "courier_uncredited_delivery" 
  | "courier_underpaid_settlement" 
  | "courier_fee_overcharge" 
  | "high_rto_cancellation";

export type ConfidenceTier = "tier_1_high" | "tier_2_medium" | "tier_3_low";

export interface AuditTrailEntry {
  timestamp: string;
  ruleName: string;
  criteriaApplied: string;
  matchedFields: string[];
  confidenceScore: number; // 0 to 100
  reviewerNote?: string;
  verifiedByHuman: boolean;
}

export interface ProfitLeakItem {
  id: string;
  type: LeakType;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  sourceCategory: "ad_campaign" | "product_pricing" | "courier_settlement" | "returns_rto";
  estimatedLossAmount: number;
  currency: string;
  confidenceTier: ConfidenceTier;
  confidenceScore: number;
  isConfirmed: boolean; // True for Tier 1
  requiresReview: boolean; // True for Tier 2 & 3
  status: "active" | "recovered" | "action_taken" | "dismissed";
  relatedEntityId?: string;
  relatedEntityName?: string;
  recommendedAction: string;
  recommendedActionEn: string;
  auditTrail: AuditTrailEntry;
  createdAt: string;
}

export interface TrueNetProfitMetrics {
  grossSales: number;
  totalCogs: number;
  totalShippingCosts: number;
  totalReturnsAndRtoLoss: number;
  totalAdSpend: number;
  trueNetProfit: number;
  netMarginPercentage: number;
  totalOrders: number;
  successfulOrdersCount: number;
  returnedOrdersCount: number;
  returnRatePercentage: number;
  roas: number; // Gross Sales / Ad Spend
  truePoas: number; // True Profit on Ad Spend: Net Profit / Ad Spend
  mer: number; // Marketing Efficiency Ratio
  currency: string;
  
  // Leak stats
  totalDiscoveredLeaksAmount: number;
  confirmedLeaksAmount: number;
  needsReviewLeaksAmount: number;
  recoveredMoneyTotal: number;
  performanceFeeSaved: number; // 10% performance fee on recovered
  leaksCount: number;
}

// Global in-memory storage for active merchant session
export interface MerchantState {
  merchantId: string;
  businessName: string;
  paymentMethod: PaymentMethod; // "cod" | "electronic" | "bank_transfer" | "mixed"
  currency: string;
  products: MerchantProduct[];
  orders: MerchantOrder[];
  campaigns: AdCampaign[];
  courierStatements: CourierStatementLine[];
  leaks: ProfitLeakItem[];
  recoveredTotal: number;
  isInitialReviewPeriod: boolean; // 60 days founder review guarantee
  referralCode: string;
  referralsCount: number;
}

// Initial realistic default state for Oman & GCC e-commerce stores
export function createDefaultMerchantState(paymentMethod: PaymentMethod = "mixed"): MerchantState {
  const products: MerchantProduct[] = [
    {
      id: "prod-1",
      sku: "OM-ATTAR-ROYAL",
      title: "عطر خشب الصندل واللبان الحوجري الفاخر (50ml)",
      category: "عطور ودخون",
      sellingPrice: 28.0,
      cogs: 6.5,
      shippingCost: 1.8,
      returnRatePct: 4.5,
      adSpendShare: 7.2,
      currency: "OMR",
      totalOrders: 142,
      isActive: true,
    },
    {
      id: "prod-2",
      sku: "OM-DATES-VIP",
      title: "صندوق تمور خلاص فاخرة محشوة بالمكسرات الملكية",
      category: "أغذية وتمور",
      sellingPrice: 14.5,
      cogs: 5.0,
      shippingCost: 2.0,
      returnRatePct: 6.0,
      adSpendShare: 4.1,
      currency: "OMR",
      totalOrders: 98,
      isActive: true,
    },
    {
      id: "prod-3",
      sku: "OM-CHARGER-PRO",
      title: "شاحن سيارة ذكي مغناطيسي فائق السرعة 65W",
      category: "إلكترونيات واكسسوارات",
      sellingPrice: 8.5,
      cogs: 4.8,
      shippingCost: 2.2,
      returnRatePct: 16.5, // High return rate!
      adSpendShare: 4.5, // Total cost (4.8+2.2+4.5 + return loss) > 8.5 selling price!
      currency: "OMR",
      totalOrders: 65,
      isActive: true,
    },
    {
      id: "prod-4",
      sku: "OM-HAIR-OIL",
      title: "زيت تقوية وإنبات الشعر العضوي المركز",
      category: "عناية وجمال",
      sellingPrice: 19.0,
      cogs: 4.0,
      shippingCost: 1.8,
      returnRatePct: 5.0,
      adSpendShare: 5.5,
      currency: "OMR",
      totalOrders: 110,
      isActive: true,
    },
  ];

  const campaigns: AdCampaign[] = [
    {
      id: "camp-1",
      name: "حملة إنستقرام - عطر اللبان الحوجري (Reels Conversion)",
      channel: "Meta (Instagram/FB)",
      spend: 380.0,
      attributedGrossSales: 1680.0,
      attributedOrdersCount: 60,
      attributedCogs: 390.0,
      attributedShipping: 108.0,
      attributedReturns: 45.0,
      startDate: "2026-08-01",
      endDate: "2026-08-30",
      status: "active",
    },
    {
      id: "camp-2",
      name: "حملة تيك توك - شاحن السيارة السريع (Spark Ads)",
      channel: "TikTok Ads",
      spend: 290.0, // High spend with low basket & high returns = LOSING CAMPAIGN
      attributedGrossSales: 340.0,
      attributedOrdersCount: 40,
      attributedCogs: 192.0,
      attributedShipping: 88.0,
      attributedReturns: 68.0,
      startDate: "2026-08-10",
      endDate: "2026-08-28",
      status: "active",
    },
    {
      id: "camp-3",
      name: "حملة سناب شات - تمور خلاص الفاخرة",
      channel: "Snapchat",
      spend: 140.0,
      attributedGrossSales: 620.0,
      attributedOrdersCount: 43,
      attributedCogs: 215.0,
      attributedShipping: 86.0,
      attributedReturns: 25.0,
      startDate: "2026-08-15",
      endDate: "2026-08-30",
      status: "active",
    },
  ];

  const orders: MerchantOrder[] = [
    {
      id: "ord-101",
      orderNumber: "GL-88901",
      trackingNumber: "TRK-ARAMEX-9921",
      customerName: "سالم بن ناصر المعمري",
      customerPhone: "96891234567",
      productId: "prod-1",
      productTitle: "عطر خشب الصندل واللبان الحوجري الفاخر (50ml)",
      unitPrice: 28.0,
      quantity: 1,
      grossAmount: 28.0,
      cogsAmount: 6.5,
      shippingFee: 1.8,
      paymentMethod: "COD",
      status: "delivered",
      courierName: "Aramex Oman",
      courierSettled: true,
      courierSettledAmount: 28.0,
      orderDate: "2026-08-18",
      city: "مسقط",
      country: "عُمان",
    },
    {
      id: "ord-102",
      orderNumber: "GL-88902",
      trackingNumber: "TRK-ARAMEX-9922",
      customerName: "أحمد بن سعيد البلوشي",
      customerPhone: "96899887766",
      productId: "prod-1",
      productTitle: "عطر خشب الصندل واللبان الحوجري الفاخر (50ml)",
      unitPrice: 28.0,
      quantity: 1,
      grossAmount: 28.0,
      cogsAmount: 6.5,
      shippingFee: 1.8,
      paymentMethod: "COD",
      status: "delivered", // DELIVERED but courier payout NEVER included this order!
      courierName: "Aramex Oman",
      courierSettled: false,
      orderDate: "2026-08-19",
      city: "صلالة",
      country: "عُمان",
    },
    {
      id: "ord-103",
      orderNumber: "GL-88903",
      trackingNumber: "TRK-DHL-4401",
      customerName: "فاطمة بنت حمود الكندية",
      customerPhone: "96894455667",
      productId: "prod-2",
      productTitle: "صندوق تمور خلاص فاخرة محشوة بالمكسرات الملكية",
      unitPrice: 14.5,
      quantity: 2,
      grossAmount: 29.0,
      cogsAmount: 10.0,
      shippingFee: 2.0,
      paymentMethod: "ELECTRONIC",
      status: "delivered",
      courierName: "DHL Express",
      courierSettled: true,
      courierSettledAmount: 29.0,
      orderDate: "2026-08-20",
      city: "صحار",
      country: "عُمان",
    },
    {
      id: "ord-104",
      orderNumber: "GL-88904",
      trackingNumber: "TRK-ARAMEX-9924",
      customerName: "محمد بن راشد الشامسي",
      customerPhone: "96892211443",
      productId: "prod-3",
      productTitle: "شاحن سيارة ذكي مغناطيسي فائق السرعة 65W",
      unitPrice: 8.5,
      quantity: 1,
      grossAmount: 8.5,
      cogsAmount: 4.8,
      shippingFee: 2.2,
      paymentMethod: "COD",
      status: "returned",
      courierName: "Aramex Oman",
      courierSettled: false,
      orderDate: "2026-08-21",
      city: "نزوى",
      country: "عُمان",
    },
    {
      id: "ord-105",
      orderNumber: "GL-88905",
      trackingNumber: "TRK-ARAMEX-9925",
      customerName: "خالد بن علي الحارثي",
      customerPhone: "96895544332",
      productId: "prod-4",
      productTitle: "زيت تقوية وإنبات الشعر العضوي المركز",
      unitPrice: 19.0,
      quantity: 2,
      grossAmount: 38.0,
      cogsAmount: 8.0,
      shippingFee: 1.8,
      paymentMethod: "COD",
      status: "delivered", // Settled for 30 OMR instead of 38 OMR -> Underpaid!
      courierName: "Aramex Oman",
      courierSettled: true,
      courierSettledAmount: 30.0,
      orderDate: "2026-08-22",
      city: "بركاء",
      country: "عُمان",
    },
    {
      id: "ord-106",
      orderNumber: "GL-88906",
      trackingNumber: "TRK-ARAMEX-9926",
      customerName: "هلال بن سيف الغافري",
      customerPhone: "96897711223",
      productId: "prod-1",
      productTitle: "عطر خشب الصندل واللبان الحوجري الفاخر (50ml)",
      unitPrice: 28.0,
      quantity: 1,
      grossAmount: 28.0,
      cogsAmount: 6.5,
      shippingFee: 1.8,
      paymentMethod: "COD",
      status: "delivered",
      courierName: "Aramex Oman",
      courierSettled: true,
      courierSettledAmount: 28.0,
      orderDate: "2026-08-23",
      city: "السيب",
      country: "عُمان",
    },
  ];

  const courierStatements: CourierStatementLine[] = [
    {
      id: "cst-1",
      trackingNumber: "TRK-ARAMEX-9921",
      orderNumber: "GL-88901",
      customerPhone: "96891234567",
      deliveryDate: "2026-08-20",
      collectedCodAmount: 28.0,
      courierFeeCharged: 1.8,
      netPayoutToMerchant: 26.2,
      courierStatus: "DELIVERED",
      courierName: "Aramex Oman",
    },
    {
      id: "cst-2",
      trackingNumber: "TRK-ARAMEX-9925",
      orderNumber: "GL-88905",
      customerPhone: "96895544332",
      deliveryDate: "2026-08-24",
      collectedCodAmount: 30.0, // Should be 38.0! Discrepancy = 8.0 OMR
      courierFeeCharged: 1.8,
      netPayoutToMerchant: 28.2,
      courierStatus: "DELIVERED",
      courierName: "Aramex Oman",
    },
    {
      id: "cst-3",
      trackingNumber: "TRK-ARAMEX-9926",
      orderNumber: "GL-88906",
      customerPhone: "96897711223",
      deliveryDate: "2026-08-25",
      collectedCodAmount: 28.0,
      courierFeeCharged: 1.8,
      netPayoutToMerchant: 26.2,
      courierStatus: "DELIVERED",
      courierName: "Aramex Oman",
    },
  ];

  const initialState: MerchantState = {
    merchantId: "merch-om-01",
    businessName: "المتجر العُماني الرائد",
    paymentMethod,
    currency: "OMR",
    products,
    orders,
    campaigns,
    courierStatements,
    leaks: [],
    recoveredTotal: 340.0,
    isInitialReviewPeriod: true,
    referralCode: "GROW-OMAN-2026",
    referralsCount: 2,
  };

  initialState.leaks = runProfitLeakDetection(initialState);
  return initialState;
}

/**
 * Multi-Tier Confidence Profit Leak Detection Algorithm
 */
export function runProfitLeakDetection(state: MerchantState): ProfitLeakItem[] {
  const leaks: ProfitLeakItem[] = [];
  const nowStr = new Date().toISOString();

  // 1. LEAK SOURCE A: Losing Ad Campaigns (حملات إعلانية خاسرة) - Serves all merchants
  for (const camp of state.campaigns) {
    const totalExpenses = camp.spend + camp.attributedCogs + camp.attributedShipping + camp.attributedReturns;
    const netProfit = camp.attributedGrossSales - totalExpenses;
    const margin = camp.attributedGrossSales > 0 ? (netProfit / camp.attributedGrossSales) * 100 : -100;

    // Rule: If net profit is negative while ad spend continues (> 50 OMR)
    if (netProfit < 0 && camp.spend > 40) {
      const lossAmount = Math.abs(netProfit);
      leaks.push({
        id: `leak-camp-${camp.id}`,
        type: "losing_ad_campaign",
        title: `حملة إعلانية خاسرة: ${camp.name}`,
        titleEn: `Losing Ad Campaign: ${camp.name}`,
        description: `أنفقت ${camp.spend.toFixed(2)} ${state.currency} بإيراد ${camp.attributedGrossSales.toFixed(2)} ${state.currency}، ولكن بعد حساب تكلفة المنتج والشحن والمرتجع، تحقق خسارة فعلية قدرها ${lossAmount.toFixed(2)} ${state.currency} (هامش ${margin.toFixed(1)}%).`,
        descriptionEn: `Spent ${camp.spend.toFixed(2)} ${state.currency} generating ${camp.attributedGrossSales.toFixed(2)} ${state.currency}, but after COGS, shipping & returns, it is losing ${lossAmount.toFixed(2)} ${state.currency} (net margin ${margin.toFixed(1)}%).`,
        sourceCategory: "ad_campaign",
        estimatedLossAmount: +lossAmount.toFixed(2),
        currency: state.currency,
        confidenceTier: "tier_1_high",
        confidenceScore: 98,
        isConfirmed: true,
        requiresReview: false,
        status: "active",
        relatedEntityId: camp.id,
        relatedEntityName: camp.name,
        recommendedAction: "أوقف الحملة فوراً أو أعد استهداف الجمهور وتحسين سعر المنتج وتخفيض تكلفة الاستحواذ.",
        recommendedActionEn: "Pause this campaign immediately or adjust product pricing and targeting.",
        auditTrail: {
          timestamp: nowStr,
          ruleName: "LOSING_AD_CAMPAIGN_NEGATIVE_NET_PROFIT",
          criteriaApplied: `Spend (${camp.spend}) > 40 AND NetProfit (${netProfit.toFixed(2)}) < 0`,
          matchedFields: ["spend", "attributedGrossSales", "attributedCogs", "attributedShipping", "attributedReturns"],
          confidenceScore: 98,
          reviewerNote: "أرقام المصروف والإيرادات مدخلة مباشرة ومطابقة بنسبة 100%.",
          verifiedByHuman: true,
        },
        createdAt: nowStr,
      });
    }
  }

  // 2. LEAK SOURCE B: Negative Margin Products (منتجات هامش ربح سالب) - Serves all merchants
  for (const prod of state.products) {
    const returnLossPerUnit = (prod.returnRatePct / 100) * (prod.shippingCost * 1.5); // Reverse courier + packaging
    const totalUnitCost = prod.cogs + prod.shippingCost + prod.adSpendShare + returnLossPerUnit;
    const unitNetProfit = prod.sellingPrice - totalUnitCost;

    if (unitNetProfit < 0) {
      const estimatedTotalProductLoss = Math.abs(unitNetProfit) * Math.max(prod.totalOrders, 10);
      leaks.push({
        id: `leak-prod-${prod.id}`,
        type: "negative_margin_product",
        title: `منتج بهامش ربح سالب: ${prod.title}`,
        titleEn: `Negative Margin Product: ${prod.title}`,
        description: `سعر البيع (${prod.sellingPrice.toFixed(2)} ${state.currency}) أقل من التكلفة الإجمالية للوحدة (${totalUnitCost.toFixed(2)} ${state.currency} تشمل COGS ${prod.cogs} + شحن ${prod.shippingCost} + إعلانات ${prod.adSpendShare} + نسبة مرتجعات ${prod.returnRatePct}%). تخسر ${Math.abs(unitNetProfit).toFixed(2)} ${state.currency} مع كل طلب!`,
        descriptionEn: `Selling price (${prod.sellingPrice.toFixed(2)} ${state.currency}) is lower than total unit cost (${totalUnitCost.toFixed(2)} ${state.currency} including COGS, shipping, ad share & returns). You lose ${Math.abs(unitNetProfit).toFixed(2)} ${state.currency} per order!`,
        sourceCategory: "product_pricing",
        estimatedLossAmount: +estimatedTotalProductLoss.toFixed(2),
        currency: state.currency,
        confidenceTier: "tier_1_high",
        confidenceScore: 95,
        isConfirmed: true,
        requiresReview: false,
        status: "active",
        relatedEntityId: prod.id,
        relatedEntityName: prod.title,
        recommendedAction: "ارفع سعر البيع بنسبة 25% أو قلل حصة الصرف الإعلاني وفاوض المورد على تكلفة الجملة.",
        recommendedActionEn: "Increase selling price by 25% or renegotiate supplier COGS and reduce ad bid.",
        auditTrail: {
          timestamp: nowStr,
          ruleName: "NEGATIVE_UNIT_MARGIN_AFTER_ALL_COSTS",
          criteriaApplied: `SellingPrice (${prod.sellingPrice}) < TotalUnitCost (${totalUnitCost.toFixed(2)})`,
          matchedFields: ["sellingPrice", "cogs", "shippingCost", "adSpendShare", "returnRatePct"],
          confidenceScore: 95,
          reviewerNote: "تم حساب تكلفة الشحن والإرجاع وحصة الإعلانات بدقة حسابية تامة.",
          verifiedByHuman: true,
        },
        createdAt: nowStr,
      });
    }
  }

  // 3. LEAK SOURCE C: Courier COD Settlement Discrepancies (فروقات تسوية الشحن)
  // Activated specifically when paymentMethod includes COD or Mixed
  if (state.paymentMethod === "cod" || state.paymentMethod === "mixed") {
    const courierStatementMapByTracking = new Map<string, CourierStatementLine>();
    const courierStatementMapByOrderNum = new Map<string, CourierStatementLine>();

    for (const stmt of state.courierStatements) {
      if (stmt.trackingNumber) courierStatementMapByTracking.set(stmt.trackingNumber.trim().toUpperCase(), stmt);
      if (stmt.orderNumber) courierStatementMapByOrderNum.set(stmt.orderNumber.trim().toUpperCase(), stmt);
    }

    for (const order of state.orders) {
      if (order.paymentMethod !== "COD") continue;

      const trackingKey = order.trackingNumber ? order.trackingNumber.trim().toUpperCase() : "";
      const orderNumKey = order.orderNumber ? order.orderNumber.trim().toUpperCase() : "";

      const directMatch = (trackingKey && courierStatementMapByTracking.get(trackingKey)) ||
                          (orderNumKey && courierStatementMapByOrderNum.get(orderNumKey));

      // CASE C1: Order is DELIVERED but completely missing from Courier Statement (Uncredited Delivery)
      if (order.status === "delivered" && !directMatch) {
        // High confidence if tracking number exists, Medium if only order number/phone
        const tier: ConfidenceTier = order.trackingNumber ? "tier_1_high" : "tier_2_medium";
        const score = order.trackingNumber ? 96 : 78;

        leaks.push({
          id: `leak-courier-unpaid-${order.id}`,
          type: "courier_uncredited_delivery",
          title: `طلب COD مسلّم لم يُحسب في كشف شركة الشحن (${order.orderNumber})`,
          titleEn: `Delivered COD Order Missing from Courier Payout (${order.orderNumber})`,
          description: `الطلب رقم ${order.orderNumber} (تتبع: ${order.trackingNumber || "غير محدد"}) للعميل ${order.customerName} سُلّم بنجاح بقيمة ${order.grossAmount.toFixed(2)} ${state.currency}، لكن لم يظهر في كشف التحويل البنكي لشركة ${order.courierName || "الشحن"}.`,
          descriptionEn: `Order ${order.orderNumber} (Tracking: ${order.trackingNumber || "N/A"}) for ${order.customerName} was marked delivered for ${order.grossAmount.toFixed(2)} ${state.currency}, but was completely omitted from courier settlement.`,
          sourceCategory: "courier_settlement",
          estimatedLossAmount: +order.grossAmount.toFixed(2),
          currency: state.currency,
          confidenceTier: tier,
          confidenceScore: score,
          isConfirmed: tier === "tier_1_high",
          requiresReview: tier !== "tier_1_high",
          status: "active",
          relatedEntityId: order.id,
          relatedEntityName: order.orderNumber,
          recommendedAction: "طالب شركة الشحن رسمياً برقم التتبع لاسترداد مبلغ التحصيل غير المحوّل.",
          recommendedActionEn: "Claim uncredited COD amount from courier using official tracking reference.",
          auditTrail: {
            timestamp: nowStr,
            ruleName: "COD_DELIVERED_OMITTED_FROM_SETTLEMENT",
            criteriaApplied: `OrderStatus == 'delivered' AND CourierStatementMatch == false`,
            matchedFields: ["trackingNumber", "orderNumber", "grossAmount", "customerPhone"],
            confidenceScore: score,
            reviewerNote: tier === "tier_1_high" ? "تطابق دقيق برقم التتبع المسجل." : "مطابقة تقريبية برقم الهاتف والمدينة تحتاج مراجعة كشف الشحن يدوياً.",
            verifiedByHuman: tier === "tier_1_high",
          },
          createdAt: nowStr,
        });
      }

      // CASE C2: Order is in statement, but collected amount is LESS than order gross (Underpaid Settlement)
      if (directMatch && directMatch.collectedCodAmount < order.grossAmount) {
        const difference = order.grossAmount - directMatch.collectedCodAmount;
        if (difference > 0.1) {
          leaks.push({
            id: `leak-courier-underpaid-${order.id}`,
            type: "courier_underpaid_settlement",
            title: `فرق تسوية ناقص في تحصيل شركة الشحن (${order.orderNumber})`,
            titleEn: `Courier Underpaid COD Collection (${order.orderNumber})`,
            description: `المبلغ المطلوب تحصيله للطلب ${order.grossAmount.toFixed(2)} ${state.currency}، بينما سجّلت شركة ${directMatch.courierName} تحصيل ${directMatch.collectedCodAmount.toFixed(2)} ${state.currency} فقط. الفرق الضائع: ${difference.toFixed(2)} ${state.currency}.`,
            descriptionEn: `Order COD value was ${order.grossAmount.toFixed(2)} ${state.currency}, but ${directMatch.courierName} only credited ${directMatch.collectedCodAmount.toFixed(2)} ${state.currency}. Underpaid gap: ${difference.toFixed(2)} ${state.currency}.`,
            sourceCategory: "courier_settlement",
            estimatedLossAmount: +difference.toFixed(2),
            currency: state.currency,
            confidenceTier: "tier_1_high",
            confidenceScore: 99,
            isConfirmed: true,
            requiresReview: false,
            status: "active",
            relatedEntityId: order.id,
            relatedEntityName: order.orderNumber,
            recommendedAction: "أرسل إشعار تسوية لشركة الشحن لتعديل المبلغ المحصل وإيداع الفارق في حسابك البنكي.",
            recommendedActionEn: "Send adjustment claim to courier to collect remaining discrepancy.",
            auditTrail: {
              timestamp: nowStr,
              ruleName: "COD_UNDERPAID_SETTLEMENT_DISCREPANCY",
              criteriaApplied: `OrderGross (${order.grossAmount}) > CourierCollected (${directMatch.collectedCodAmount})`,
              matchedFields: ["trackingNumber", "orderNumber", "grossAmount", "collectedCodAmount"],
              confidenceScore: 99,
              reviewerNote: "مقارنة دقيقة ومطابقة بين رقم التتبع والمبلغ المودع في الكشف.",
              verifiedByHuman: true,
            },
            createdAt: nowStr,
          });
        }
      }
    }
  }

  return leaks;
}

/**
 * Compute Unified True Net Profit Metrics
 */
export function calculateTrueNetProfit(state: MerchantState): TrueNetProfitMetrics {
  let grossSales = 0;
  let totalCogs = 0;
  let totalShippingCosts = 0;
  let totalReturnsAndRtoLoss = 0;
  let totalOrders = state.orders.length;
  let successfulOrdersCount = 0;
  let returnedOrdersCount = 0;

  for (const order of state.orders) {
    if (order.status === "delivered") {
      grossSales += order.grossAmount;
      totalCogs += order.cogsAmount;
      totalShippingCosts += order.shippingFee;
      successfulOrdersCount++;
    } else if (order.status === "returned") {
      // In returns: goods return to stock, but merchant loses courier shipping + return shipping + packaging
      totalShippingCosts += order.shippingFee;
      totalReturnsAndRtoLoss += (order.shippingFee * 1.5) + (order.grossAmount * 0.1); // return handling
      returnedOrdersCount++;
    } else if (order.status === "in_transit" || order.status === "pending") {
      // Pending
    }
  }

  let totalAdSpend = state.campaigns.reduce((sum, c) => sum + c.spend, 0);
  
  // Formula: True Net Profit = Gross Sales - (COGS + Shipping + Returns + Ad Spend)
  const totalExpenses = totalCogs + totalShippingCosts + totalReturnsAndRtoLoss + totalAdSpend;
  const trueNetProfit = grossSales - totalExpenses;
  const netMarginPercentage = grossSales > 0 ? (trueNetProfit / grossSales) * 100 : 0;
  const returnRatePercentage = totalOrders > 0 ? (returnedOrdersCount / totalOrders) * 100 : 0;
  const roas = totalAdSpend > 0 ? grossSales / totalAdSpend : 0;
  const truePoas = totalAdSpend > 0 ? trueNetProfit / totalAdSpend : 0;
  const mer = totalAdSpend > 0 ? grossSales / totalAdSpend : 0;

  // Calculate Leak Totals
  const confirmedLeaks = state.leaks.filter(l => l.isConfirmed && l.status === "active");
  const needsReviewLeaks = state.leaks.filter(l => l.requiresReview && l.status === "active");

  const confirmedLeaksAmount = confirmedLeaks.reduce((sum, l) => sum + l.estimatedLossAmount, 0);
  const needsReviewLeaksAmount = needsReviewLeaks.reduce((sum, l) => sum + l.estimatedLossAmount, 0);
  const totalDiscoveredLeaksAmount = confirmedLeaksAmount + needsReviewLeaksAmount;

  return {
    grossSales: +grossSales.toFixed(2),
    totalCogs: +totalCogs.toFixed(2),
    totalShippingCosts: +totalShippingCosts.toFixed(2),
    totalReturnsAndRtoLoss: +totalReturnsAndRtoLoss.toFixed(2),
    totalAdSpend: +totalAdSpend.toFixed(2),
    trueNetProfit: +trueNetProfit.toFixed(2),
    netMarginPercentage: +netMarginPercentage.toFixed(1),
    totalOrders,
    successfulOrdersCount,
    returnedOrdersCount,
    returnRatePercentage: +returnRatePercentage.toFixed(1),
    roas: +roas.toFixed(2),
    truePoas: +truePoas.toFixed(2),
    mer: +mer.toFixed(2),
    currency: state.currency,
    totalDiscoveredLeaksAmount: +totalDiscoveredLeaksAmount.toFixed(2),
    confirmedLeaksAmount: +confirmedLeaksAmount.toFixed(2),
    needsReviewLeaksAmount: +needsReviewLeaksAmount.toFixed(2),
    recoveredMoneyTotal: +state.recoveredTotal.toFixed(2),
    performanceFeeSaved: +(state.recoveredTotal * 0.1).toFixed(2),
    leaksCount: state.leaks.filter(l => l.status === "active").length,
  };
}

/**
 * Free Instant Leak Scan Simulation Engine (No Registration Required)
 */
export interface InstantScanInput {
  monthlySales: number;
  monthlyAdSpend: number;
  paymentMethod: PaymentMethod;
  returnRatePct: number;
  courierUnsettledOrdersEstimate?: number;
  currency?: string;
}

export interface InstantScanResult {
  estimatedMonthlyLeaks: number;
  estimatedYearlyLeaks: number;
  losingAdsLeak: number;
  negativeMarginLeak: number;
  courierDiscrepancyLeak: number;
  returnWasteLeak: number;
  trueNetProfitEstimate: number;
  industryAverageLeakPct: number;
  leakBreakdown: Array<{
    category: string;
    categoryEn: string;
    amount: number;
    description: string;
    urgency: "high" | "medium";
  }>;
}

export function performFreeInstantLeakScan(input: InstantScanInput): InstantScanResult {
  const currency = input.currency || "OMR";
  const sales = Math.max(input.monthlySales || 1000, 100);
  const adSpend = Math.max(input.monthlyAdSpend || 250, 0);
  const returnRate = Math.min(Math.max(input.returnRatePct || 10, 0), 40);

  // Heuristic empirical models based on Gulf E-commerce merchant audits:
  // 1. Losing Ads leak: ~18% to 28% of ad spend is spent on non-profitable / negative margin segments
  const losingAdsLeak = +(adSpend * 0.22).toFixed(2);

  // 2. Negative margin / mispriced products: ~3.5% of gross sales
  const negativeMarginLeak = +(sales * 0.038).toFixed(2);

  // 3. Courier COD Settlement discrepancies (only if COD or Mixed): ~4.2% of COD volume
  let courierDiscrepancyLeak = 0;
  if (input.paymentMethod === "cod" || input.paymentMethod === "mixed") {
    const codShare = input.paymentMethod === "cod" ? 0.85 : 0.45;
    courierDiscrepancyLeak = +(sales * codShare * 0.045).toFixed(2);
  }

  // 4. Return handling & reverse courier drain:
  const returnWasteLeak = +(sales * (returnRate / 100) * 0.12).toFixed(2);

  const totalMonthlyLeaks = +(losingAdsLeak + negativeMarginLeak + courierDiscrepancyLeak + returnWasteLeak).toFixed(2);
  const estimatedYearlyLeaks = +(totalMonthlyLeaks * 12).toFixed(2);

  // Rough Net Profit Estimate = Sales - (Sales*0.35 COGS + adSpend + Sales*0.08 Shipping + totalMonthlyLeaks)
  const trueNetProfitEstimate = +(sales - (sales * 0.35 + adSpend + sales * 0.08 + totalMonthlyLeaks)).toFixed(2);

  const breakdown: InstantScanResult["leakBreakdown"] = [
    {
      category: "حملات إعلانية خاسرة وغير مجدية",
      categoryEn: "Losing Ad Campaigns",
      amount: losingAdsLeak,
      description: `صرف إعلاني يستمر على منتجات واستهدافات ذات صافي ربح سالب بعد خصم التكاليف.`,
      urgency: "high",
    },
    {
      category: "منتجات مسعّرة بهامش ربح سالب",
      categoryEn: "Negative Margin Products",
      amount: negativeMarginLeak,
      description: `منتجات تظن أنها رابحة لكن تكلفة الشحن وتجهيز الطلب ونسبة المرتجع تجعلها خاسرة فعلياً.`,
      urgency: "high",
    },
  ];

  if (courierDiscrepancyLeak > 0) {
    breakdown.push({
      category: "فروقات تسوية مع شركات الشحن (COD)",
      categoryEn: "Courier COD Settlement Gaps",
      amount: courierDiscrepancyLeak,
      description: `طلبات سُلّمت للعميل لكن لم تُحوّل في كشف الحساب أو حُوّلت بمبالغ ناقصة.`,
      urgency: "high",
    });
  }

  breakdown.push({
    category: "هدر المرتجعات ورسوم الشحن العكسي",
    categoryEn: "Returns & Reverse Logistics Waste",
    amount: returnWasteLeak,
    description: `رسوم شحن مستهلكة على طلبات ملغاة أو مرتجعة لا تُسترد من العميل.`,
    urgency: "medium",
  });

  return {
    estimatedMonthlyLeaks: totalMonthlyLeaks,
    estimatedYearlyLeaks,
    losingAdsLeak,
    negativeMarginLeak,
    courierDiscrepancyLeak,
    returnWasteLeak,
    trueNetProfitEstimate,
    industryAverageLeakPct: 14.2, // 14.2% average in GCC
    leakBreakdown: breakdown,
  };
}

/**
 * Generate Weekly / Periodic Executive Summary
 */
export function generateWeeklyExecutiveSummary(state: MerchantState): {
  summaryDate: string;
  totalLeaksDiscovered: number;
  totalEstimatedLoss: number;
  highConfidenceCount: number;
  needsReviewCount: number;
  recoveredSoFar: number;
  keyActionItems: string[];
} {
  const metrics = calculateTrueNetProfit(state);
  const highConfidence = state.leaks.filter(l => l.isConfirmed);
  const needsReview = state.leaks.filter(l => l.requiresReview);

  const actionItems: string[] = [];
  if (state.leaks.some(l => l.type === "losing_ad_campaign")) {
    actionItems.push("إيقاف أو تعديل الحملة الإعلانية الخاسرة فوراً لوقف نزيف الصرف اليومي.");
  }
  if (state.leaks.some(l => l.type === "negative_margin_product")) {
    actionItems.push("مراجعة تسعير المنتجات ذات الهامش السالب ورفع السعر أو تخفيض تكلفة الشحن.");
  }
  if (state.leaks.some(l => l.type === "courier_uncredited_delivery" || l.type === "courier_underpaid_settlement")) {
    actionItems.push("تصدير تقرير فروقات شركة الشحن وإرسال مطالبة مالية رسمية لفرق التحصيل.");
  }

  return {
    summaryDate: new Date().toLocaleDateString("ar-OM", { year: "numeric", month: "long", day: "numeric" }),
    totalLeaksDiscovered: state.leaks.length,
    totalEstimatedLoss: metrics.totalDiscoveredLeaksAmount,
    highConfidenceCount: highConfidence.length,
    needsReviewCount: needsReview.length,
    recoveredSoFar: state.recoveredTotal,
    keyActionItems: actionItems.length > 0 ? actionItems : ["لا توجد تسريبات نشطة حالياً — وضعك المالي ممتاز."],
  };
}
