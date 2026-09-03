import React from "react";
import { getLocale } from "next-intl/server";
import CompetitorRadarView from "@/components/radar/CompetitorRadarView";

export const metadata = {
  title: "رادار التعمين والامتثال الذكي | Omanization & Compliance Radar",
  description: "متابعة نسب التعمين والامتثال التنظيمي للأنشطة والمهن في سلطنة عمان وتفادي الغرامات",
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
