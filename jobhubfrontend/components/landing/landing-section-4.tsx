"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  type MotionStyle,
} from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { LandingReveal, useLandingMotion } from "./landing-motion";
import { landing } from "./landing-styles";

// The changing color field is part of the original landing-page identity.
// Both palettes keep readable text throughout the complete scroll transition.
const lightColors = [
  "#bde9f5",
  "#f5e59a",
  "#f6c1b8",
  "#ebc9d7",
  "#c4dfce",
  "#d9e8b0",
];
const darkColors = [
  "#193c49",
  "#443b20",
  "#482a27",
  "#40283a",
  "#213d33",
  "#333e24",
];
const stories = [
  {
    title: "less searching. more finding.",
    text: "Filter by role, location, and workplace type. Read the requirements before deciding where to apply.",
    action: "Find jobs",
    href: "/find-job",
  },
  {
    title: "understand your match.",
    text: "A score is a starting point. Look at the available profile evidence and requirements to understand how a role fits.",
    action: "Explore recommendations",
    href: "/home",
  },
  {
    title: "beyond the résumé.",
    text: "Your work tells a bigger story. Add experience, projects, and portfolio links so employers can see what you bring.",
    action: "Build your profile",
    href: "/candidate-profile",
  },
  {
    title: "show how you think.",
    text: "Take on practical programming, design, or SQL tasks when a role includes an assessment. Let your approach speak for itself.",
    action: "Learn about assessments",
    href: "#faq",
  },
  {
    id: "for-employers",
    title: "your next great hire.",
    text: "Create a listing, review candidate profiles and assessment results, and edit job details from one hiring workspace.",
    action: "Post a job",
    href: "/manage-jobs",
  },
  {
    title: "know what’s next.",
    text: "Keep your applications together. Check their status and return to the roles you’ve applied for without losing your place.",
    action: "Track your applications",
    href: "/job-tracker",
  },
];

export default function LandingSectionFour() {
  const sectionRef = useRef<HTMLElement>(null);
  const { enabled } = useLandingMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const light = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    lightColors,
  );
  const dark = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    darkColors,
  );
  const colors = {
    "--story-light": enabled ? light : lightColors[0],
    "--story-dark": enabled ? dark : darkColors[0],
  } as MotionStyle;

  return (
    <motion.section
      ref={sectionRef}
      id="how-it-works"
      aria-label="How JobHub works"
      style={colors}
      className="relative scroll-mt-8 bg-[var(--story-light)] text-foreground dark:bg-[var(--story-dark)]"
    >
      <div className={landing.container}>
        {stories.map((story) => (
          <article
            key={story.title}
            id={story.id}
            className="flex min-h-[30rem] scroll-mt-8 items-center justify-center py-16 text-center sm:min-h-[65svh] sm:py-24"
          >
            <LandingReveal className="flex w-full max-w-3xl flex-col items-center">
              <h2 className={landing.heading}>{story.title}</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">
                {story.text}
              </p>
              <Button asChild className={landing.button + " mt-8"}>
                <Link href={story.href}>
                  {story.action}
                  <IconArrowRight className="size-4" />
                </Link>
              </Button>
            </LandingReveal>
          </article>
        ))}
      </div>
    </motion.section>
  );
}
