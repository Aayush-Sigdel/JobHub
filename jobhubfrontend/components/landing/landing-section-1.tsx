import { Button } from "@/components/ui/button";
import LandingPageNavbar from "./landing-page-navbar";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ArrowUp } from "lucide-react";

const LandingSectionOne = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-background flex flex-col pb-16"
    >
      <LandingPageNavbar />

      <div className="flex flex-1 flex-col-reverse lg:flex-row items-center justify-center gap-12 lg:gap-16 px-6 md:px-12 lg:px-24 mt-12 lg:mt-0 max-w-7xl mx-auto">
        <div className="w-full lg:w-1/2 flex flex-col gap-6 justify-center text-left">
          <div className="inline-block bg-primary/10 text-primary font-medium px-4 py-1.5 rounded-full mb-2 text-sm border border-primary/20 self-start">
            The Future of Recruitment
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-foreground">
            Hire fairly.
            <br />
            Work brilliantly.
          </h1>
          <p className="text-lg md:text-xl font-medium text-foreground max-w-lg leading-relaxed">
            JobHub merges powerful AI matching, deep profile enrichment, and
            strict anonymization to create a transparent, unbiased job market.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-6 rounded-xl border border-transparent shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <Link href="/find-job">Find jobs</Link>
            </Button>
            {/*<Button
              asChild
              variant="outline"
              className="bg-white/50 hover:bg-white text-foreground border-none font-semibold text-lg px-8 py-6 rounded-xl shadow-sm transition-all"
            >
              <Link href="/post-job">Post a Job</Link>
            </Button>*/}
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end h-full">
          <Image
            src="/landing-illustrate.png"
            alt="JobHub Illustration"
            width={600}
            height={600}
            priority
            className="object-contain w-[90%] lg:max-w-full h-auto"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LandingSectionOne;
