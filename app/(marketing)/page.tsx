import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import TrustProof from "@/components/TrustProof";
import Compare from "@/components/Compare";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import NeedSurvey from "@/components/NeedSurvey";

export default function MarketingHome() {
  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <TrustProof />
      <Compare />
      <Pricing />
      <Faq />
      <Footer />
      <NeedSurvey />
    </main>
  );
}
