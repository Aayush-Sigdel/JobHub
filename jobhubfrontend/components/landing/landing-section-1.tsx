import { Button } from "@/components/ui/button";
import LandingPageNavbar from "./landing-page-navbar";
import Image from "next/image";
import Link from "next/link";
import { LandingReveal } from "./landing-motion";
import { landing } from "./landing-styles";
import { IconArrowRight } from "@tabler/icons-react";

const LandingSectionOne = () => {
  return (
    <section className="w-full bg-background">
      <LandingPageNavbar />

      <div
        className={`${landing.container} grid items-center gap-10 pb-14 pt-10 sm:gap-12 sm:pb-16 sm:pt-12 md:grid-cols-[1.2fr_1fr] lg:gap-16 lg:pb-20 lg:pt-14`}
      >
        <LandingReveal className="flex min-w-0 flex-col items-start text-left">
          <p className="mb-5 border-l-2 border-primary pl-3 text-sm font-medium text-muted-foreground sm:mb-6">
            Skills first. People always.
          </p>
          <h1
            id="hero-content"
            tabIndex={-1}
            className="text-[clamp(2.125rem,4.5vw,4rem)] font-extrabold leading-[1.15] tracking-[-0.05em] text-foreground"
          >
            Hire fairly.
            <br />
            Work{" "}
            <span className="box-decoration-clone bg-primary px-1 text-primary-foreground">
              brilliantly.
            </span>
          </h1>
          <p className={`${landing.body} mt-6 max-w-[29rem] text-pretty`}>
            Find your next role. Show what you can do. Connect through skills,
            portfolios, and practical work.
          </p>

          <div className="mt-8 flex w-full flex-col items-start gap-3 sm:mt-9 sm:w-auto sm:gap-4">
            <Button
              asChild
              className={`${landing.button} h-14 w-full justify-between gap-10 px-6 sm:w-auto`}
            >
              <Link href="/home">
                Find jobs
                <IconArrowRight
                  aria-hidden="true"
                  className="size-5 transition-transform group-hover/button:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                />
              </Link>
            </Button>
            <Link href="#for-employers" className={landing.link}>
              Hiring? Meet your next team.
            </Link>
          </div>
        </LandingReveal>

        <LandingReveal
          delay={0.12}
          className="mx-auto w-full max-w-[25rem] md:ml-auto md:mr-0 lg:max-w-[27rem]"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 p-2 sm:p-3">
            <Image
              src="/jobhub-team-illustration.png"
              alt="Two professionals reviewing a portfolio together at a laptop"
              width={1122}
              height={1402}
              priority
              sizes="(max-width: 479px) calc(100vw - 66px), (max-width: 767px) 382px, (max-width: 1279px) 38vw, 406px"
              className="h-auto w-full rounded-xl"
            />
          </div>
        </LandingReveal>
      </div>
    </section>
  );
};

export default LandingSectionOne;
