"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const categories = [
  { id: 1, name: "Full Stack", href: "#" },
  { id: 2, name: "Frontend Developer", href: "#" },
  { id: 3, name: "Backend Developer", href: "#" },
  { id: 4, name: "Data Scientist", href: "#" },
  { id: 5, name: "DevOps Engineer", href: "#" },
  { id: 6, name: "Mobile Developer", href: "#" },
  { id: 7, name: "UI/UX Designer", href: "#" },
  { id: 8, name: "Product Manager", href: "#" },
  { id: 9, name: "QA Engineer", href: "#" },
  { id: 10, name: "Cloud Engineer", href: "#" },
];

const NavigationBarBottom = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full bg-background/80 backdrop-blur-md border-b border-border dark:border-slate-800 relative z-40">
      <nav className="flex max-w-7xl mx-auto py-1.5 px-4 md:px-6 items-center overflow-x-auto no-scrollbar gap-1">
        <Link
          href="#"
          className="shrink-0 flex items-center justify-center gap-1.5 mr-2 bg-tomato-500/10 hover:bg-tomato-500/20 px-3 py-1.5 rounded-full transition-colors border border-tomato-500/30"
        >
          <Image
            src="/icons/Fire.gif"
            alt="fire icon"
            width={18}
            height={10}
            className="opacity-90 w-4 h-4"
          />
          <span className="text-xs font-bold text-tomato-700 dark:text-tomato-500">
            Latest Jobs
          </span>
        </Link>

        {categories.map((category, idx) => (
          <Link
            key={category.id}
            href={category.href}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors dark:text-slate-300"
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="bottom-nav-hover-pill"
                  className="absolute inset-0 bg-tomato-500 rounded-full -z-10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    type: "tween",
                    duration: 0.15,
                    ease: "easeOut",
                  }}
                />
              )}
            </AnimatePresence>
            <span
              className={cn(
                "relative z-10 transition-colors",
                hoveredIndex === idx ? "text-foreground" : "",
              )}
            >
              {category.name}
            </span>
          </Link>
        ))}

        <Link
          href="#"
          className="shrink-0 px-3 py-1.5 text-xs font-bold text-muted-foreground underline decoration-2 decoration-tomato-500 underline-offset-4 transition-colors hover:text-foreground"
        >
          more
        </Link>
      </nav>
    </div>
  );
};

export default NavigationBarBottom;
