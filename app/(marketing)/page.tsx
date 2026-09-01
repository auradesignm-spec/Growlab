import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FreeLeakScanner from "@/components/FreeLeakScanner";
import CompetitorRadarShowcase from "@/components/CompetitorRadarShowcase";
import AnonymizedBenchmark from "@/components/AnonymizedBenchmark";
import TrustProof from "@/components/TrustProof";
import HowItWorks from "@/components/HowItWorks";
import Compare from "@/components/Compare";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AuthDock from "@/components/AuthDock";
import NeedSurvey from "@/components/NeedSurvey";
import ProductTour from "@/components/ProductTour";

export default function MarketingHome() {
  return (
    <main>
      <Header />
      <Hero />
      <section className="relative px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 mb-16">
        <FreeLeakScanner />
      </section>
      <CompetitorRadarShowcase />
      <AnonymizedBenchmark />
      <HowItWorks />
      <TrustProof />
      <Gallery />
      <Compare />
      <Pricing />
      <Faq />
      <Contact />
      <Footer />
      <AuthDock />
      <NeedSurvey />
      <ProductTour />
    </main>
  );
}

