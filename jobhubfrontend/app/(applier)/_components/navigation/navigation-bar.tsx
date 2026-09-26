"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { ListingSearch } from "@/components/web/listing-search";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { DropdownMenuProfileIcons } from "@/app/(applier)/_components/dropdown/dropdown-profile";
import NotificationCenter from "@/app/(applier)/_components/dropdown/dropdown-notification";
import Logo from "./logo";
import MessageCenter from "../dropdown/dropdown-message";
import JobTracker from "../dropdown/dropdown-job-tracker";
import { cn } from "@/lib/utils";
import type { UserProfileResponse } from "@/types/api/user";
import { CollaborationInboxIndicator } from "@/components/collaboration/inbox-indicator";

const candidateLinks = [
  { name: "Home", href: "/home" },
  { name: "Find Jobs", href: "/find-job" },
  { name: "Track Applications", href: "/job-tracker" },
  { name: "Collaboration", href: "/collaborators" },
];

interface NavigationBarProps {
  profile?: UserProfileResponse | null;
}

const NavigationBarContent = ({ profile }: NavigationBarProps) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isUserLoggedIn = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        {/* Left: Logo & Primary Candidate Links */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={
              isUserLoggedIn
                ? profile?.employer || session?.user?.employer
                  ? "/dashboard"
                  : "/home"
                : "/"
            }
            className="flex items-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="JobHub Home"
          >
            <Logo className="[&>span]:hidden sm:[&>span]:inline" />
          </Link>

          {isUserLoggedIn && (
            <nav className="hidden lg:flex items-center gap-1">
              {candidateLinks.map((link) => {
                const isActive =
                  link.href === "/home"
                    ? pathname === "/home"
                    : pathname === link.href || pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      isActive
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {isUserLoggedIn && pathname !== "/find-job" && (
          <div className="ml-auto min-w-0 sm:w-56 sm:flex-1 sm:max-w-xs">
            <ListingSearch />
          </div>
        )}

        {/* Right: Actions, Theme, & Profile / Auth */}
        <div className="flex shrink-0 items-center gap-1.5">
          {isUserLoggedIn ? (
            <div className="flex items-center gap-1">
              <JobTracker />
              <CollaborationInboxIndicator />
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
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
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
            <div className="flex items-center gap-3 shrink-0">
              <Logo className="[&>span]:hidden sm:[&>span]:inline" />
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
