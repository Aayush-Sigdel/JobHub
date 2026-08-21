"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";

import { SearchBar } from "@/components/web/search";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { DropdownMenuProfileIcons } from "@/app/(applier)/_components/dropdown/dropdown-profile";
import NotificationCenter from "@/app/(applier)/_components/dropdown/dropdown-notification";
import Logo from "./logo";
import MessageCenter from "../dropdown/dropdown-message";
import JobTracker from "../dropdown/dropdown-job-tracker";

const links = [
  { name: "Dashboard", href: "#" },
  { name: "Applications", href: "#" },
];

const NavigationBar = () => {
  const { data: session, status } = useSession();
  const isUserLoggedIn = status === "authenticated";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border dark:border-slate-800 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex flex-1 items-center gap-6">
          <Link
            href="/"
            className="flex shrink-0 items-center hover:scale-105 transition-transform"
          >
            <Logo />
          </Link>

          <div className="hidden w-full max-w-xl md:block">
            <SearchBar />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {isUserLoggedIn && (
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <MessageCenter />
              <Link
                href={"/job-tracker"}
                className="hover:text-tomato-500 transition-colors"
              >
                <JobTracker />
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 border-l border-border dark:border-slate-800 pl-4">
            <ThemeToggle variant="circle" />
            {isUserLoggedIn ? (
              <DropdownMenuProfileIcons />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Link href="/sign-in">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-1.5 rounded-xl font-bold text-sm text-foreground hover:bg-muted dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    Sign In
                  </motion.div>
                </Link>

                <Link href="/sign-up">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-1.5 bg-tomato-500 text-white rounded-xl font-bold text-sm flex items-center justify-center cursor-pointer border border-tomato-500 hover:bg-transparent hover:text-foreground transition-colors"
                  >
                    Sign Up
                  </motion.div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
