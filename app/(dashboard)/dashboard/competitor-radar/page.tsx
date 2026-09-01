import React from "react";
import { getLocale } from "next-intl/server";
import CompetitorRadarView from "@/components/radar/CompetitorRadarView";

export const metadata = {
  title: "Competitor Radar & Creative Intelligence | Growlab",
  description: "Track competitor ad campaigns, creative hooks, offer weaknesses, and market opportunities in the GCC.",
};

export default async function DashboardCompetitorRadarPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <CompetitorRadarView />
      </div>
    </div>
  );
}
