"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

const LandingSectionSix = () => {
  return (
    <footer className="w-full flex flex-col">
      {/* CTA Section with Image */}
      <section className="py-24 md:py-32 px-6 flex justify-center bg-muted border-b-2 border-border overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full">
          {/* Text Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 text-foreground uppercase leading-[1.05]"
            >
              Ready to revolutionize hiring?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl font-bold text-muted-foreground max-w-xl mb-12 leading-relaxed"
            >
              Join the platform that puts skills first. Transparent, unbiased,
              and powered by intelligent data.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button className="bg-foreground text-tomato-500 hover:bg-background hover:text-foreground border-2 border-border font-black uppercase tracking-widest text-lg px-12 py-8 rounded-none transition-all">
                Get Started Now
              </Button>
            </motion.div>
          </div>

          <div className="flex w-1/2 justify-center lg:justify-end">
            <Image
              src="/landing-illustrate-two.png"
              alt="JobHub Platform Preview"
              width={1000}
              height={800}
              className="object-cover z-10 transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Footer Details */}
      <section className="w-full bg-background py-16 px-6 lg:px-24 flex flex-col items-center">
        <div className="text-4xl font-black text-foreground mb-10 tracking-tighter uppercase">
          JobHub.
        </div>

        <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 mb-12 font-bold text-sm uppercase tracking-widest text-muted-foreground">
          <Link
            href="#"
            className="hover:text-foreground transition-colors hover:underline underline-offset-4"
          >
            Candidates
          </Link>
          <Link
            href="#"
            className="hover:text-foreground transition-colors hover:underline underline-offset-4"
          >
            Employers
          </Link>
          <Link
            href="#"
            className="hover:text-foreground transition-colors hover:underline underline-offset-4"
          >
            AI Specifications
          </Link>
          <Link
            href="#"
            className="hover:text-foreground transition-colors hover:underline underline-offset-4"
          >
            Privacy Policy
          </Link>
        </div>

        <p className="text-gray-400 text-xs font-bold text-center uppercase tracking-widest max-w-2xl leading-relaxed">
          © {new Date().getFullYear()} JobHub. A Project by Aayush Sigdel,
          Sugham Kharel, and Kamal Subedi. All rights reserved.
        </p>
      </section>
    </footer>
  );
};

export default LandingSectionSix;
