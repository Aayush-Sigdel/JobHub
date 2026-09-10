import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconSearch,
  IconCode,
  IconClipboardCheck,
  IconChartBar,
  IconArrowRight,
} from "@tabler/icons-react";
import { LandingReveal } from "./landing-motion";
import { landing } from "./landing-styles";

const features = [
  {
    title: "Focused discovery",
    text: "Find opportunities by role, location, and the way you want to work.",
    icon: IconSearch,
  },
  {
    title: "Deeper profiles",
    text: "Bring your skills, experience, GitHub, and portfolio into one profile.",
    icon: IconCode,
  },
  {
    title: "Practical assessments",
    text: "Show how you approach programming, design, and SQL tasks.",
    icon: IconClipboardCheck,
  },
  {
    title: "Clearer matching",
    text: "Explore the available evidence behind a job or candidate match.",
    icon: IconChartBar,
  },
];

export default function LandingSectionTwo() {
  return (
    <section
      id="features"
      className={
        landing.section +
        " scroll-mt-8 border-y border-border bg-muted/50 text-center"
      }
    >
      <div className={landing.container}>
        <LandingReveal>
          <h2 className={landing.heading}>
            Advanced tools for
            <br className="hidden sm:block" /> a fairer search.
          </h2>
          <p className={landing.body + " mx-auto mt-6 max-w-2xl"}>
            There’s more to a match than a job title. Get to know the skills,
            work, and people behind it.
          </p>
        </LandingReveal>
        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8">
          {features.map(({ title, text, icon: Icon }, index) => (
            <LandingReveal
              key={title}
              delay={index * 0.07}
              className="flex flex-col items-center"
            >
              <div className="mb-5 flex size-20 items-center justify-center rounded-2xl border border-border bg-card">
                <Icon className="size-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{title}</h3>
              <p className="mt-3 max-w-xs text-base leading-7 text-muted-foreground">
                {text}
              </p>
            </LandingReveal>
          ))}
        </div>
        <Button asChild variant="outline" className={landing.button + " mt-12"}>
          <Link href="#how-it-works">
            See how it works <IconArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
