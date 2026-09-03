import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompetitorRadarView from "@/components/radar/CompetitorRadarView";

export const metadata = {
  title: "رادار المنافسين ومؤشرات السوق | مساعد ريادة",
  description: "Track competitor ad campaigns, creative hooks, offer weaknesses, and market opportunities in the GCC.",
};

export default function PublicCompetitorRadarPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)]">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-8 mt-16 sm:mt-20">
        <div className="mx-auto max-w-7xl">
          <CompetitorRadarView />
        </div>
      </main>
      <Footer />
    </div>
  );
}
