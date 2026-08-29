import FinancialOnboardingSurvey from "@/components/onboarding/FinancialOnboardingSurvey";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "AI Financial Onboarding & Leak Audit | Growlab",
  description: "Identify hidden profit leaks across Shopify, Meta Ads, and courier COD returns.",
};

export default async function OnboardingSurveyPage() {
  const locale = await getLocale();
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <FinancialOnboardingSurvey locale={locale} />
    </main>
  );
}
