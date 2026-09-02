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
} from "lucide-react";
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
  const userName = profile?.name || "Candidate";
  const userTitle = profile?.title || "Professional Developer";
  const userImage = profile?.imageUrl;
  const userLocation = profile?.location;
  const isVerified = profile?.isVerified ?? true;
  const skillsCount = profile?.skills?.length || 0;
  const applicationsCount = applications.length;

  // Calculate profile completeness score
  const calculateCompleteness = () => {
    let score = 20; // Base for account creation
    if (profile?.name && profile?.email) score += 10;
    if (profile?.title) score += 15;
    if (profile?.bio) score += 15;
    if (profile?.location) score += 10;
    if (profile?.imageUrl) score += 10;
    if (profile?.skills && profile.skills.length > 0) score += 10;
    if (profile?.experiences && profile.experiences.length > 0) score += 5;
    if (profile?.educations && profile.educations.length > 0) score += 5;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

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
        <div className="overflow-hidden border border-border bg-card rounded-2xl shadow-sm transition-all hover:shadow-md">
          {/* Header Banner */}
          <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/30 relative">
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-full bg-card p-1 shadow-sm border border-border">
              <Avatar className="h-18 w-18 ring-2 ring-background">
                <AvatarImage src={userImage} alt={userName} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Profile Details */}
          <div className="pt-11 pb-5 px-5 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Link
                href="/candidate-profile"
                className="font-bold text-[17px] hover:text-primary transition-colors text-foreground truncate max-w-[200px]"
              >
                {userName}
              </Link>
              {isVerified && (
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>

            <p className="text-[13px] text-muted-foreground font-medium mt-0.5 line-clamp-1">
              {userTitle}
            </p>

            {userLocation && (
              <p className="text-[12px] text-muted-foreground/80 mt-1.5 flex items-center justify-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                <span className="truncate">{userLocation}</span>
              </p>
            )}

            {/* Profile Stats Matrix */}
            <div className="mt-5 py-3.5 border-y border-border/70 grid grid-cols-3 divide-x divide-border/60">
              <div className="text-center px-1">
                <p className="text-base font-bold text-foreground">{applicationsCount}</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Applied</p>
              </div>
              <div className="text-center px-1">
                <p className="text-base font-bold text-primary">{skillsCount}</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Skills</p>
              </div>
              <div className="text-center px-1">
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {completeness}%
                </p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Profile</p>
              </div>
            </div>

            {/* Quick Profile Actions */}
            <div className="mt-4 flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold justify-between h-9 rounded-xl border-border/80 hover:bg-muted/80"
              >
                <Link href="/candidate-profile">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
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
                    <Bookmark className="h-3.5 w-3.5 text-tomato-500" />
                    My Applications & Tracker
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {applicationsCount}
                  </Badge>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Navigation / Discovery Card */}
        <div className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden p-3.5">
          <h3 className="font-bold text-[13px] uppercase tracking-wider text-muted-foreground mb-2 px-2.5">
            Discover & Explore
          </h3>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => onTabChange?.("recommended")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "recommended"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted/80"
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Recommended Matches
              </span>
              <span className="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">
                AI
              </span>
            </button>

            <Link
              href="/find-job"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Explore All Jobs
              </span>
            </Link>

            <button
              onClick={() => onTabChange?.("tasks")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === "tasks"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <span className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-500" />
                Assessment Challenges
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                Verified
              </span>
            </button>

            <button
              onClick={() => onTabChange?.("recent")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === "recent"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Recently Posted
              </span>
            </button>

            <button
              onClick={() => onTabChange?.("remote")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === "remote"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                Remote Opportunities
              </span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
