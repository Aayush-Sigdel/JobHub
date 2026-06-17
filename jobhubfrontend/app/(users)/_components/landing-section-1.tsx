import { Button } from "@/components/ui/button";
import LandingPageNavbar from "./landing-page-navbar";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

const LandingSectionOne = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-[#FFCC00] flex flex-col pb-16"
    >
      <LandingPageNavbar />

      <div className="flex flex-1 flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16 px-6 md:px-12 lg:px-24 mt-12 lg:mt-0">
        <div className="w-full lg:w-1/2 flex flex-col gap-8 justify-center text-left">
          <h1 className="text-6xl md:text-7xl lg:text-7xl font-black leading-[1.1] tracking-tight text-black">
            <div className="inline-block bg-secondary text-black font-bold px-6 py-2 rounded-full mb-8 text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              The Future of Recruitment
            </div>
            <br />
            Hire fairly.
            <br className="hidden lg:block" />
            Work brilliantly.
          </h1>
          <p className="text-lg md:text-xl font-medium text-black max-w-md">
            JobHub merges powerful AI matching, deep profile enrichment, and
            strict anonymization to create a transparent, unbiased job market.
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
    </motion.div>
  );
};

export default LandingSectionOne;
