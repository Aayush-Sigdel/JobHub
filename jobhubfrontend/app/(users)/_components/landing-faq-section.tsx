"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlusIcon as Plus, MinusIcon as Minus } from "@animateicons/react/lucide";;

const faqs = [
  {
    question: "How is JobHub different from other Nepalese job portals?",
    answer:
      "Unlike traditional platforms that suffer from duplicate listings and hidden algorithms, JobHub actively cleans expired data, uses 100% transparent AI matching formulas, and analyzes your actual coding portfolios—not just a static resume.",
  },
  {
    question: "How does the 'Blind Shortlisting' actually work?",
    answer:
      "To prevent unconscious bias, our system temporarily masks personally identifiable information (like your name, profile photo, and gender) during the initial review stages. Employers only see your skills, GitHub metrics, and match score.",
  },
  {
    question: "Do I have to connect my GitHub and Portfolio?",
    answer:
      "It is completely optional, but highly recommended! Connecting external sources gives our deep-profiling engine a much richer understanding of your capabilities, which directly boosts your match accuracy for premium roles.",
  },
  {
    question: "Is JobHub completely free for candidates?",
    answer:
      "Yes. All candidate features, including intelligent matching, automated Top-K alerts, and deep-profile extraction, are completely free to use.",
  },
  {
    question: "How do the automated 'Top-K' alerts function?",
    answer:
      "The moment an employer publishes a new job, our algorithm calculates match scores across the candidate pool. The top 'K' (e.g., top 10) most qualified candidates instantly receive a push notification to apply.",
  },
];

const FAQItem = ({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={`border-2 border-black bg-white transition-all duration-300 ${
        isOpen
          ? "border-[#FFCC00] -translate-y-1"
          : ""
      } mb-6`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
      >
        <span className="font-black text-lg md:text-xl text-black pr-8 uppercase tracking-wide">
          {question}
        </span>
        <div
          className={`shrink-0 p-2 border-2 border-black transition-colors ${isOpen ? "bg-[#FFCC00]" : "bg-slate-100"}`}
        >
          {isOpen ? (
            <Minus className="w-6 h-6 text-black" />
          ) : (
            <Plus className="w-6 h-6 text-black" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 md:p-8 pt-0 border-t-2 border-dashed border-gray-300 text-gray-700 font-bold text-base md:text-lg leading-relaxed mt-2">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingSectionFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  return (
    <section className="w-full bg-[#F5F5F3] py-24 md:py-32 px-6 flex flex-col items-center border-b-2 border-black">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-xs font-black uppercase tracking-widest bg-black text-[#FFCC00] px-3 py-1 mb-4 border-2 border-black">
            Got Questions?
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.1] uppercase">
            Frequently Asked <br className="hidden md:block" /> Questions.
          </h2>
        </div>

        <div className="w-full flex flex-col">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingSectionFAQ;
