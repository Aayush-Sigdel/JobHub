"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "motion/react";

const LandingSectionFour = () => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      "#FFCC00", // 1. Yellow (Start)
      "#93C5FD", // 2. Soft Blue
      "#FCA5A5", // 3. Soft Red
      "#6EE7B7", // 4. Emerald Green
      "#C084FC", // 5. Soft Purple
      "#818CF8", // 6. Indigo (End)
    ],
  );

  return (
    <motion.section
      ref={sectionRef}
      style={{ backgroundColor }}
      className="w-full py-32 px-6 flex flex-col items-center transition-colors duration-300"
    >
      {/* Block 1 (Yellow) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 h-[80vh] justify-center text-center"
      >
        <span className="text-sm font-bold uppercase tracking-widest text-black">
          Data Aggregation
        </span>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
          no endless duplicates
        </h2>
        <p className="text-xl font-medium text-black max-w-lg">
          Say goodbye to redundant and expired vacancies. Our ML-based
          deduplication cleans up job postings from multiple sources so you only
          see what's fresh.
        </p>
        <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-none mt-4">
          See how it works
        </Button>
      </motion.div>

      {/* Block 2 (Soft Blue) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 h-[80vh] justify-center text-center"
      >
        <span className="text-sm font-bold uppercase tracking-widest text-black">
          AI Transparency
        </span>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
          open algorithms
        </h2>
        <p className="text-xl font-medium text-black max-w-lg">
          No hidden black-box models. The specifications of our personalized job
          recommendation system are publicly disclosed and fully accessible.
        </p>
        <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-none mt-4">
          Read the specs
        </Button>
      </motion.div>

      {/* Block 3 (Soft Red) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 h-[80vh] justify-center text-center"
      >
        <span className="text-sm font-bold uppercase tracking-widest text-black">
          Deep Profiling
        </span>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
          beyond the resume
        </h2>
        <p className="text-xl font-medium text-black max-w-lg">
          We analyze more than just platform data. By extracting insights from
          your GitHub and portfolio websites, we capture your true capabilities.
        </p>
        <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-none mt-4">
          Connect your GitHub
        </Button>
      </motion.div>

      {/* Block 4 (Emerald Green) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 h-[80vh] justify-center text-center"
      >
        <span className="text-sm font-bold uppercase tracking-widest text-black">
          Smart Matching
        </span>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
          Instant Top-K Alerts
        </h2>
        <p className="text-xl font-medium text-black max-w-lg">
          Recruiters automatically view candidate match scores. The platform
          instantly fires notifications to the top K matching job seekers.
        </p>
        <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-none mt-4">
          View matching system
        </Button>
      </motion.div>

      {/* Block 5 (Soft Purple) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 h-[80vh] justify-center text-center"
      >
        <span className="text-sm font-bold uppercase tracking-widest text-black">
          Censorship Controls
        </span>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
          Blind Shortlisting
        </h2>
        <p className="text-xl font-medium text-black max-w-lg">
          Eliminate unconscious bias. Toggle our data-masking system to secure
          your early review stages with objective verification markers.
        </p>
        <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-none mt-4">
          See Anonymization Tools
        </Button>
      </motion.div>

      {/* Block 6 (Indigo) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 h-[80vh] justify-center text-center"
      >
        <span className="text-sm font-bold uppercase tracking-widest text-black">
          App Feed Reliability
        </span>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
          Daily Feed Refreshes
        </h2>
        <p className="text-xl font-medium text-black max-w-lg">
          Never waste time applying to expired openings again. JobHub handles
          constant maintenance sweeps to assure dynamic data fidelity.
        </p>
        <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-none mt-4">
          Browse Live Vacancies
        </Button>
      </motion.div>
    </motion.section>
  );
};

export default LandingSectionFour;
