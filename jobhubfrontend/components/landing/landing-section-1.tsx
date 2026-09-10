import { Button } from "@/components/ui/button";
import LandingPageNavbar from "./landing-page-navbar";
import Image from "next/image";
import Link from "next/link";
import { LandingReveal, ParallaxIllustration } from "./landing-motion";
import { landing } from "./landing-styles";
import { IconArrowRight } from "@tabler/icons-react";

const LandingSectionOne = () => {
  return (
    <section className="w-full bg-background pb-16 sm:pb-20">
      <LandingPageNavbar />

      <div
        className={`${landing.container} grid items-center gap-12 pt-8 sm:pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14`}
      >
        <LandingReveal className="flex flex-col items-start gap-6 text-left">
          <div className="rounded-lg bg-primary/15 px-3 py-1.5 text-sm font-semibold text-foreground">
            Skills first. People always.
          </div>
          <h1
            id="hero-content"
            tabIndex={-1}
            className="text-[clamp(2.5rem,5.3vw,4.5rem)] font-extrabold leading-[1.08] tracking-[-0.045em] text-foreground"
          >
            Hire fairly.
            <br />
            Work brilliantly.
          </h1>
          <p className={`${landing.body} max-w-lg`}>
            Find your next role. Show what you can do. Connect through skills,
            portfolios, and practical work.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button asChild className={landing.button}>
              <Link href="/find-job">
                Find jobs <IconArrowRight className="size-4" />
              </Link>
            </Button>
            <Link href="#for-employers" className={landing.link}>
              Hiring? Meet your next team.
            </Link>
          </div>
        </LandingReveal>

        <ParallaxIllustration className="mx-auto w-full max-w-md lg:max-w-none">
          <Image
            src="/jobhub-team-illustration.png"
            alt="Two professionals reviewing a portfolio together at a laptop"
            width={1122}
            height={1402}
            priority
            sizes="(max-width: 1024px) 90vw, 480px"
            className="h-auto max-h-[540px] w-full rounded-2xl object-cover object-top"
          />
        </ParallaxIllustration>
      </div>
    </section>
  );
};

export default LandingSectionOne;
