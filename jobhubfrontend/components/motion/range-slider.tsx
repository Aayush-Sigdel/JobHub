"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect } from "react";
import { SPRING_GLIDE } from "@/lib/ease";
import { type SliderOptions, useSlider } from "@/lib/hooks/use-slider";
import { cn } from "@/lib/utils";

// Bouncy grab feedback for the thumb scale only
const SPRING_BOUNCY = {
  type: "spring",
  stiffness: 500,
  damping: 14,
  mass: 0.7,
} as const;

export interface RangeSliderProps extends SliderOptions {
  /** Render a tick dot at each step. */
  showTicks?: boolean;
  className?: string;
}

export function RangeSlider({
  showTicks = true,
  className,
  ...options
}: RangeSliderProps) {
  const reduce = useReducedMotion();
  const { percent, dragging, min, max, step, trackProps, sliderProps } =
    useSlider(options);

  // Spring-smoothed position drives both the thumb and the fill
  const target = useMotionValue(percent);
  useEffect(() => {
    target.set(percent);
  }, [percent, target]);

  const smooth = useSpring(target, SPRING_GLIDE);
  const pos = reduce ? target : smooth;
  const left = useMotionTemplate`${pos}%`;

  // Self-offset the thumb from 0% to -100% of its own width so it stays flush inside the track
  const thumbX = useTransform(pos, (p) => `${-p}%`);

  const steps = Math.floor(Number(((max - min) / step).toFixed(6)));
  const ticks =
    showTicks && steps > 0 && steps <= 50
      ? Array.from({ length: steps + 1 }, (_, i) =>
          Number((min + i * step).toFixed(6))
        )
      : [];

  return (
    <div
      {...trackProps}
      className={cn(
        "relative flex h-8 w-full touch-none select-none items-center overflow-hidden rounded-lg bg-muted border border-border/60",
        options.disabled
          ? "pointer-events-none opacity-50"
          : "cursor-grab active:cursor-grabbing",
        className
      )}
    >
      {/* Fill — runs from the left edge to the thumb */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-tomato-500/20"
        style={{ width: left }}
      />

      {/* Ticks */}
      <div className="pointer-events-none absolute inset-x-[3px] inset-y-0">
        {ticks.map((t) => {
          const tp = ((t - min) / (max - min)) * 100;
          return (
            <span
              key={t}
              className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25"
              style={{ left: `${tp}%` }}
            />
          );
        })}
      </div>

      {/* Vertical bar thumb — bounces on step */}
      <motion.div
        {...sliderProps}
        animate={reduce ? undefined : { scaleY: dragging ? 1.35 : 1 }}
        transition={SPRING_BOUNCY}
        className="absolute top-1/2 h-5 w-1.5 rounded-sm bg-tomato-500 shadow-sm outline-none ring-inset ring-tomato-500/30 focus-visible:ring-4"
        style={{ left, x: thumbX, y: "-50%" }}
      />
    </div>
  );
}

export default RangeSlider;
