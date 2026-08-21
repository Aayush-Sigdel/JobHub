"use client";

import React from "react";
import Link from "next/link";
import { Building2, Briefcase, Search } from "lucide-react";
import Logo from "@/app/(applier)/_components/navigation/logo";

export const AuthNavbar: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 w-full px-4 sm:px-8 lg:px-12 py-3.5 sm:py-5 flex items-center justify-between pointer-events-none">
      {/* Left: JobHub Applier Logo */}
      <div className="pointer-events-auto flex items-center gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center hover:scale-105 transition-transform"
        >
          <Logo />
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-neutral-600">
          <Link
            href="/find-job"
            className="inline-flex items-center gap-1.5 hover:text-neutral-900 transition-colors"
          >
            <Search className="w-4 h-4 text-neutral-400" />
            <span>Find a job</span>
          </Link>
          <Link
            href="/category"
            className="inline-flex items-center gap-1.5 hover:text-neutral-900 transition-colors"
          >
            <Briefcase className="w-4 h-4 text-neutral-400" />
            <span>Explore categories</span>
          </Link>
        </nav>
      </div>

      {/* Right: Contact Enterprise direct page link */}
      <div className="pointer-events-auto flex items-center gap-3">
        <Link
          href="/enterprise"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-neutral-800 hover:text-neutral-950 bg-white/90 hover:bg-white border-2 border-neutral-300 hover:border-neutral-900 shadow-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <Building2 className="w-4 h-4 text-orange-500" />
          <span>Contact Enterprise</span>
        </Link>
      </div>
    </header>
  );
};
