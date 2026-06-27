"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import { SearchBar } from "@/components/web/search";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import Logo from "../../_components/logo";
import { DropdownMenuProfileIcons } from "../../_components/dropdown-profile";
import NotificationCenter from "../../_components/dropdown-notification";
import MessageCenter from "../../_components/dropdown-message";
import JobTracker from "../../_components/dropdown-job-tracker";
import { cn } from "@/lib/utils";
import { AuthModalWrapper } from "@/components/auth/auth-modal-wrapper";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { SignUpModal } from "@/components/auth/sign-up-modal";

const links = [
  { name: "Dashboard", href: "#" },
  { name: "Applications", href: "#" },
];

const NavigationBar = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isJobPoster, setIsJobPoster] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex flex-1 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center hover:scale-105 transition-transform">
            <Logo />
          </Link>

          <div className="hidden w-full max-w-xl md:block">
            <SearchBar />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {isJobPoster && (
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link, idx) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative px-3 py-1.5 text-sm font-bold text-foreground transition-colors rounded-full"
                >
                  <AnimatePresence>
                    {hoveredIndex === idx && (
                      <motion.div
                        layoutId="navbar-hover-pill"
                        className="absolute inset-0 bg-[#FFCC00] rounded-full -z-10"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className={cn("relative z-10", hoveredIndex === idx ? "text-slate-900" : "")}>{link.name}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <NotificationCenter />
            <MessageCenter />
            <Link href={"/save-job"} className="hover:text-[#FFCC00] transition-colors">
              <JobTracker />
            </Link>
          </div>

          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
            <ThemeToggle variant="circle" />
            {isUserLoggedIn ? (
              <DropdownMenuProfileIcons />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div onClick={() => setIsSignInOpen(true)}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-1.5 rounded-xl font-bold text-sm text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    Sign In
                  </motion.div>
                </div>

                <div onClick={() => setIsSignUpOpen(true)}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center cursor-pointer border border-slate-900 dark:border-white hover:bg-transparent hover:text-slate-900 dark:hover:bg-transparent dark:hover:text-white transition-colors"
                  >
                    Sign Up
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* State-driven Modals */}
      <AuthModalWrapper isOpen={isSignInOpen} setIsOpen={setIsSignInOpen}>
        <SignInModal />
      </AuthModalWrapper>

      <AuthModalWrapper isOpen={isSignUpOpen} setIsOpen={setIsSignUpOpen}>
        <SignUpModal />
      </AuthModalWrapper>
    </nav>
  );
};

export default NavigationBar;
