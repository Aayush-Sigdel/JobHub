"use client";

import LandingSectionFAQ from "./_components/landing-faq-section";
import LandingSectionOne from "./_components/landing-section-1";
import LandingSectionTwo from "./_components/landing-section-2";
import LandingSectionThree from "./_components/landing-section-3";
import LandingSectionFour from "./_components/landing-section-4";
import LandingSectionFive from "./_components/landing-section-5";
import LandingSectionSix from "./_components/landing-section-6";

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
