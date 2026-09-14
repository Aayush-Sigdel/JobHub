import Link from "next/link";
import JobHubLogo from "@/components/brand/JobHubLogo";
import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { LandingReveal } from "./landing-motion";
import { landing } from "./landing-styles";

export default function LandingSectionSix() {
  return (
    <footer>
      <section
        className={landing.section + " border-y border-border bg-muted/50"}
      >
        <div
          className={
            landing.container +
            " grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16"
          }
        >
          <LandingReveal className="text-center lg:text-left">
            <h2 className={landing.heading}>
              Ready for your
              <br className="hidden sm:block" /> next chapter?
            </h2>
            <p className={landing.body + " mx-auto mt-6 max-w-lg lg:mx-0"}>
              Bring your skills. Find your people. Take the next step toward
              work that fits you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
              <Button asChild className={landing.button}>
                <Link href="/sign-up">
                  Join JobHub
                  <IconArrowRight className="size-4" />
                </Link>
              </Button>
              <Link href="/manage-jobs" className={landing.link}>
                I’m here to hire
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </LandingReveal>
          <Image
            src="/landing-illustrate-two.png"
            alt="People sharing ideas and learning together"
            width={613}
            height={350}
            sizes="(max-width: 1024px) 90vw, 500px"
            className="mx-auto h-auto w-full max-w-lg object-contain"
          />
        </div>
      </section>
      <div
        className={
          landing.container +
          " flex flex-col items-center py-12 text-center sm:py-16"
        }
      >
        <Link
          href="/"
          aria-label="JobHub home"
          className="rounded-md text-4xl font-extrabold tracking-tight focus-visible:outline-2 focus-visible:outline-foreground"
        >
          <JobHubLogo markClassName="size-10" />
        </Link>
        <nav
          aria-label="Footer navigation"
          className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2"
        >
          <Link href="/find-job" className={landing.link}>
            Candidates
          </Link>
          <Link href="/manage-jobs" className={landing.link}>
            Employers
          </Link>
          <Link href="#how-it-works" className={landing.link}>
            How it works
          </Link>
          <Link href="/privacy-policy" className={landing.link}>
            Privacy policy
          </Link>
          <Link href="/terms-of-service" className={landing.link}>
            Terms of service
          </Link>
        </nav>
        <p className="mt-8 max-w-2xl text-xs leading-6 text-muted-foreground">
          © {new Date().getFullYear()} JobHub. A Project by Aayush Sigdel,
          Sugham Kharel, and Kamal Subedi. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
