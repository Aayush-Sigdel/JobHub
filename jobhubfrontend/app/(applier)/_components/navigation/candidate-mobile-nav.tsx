"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  IconHome,
  IconSearch,
  IconBookmark,
  IconCode,
  IconUsers,
  IconUser,
} from "@tabler/icons-react";
import { useLocalSavedJobs } from "@/lib/hooks/use-local-jobs";
import { cn } from "@/lib/utils";

const mobileTabs = [
  { name: "Home", href: "/home", icon: IconHome },
  { name: "Search", href: "/find-job", icon: IconSearch },
  { name: "Tracker", href: "/job-tracker", icon: IconBookmark },
  { name: "Tasks", href: "/task/program", icon: IconCode },
  { name: "Collab", href: "/collaborators", icon: IconUsers },
  { name: "Profile", href: "/candidate-profile", icon: IconUser },
];

export default function CandidateMobileNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const { savedJobs } = useLocalSavedJobs();

  // Only show bottom navigation on mobile when user is signed in
  if (status !== "authenticated") {
    return null;
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-border bg-background/95 backdrop-blur-md"
    >
      <div className="flex h-14 items-center justify-around px-2">
        {mobileTabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/home" && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          const isTracker = tab.name === "Tracker";

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors",
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative">
                <Icon size={19} stroke={isActive ? 2 : 1.75} />
                {isTracker && savedJobs.length > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-black text-black ring-1 ring-background">
                    {savedJobs.length}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] leading-tight">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
