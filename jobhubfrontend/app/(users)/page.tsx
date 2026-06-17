"use client";

import { motion } from "motion/react";
import LandingPageNavbar from "./_components/landing-page-navbar";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Briefcase,
  Search,
  // Github,
  Database,
  Eraser,
  Sparkles,
  Code2,
  LineChart,
  BellRing,
  EyeOff,
  UserX,
  GitGraph,
} from "lucide-react";
// import Link from "next/link";
import LandingSectionOne from "./_components/landing-section-1";
import LandingSectionTwo from "./_components/landing-section-2";
import LandingSectionThree from "./_components/landing-section-3";
import LandingSectionFour from "./_components/landing-section-4";
import LandingSectionFive from "./_components/landing-section-5";
import LandingSectionSix from "./_components/landing-section-6";

const LandingPage = () => {
  return (
    <main className="w-full flex flex-col font-sans bg-[#FAFAFA] text-black overflow-hidden selection:bg-black selection:text-[#FFCC00]">
      <LandingSectionOne />
      <LandingSectionTwo />
      <LandingSectionThree />
      <LandingSectionFour />
      <LandingSectionFive />
      <LandingSectionSix />
      {/*<LandingPageNavbar />*/}
      {/*<HeroSection />*/}

      <CoreCapabilities />
      <AdvancedData />
      <TransparentAI />
      <UnbiasedHiring />
      <FooterCTA />
    </main>
  );
};

// const HeroSection = () => (
//   <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//       className="max-w-4xl z-10"
//     >
//       <div className="inline-block bg-[#FFCC00] text-black font-bold px-6 py-2 rounded-full mb-8 text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
//         The Future of Recruitment
//       </div>
//       <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight mb-8">
//         Hire fairly. <br /> Work brilliantly.
//       </h1>
//       <p className="text-xl md:text-2xl font-medium text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
//         JobHub merges powerful AI matching, deep profile enrichment, and strict
//         anonymization to create a transparent, unbiased job market.
//       </p>
//       <div className="flex flex-col sm:flex-row gap-6 justify-center">
//         <Button
//           asChild
//           className="bg-black text-white hover:bg-gray-800 font-bold text-lg px-8 py-7 rounded-none shadow-[6px_6px_0px_0px_rgba(255,204,0,1)] transition-transform hover:-translate-y-1"
//         >
//           <Link href="/jobs">Find Jobs</Link>
//         </Button>
//         <Button
//           asChild
//           className="bg-white text-black hover:bg-gray-50 border-2 border-black font-bold text-lg px-8 py-7 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
//         >
//           <Link href="/post-job">Post a Job</Link>
//         </Button>
//       </div>
//     </motion.div>
//   </section>
// );

