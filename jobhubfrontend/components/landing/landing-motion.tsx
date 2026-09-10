"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import {
  motion,
  MotionConfig,
  useReducedMotion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";

const MotionContext = createContext({
  enabled: false,
});

export function LandingMotion({ children }: { children: ReactNode }) {
  const systemReduced = useReducedMotion() ?? true;
  return (
    <MotionContext.Provider
      value={{
        enabled: !systemReduced,
      }}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </MotionContext.Provider>
  );
}

export const useLandingMotion = () => useContext(MotionContext);

export function LandingReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { enabled } = useLandingMotion();
  const target = useRef<HTMLDivElement>(null);
  const inView = useInView(target, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={target}
      className={className}
      initial={false}
      animate={{ y: enabled && !inView ? 22 : 0 }}
      // Content stays visible in server HTML; only its position changes on entry.
      transition={{
        duration: enabled ? 0.5 : 0,
        delay: enabled ? delay : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxIllustration({
  children,
  className,
  variant = "hero",
}: {
  children: ReactNode;
  className?: string;
  variant?: "hero" | "community";
}) {
  const target = useRef<HTMLDivElement>(null);
  const { enabled } = useLandingMotion();
  const canHover = useHoverCapable();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const distance = canHover ? (variant === "hero" ? 38 : 24) : 12;
  const scrollOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [-distance, distance],
  );
  const scrollY = useSpring(scrollOffset, {
    stiffness: 75,
    damping: 24,
    mass: 0.8,
  });
  return (
    <div ref={target} className={className}>
      <motion.div style={{ y: enabled ? scrollY : 0 }}>{children}</motion.div>
    </div>
  );
}
