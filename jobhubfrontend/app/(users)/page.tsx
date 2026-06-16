import LandingPageNavbar from "./_components/landing-page-navbar";
import LandingSectionOne from "./_components/landing-section-1";
import LandingSectionTwo from "./_components/landing-section-2";
import LandingSectionThree from "./_components/landing-section-3";
import LandingSectionFour from "./_components/landing-section-4";
import LandingSectionFive from "./_components/landing-section-5";
import LandingSectionSix from "./_components/landing-section-6";

const LandingPage = () => {
  return (
    <main className="w-full flex flex-col font-sans selection:bg-black selection:text-[#FFCC00]">
      <LandingSectionOne />
      <LandingSectionTwo />
      <LandingSectionThree />
      <LandingSectionFour />
      <LandingSectionFive />
      <LandingSectionSix />
    </main>
  );
};

export default LandingPage;
