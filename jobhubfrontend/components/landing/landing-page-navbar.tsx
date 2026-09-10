import Link from "next/link";
import Logo from "@/app/(applier)/_components/navigation/logo";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { IconMenu2 } from "@tabler/icons-react";
import { landing } from "./landing-styles";

const links = [
  { label: "Explore jobs", href: "/find-job" },
  { label: "Discover companies", href: "#companies" },
  { label: "For employers", href: "#for-employers" },
];

export default function LandingPageNavbar() {
  return (
    <header className="relative z-20">
      <a
        href="#hero-content"
        className="sr-only fixed left-4 top-4 rounded-xl bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only"
      >
        Skip to content
      </a>
      <div
        className={
          landing.container +
          " flex min-h-20 items-center justify-between gap-4"
        }
      >
        <Link
          href="/"
          aria-label="JobHub home"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <Logo />
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                landing.link +
                (index === 2 ? " border-l border-border pl-7" : "")
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle
            className="size-11 rounded-xl hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground"
            iconClassName="size-5"
          />
          <details className="group relative md:hidden">
            <summary
              aria-label="Open navigation"
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden"
            >
              <IconMenu2 className="size-5" />
            </summary>
            <nav
              aria-label="Mobile navigation"
              className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-card p-2 shadow-lg"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-4 py-3 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
