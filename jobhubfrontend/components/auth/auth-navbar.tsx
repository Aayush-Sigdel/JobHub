"use client";

import React from "react";
import Link from "next/link";
import { Building2, Briefcase, Search } from "lucide-react";
import Logo from "@/app/(applier)/_components/navigation/logo";
import { Button } from "@/components/ui/button";

export const AuthNavbar: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 w-full px-4 sm:px-8 lg:px-12 py-3.5 sm:py-5 flex items-center justify-between pointer-events-none">
      {/* Left: JobHub Applier Logo */}
      <div className="pointer-events-auto flex items-center gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-md transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link
            href="/find-job"
            className="inline-flex items-center gap-1.5 rounded-md hover:text-foreground transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Find a job</span>
          </Link>
          <Link
            href="/category"
            className="inline-flex items-center gap-1.5 rounded-md hover:text-foreground transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            <span>Explore categories</span>
          </Link>
        </nav>
      </div>

      {/* Right: Contact Enterprise direct page link */}
      <div className="pointer-events-auto flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-xl px-3 text-xs sm:px-4 sm:text-sm"
        >
          <Link href="/enterprise">
            <Building2 className="w-4 h-4" />
            <span>Contact Enterprise</span>
          </Link>
        </Button>
      </div>
    </header>
  );
};