const CoreCapabilities = () => (
  <section className="py-32 px-6 md:px-12 lg:px-24 bg-white border-y-4 border-black">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-20 text-center uppercase">
        Core Portal Mechanics
      </h2>
      <div className="grid md:grid-cols-3 gap-10">
        {[
          {
            icon: UserCircle,
            title: "User Profiles",
            desc: "Candidates create professional profiles detailing their skills, projects, and experiences to stand out.",
          },
          {
            icon: Briefcase,
            title: "Job Management",
            desc: "Employers publish job advertisements and seamlessly manage incoming applications in one place.",
          },
          {
            icon: Search,
            title: "Search and Apply",
            desc: "Candidates actively search and apply directly to relevant opportunities via a centralized interface.",
          },
        ].map((feature, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            key={i}
            className="p-10 border-4 border-black bg-[#F5F5F3] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-start"
          >
            <feature.icon
              className="w-16 h-16 mb-8 text-black"
              strokeWidth={2}
            />
            <h3 className="text-3xl font-black mb-4 uppercase">
              {feature.title}
            </h3>
            <p className="font-medium text-lg text-gray-700 leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const AdvancedData = () => (
  <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#FFCC00]">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
      <div className="lg:w-1/2">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight uppercase">
          Advanced Data & Scraping
        </h2>
        <p className="text-2xl font-medium mb-14 text-black/80">
          We go beyond surface-level resumes to build a robust, self-cleaning
          ecosystem of opportunities and talent.
        </p>
        <div className="flex flex-col gap-10">
          <div className="flex gap-6 items-start">
            <GitGraph className="w-10 h-10 mt-1" strokeWidth={2.5} />
            <div>
              <h4 className="text-3xl font-black uppercase">
                Profile Enrichment
              </h4>
              <p className="font-medium text-lg mt-2">
                Extracts social and professional data from GitHub and portfolio
                websites for deeper analysis.
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <Database className="w-10 h-10 mt-1" strokeWidth={2.5} />
            <div>
              <h4 className="text-3xl font-black uppercase">Job Aggregation</h4>
              <p className="font-medium text-lg mt-2">
                Actively scrapes job listings from multiple external sources to
                build a comprehensive database.
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <Eraser className="w-10 h-10 mt-1" strokeWidth={2.5} />
            <div>
              <h4 className="text-3xl font-black uppercase">
                Automated Cleaning
              </h4>
              <p className="font-medium text-lg mt-2">
                ML-based deduplication and daily refreshes remove redundant or
                expired job postings automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 w-full h-[600px] bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8 relative overflow-hidden flex flex-col justify-center">
        <motion.div
          animate={{ y: [0, -120, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="flex flex-col gap-6 opacity-30"
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-16 w-full bg-gray-200 border-4 border-dashed border-gray-400"
            />
          ))}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end p-10">
          <div className="bg-black text-[#FFCC00] font-black p-6 text-2xl border-4 border-[#FFCC00] shadow-[8px_8px_0px_0px_rgba(255,204,0,1)] uppercase">
            Daily ML Cleanup Active
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TransparentAI = () => (
  <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#111111] text-white border-t-4 border-black">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-24">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-[#FFCC00] uppercase">
          Transparent AI Matching
        </h2>
        <p className="text-2xl font-medium text-gray-400 max-w-3xl mx-auto">
          Open algorithms. Honest scores. Immediate connections.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="p-10 border-4 border-[#333] bg-[#1A1A1A] hover:border-[#FFCC00] transition-colors group">
          <Sparkles className="w-12 h-12 text-[#FFCC00] mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-black mb-4 uppercase">
            Personalized Recommendations
          </h3>
          <p className="font-medium text-lg text-gray-400">
            Candidates receive tailored jobs based on both on-platform profiles
            and extracted social data.
          </p>
        </div>
        <div className="p-10 border-4 border-[#333] bg-[#1A1A1A] hover:border-[#FFCC00] transition-colors group">
          <Code2 className="w-12 h-12 text-[#FFCC00] mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-black mb-4 uppercase">
            Open Specifications
          </h3>
          <p className="font-medium text-lg text-gray-400">
            The algorithms and underlying models driving recommendations are
            completely transparent and publicly available.
          </p>
        </div>
        <div className="p-10 border-4 border-[#333] bg-[#1A1A1A] hover:border-[#FFCC00] transition-colors group">
          <LineChart className="w-12 h-12 text-[#FFCC00] mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-black mb-4 uppercase">
            Recruiter Insights
          </h3>
          <p className="font-medium text-lg text-gray-400">
            Employers view curated candidate lists with specific, quantifiable
            matching scores for their open roles.
          </p>
        </div>
        <div className="p-10 border-4 border-[#333] bg-[#1A1A1A] hover:border-[#FFCC00] transition-colors group">
          <BellRing className="w-12 h-12 text-[#FFCC00] mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-black mb-4 uppercase">Instant Alerts</h3>
          <p className="font-medium text-lg text-gray-400">
            An automated notification system alerts the &quot;top K&quot;
            matching candidates whenever a new, relevant job is posted.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const UnbiasedHiring = () => (
  <section className="py-32 px-6 md:px-12 lg:px-24 bg-white border-y-4 border-black">
    <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-20">
      <div className="lg:w-1/2 w-full">
        <div className="bg-[#F5F5F3] border-4 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-8 mb-10">
            <div className="w-24 h-24 bg-black flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 backdrop-blur-md bg-black/70 z-10 flex items-center justify-center">
                <EyeOff className="text-white w-10 h-10" />
              </div>
              <UserCircle className="w-14 h-14 text-white" />
            </div>
            <div>
              <h4 className="text-3xl font-black bg-black text-white px-3 py-1 inline-block mb-3 uppercase">
                Candidate #8492
              </h4>
              <p className="font-bold text-xl text-gray-600">
                Match Score: <span className="text-green-600">97%</span>
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-6 w-full bg-gray-300" />
            <div className="h-6 w-5/6 bg-gray-300" />
            <div className="h-6 w-4/6 bg-gray-300" />
          </div>
        </div>
      </div>

      <div className="lg:w-1/2">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight uppercase">
          Unbiased Hiring Tools
        </h2>
        <p className="text-2xl font-medium mb-12 text-gray-700">
          Evaluate talent strictly on merit. Our platform removes bias from the
          equation.
        </p>

        <div className="space-y-10">
          <div className="flex items-start gap-6">
            <EyeOff className="w-10 h-10 mt-1 text-black" strokeWidth={2.5} />
            <div>
              <h4 className="text-3xl font-black uppercase">
                Anonymization System
              </h4>
              <p className="font-medium text-lg text-gray-700 mt-2">
                A built-in censorship system actively hides personal candidate
                information to prevent unconscious bias.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-6">
            <UserX className="w-10 h-10 mt-1 text-black" strokeWidth={2.5} />
            <div>
              <h4 className="text-3xl font-black uppercase">
                Blind Shortlisting
              </h4>
              <p className="font-medium text-lg text-gray-700 mt-2">
                Identifying details like surnames and profile pictures are
                completely concealed during the early stages of candidate
                evaluation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FooterCTA = () => (
  <section className="py-32 px-6 flex flex-col items-center text-center bg-[#FFCC00]">
    <h2 className="text-6xl md:text-8xl font-black tracking-tight mb-10 uppercase">
      Ready to revolutionize hiring?
    </h2>
    <p className="text-2xl font-medium text-black/80 max-w-3xl mb-14 leading-relaxed">
      Join the platform that puts skills first. Transparent, unbiased, and
      powered by intelligent data.
    </p>
    <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase text-2xl px-16 py-10 rounded-none shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-2">
      Get Started Now
    </Button>
  </section>
);

export default LandingPage;
