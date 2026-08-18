export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  image: string;
  description: string;
  sellingPoints: string[];
  aiTrainingNotes: string;
  warranty: string;
  deliveryTime: string;
  salesCount: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: "cash_on_delivery" | "online_link";
  status: "pending" | "confirmed_by_ai" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  aiConversationSnippet: string;
  source: "whatsapp_ai" | "meta_ad_instagram" | "meta_ad_facebook";
}

export interface Campaign {
  id: string;
  name: string;
  platform: "instagram" | "facebook" | "both";
  status: "active" | "learning" | "paused";
  dailyBudget: number;
  spent: number;
  revenue: number;
  roas: number;
  clicks: number;
  orders: number;
  targetAudience: string;
  creativeType: "UGC Video Reel" | "Carousel Showcase" | "Story Direct Ad";
}

export interface CompanyAccount {
  id: string;
  name: string;
  category: string;
  ownerName: string;
  email: string;
  phone: string;
  currency: string;
  plan: "starter" | "partner" | "enterprise";
  commissionRate: number; // e.g. 5%
  agentName: string;
  agentDialect: "omani" | "gulf" | "standard_arabic" | "casual";
  agentAutoDiscountMax: number; // e.g. 10%
  whatsappConnected: boolean;
  whatsappNumber: string;
}

export interface AnalyticsMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtitle: string;
}
