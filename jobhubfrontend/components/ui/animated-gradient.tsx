"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function AnimatedGradient({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden w-full h-full bg-tuscan-sun-400", className)}>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 blur-[100px]"
      />
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
