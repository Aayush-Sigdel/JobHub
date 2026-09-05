"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Search,
  Code2,
  TrendingUp,
  Building2,
  Briefcase,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecommendedJobCard } from "./recommended-job-card";
import { CompanySpotlight } from "./company-spotlight";
import type { JobPostResponse, JobApplicationResponse } from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";

interface PersonalizedFeedProps {
  profile: UserProfileResponse | null;
  recommendedJobs: JobPostResponse[];
  recentJobs: JobPostResponse[];
  applications: JobApplicationResponse[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PersonalizedFeed({
  profile,
  recommendedJobs,
  recentJobs,
  applications,
  activeTab,
  onTabChange,
}: PersonalizedFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const userSkills = useMemo(() => {
    return profile?.skills?.map((s) => s.name) || [];
  }, [profile]);

  const appliedJobIds = useMemo(() => {
    return new Set(applications.map((app) => app.jobPostId));
  }, [applications]);

  const firstName = profile?.name ? profile.name.split(" ")[0] : "there";

  const handleToggleBookmark = (jobId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  // Determine current active jobs list based on active tab
  const baseJobs = useMemo(() => {
    switch (activeTab) {
      case "tasks":
        return [
          ...recommendedJobs.filter((j) => j.hasProgrammingTask || j.hasDesignTask || j.hasSqlTask),
          ...recentJobs.filter(
            (j) =>
              (j.hasProgrammingTask || j.hasDesignTask || j.hasSqlTask) &&
              !recommendedJobs.some((rj) => rj.id === j.id)
          ),
        ];
      case "recent":
        return recentJobs.length > 0 ? recentJobs : recommendedJobs;
      case "remote":
        return [
          ...recommendedJobs.filter((j) => j.workplaceType === "REMOTE"),
          ...recentJobs.filter((j) => j.workplaceType === "REMOTE" && !recommendedJobs.some((rj) => rj.id === j.id)),
        ];
      case "recommended":
      default:
        return recommendedJobs.length > 0 ? recommendedJobs : recentJobs;
    }
  }, [activeTab, recommendedJobs, recentJobs]);

  // Filter jobs by search input
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return baseJobs;
    const q = searchQuery.toLowerCase().trim();
    return baseJobs.filter((job) => {
      return (
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        (job.location && job.location.toLowerCase().includes(q))
      );
    });
  }, [baseJobs, searchQuery]);

  const tabCounts = useMemo(() => {
    const recCount = recommendedJobs.length;
    const taskCount = [
      ...recommendedJobs.filter((j) => j.hasProgrammingTask || j.hasDesignTask || j.hasSqlTask),
      ...recentJobs.filter(
        (j) =>
          (j.hasProgrammingTask || j.hasDesignTask || j.hasSqlTask) &&
          !recommendedJobs.some((rj) => rj.id === j.id)
      ),
    ].length;
    const recentCount = recentJobs.length;
    const remoteCount = [
      ...recommendedJobs.filter((j) => j.workplaceType === "REMOTE"),
      ...recentJobs.filter((j) => j.workplaceType === "REMOTE" && !recommendedJobs.some((rj) => rj.id === j.id)),
    ].length;
    return { recCount, taskCount, recentCount, remoteCount };
  }, [recommendedJobs, recentJobs]);

  return (
    <main className="flex-1 min-w-0 flex flex-col gap-6">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-44 w-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Welcome back, {firstName} 👋
              </h1>
            </div>

            <p className="text-[14px] text-muted-foreground font-medium max-w-xl">
              {userSkills.length > 0 ? (
                <span>
                  We curated jobs matched with your expertise in{" "}
                  <strong className="text-foreground">
                    {userSkills.slice(0, 3).join(", ")}
                  </strong>
                  {userSkills.length > 3 ? ` and ${userSkills.length - 3} other skills.` : "."}
                </span>
              ) : (
                <span>
                  Explore open roles or complete your profile to unlock precision AI job recommendations.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Vector Match Engine Active</span>
            </div>
          </div>
        </div>

        {/* Quick Search & Filter bar inside feed */}
        <div className="mt-5 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed by title, skill, company or location..."
              className="pl-9 h-10 rounded-xl bg-muted/40 border-border text-sm"
            />
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-bold shrink-0 gap-2"
          >
            <Link href="/find-job">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Advanced Filters</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Feed Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-border/70">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange("recommended")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "recommended"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Recommended for You</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${
                activeTab === "recommended" ? "bg-background/20 text-background" : ""
              }`}
            >
              {tabCounts.recCount}
            </Badge>
          </button>

          <button
            onClick={() => onTabChange("tasks")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "tasks"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>With Assessments</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${
                activeTab === "tasks" ? "bg-background/20 text-background" : ""
              }`}
            >
              {tabCounts.taskCount}
            </Badge>
          </button>

          <button
            onClick={() => onTabChange("recent")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "recent"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            <span>Recently Posted</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${
                activeTab === "recent" ? "bg-background/20 text-background" : ""
              }`}
            >
              {tabCounts.recentCount}
            </Badge>
          </button>

          <button
            onClick={() => onTabChange("remote")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "remote"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-purple-500" />
            <span>Remote Only</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${
                activeTab === "remote" ? "bg-background/20 text-background" : ""
              }`}
            >
              {tabCounts.remoteCount}
            </Badge>
          </button>
        </div>

        <span className="text-xs font-medium text-muted-foreground hidden sm:block shrink-0">
          Showing {filteredJobs.length} {filteredJobs.length === 1 ? "role" : "roles"}
        </span>
      </div>

      {/* Recommended Jobs List */}
      <div className="flex flex-col gap-4">
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No matching roles found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No jobs found matching "${searchQuery}". Try clearing your search term.`
                : "Complete your profile or explore all available jobs in our marketplace."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl text-xs font-bold"
                >
                  Clear Search
                </Button>
              )}
              <Button asChild className="rounded-xl text-xs font-bold">
                <Link href="/find-job">Explore All Jobs</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => (
              <RecommendedJobCard
                key={job.id}
                job={job}
                userSkills={userSkills}
                isApplied={appliedJobIds.has(job.id)}
                isBookmarked={bookmarkedIds.has(job.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>
        )}
      </div>

      {/* Explore More Jobs CTA Button */}
      {filteredJobs.length > 0 && (
        <div className="pt-2 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto px-8 h-12 rounded-2xl font-bold text-sm border-border hover:bg-muted transition-all shadow-sm"
          >
            <Link href="/find-job" className="flex items-center gap-2">
              <span>Explore More Jobs in Market</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <div className="h-px w-full bg-border/60 my-2" />

      {/* Company Spotlight Section */}
      <CompanySpotlight />
    </main>
  );
}
