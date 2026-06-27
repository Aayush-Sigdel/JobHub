"use client";

import { motion, Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { StarIcon as Star } from "@animateicons/react/lucide";;

const LandingSectionFive = () => {
  const cities = [
    "AMSTERDAM",
    "BARCELONA",
    "BERLIN",
    "DUBLIN",
    "PARIS",
    "REMOTE",
    "AND MORE",
  ];

  const testimonials = [
    {
      quote: "Anyway, as I was saying — best-in-class.",
      stars: 5,
      author: "Anonymous",
      title: "Tech Lead",
    },
    {
      quote: "AHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
      stars: 0,
      author: "Polyphemus",
      title: "Cyclops, Cave Solutions (on leave)",
      isJoke: true,
    },
    {
      quote: "I'm a real person. This is a real testimonial. By a real woman.",
      stars: 5,
      author: "Definitely A. Human",
      title: "Totally Real Developer",
    },
  ];

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < count ? "fill-tuscan-sun-500 text-foreground" : "text-gray-300"
        } ${count > 0 ? "stroke-2" : "stroke-1"}`}
      />
    ));
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full flex flex-col">
      {/* --- PART 1: LOCATIONS MARQUEE --- */}
      <section className="w-full bg-background py-24 md:py-32 flex flex-col items-center border-b-2 border-border overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-6 text-center z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-2 mb-8"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground uppercase">
              Work how you want.
            </h2>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent [-webkit-text-stroke:2px_currentColor] uppercase">
              Work where you want.
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl font-bold text-gray-700 max-w-2xl mb-12 leading-relaxed"
          >
            Find roles in the most exciting cities for tech jobs, plus thousands
            of remote and flexible opportunities tailored to your lifestyle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button className="bg-tomato-500 text-white hover:bg-tomato-500 border-2 border-transparent font-black uppercase tracking-widest text-lg px-10 py-7 rounded-none transition-all flex items-center gap-3">
              Let's Go <ArrowRight className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>

        {/* Infinite Scrolling Marquee */}
        <div className="w-full mt-20 border-y-2 border-border bg-onyx-900 text-white py-4 flex overflow-hidden whitespace-nowrap">
          <motion.div
            animate={{ x: [0, -1035] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            className="flex items-center gap-12 font-black text-xl md:text-2xl tracking-widest uppercase"
          >
            {[...cities, ...cities, ...cities].map((city, idx) => (
              <div key={idx} className="flex items-center gap-12">
                <span className="text-white">{city}</span>
                <span className="text-tomato-500 text-2xl">●</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- PART 2: JOKE TESTIMONIALS --- */}
      <section className="w-full bg-muted py-24 md:py-32 px-6 flex flex-col items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16 flex flex-col items-center">
            <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-3 py-1 mb-4 border-2 border-border">
              What Our Users Say
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] uppercase">
              We are here to help you <br className="hidden md:block" /> find
              your people.
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((test, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className={`flex flex-col justify-between p-8 border-2 border-border bg-background transition-all ${
                  test.isJoke ? "rotate-1" : "even:-rotate-1"
                }`}
              >
                <div>
                  <div className="flex gap-1 mb-6">
                    {renderStars(test.stars)}
                  </div>
                  <p
                    className={`text-lg font-bold text-foreground mb-8 leading-snug ${test.isJoke ? "text-red-600 font-black text-xl break-words" : ""}`}
                  >
                    "{test.quote}"
                  </p>
                </div>

                <div className="pt-6 border-t-2 border-dashed border-gray-300">
                  <p className="font-black text-foreground uppercase">
                    {test.author}
                  </p>
                  <p className="text-sm font-bold text-gray-500">
                    {test.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingSectionFive;
