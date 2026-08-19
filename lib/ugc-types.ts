export type Gender = "male" | "female" | "unisex";
export type TargetAudienceGender = "men" | "women" | "all";
export type CountryCode = "OM" | "SA" | "AE" | "KW" | "QA" | "BH" | "GLOBAL";
export type LanguageCode = "ar" | "en";
export type CurrencyCode = "OMR" | "SAR" | "AED" | "USD";
export type SubscriptionTier = "free" | "basic" | "pro";
export type UserRole = "visitor" | "creator" | "merchant" | "admin";
export type TimePeriod = "weekly" | "monthly" | "all-time";
export type ProductCategory = "tech" | "fashion" | "beauty" | "home" | "perfume" | "lifestyle";

export interface CurrencyConfig {
  code: CurrencyCode;
  nameAr: string;
  nameEn: string;
  symbol: string;
  rateToUSD: number; // 1 USD = rate * currency
  flag: string;
}

export interface Badge {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface Creator {
  id: string;
  username: string; // e.g. "salem_reviews"
  displayName: string;
  displayNameEn: string;
  bio: string;
  bioEn: string;
  avatar: string;
  banner: string;
  gender: Gender;
  country: CountryCode;
  language: LanguageCode;
  subscriptionTier: SubscriptionTier;
  verifiedAt: string | null;
  isFirstCampaignFree: boolean; // First product/campaign with 0% platform fee
  paymentVerified: boolean;
  paymentMethod: {
    type: "stripe" | "iban" | "card";
    identifier: string; // e.g. "•••• 4242" or "OM82BANK..."
    bankName: string;
  };
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    followersCount?: string;
  };
  selectedProductIds: string[]; // Curated products shown in their storefront
  stats: {
    salesValue: number; // in USD
    conversionRate: number; // e.g. 4.8 (%)
    orderCount: number;
    totalCommission: number; // in USD
    pendingPayout: number; // in USD
    profileViews: number;
  };
  badges: Badge[];
}

export interface Merchant {
  id: string;
  businessName: string;
  businessNameEn: string;
  logo: string;
  country: CountryCode;
  category: ProductCategory;
  verifiedAt: string;
  contactEmail: string;
  phone: string;
  rating: number;
  totalOrders: number;
  netRevenue: number; // in USD
}

export interface Product {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: ProductCategory;
  genderTarget: TargetAudienceGender;
  priceUSD: number; // Standard price in USD for conversion
  costUSD: number;
  commissionRate: number; // e.g. 0.18 for 18% creator commission
  image: string;
  gallery?: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  sellingPoints: string[];
  ugcVideoPreview?: string;
  isFeatured?: boolean;
}

export interface OrderSplit {
  totalAmountUSD: number;
  merchantAmountUSD: number; // 75-80%
  merchantRate: number; // e.g. 0.77
  creatorCommissionUSD: number; // 15-20%
  creatorCommissionRate: number; // e.g. 0.18
  platformFeeUSD: number; // 5% (or 0% if first campaign free)
  platformFeeRate: number; // e.g. 0.05 or 0.0
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  productId: string;
  productName: string;
  productImage: string;
  creatorId: string;
  creatorUsername: string;
  merchantId: string;
  merchantName: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerCountry: CountryCode;
  quantity: number;
  currency: CurrencyCode;
  paidAmountLocal: number;
  splits: OrderSplit;
  status: "completed" | "processing" | "refunded";
  attributionSource: "creator_storefront" | "direct_ugc_link";
}

export interface LeaderboardEntry {
  rank: number;
  creatorId: string;
  username: string;
  displayName: string;
  avatar: string;
  category: ProductCategory;
  country: CountryCode;
  gender: Gender;
  subscriptionTier: SubscriptionTier;
  salesValueUSD: number;
  conversionRate: number;
  orderCount: number;
  compositeScore: number;
  badgeTitle?: string;
}
