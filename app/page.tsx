"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Compare from "@/components/Compare";
import Founders from "@/components/Founders";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import DashboardView from "@/components/dashboard/DashboardView";

export default function Home() {
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">("landing");

  if (viewMode === "dashboard") {
    return <DashboardView onBackToLanding={() => setViewMode("landing")} />;
  }

  return (
    <main>
      <Header onOpenDashboard={() => setViewMode("dashboard")} />
      <Hero onOpenDashboard={() => setViewMode("dashboard")} />
      <Problem />
      <HowItWorks />
      <Pricing onOpenDashboard={() => setViewMode("dashboard")} />
      <Compare />
      <Founders />
      <Contact />
      <Footer />
    </main>
  );
}
