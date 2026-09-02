/**
 * Brandstack-Inspired Financial Intelligence & Reconciliation Engine for Growlab
 * 
 * Unifies fragmented data across:
 * - E-Commerce Storefronts (Shopify, Direct Store, Zid, WooCommerce)
 * - Ad Networks (Meta Marketing API, Google Ads, TikTok Ads)
 * - Logistics & Couriers (Aramex, SMSA, J&T Express, DHL)
 * - Payment Mix (Cash on Delivery vs Prepaid / Apple Pay)
 * - Regional Returns (RTO & Restocking Costs)
 * 
 * CORE FORMULA:
 * Net Profit = Gross Sales - (COGS + Ad Spend Share + Courier Shipping Cost + Refund/RTO Impact + Payment Gateway Fee)
 */

export interface UnifiedOrder {
  id: string;
  orderId: string;
  channel: "Shopify D2C" | "Direct Store" | "Zid" | "Amazon" | "TikTok Shop" | "Noon";
  sku: string;
  productTitle: string;
  grossSales: number;
  discountAmount: number;
  netSales: number;
  cogs: number;
  shippingCost: number;
  adSpendShare: number;
  paymentFee: number;
  paymentMethod: "COD" | "PREPAID";
  paymentGateway: string;
  financialStatus: "paid" | "pending" | "partially_paid" | "refunded" | "cancelled" | string;
  fulfillmentStatus: "fulfilled" | "unfulfilled" | "partial" | "returned" | string;
  isReturned: boolean;
  isCancelled: boolean;
  courierName: "Aramex" | "SMSA" | "J&T Express" | "DHL" | "Spl";
  courierStatus: "DELIVERED" | "IN_TRANSIT" | "RTO_RETURNED" | "OUT_FOR_DELIVERY";
  rtoLoss: number;
  netProfit: number;
  marginPercentage: number;
  currency: string;
  customerCity: string;
  customerCountry: string;
  createdAt: string;
}

export interface ChannelProfitability {
  channel: string;
  grossSales: number;
  netSales: number;
  ordersCount: number;
  cogs: number;
  adSpend: number;
  shippingCosts: number;
  refundsAndRto: number;
  netProfit: number;
  marginPercentage: number;
  orderSharePercentage: number;
  isProfitable: boolean;
  rtoRate: number;
  recommendedAction: string;
}

export interface FinancialSummaryMetrics {
  grossSales: number;
  netSales: number;
  totalOrders: number;
  averageOrderValue: number; // AOV
  totalCogs: number;
  totalAdSpend: number;
  totalShippingCosts: number;
  totalRefundsAndRto: number;
  totalPaymentFees: number;
  trueNetProfit: number;
  netMarginPercentage: number;
  mer: number; // Marketing Efficiency Ratio (Total Revenue / Total Ad Spend)
  blendedCac: number; // Blended Customer Acquisition Cost
  codOrdersCount: number;
  prepaidOrdersCount: number;
  codSharePercentage: number;
  codRtoRatePercentage: number;
  prepaidRtoRatePercentage: number;
  totalRtoLoss: number;
}

