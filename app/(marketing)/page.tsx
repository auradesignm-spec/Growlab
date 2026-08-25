import Header from "@/components/Header";
import Hero from "@/components/Hero";
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
      <div className="h-20 md:hidden" aria-hidden="true" />
    </main>
  );
}
