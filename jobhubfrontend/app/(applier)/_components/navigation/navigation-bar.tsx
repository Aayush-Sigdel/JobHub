"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { SearchBar } from "@/components/web/search";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { DropdownMenuProfileIcons } from "@/app/(applier)/_components/dropdown/dropdown-profile";
import NotificationCenter from "@/app/(applier)/_components/dropdown/dropdown-notification";
import Logo from "./logo";
import MessageCenter from "../dropdown/dropdown-message";
import JobTracker from "../dropdown/dropdown-job-tracker";
import { cn } from "@/lib/utils";

const candidateLinks = [
  { name: "Home", href: "/home" },
  { name: "Find Jobs", href: "/find-job" },
  { name: "Track Applications", href: "/job-tracker" },
  { name: "Collaboration", href: "/home?tab=collaboration" },
];

interface NavigationBarProps {
  profile?: any;
}

const NavigationBarContent = ({ profile }: NavigationBarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const { data: session, status } = useSession();
  const isUserLoggedIn = status === "authenticated";

  // Hide the navbar search bar when the current page already contains an in-page search bar
  const hasInPageSearch =
    pathname === "/home" || pathname === "/find-job" || pathname === "/job-tracker";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        {/* Left: Logo & Primary Candidate Links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            href={
              isUserLoggedIn
                ? profile?.employer || session?.user?.employer
                  ? "/dashboard"
                  : "/home"
                : "/"
            }
            className="flex items-center transition-opacity hover:opacity-90"
            aria-label="JobHub Home"
          >
            <Logo />
          </Link>

          {isUserLoggedIn && (
            <nav className="hidden lg:flex items-center gap-1">
              {candidateLinks.map((link) => {
                const isCollabLink = link.href === "/home?tab=collaboration";
                const isActive = isCollabLink
                  ? pathname === "/home" && currentTab === "collaboration"
                  : link.href === "/home"
                  ? pathname === "/home" && currentTab !== "collaboration"
                  : pathname === link.href || pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Center: Compact Search Bar (only shown when page does not already have an in-page search bar) */}
        {!hasInPageSearch && (
          <div className="flex-1 max-w-md hidden sm:block">
            <SearchBar />
          </div>
        )}

        {/* Right: Actions, Theme, & Profile / Auth */}
        <div className="flex shrink-0 items-center gap-1.5">
          {isUserLoggedIn ? (
            <div className="flex items-center gap-1">
              <JobTracker />
              <MessageCenter />
              <NotificationCenter />
            </div>
          ) : null}

          <div className="mx-1.5 h-4 w-px bg-border hidden sm:block" />

          <ThemeToggle variant="circle" />

          {isUserLoggedIn ? (
            <div className="ml-1">
              <DropdownMenuProfileIcons profile={profile} />
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link
                href="/sign-in"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-black hover:bg-primary/90 transition-colors shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const NavigationBar = (props: NavigationBarProps) => {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
            <div className="flex items-center gap-6 shrink-0">
              <Logo />
            </div>
          </div>
        </header>
      }
    >
      <NavigationBarContent {...props} />
    </Suspense>
  );
};

export default NavigationBar;
