"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Bookmark,
  Briefcase,
  TrendingUp,
  Building2,
  Code2,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useLocalSavedJobs } from "@/lib/hooks/use-local-jobs";
import type { UserProfileResponse } from "@/types/api/user";
import type { JobApplicationResponse } from "@/types/api/jobs";

interface UserProfileSidebarProps {
  profile: UserProfileResponse | null;
  applications: JobApplicationResponse[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function UserProfileSidebar({
  profile,
  applications,
  activeTab,
  onTabChange,
}: UserProfileSidebarProps) {
  const { savedJobs } = useLocalSavedJobs();
  const userName = profile?.name || "Candidate";
  const userTitle = profile?.title || "Professional Developer";
  const userImage = profile?.imageUrl;
  const userLocation = profile?.location;
  const isVerified = profile?.isVerified ?? true;
  const skillsCount = profile?.skills?.length || 0;
  const experienceCount = profile?.experiences?.length || 0;
  const applicationsCount = applications.length;

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-full lg:w-[280px] xl:w-[300px] shrink-0 flex flex-col gap-5">
      {/* Sticky container */}
      <div className="sticky top-20 flex flex-col gap-5">
        {/* User Mini Profile Card */}
        <div className="overflow-hidden border border-border bg-card rounded-2xl shadow-xs hover:border-primary/30 transition-all duration-300">
          {/* Header Banner */}
          <div className="h-16 bg-primary border-b border-black/10 relative">
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-card p-1 shadow-xs border border-border">
              <Avatar className="h-16 w-16 ring-2 ring-background">
                <AvatarImage src={userImage} alt={userName} className="object-cover" />
                <AvatarFallback className="bg-muted text-foreground font-bold text-base">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Profile Details */}
          <div className="pt-10 pb-5 px-5 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Link
                href="/candidate-profile"
                className="font-bold text-[16px] hover:underline transition-colors text-foreground truncate max-w-[200px]"
              >
                {userName}
              </Link>
              {isVerified && (
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-primary shrink-0" />
              )}
            </div>

            <p className="text-xs text-muted-foreground font-normal mt-0.5 line-clamp-1">
              {userTitle}
            </p>

            {userLocation && (
              <p className="text-[12px] text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground/70" />
                <span className="truncate">{userLocation}</span>
              </p>
            )}

            {/* Profile Stats Matrix */}
            <div className="mt-5 py-3 border-y border-border/60 grid grid-cols-3 divide-x divide-border/60 bg-muted/20 rounded-xl">
              <div className="text-center px-1">
                <p className="text-sm font-bold text-foreground">{applicationsCount}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Applied</p>
              </div>
              <div className="text-center px-1">
                <p className="text-sm font-bold text-foreground">{skillsCount}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Skills</p>
              </div>
              <div className="text-center px-1">
                <p className="text-sm font-bold text-foreground">{experienceCount}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Roles</p>
              </div>
            </div>

            {/* Quick Profile Actions */}
            <div className="mt-4 flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold justify-between h-9 rounded-xl border-border/80 hover:bg-muted text-foreground transition-all"
              >
                <Link href="/candidate-profile">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Edit Profile & Resume
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full text-xs font-semibold justify-between h-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <Link href="/job-tracker">
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                    My Applications & Tracker
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-black">
                    {applicationsCount}
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Navigation / Discovery Card */}
        <div className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden p-3.5 hover:border-primary/30 transition-all duration-300">
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground/80 mb-2 px-2.5">
            Discover & Explore
          </h3>
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => onTabChange?.("recommended")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "recommended"
                  ? "bg-primary text-black font-bold shadow-xs border border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Recommended Matches
              </span>
            </button>

            <button
              onClick={() => onTabChange?.("collaboration")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "collaboration"
                  ? "bg-primary text-black font-bold shadow-xs border border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Collaboration Hub
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "collaboration"
                    ? "bg-black text-white"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                Peer
              </span>
            </button>

            <button
              onClick={() => onTabChange?.("saved")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "saved"
                  ? "bg-primary text-black font-bold shadow-xs border border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <span className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved Jobs
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "saved"
                    ? "bg-black text-white"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                {savedJobs.length}
              </span>
            </button>

            <Link
              href="/find-job"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Explore All Jobs
              </span>
            </Link>

            <button
              onClick={() => onTabChange?.("tasks")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "tasks"
                  ? "bg-primary text-black font-bold shadow-xs border border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <span className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Assessment Challenges
              </span>
            </button>

            <button
              onClick={() => onTabChange?.("recent")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "recent"
                  ? "bg-primary text-black font-bold shadow-xs border border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recently Posted
              </span>
            </button>

            <button
              onClick={() => onTabChange?.("remote")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "remote"
                  ? "bg-primary text-black font-bold shadow-xs border border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Remote Opportunities
              </span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
