"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
  Users,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatSkillName } from "@/lib/utils";
import { useLocalSavedJobs } from "@/lib/hooks/use-local-jobs";
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
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<"all" | "remote" | "tasks" | "salary">("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { savedJobs, toggleSaveJob, isSaved } = useLocalSavedJobs();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Global keyboard shortcut to focus search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const checkScroll = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = tabsContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
        checkScroll();
      }
    };

    el.addEventListener("scroll", checkScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", checkScroll);

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(el);

    const timer = setTimeout(checkScroll, 150);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      el.removeEventListener("scroll", checkScroll);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  // Smooth scroll active tab into view when activeTab changes
  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const scrollAmount = 220;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const userSkills = useMemo(() => {
    return profile?.skills?.map((s) => formatSkillName(s.name)) || [];
  }, [profile]);

  const appliedJobIds = useMemo(() => {
    return new Set(applications.map((app) => app.jobPostId));
  }, [applications]);

  const firstName = profile?.name ? profile.name.split(" ")[0] : "there";

  const handleToggleBookmark = (jobId: string) => {
    const job =
      recommendedJobs.find((j) => j.id === jobId) ||
      recentJobs.find((j) => j.id === jobId);
    if (job) {
      toggleSaveJob({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        savedAt: new Date().toISOString(),
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        jobType: job.jobType,
        workplaceType: job.workplaceType,
      });
    }
  };

  // Determine current active jobs list based on active tab
  const baseJobs = useMemo(() => {
    switch (activeTab) {
      case "saved": {
        const allJobs = [
          ...recommendedJobs,
          ...recentJobs.filter((rj) => !recommendedJobs.some((j) => j.id === rj.id)),
        ];
        return allJobs.filter((j) => isSaved(j.id));
      }
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
  }, [activeTab, recommendedJobs, recentJobs, isSaved]);

  // Filter jobs by search input, selected skill tag, and quick filter
  const filteredJobs = useMemo(() => {
    let list = baseJobs;

    if (selectedSkill) {
      const s = selectedSkill.toLowerCase();
      list = list.filter((job) => {
        const text = `${job.title} ${job.description} ${job.requirements || ""}`.toLowerCase();
        return text.includes(s);
      });
    }

    if (quickFilter === "remote") {
      list = list.filter((job) => job.workplaceType === "REMOTE");
    } else if (quickFilter === "tasks") {
      list = list.filter((job) => job.hasProgrammingTask || job.hasDesignTask || job.hasSqlTask);
    } else if (quickFilter === "salary") {
      list = list.filter((job) => (job.salaryMin && job.salaryMin > 0) || (job.salaryMax && job.salaryMax > 0));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((job) => {
        const text = `${job.title} ${job.companyName} ${job.description} ${job.requirements || ""} ${job.location || ""}`.toLowerCase();
        return text.includes(q);
      });
    }

    return list;
  }, [baseJobs, searchQuery, selectedSkill, quickFilter]);

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
    const collabCount = 4;
    const savedCount = savedJobs.length;
    return { recCount, taskCount, recentCount, remoteCount, collabCount, savedCount };
  }, [recommendedJobs, recentJobs]);

  return (
    <main className="flex-1 min-w-0 flex flex-col gap-6">
      {/* Personalized Welcome Banner & Discovery Hub */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
        {/* Top Row: Greeting & Clean Context */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
            {userSkills.length > 0
              ? "Recommended opportunities matched with your verified background and hiring preferences."
              : "Explore curated positions or add skills to personalize your job recommendations."}
          </p>

          {/* Interactive Matched Skills Chips */}
          {userSkills.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
              <span className="text-xs text-muted-foreground font-medium mr-0.5">Matched skills:</span>
              {userSkills.slice(0, 5).map((skill) => {
                const isSkillActive = selectedSkill?.toLowerCase() === skill.toLowerCase();
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSelectedSkill(isSkillActive ? null : skill)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSkillActive
                        ? "bg-primary text-black border border-primary font-bold shadow-xs"
                        : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                    }`}
                  >
                    <span>{skill}</span>
                    {isSkillActive && <X className="h-3 w-3 text-black" />}
                  </button>
                );
              })}
              {userSkills.length > 5 && (
                <span className="text-[11px] text-muted-foreground font-medium self-center">
                  +{userSkills.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Search & Filter bar inside feed */}
        <div className="mt-5 pt-5 border-t border-border/60 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feed by title, skill, company, or location..."
                className="pl-10 pr-14 sm:pr-16 h-10 rounded-xl bg-background border border-border text-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/70 font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60 select-none">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              )}
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-semibold shrink-0 gap-2 border-border text-foreground hover:bg-muted/80 hover:border-foreground/30 cursor-pointer"
            >
              <Link href="/find-job">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Advanced Filters</span>
              </Link>
            </Button>
          </div>

          {/* Quick Filter discovery toggles */}
          <div className="flex items-center flex-wrap justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-xs text-muted-foreground font-medium mr-1 shrink-0">Quick filter:</span>
              <button
                type="button"
                onClick={() => setQuickFilter("all")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  quickFilter === "all"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === "remote" ? "all" : "remote")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  quickFilter === "remote"
                    ? "bg-primary text-black font-bold border border-primary shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
                }`}
              >
                Remote Only
              </button>
              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === "tasks" ? "all" : "tasks")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  quickFilter === "tasks"
                    ? "bg-primary text-black font-bold border border-primary shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
                }`}
              >
                With Assessments
              </button>
              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === "salary" ? "all" : "salary")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  quickFilter === "salary"
                    ? "bg-primary text-black font-bold border border-primary shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
                }`}
              >
                Salary Disclosed
              </button>
            </div>

            {(searchQuery || selectedSkill || quickFilter !== "all") && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  Showing {filteredJobs.length} {filteredJobs.length === 1 ? "role" : "roles"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSkill(null);
                    setQuickFilter("all");
                  }}
                  className="text-xs text-foreground font-semibold underline underline-offset-4 hover:opacity-80 cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feed Navigation Tabs - Fully scrollable with mouse wheel, touch & arrow controls */}
      <div className="relative flex items-center justify-between gap-3 border-b border-border/60 pb-2">
        <div className="relative flex-1 min-w-0 flex items-center gap-1.5">
          {/* Scroll Left Chevron Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              className="shrink-0 h-7 w-7 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-foreground hover:bg-muted cursor-pointer transition-all"
              aria-label="Scroll tabs left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Scrollable Tabs List */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0 py-0.5 px-0.5 touch-pan-x select-none"
          >
            <button
              data-tab="recommended"
              onClick={() => onTabChange("recommended")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "recommended"
                  ? "bg-primary text-black shadow-xs border border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recommended</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === "recommended"
                    ? "bg-black text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {tabCounts.recCount}
              </span>
            </button>

            <button
              data-tab="collaboration"
              onClick={() => onTabChange("collaboration")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "collaboration"
                  ? "bg-primary text-black shadow-xs border border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Collaboration</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === "collaboration"
                    ? "bg-black text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {tabCounts.collabCount}
              </span>
            </button>

            <button
              data-tab="saved"
              onClick={() => onTabChange("saved")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "saved"
                  ? "bg-primary text-black shadow-xs border border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Saved</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === "saved"
                    ? "bg-black text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {tabCounts.savedCount}
              </span>
            </button>

            <button
              data-tab="tasks"
              onClick={() => onTabChange("tasks")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "tasks"
                  ? "bg-primary text-black shadow-xs border border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Assessments</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === "tasks"
                    ? "bg-black text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {tabCounts.taskCount}
              </span>
            </button>

            <button
              data-tab="recent"
              onClick={() => onTabChange("recent")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "recent"
                  ? "bg-primary text-black shadow-xs border border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Recently Posted</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === "recent"
                    ? "bg-black text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {tabCounts.recentCount}
              </span>
            </button>

            <button
              data-tab="remote"
              onClick={() => onTabChange("remote")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "remote"
                  ? "bg-primary text-black shadow-xs border border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Remote</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === "remote"
                    ? "bg-black text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {tabCounts.remoteCount}
              </span>
            </button>
          </div>

          {/* Scroll Right Chevron Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs("right")}
              className="shrink-0 h-7 w-7 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-foreground hover:bg-muted cursor-pointer transition-all"
              aria-label="Scroll tabs right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <span className="text-xs text-muted-foreground font-medium hidden xl:inline shrink-0">
          {activeTab === "collaboration" ? "4 active rooms" : `${filteredJobs.length} roles`}
        </span>
      </div>

      {/* Main Feed Content or Collaboration Hub */}
      {activeTab === "collaboration" ? (
        <div className="flex flex-col gap-4">
          {/* Collaboration Hub Header */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Candidate Peer Collaboration Hub
              </h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                Connect with fellow engineers for mock interviews, pair programming on real-world projects, or assemble teams for upcoming hackathons.
              </p>
            </div>
            <Button className="bg-primary text-black font-bold text-xs h-9 px-4 rounded-xl hover:bg-primary/90 shadow-xs shrink-0 cursor-pointer">
              + Host Collaboration Room
            </Button>
          </div>

          {/* Active Collaboration Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room 1 */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-foreground">
                      Mock Technical Interview
                    </span>
                    <h3 className="font-bold text-base text-foreground mt-2">
                      System Design & Frontend Architecture
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active Now
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Practice 45-minute simulated system design for high-traffic web applications with peer review and rubric scoring.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    Next.js
                  </span>
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    Web Performance
                  </span>
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    State Architecture
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Host: Sarah L. · 2/3 Slots Filled
                </span>
                <Button size="sm" className="bg-primary text-black font-bold text-xs h-8 px-3.5 rounded-xl hover:bg-primary/90 shadow-xs cursor-pointer">
                  Join Room
                </Button>
              </div>
            </div>

            {/* Room 2 */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-foreground">
                      Pair Coding Sprint
                    </span>
                    <h3 className="font-bold text-base text-foreground mt-2">
                      Algorithms & Data Structures Prep
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active Now
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Live pair coding session tackling LeetCode Medium/Hard problems on graphs, dynamic programming, and heaps.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    TypeScript
                  </span>
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    Python
                  </span>
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    Graphs & DP
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Host: David M. · 1 Slot Available
                </span>
                <Button size="sm" className="bg-primary text-black font-bold text-xs h-8 px-3.5 rounded-xl hover:bg-primary/90 shadow-xs cursor-pointer">
                  Join Room
                </Button>
              </div>
            </div>

            {/* Room 3 */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-foreground">
                      Hackathon Project Squad
                    </span>
                    <h3 className="font-bold text-base text-foreground mt-2">
                      AI Job Intelligence & Resume Screener
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                    Starting 6 PM
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Building an open-source evaluation dashboard for vector matching engines. Looking for 1 backend developer proficient in Python/FastAPI.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    FastAPI
                  </span>
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    PostgreSQL
                  </span>
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    Docker
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Host: Alex R. · 3/4 Members
                </span>
                <Button size="sm" className="bg-primary text-black font-bold text-xs h-8 px-3.5 rounded-xl hover:bg-primary/90 shadow-xs cursor-pointer">
                  Request to Join
                </Button>
              </div>
            </div>

            {/* Room 4 */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-foreground">
                      Peer Code Review
                    </span>
                    <h3 className="font-bold text-base text-foreground mt-2">
                      Full-Stack Portfolio & PR Review
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                    Open Queue
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Bring your pull request or portfolio project to get actionable feedback from peer engineers on architecture, security, and clean code.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    Code Review
                  </span>
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    Architecture
                  </span>
                  <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                    Testing
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Host: Elena K. · 2 Slots Open
                </span>
                <Button size="sm" className="bg-primary text-black font-bold text-xs h-8 px-3.5 rounded-xl hover:bg-primary/90 shadow-xs cursor-pointer">
                  Join Room
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Recommended Jobs List */
        <div className="flex flex-col gap-4">
          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                {activeTab === "saved" ? (
                  <Bookmark className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {activeTab === "saved" ? "No saved jobs yet" : "No matching roles found"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {activeTab === "saved"
                  ? "Click the bookmark icon on any job card to save roles you want to revisit and apply to later."
                  : searchQuery || selectedSkill || quickFilter !== "all"
                  ? "No jobs found matching your active search or filter selection. Try resetting filters to see more results."
                  : "Complete your profile or explore all available jobs in our marketplace."}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                {activeTab === "saved" ? (
                  <Button
                    onClick={() => onTabChange("recommended")}
                    className="rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary/90 cursor-pointer shadow-xs"
                  >
                    Browse Recommended Jobs
                  </Button>
                ) : (
                  <>
                    {(searchQuery || selectedSkill || quickFilter !== "all") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedSkill(null);
                          setQuickFilter("all");
                        }}
                        className="rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Reset All Filters
                      </Button>
                    )}
                    <Button asChild className="rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary/90">
                      <Link href="/find-job">Explore All Jobs</Link>
                    </Button>
                  </>
                )}
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
                  isBookmarked={isSaved(job.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
