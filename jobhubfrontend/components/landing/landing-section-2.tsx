"use client";

import { Button } from "@/components/ui/button";
import { Database, Code2, ShieldClose } from "lucide-react";
import { BellRingIcon as BellRing } from "@animateicons/react/lucide";;
import { motion, Variants } from "motion/react";

const LandingSectionTwo = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="w-full bg-[#F5F5F3] py-32 px-6 flex flex-col items-center text-center overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="flex flex-col items-center w-full max-w-7xl mx-auto"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]"
        >
          Advanced tools for <br className="hidden md:block" />a fairer search
        </motion.h2>
        
        <motion.p 
          variants={itemVariants}
          className="text-lg font-medium text-slate-600 max-w-2xl mb-20"
        >
          We go beyond simple keyword matching. JobHub uses transparent AI models
          and deep profiling to ensure high-quality, unbiased recruitment.
        </motion.p>

        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 w-full mb-20"
        >
          {/* Feature 1 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 text-center group cursor-pointer">
            <div className="p-6 bg-card rounded-3xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <Database className="w-10 h-10 text-slate-800 group-hover:text-tomato-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-2">Clean Data</h3>
            <p className="text-slate-600 font-medium max-w-[250px]">
              No duplicate or expired listings. We scrape sources and use ML-based
              deduplication for a flawless feed.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 text-center group cursor-pointer">
            <div className="p-6 bg-card rounded-3xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <Code2 className="w-10 h-10 text-slate-800 group-hover:text-tomato-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-2">Deep Profiling</h3>
            <p className="text-slate-600 font-medium max-w-[250px]">
              We extract data from your GitHub and portfolio websites to provide
              highly personalized AI recommendations.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 text-center group cursor-pointer">
            <div className="p-6 bg-card rounded-3xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <ShieldClose className="w-10 h-10 text-slate-800 group-hover:text-tomato-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-2">Unbiased Hiring</h3>
            <p className="text-slate-600 font-medium max-w-[250px]">
              A built-in censorship system hides personal candidate information
              during the early shortlisting process.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 text-center group cursor-pointer">
            <div className="p-6 bg-card rounded-3xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <BellRing className="w-10 h-10 text-slate-800 group-hover:text-tomato-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-2">Smart Matching</h3>
            <p className="text-slate-600 font-medium max-w-[250px]">
              Recruiters see detailed matching scores, and our system
              automatically notifies the top candidates for new roles.
            </p>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold tracking-wider text-lg px-12 py-8 rounded-2xl border border-transparent shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            View Transparent AI Specs
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LandingSectionTwo;