// Initial robust dataset representing multi-channel unified orders
let unifiedOrdersStore: UnifiedOrder[] = [
  {
    id: "un-001",
    orderId: "SH-10948",
    channel: "Shopify D2C",
    sku: "GROW-PRO-01",
    productTitle: "سيروم النضارة الفائق مع فيتامين C المركز",
    grossSales: 380,
    discountAmount: 0,
    netSales: 380,
    cogs: 95,
    shippingCost: 24,
    adSpendShare: 68,
    paymentFee: 8.5,
    paymentMethod: "PREPAID",
    paymentGateway: "Apple Pay / Mada",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    isReturned: false,
    isCancelled: false,
    courierName: "SMSA",
    courierStatus: "DELIVERED",
    rtoLoss: 0,
    netProfit: 184.5,
    marginPercentage: 48.55,
    currency: "SAR",
    customerCity: "الرياض",
    customerCountry: "المملكة العربية السعودية",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "un-002",
    orderId: "SH-10947",
    channel: "Shopify D2C",
    sku: "GROW-HYDRA-02",
    productTitle: "كريم الترطيب العميق بحمض الهيالورونيك",
    grossSales: 290,
    discountAmount: 20,
    netSales: 270,
    cogs: 75,
    shippingCost: 32,
    adSpendShare: 58,
    paymentFee: 12,
    paymentMethod: "COD",
    paymentGateway: "Cash on Delivery",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    isReturned: false,
    isCancelled: false,
    courierName: "Aramex",
    courierStatus: "DELIVERED",
    rtoLoss: 0,
    netProfit: 93,
    marginPercentage: 34.44,
    currency: "SAR",
    customerCity: "جدة",
    customerCountry: "المملكة العربية السعودية",
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },
  {
    id: "un-003",
    orderId: "TT-54910",
    channel: "TikTok Shop",
    sku: "GROW-MATTE-04",
    productTitle: "مجموعة العناية المزدوجة والمقشر الطبيعي",
    grossSales: 240,
    discountAmount: 0,
    netSales: 240,
    cogs: 80,
    shippingCost: 35,
    adSpendShare: 110,
    paymentFee: 15,
    paymentMethod: "COD",
    paymentGateway: "COD - J&T",
    financialStatus: "refunded",
    fulfillmentStatus: "returned",
    isReturned: true,
    isCancelled: false,
    courierName: "J&T Express",
    courierStatus: "RTO_RETURNED",
    rtoLoss: 55, // Reverse courier fee + box damage
    netProfit: -90, // Loss from RTO + Ad Spend spent
    marginPercentage: -37.5,
    currency: "SAR",
    customerCity: "الدمام",
    customerCountry: "المملكة العربية السعودية",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: "un-004",
    orderId: "AMZ-88201",
    channel: "Amazon",
    sku: "GROW-PRO-01",
    productTitle: "سيروم النضارة الفائق مع فيتامين C المركز",
    grossSales: 390,
    discountAmount: 0,
    netSales: 390,
    cogs: 95,
    shippingCost: 45, // Amazon FBA fee
    adSpendShare: 85, // Amazon Sponsored Products
    paymentFee: 39, // Amazon 10% referral fee
    paymentMethod: "PREPAID",
    paymentGateway: "Amazon Pay",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    isReturned: false,
    isCancelled: false,
    courierName: "Spl",
    courierStatus: "DELIVERED",
    rtoLoss: 0,
    netProfit: 126,
    marginPercentage: 32.3,
    currency: "SAR",
    customerCity: "مكة المكرمة",
    customerCountry: "المملكة العربية السعودية",
    createdAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
  },
  {
    id: "un-005",
    orderId: "SAL-32910",
    channel: "Direct Store",
    sku: "GROW-HAIR-05",
    productTitle: "زيت إنبات الشعر العضوي المركز",
    grossSales: 320,
    discountAmount: 30,
    netSales: 290,
    cogs: 65,
    shippingCost: 23,
    adSpendShare: 45,
    paymentFee: 6.5,
    paymentMethod: "PREPAID",
    paymentGateway: "Mada / STC Pay",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    isReturned: false,
    isCancelled: false,
    courierName: "SMSA",
    courierStatus: "DELIVERED",
    rtoLoss: 0,
    netProfit: 150.5,
    marginPercentage: 51.89,
    currency: "SAR",
    customerCity: "المدينة المنورة",
    customerCountry: "المملكة العربية السعودية",
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
  {
    id: "un-006",
    orderId: "ZID-90124",
    channel: "Zid",
    sku: "GROW-HAIR-05",
    productTitle: "زيت إنبات الشعر العضوي المركز",
    grossSales: 320,
    discountAmount: 0,
    netSales: 320,
    cogs: 65,
    shippingCost: 28,
    adSpendShare: 60,
    paymentFee: 8,
    paymentMethod: "PREPAID",
    paymentGateway: "Tabby 4-Installments",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    isReturned: false,
    isCancelled: false,
    courierName: "Aramex",
    courierStatus: "DELIVERED",
    rtoLoss: 0,
    netProfit: 159,
    marginPercentage: 49.68,
    currency: "SAR",
    customerCity: "الخبر",
    customerCountry: "المملكة العربية السعودية",
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  },
  {
    id: "un-007",
    orderId: "SH-10946",
    channel: "Shopify D2C",
    sku: "GROW-MATTE-04",
    productTitle: "مجموعة العناية المزدوجة والمقشر الطبيعي",
    grossSales: 240,
    discountAmount: 0,
    netSales: 240,
    cogs: 80,
    shippingCost: 32,
    adSpendShare: 75,
    paymentFee: 14,
    paymentMethod: "COD",
    paymentGateway: "Cash on Delivery",
    financialStatus: "refunded",
    fulfillmentStatus: "returned",
    isReturned: true,
    isCancelled: false,
    courierName: "SMSA",
    courierStatus: "RTO_RETURNED",
    rtoLoss: 45,
    netProfit: -86,
    marginPercentage: -35.83,
    currency: "SAR",
    customerCity: "تبوك",
    customerCountry: "المملكة العربية السعودية",
    createdAt: new Date(Date.now() - 1000 * 60 * 800).toISOString(),
  },
  {
    id: "un-008",
    orderId: "NOON-44109",
    channel: "Noon",
    sku: "GROW-PRO-01",
    productTitle: "سيروم النضارة الفائق مع فيتامين C المركز",
    grossSales: 350,
    discountAmount: 0,
    netSales: 350,
    cogs: 95,
    shippingCost: 40,
    adSpendShare: 120,
    paymentFee: 52, // Noon Commission
    paymentMethod: "PREPAID",
    paymentGateway: "Noon Pay",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    isReturned: false,
    isCancelled: false,
    courierName: "Spl",
    courierStatus: "DELIVERED",
    rtoLoss: 0,
    netProfit: 43,
    marginPercentage: 12.28,
    currency: "SAR",
    customerCity: "دبي",
    customerCountry: "الإمارات العربية المتحدة",
    createdAt: new Date(Date.now() - 1000 * 60 * 1100).toISOString(),
  },
];

/**
 * Calculates True Net Margin for a single order
 */
export function calculateOrderNetProfit(input: {
  grossSales: number;
  discountAmount?: number;
  cogs: number;
  shippingCost: number;
  adSpendShare: number;
  paymentFee?: number;
  isReturned?: boolean;
  rtoLoss?: number;
}): { netSales: number; netProfit: number; marginPercentage: number } {
  const discount = input.discountAmount || 0;
  const netSales = Math.max(0, input.grossSales - discount);
  const paymentFee = input.paymentFee ?? (netSales * 0.025 + 1); // Standard 2.5% + 1 SAR default
  const rtoLoss = input.isReturned ? (input.rtoLoss || 45) : 0;

  let netProfit: number;
  if (input.isReturned) {
    // If order was returned (RTO), revenue is 0, but you lost ad spend, COGS damages, shipping fee, and return fee
    netProfit = -(input.adSpendShare + input.shippingCost + rtoLoss);
  } else {
    netProfit = netSales - (input.cogs + input.adSpendShare + input.shippingCost + paymentFee);
  }

  const marginPercentage = netSales > 0 ? (netProfit / netSales) * 100 : -100;

  return {
    netSales,
    netProfit: Number(netProfit.toFixed(2)),
    marginPercentage: Number(marginPercentage.toFixed(2)),
  };
}

/**
 * Records a new reconciled order into the engine
 */
export function recordReconciliationOrder(
  data: Omit<UnifiedOrder, "id" | "netSales" | "paymentFee" | "rtoLoss" | "netProfit" | "marginPercentage" | "courierName" | "courierStatus"> & {
    courierName?: UnifiedOrder["courierName"];
    courierStatus?: UnifiedOrder["courierStatus"];
    paymentFee?: number;
    rtoLoss?: number;
  }
): UnifiedOrder {
  const { netSales, netProfit, marginPercentage } = calculateOrderNetProfit({
    grossSales: data.grossSales,
    discountAmount: data.discountAmount,
    cogs: data.cogs,
    shippingCost: data.shippingCost,
    adSpendShare: data.adSpendShare,
    paymentFee: data.paymentFee,
    isReturned: data.isReturned,
    rtoLoss: data.rtoLoss,
  });

  const newOrder: UnifiedOrder = {
    id: `un-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...data,
    netSales,
    paymentFee: data.paymentFee ?? (netSales * 0.025 + 1),
    rtoLoss: data.isReturned ? (data.rtoLoss || 45) : 0,
    netProfit,
    marginPercentage,
    courierName: data.courierName || "SMSA",
    courierStatus: data.courierStatus || (data.isReturned ? "RTO_RETURNED" : "DELIVERED"),
  };

  unifiedOrdersStore.unshift(newOrder);
  return newOrder;
}

/**
 * Returns all unified orders
 */
export function getUnifiedOrders(): UnifiedOrder[] {
  return [...unifiedOrdersStore];
}

/**
 * Computes high-level financial summary metrics (MER, AOV, True Net Profit, CAC, COD/Prepaid breakdown)
 */
export function getFinancialSummaryMetrics(): FinancialSummaryMetrics {
  const orders = unifiedOrdersStore;
  const totalOrders = orders.length;

  const grossSales = orders.reduce((sum, o) => sum + o.grossSales, 0);
  const netSales = orders.reduce((sum, o) => sum + (o.isReturned ? 0 : o.netSales), 0);
  const totalCogs = orders.reduce((sum, o) => sum + (o.isReturned ? 0 : o.cogs), 0);
  const totalAdSpend = orders.reduce((sum, o) => sum + o.adSpendShare, 0);
  const totalShippingCosts = orders.reduce((sum, o) => sum + o.shippingCost, 0);
  const totalRefundsAndRto = orders.reduce((sum, o) => sum + (o.isReturned ? (o.rtoLoss + o.shippingCost) : 0), 0);
  const totalPaymentFees = orders.reduce((sum, o) => sum + o.paymentFee, 0);
  const trueNetProfit = orders.reduce((sum, o) => sum + o.netProfit, 0);

  const averageOrderValue = totalOrders > 0 ? Number((grossSales / totalOrders).toFixed(2)) : 0;
  const netMarginPercentage = netSales > 0 ? Number(((trueNetProfit / netSales) * 100).toFixed(2)) : 0;
  const mer = totalAdSpend > 0 ? Number((grossSales / totalAdSpend).toFixed(2)) : 0;
  
  const successfulOrders = orders.filter((o) => !o.isReturned && !o.isCancelled);
  const blendedCac = successfulOrders.length > 0 ? Number((totalAdSpend / successfulOrders.length).toFixed(2)) : 0;

  const codOrders = orders.filter((o) => o.paymentMethod === "COD");
  const prepaidOrders = orders.filter((o) => o.paymentMethod === "PREPAID");
  const codOrdersCount = codOrders.length;
  const prepaidOrdersCount = prepaidOrders.length;
  const codSharePercentage = totalOrders > 0 ? Number(((codOrdersCount / totalOrders) * 100).toFixed(1)) : 0;

  const codReturns = codOrders.filter((o) => o.isReturned).length;
  const prepaidReturns = prepaidOrders.filter((o) => o.isReturned).length;
  const codRtoRatePercentage = codOrdersCount > 0 ? Number(((codReturns / codOrdersCount) * 100).toFixed(1)) : 0;
  const prepaidRtoRatePercentage = prepaidOrdersCount > 0 ? Number(((prepaidReturns / prepaidOrdersCount) * 100).toFixed(1)) : 0;
  const totalRtoLoss = orders.reduce((sum, o) => sum + o.rtoLoss, 0);

  return {
    grossSales: Number(grossSales.toFixed(2)),
    netSales: Number(netSales.toFixed(2)),
    totalOrders,
    averageOrderValue,
    totalCogs: Number(totalCogs.toFixed(2)),
    totalAdSpend: Number(totalAdSpend.toFixed(2)),
    totalShippingCosts: Number(totalShippingCosts.toFixed(2)),
    totalRefundsAndRto: Number(totalRefundsAndRto.toFixed(2)),
    totalPaymentFees: Number(totalPaymentFees.toFixed(2)),
    trueNetProfit: Number(trueNetProfit.toFixed(2)),
    netMarginPercentage,
    mer,
    blendedCac,
    codOrdersCount,
    prepaidOrdersCount,
    codSharePercentage,
    codRtoRatePercentage,
    prepaidRtoRatePercentage,
    totalRtoLoss: Number(totalRtoLoss.toFixed(2)),
  };
}

/**
 * Computes Channel Profitability Scorecard (Rankings, Share %, Margins, Losing vs Winning Channel Highlights)
 */
export function getChannelProfitabilityScorecard(): ChannelProfitability[] {
  const orders = unifiedOrdersStore;
  const channelMap = new Map<string, UnifiedOrder[]>();

  for (const order of orders) {
    const list = channelMap.get(order.channel) || [];
    list.push(order);
    channelMap.set(order.channel, list);
  }

  const totalOrdersCount = orders.length || 1;
  const scorecard: ChannelProfitability[] = [];

  for (const [channel, channelOrders] of channelMap.entries()) {
    const grossSales = channelOrders.reduce((sum, o) => sum + o.grossSales, 0);
    const netSales = channelOrders.reduce((sum, o) => sum + (o.isReturned ? 0 : o.netSales), 0);
    const ordersCount = channelOrders.length;
    const cogs = channelOrders.reduce((sum, o) => sum + (o.isReturned ? 0 : o.cogs), 0);
    const adSpend = channelOrders.reduce((sum, o) => sum + o.adSpendShare, 0);
    const shippingCosts = channelOrders.reduce((sum, o) => sum + o.shippingCost, 0);
    const refundsAndRto = channelOrders.reduce((sum, o) => sum + (o.isReturned ? (o.rtoLoss + o.shippingCost) : 0), 0);
    const netProfit = channelOrders.reduce((sum, o) => sum + o.netProfit, 0);
    
    const marginPercentage = netSales > 0 ? Number(((netProfit / netSales) * 100).toFixed(1)) : -100;
    const orderSharePercentage = Number(((ordersCount / totalOrdersCount) * 100).toFixed(1));
    const isProfitable = netProfit > 0;
    const returnCount = channelOrders.filter((o) => o.isReturned).length;
    const rtoRate = ordersCount > 0 ? Number(((returnCount / ordersCount) * 100).toFixed(1)) : 0;

    let recommendedAction = "الحفاظ على الميزانية وتحسين معدل التحويل";
    if (!isProfitable) {
      recommendedAction = "⚠️ وقف الإعلانات الخاسرة وخفض نسبة الدفع عند الاستلام لتفادي نزيف الـ RTO";
    } else if (marginPercentage > 45) {
      recommendedAction = "🚀 قناة ذهبية: رفع الميزانية الإعلانية فوراً لتوسيع حجم المبيعات";
    } else if (rtoRate > 25) {
      recommendedAction = "تفعيل رسائل تأكيد وتتبع الواتساب لتخفيض المرتجعات";
    }

    scorecard.push({
      channel,
      grossSales: Number(grossSales.toFixed(2)),
      netSales: Number(netSales.toFixed(2)),
      ordersCount,
      cogs: Number(cogs.toFixed(2)),
      adSpend: Number(adSpend.toFixed(2)),
      shippingCosts: Number(shippingCosts.toFixed(2)),
      refundsAndRto: Number(refundsAndRto.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      marginPercentage,
      orderSharePercentage,
      isProfitable,
      rtoRate,
      recommendedAction,
    });
  }

  // Sort descending by Net Profit
  return scorecard.sort((a, b) => b.netProfit - a.netProfit);
}

/**
 * Returns Time-Series data for Recharts Profitability & Revenue trends
 */
export function getFinancialTimeSeriesData() {
  return [
    { day: "السبت", gross: 4200, net: 3890, cogs: 1350, adSpend: 820, shipping: 380, trueProfit: 1340, margin: 34.4 },
    { day: "الأحد", gross: 5100, net: 4800, cogs: 1680, adSpend: 950, shipping: 460, trueProfit: 1710, margin: 35.6 },
    { day: "الاثنين", gross: 6300, net: 5900, cogs: 2050, adSpend: 1180, shipping: 580, trueProfit: 2090, margin: 35.4 },
    { day: "الثلاثاء", gross: 5800, net: 5400, cogs: 1890, adSpend: 1100, shipping: 520, trueProfit: 1890, margin: 35.0 },
    { day: "الأربعاء", gross: 7200, net: 6850, cogs: 2380, adSpend: 1420, shipping: 640, trueProfit: 2410, margin: 35.1 },
    { day: "الخميس", gross: 8900, net: 8400, cogs: 2940, adSpend: 1750, shipping: 790, trueProfit: 2920, margin: 34.7 },
    { day: "الجمعة (اليوم)", gross: 9400, net: 8950, cogs: 3120, adSpend: 1890, shipping: 850, trueProfit: 3090, margin: 34.5 },
  ];
}
