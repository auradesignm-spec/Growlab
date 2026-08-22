import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Compare from "@/components/Compare";
import Roadmap from "@/components/Roadmap";
import Gallery from "@/components/Gallery";
import LedgerPreview from "@/components/LedgerPreview";
import ValueChain from "@/components/ValueChain";
import PartnerBenefits from "@/components/PartnerBenefits";
import Governance from "@/components/Governance";
import Pricing from "@/components/Pricing";
import Founders from "@/components/Founders";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AuthDock from "@/components/AuthDock";

export default function MarketingHome() {
  return (
    <main>
      <Header />
      <Hero />
      <Gallery />
      <Problem />
      <HowItWorks />
      <Compare />
      <Roadmap />
      <LedgerPreview />
      <ValueChain />
      <PartnerBenefits />
      <Governance />
      <Pricing />
      <Founders />
      <Contact />
      <Footer />
      <AuthDock />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </main>
  );
}
