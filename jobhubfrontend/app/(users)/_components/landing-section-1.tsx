import { Button } from "@/components/ui/button";
import LandingPageNavbar from "./landing-page-navbar";
import Image from "next/image";
import Link from "next/link";

const LandingSectionOne = () => {
  return (
    <section className="min-h-screen w-full bg-[#FFCC00] flex flex-col pb-16">
      <LandingPageNavbar />

      <div className="flex flex-1 flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16 px-6 md:px-12 lg:px-24 mt-12 lg:mt-0">
        <div className="w-full lg:w-1/2 flex flex-col gap-8 justify-center text-left">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight text-black">
            Intelligent <br className="hidden lg:block" />
            job hunting
          </h1>
          <p className="text-lg md:text-xl font-medium text-black max-w-md">
            Connect with your next big opportunity. JobHub uses advanced
            recruitment features to seamlessly match job seekers and employers
            based on real skills, projects, and experiences.
          </p>

          <div className="flex justify-start pt-4">
            <Button
              asChild
              className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-7 rounded-none border-2 border-transparent transition-all"
            >
              <Link href="/jobs">Find jobs</Link>
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end h-full">
          <Image
            src="/landing-illustrate.png"
            alt="JobHub Illustration"
            width={600}
            height={600}
            priority
            className="object-contain w-[80%] max-w-100 lg:max-w-full h-auto drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default LandingSectionOne;
