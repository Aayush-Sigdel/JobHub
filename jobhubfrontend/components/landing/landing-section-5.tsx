"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { LandingReveal } from "./landing-motion";
import { landing } from "./landing-styles";
import styles from "./landing-marquee.module.css";

const places = [
  { label: "Kathmandu", href: "/find-job?location=Kathmandu" },
  { label: "Lalitpur", href: "/find-job?location=Lalitpur" },
  { label: "Pokhara", href: "/find-job?location=Pokhara" },
  { label: "Remote", href: "/find-job?workplaceType=REMOTE" },
  { label: "Hybrid", href: "/find-job?workplaceType=HYBRID" },
];
const paths = [
  {
    title: "A place for your next step.",
    text: "Build a profile that brings your experience and work together. Find roles, apply, and follow your progress.",
    action: "Create your profile",
    href: "/sign-up",
    audience: "For candidates",
  },
  {
    title: "A place for your next hire.",
    text: "Give candidates a clear picture of the role. Review their profiles, work, and assessments in one workspace.",
    action: "Open hiring workspace",
    href: "/manage-jobs",
    audience: "For employers",
  },
];

export default function LandingSectionFive() {
  const [paused, setPaused] = useState(false);
  return (
    <div>
      <section className={landing.section + " overflow-hidden bg-background"}>
        <LandingReveal className={landing.container + " text-center"}>
          <h2 className={landing.heading + " uppercase"}>
            Work how you want.
            <br />
            <span className="[-webkit-text-stroke:1.5px_currentColor] [-webkit-text-fill-color:transparent]">
              Work where you want.
            </span>
          </h2>
          <p className={landing.body + " mx-auto mt-6 max-w-2xl"}>
            A different city, a new team, or the flexibility to work remotely.
            Find a role that fits the way you live.
          </p>
          <Button asChild className={landing.button + " mt-8"}>
            <Link href="/find-job">
              Find your next role
              <IconArrowRight className="size-4" />
            </Link>
          </Button>
        </LandingReveal>
        <div className="mt-12 border-y border-border bg-muted/60 sm:mt-16">
          <div className={landing.container + " relative"}>
            <div
              className={styles.frame}
              data-paused={paused}
              aria-label="Browse jobs by location or work style"
            >
              <div className={styles.track}>
                <div className={styles.group}>
                  {places.map((place) => (
                    <Link
                      key={place.label}
                      href={place.href}
                      className="flex min-h-20 shrink-0 items-center gap-7 rounded text-xl font-extrabold uppercase tracking-tight hover:underline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground sm:text-2xl"
                    >
                      {place.label}
                      <IconArrowRight className="size-5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
                <div className={styles.duplicate} aria-hidden="true">
                  {places.map((place) => (
                    <span
                      key={place.label}
                      className="flex min-h-20 shrink-0 items-center gap-7 text-xl font-extrabold uppercase tracking-tight sm:text-2xl"
                    >
                      {place.label}
                      <IconArrowRight className="size-5 text-muted-foreground" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={landing.container + " mt-3 flex justify-end"}>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            aria-label={
              paused ? "Resume location animation" : "Pause location animation"
            }
            className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground motion-reduce:hidden"
          >
            {paused ? (
              <IconPlayerPlay className="size-4" />
            ) : (
              <IconPlayerPause className="size-4" />
            )}
            {paused ? "Resume motion" : "Pause motion"}
          </button>
        </div>
      </section>
      <section
        className={landing.section + " border-y border-border bg-muted/50"}
      >
        <div className={landing.container}>
          <LandingReveal className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className={landing.heading}>
              We’re here to help you
              <br className="hidden sm:block" /> find your people.
            </h2>
          </LandingReveal>
          <div className="grid gap-6 md:grid-cols-2">
            {paths.map((path, index) => (
              <LandingReveal
                key={path.href}
                delay={index * 0.08}
                className="flex flex-col rounded-2xl border border-border bg-card p-7 sm:p-10"
              >
                <p className="text-sm font-semibold text-muted-foreground">
                  {path.audience}
                </p>
                <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {path.title}
                </h3>
                <p className="mt-4 mb-6 text-base leading-7 text-muted-foreground">
                  {path.text}
                </p>
                <Link
                  href={path.href}
                  className={landing.link + " mt-auto self-start"}
                >
                  {path.action}
                  <IconArrowRight className="size-4" />
                </Link>
              </LandingReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
