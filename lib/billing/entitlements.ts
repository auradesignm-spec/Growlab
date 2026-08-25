import type { MerchantPlanId } from "@/lib/domain/enums";

export const PRO_PRICE_OMR = 15;

export interface MerchantPlanProfile {
  plan: string;
  planExpiresAt: Date | null;
}

export const PLAN_LIMITS = {
  free: {
    maxProducts: 3,
    maxActiveCampaigns: 1,
    maxBudgetCap: 100,
    maxMediaPerProduct: 8,
    aiStore: false,
    storeOffers: true,
    storeLayoutPro: false,
  },
  pro: {
    maxProducts: Number.POSITIVE_INFINITY,
    maxActiveCampaigns: Number.POSITIVE_INFINITY,
    maxBudgetCap: 2000,
    maxMediaPerProduct: Number.POSITIVE_INFINITY,
    aiStore: true,
    storeOffers: true,
    storeLayoutPro: true,
  },
} as const;

export type PlanFeature = keyof typeof PLAN_LIMITS.free;

export function effectivePlan(profile: MerchantPlanProfile, now = new Date()): MerchantPlanId {
  if (profile.plan !== "pro") return "free";
  if (profile.planExpiresAt && profile.planExpiresAt <= now) return "free";
  return "pro";
}

export function isPro(profile: MerchantPlanProfile, now = new Date()): boolean {
  return effectivePlan(profile, now) === "pro";
}

export function planLimits(profile: MerchantPlanProfile, now = new Date()) {
  return PLAN_LIMITS[effectivePlan(profile, now)];
}

export function assertProFeature(profile: MerchantPlanProfile, feature: PlanFeature, messageAr: string) {
  const limits = planLimits(profile);
  if (!limits[feature]) throw new Error(messageAr);
}

export function canAddProduct(profile: MerchantPlanProfile, currentCount: number): boolean {
  return currentCount < planLimits(profile).maxProducts;
}

export function maxBudgetCap(profile: MerchantPlanProfile): number {
  return planLimits(profile).maxBudgetCap;
}

export const PRO_REQUIRED_AR = "هذه الميزة متاحة في Growlab Pro — 15 ر.ع./شهر.";
export const PRODUCT_LIMIT_AR = "الخطة المجانية تسمح بـ 3 منتجات. رقِّ إلى Pro لإضافة المزيد.";
export const CAMPAIGN_LIMIT_AR = "الخطة المجانية تسمح بحملة نشطة واحدة. رقِّ إلى Pro.";
export const BUDGET_CAP_LIMIT_AR = "الخطة المجانية: سقف الحملة حتى 100 ر.ع. رقِّ إلى Pro لسقف أعلى.";
