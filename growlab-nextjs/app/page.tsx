import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Compare from "@/components/Compare";
import Founders from "@/components/Founders";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <Pricing />
      <Compare />
      <Founders />
      <Contact />
      <Footer />
    </main>
  );
}
