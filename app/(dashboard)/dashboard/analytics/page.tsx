import React from "react";
import { getLocale } from "next-intl/server";
import FinancialAnalyticsDashboard from "@/components/dashboard/FinancialAnalyticsDashboard";

export const metadata = {
  title: "True Net Profit & Reconciliation Analytics | Growlab",
  description: "Unified financial intelligence, attribution, and reconciliation engine inspired by Brandstack.",
};

export default async function FinancialAnalyticsPage() {
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <FinancialAnalyticsDashboard locale={locale} />
      </div>
    </div>
  );
}
