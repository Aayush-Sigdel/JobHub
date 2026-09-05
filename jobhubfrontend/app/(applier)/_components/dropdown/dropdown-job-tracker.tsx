"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useLocalSavedJobs } from "@/lib/hooks/use-local-jobs";
import { cn } from "@/lib/utils";

export default function JobTracker() {
  const pathname = usePathname();
  const { savedJobs } = useLocalSavedJobs();
  const count = savedJobs.length;
  const isTrackerActive = pathname.startsWith("/job-tracker");

  return (
    <Link
      href="/job-tracker?tab=saved"
      aria-label={`Saved and tracked jobs (${count})`}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer border",
        isTrackerActive
          ? "bg-primary text-black border-primary shadow-xs"
          : count > 0
          ? "bg-muted text-foreground border-border/80 hover:bg-muted/80 shadow-2xs hover:border-foreground/30"
          : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent hover:border-border/60"
      )}
      title={
        count > 0
          ? `${count} saved ${count === 1 ? "job" : "jobs"} - Click to view in tracker`
          : "Saved & Tracked Jobs"
      }
    >
      <Bookmark
        className={cn(
          "h-4 w-4 transition-all",
          isTrackerActive
            ? "fill-black text-black"
            : count > 0
            ? "fill-foreground text-foreground"
            : "text-muted-foreground"
        )}
      />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-black shadow-xs ring-2 ring-background animate-in zoom-in-50 duration-200">
          {count}
        </span>
      )}
    </Link>
  );
}
