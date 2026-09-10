import type { Metadata } from "next";
import LandingSectionFAQ from "@/components/landing/landing-faq-section";
import LandingSectionOne from "@/components/landing/landing-section-1";
import LandingSectionTwo from "@/components/landing/landing-section-2";
import LandingSectionThree from "@/components/landing/landing-section-3";
import LandingSectionFour from "@/components/landing/landing-section-4";
import LandingSectionFive from "@/components/landing/landing-section-5";
import LandingSectionSix from "@/components/landing/landing-section-6";
import { LandingMotion } from "@/components/landing/landing-motion";

export const metadata: Metadata = {
  title: "JobHub | Hire fairly. Work brilliantly.",
  description:
    "Find your next role, show your skills and portfolio, and connect with employers through practical work on JobHub.",
};

const LandingPage = () => {
  return (
    <LandingMotion>
      <main
        id="main-content"
        className="w-full flex flex-col font-sans bg-background text-foreground overflow-x-clip selection:bg-primary selection:text-primary-foreground"
      >
        <LandingSectionOne />
        <LandingSectionTwo />
        <LandingSectionThree />
        <LandingSectionFour />
        <LandingSectionFive />
        <LandingSectionFAQ />
        <LandingSectionSix />
      </main>
    </LandingMotion>
  );
};

export default LandingPage;
