import React from "react";
import { getLocale } from "next-intl/server";
import IntegrationsHub from "@/components/dashboard/IntegrationsHub";

export const metadata = {
  title: "Integrations & Data Sources Hub | Growlab",
  description: "Connect Shopify, Meta Ads, Google Ads, and Courier Payouts.",
};

export default async function IntegrationsPage() {
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-[var(--paper)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <IntegrationsHub locale={locale} />
      </div>
    </div>
  );
}
