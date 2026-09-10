"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useLandingMotion } from "./landing-motion";
import {
  IconArrowRight,
  IconBrandGithub,
  IconWorld,
  IconUserCircle,
  IconCheck,
  IconFileDescription,
  IconCode,
} from "@tabler/icons-react";

const stories = [
  {
    title: "Beyond the résumé.",
    description:
      "Your best work deserves to be seen. Connect your experience, GitHub, and portfolio to give employers a fuller picture.",
    href: "/candidate-profile",
    action: "Build your profile",
    items: [
      {
        icon: IconUserCircle,
        title: "Your experience",
        detail: "Skills, education, and the work you’ve done.",
      },
      {
        icon: IconBrandGithub,
        title: "Your projects",
        detail: "Connect your GitHub and other work sources.",
      },
      {
        icon: IconWorld,
        title: "Your portfolio",
        detail: "Bring your own work into the conversation.",
      },
    ],
  },
  {
    title: "Understand your match.",
    description:
      "A score is only a starting point. Explore the profile evidence and assessment results behind a candidate’s fit.",
    href: "/manage-jobs",
    action: "Explore the hiring workspace",
    items: [
      {
        icon: IconFileDescription,
        title: "Profile evidence",
        detail: "Review the experience behind the application.",
      },
      {
        icon: IconCode,
        title: "Practical assessments",
        detail: "See how a candidate approaches real work.",
      },
      {
        icon: IconCheck,
        title: "Your decision",
        detail: "Review and shortlist with the evidence in view.",
      },
    ],
  },
];

export default function LandingFeatureStories() {
  const { enabled } = useLandingMotion();
  return (
    <section
      aria-label="A closer look at JobHub"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
        <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
          Advanced tools for
          <br />a fairer search.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Get to know the work behind a profile and the opportunity behind a job
          title.
        </p>
      </div>
      <div className="space-y-14 sm:space-y-20">
        {stories.map((story, index) => (
          <motion.article
            key={story.title}
            initial={enabled ? { opacity: 1, y: 24 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            animate={enabled ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: enabled ? 0.55 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="grid items-start gap-8 border-t border-border pt-10 sm:gap-12 sm:pt-14 lg:grid-cols-2 lg:gap-24"
          >
            <div className={index === 1 ? "lg:order-2" : ""}>
              <h3 className="max-w-md text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
                {story.title}
              </h3>
              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                {story.description}
              </p>
              <Link
                href={story.href}
                className="mt-6 inline-flex items-center gap-2 rounded text-sm font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {story.action}
                <IconArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="space-y-8">
              {story.items.map(({ icon: Icon, title, detail }, itemIndex) => (
                <motion.li
                  key={title}
                  className="flex gap-4"
                  initial={enabled ? { x: index === 0 ? 16 : -16 } : false}
                  whileInView={{ x: 0 }}
                  animate={enabled ? undefined : { x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: enabled ? 0.45 : 0,
                    delay: enabled ? itemIndex * 0.09 : 0,
                  }}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                    <Icon className="size-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{title}</h4>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
