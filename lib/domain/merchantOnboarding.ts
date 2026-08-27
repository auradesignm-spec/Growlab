/**
 * Merchant first-run checklist — single source for progress UI and redirects.
 * Order: KYC → store draft → first product → campaign → publish.
 */

export const MERCHANT_ONBOARDING_STEPS = [
  "kyc",
  "store",
  "product",
  "campaign",
  "publish",
] as const;

export type MerchantOnboardingStepId = (typeof MERCHANT_ONBOARDING_STEPS)[number];

export interface MerchantOnboardingInput {
  verificationStatus: string;
  hasStore: boolean;
  storePublished: boolean;
  productCount: number;
  hasActiveOrDraftCampaign: boolean;
}

export interface MerchantOnboardingProgress {
  /** First incomplete step (or "done"). */
  current: MerchantOnboardingStepId | "done";
  steps: Array<{
    id: MerchantOnboardingStepId;
    done: boolean;
  }>;
  completedCount: number;
  total: number;
}

export function merchantOnboardingProgress(input: MerchantOnboardingInput): MerchantOnboardingProgress {
  const kycDone = input.verificationStatus === "verified";
  const storeDone = input.hasStore;
  const productDone = input.productCount > 0;
  const campaignDone = input.hasActiveOrDraftCampaign;
  const publishDone = input.storePublished;

  const steps: MerchantOnboardingProgress["steps"] = [
    { id: "kyc", done: kycDone },
    { id: "store", done: storeDone },
    { id: "product", done: productDone },
    { id: "campaign", done: campaignDone },
    { id: "publish", done: publishDone },
  ];

  const current = steps.find((s) => !s.done)?.id ?? "done";
  const completedCount = steps.filter((s) => s.done).length;

  return {
    current,
    steps,
    completedCount,
    total: steps.length,
  };
}

/** Where to send the merchant after a milestone. */
export function merchantOnboardingHref(step: MerchantOnboardingStepId | "done"): string {
  switch (step) {
    case "kyc":
      return "/dashboard?kyc=1";
    case "store":
      return "/dashboard/store/edit?fresh=1";
    case "product":
      return "/dashboard/products/new";
    case "campaign":
      return "/dashboard?tab=campaign";
    case "publish":
      return "/dashboard/store/edit";
    case "done":
      return "/dashboard?tab=store";
  }
}
