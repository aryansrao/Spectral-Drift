import Nav from "@/components/nav/Nav";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Security from "@/components/landing/Security";
import Economy from "@/components/landing/Economy";
import Advertising from "@/components/landing/Advertising";
import TechStack from "@/components/landing/TechStack";
import CtaBand from "@/components/landing/CtaBand";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/landing/ScrollReveal";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Security />
        <Economy />
        <Advertising />
        <TechStack />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
