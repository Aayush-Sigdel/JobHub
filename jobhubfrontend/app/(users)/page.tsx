"use client";

import LandingSectionFAQ from "@/components/landing/landing-faq-section";
import LandingSectionOne from "@/components/landing/landing-section-1";
import LandingSectionTwo from "@/components/landing/landing-section-2";
import LandingSectionThree from "@/components/landing/landing-section-3";
import LandingSectionFour from "@/components/landing/landing-section-4";
import LandingSectionFive from "@/components/landing/landing-section-5";
import LandingSectionSix from "@/components/landing/landing-section-6";

const LandingPage = () => {
  return (
    <main className="w-full flex flex-col font-sans bg-background text-foreground overflow-hidden selection:bg-tuscan-sun-400 selection:text-background">
      <LandingSectionOne />
      <LandingSectionTwo />
      <LandingSectionThree />
      <LandingSectionFour />
      <LandingSectionFive />
      <LandingSectionFAQ />
      <LandingSectionSix />
    </main>
  );
};

export default LandingPage;
