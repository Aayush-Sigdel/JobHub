"use client";

import React from "react";
import Link from "next/link";
import { Zap, Plus, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatSkillName } from "@/lib/utils";
import type { UserProfileResponse } from "@/types/api/user";

interface SkillsSidebarProps {
  profile: UserProfileResponse | null;
  onTabChange?: (tab: string) => void;
}

const TRENDING_IN_DEMAND_SKILLS = [
  "React",
  "TypeScript",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Python",
  "Go",
  "GraphQL",
  "AWS",
  "Redis",
];

export function SkillsSidebar({ profile, onTabChange }: SkillsSidebarProps) {
  const userSkills = profile?.skills || [];

  // Identify missing professional evidence without inventing a percentage score.
  const missingItems: string[] = [];
  if (!profile?.title) {
    missingItems.push("Add professional title");
  }

  if (!profile?.bio) {
    missingItems.push("Write a short bio");
  }

  if (!profile?.location) {
    missingItems.push("Set your location");
  }

  if (!profile?.imageUrl) {
    missingItems.push("Upload profile avatar");
  }

  if (userSkills.length === 0) {
    missingItems.push("Add at least 3 skills");
  }

  if (!profile?.experiences?.length) {
    missingItems.push("Add work experience");
  }

  if (!profile?.educations?.length) {
    missingItems.push("Add education");
  }
  const evidenceItemCount = 7;
  const completedEvidenceItems = evidenceItemCount - missingItems.length;

  const formatLevel = (lvl: string) => {
    switch (lvl?.toUpperCase()) {
      case "EXPERT":
        return "Expert";
      case "INTERMEDIATE":
        return "Mid";
      case "BEGINNER":
        return "Beginner";
      default:
        return lvl || "Proficient";
    }
  };

  return (
    <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0 flex flex-col gap-5">
      {/* Sticky container */}
      <div className="sticky top-20 flex flex-col gap-5">
        {/* Your Skills Card */}
        <div className="border border-border bg-card rounded-2xl shadow-xs p-5 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-foreground">
              Your Skills
            </h3>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs font-bold text-black bg-primary hover:bg-primary/90 gap-1 rounded-full shadow-xs cursor-pointer"
            >
              <Link href="/candidate-profile">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Link>
            </Button>
          </div>

          {userSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {userSkills.map((skill) => (
                <div
                  key={skill.id || skill.name}
                  className="inline-flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium px-3 py-1 rounded-full border border-border transition-colors"
                >
                  <span>{formatSkillName(skill.name)}</span>
                  {skill.level && (
                    <span className="text-[10px] bg-background text-muted-foreground px-1.5 py-0.2 rounded-full font-medium border border-border/60">
                      {formatLevel(skill.level)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 p-4 text-center">
              <p className="text-xs text-muted-foreground font-normal">
                No skills added yet. Add your skills to receive tailored recommendations.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-3 h-7 text-xs font-bold rounded-full bg-primary text-black hover:bg-primary/90 shadow-xs"
              >
                <Link href="/candidate-profile">Add Skills</Link>
              </Button>
            </div>
          )}

          {/* Trending Tech Suggestions */}
          <div className="mt-5 pt-4 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-2.5">
              <TrendingUp className="h-3.5 w-3.5 text-foreground" />
              <span>Trending in market</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TRENDING_IN_DEMAND_SKILLS.filter(
                (ts) => !userSkills.some((us) => us.name.toLowerCase() === ts.toLowerCase())
              )
                .slice(0, 8)
                .map((trendingSkill) => (
                  <Link
                    key={trendingSkill}
                    href={`/find-job?query=${encodeURIComponent(trendingSkill)}`}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted border border-border/60 px-2.5 py-0.5 rounded-full transition-all"
                  >
                    +{trendingSkill}
                  </Link>
                ))}
            </div>
          </div>
        </div>

        {/* Candidate Peer Collaboration Spotlight */}
        <div className="border border-border bg-card rounded-2xl shadow-xs p-5 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-foreground">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground">
              Peer Collaboration
            </h3>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Practice mock interviews, pair-code challenges, or build open projects with other candidates.
          </p>

          <div className="mt-3.5">
            {onTabChange ? (
              <Button
                onClick={() => onTabChange("collaboration")}
                className="w-full h-8 text-xs font-bold bg-primary text-black hover:bg-primary/90 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                Open Collaboration Hub
              </Button>
            ) : (
              <Button
                asChild
                className="w-full h-8 text-xs font-bold bg-primary text-black hover:bg-primary/90 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Link href="/home?tab=collaboration" className="flex items-center justify-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Open Collaboration Hub
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Matching evidence checklist with SastoTech progress bar */}
        <div className="border border-border bg-card rounded-2xl shadow-xs p-5 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-foreground">
              Profile Completeness
            </h3>
            <span className="text-xs font-bold text-foreground">
              {completedEvidenceItems} of {evidenceItemCount}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.round((completedEvidenceItems / evidenceItemCount) * 100)}%` }}
            />
          </div>

          {missingItems.length > 0 ? (
            <div className="bg-muted/40 rounded-xl p-3 border border-border/60">
              <div className="flex items-start gap-2 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">Next recommended step:</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    {missingItems[0]} to improve recommendations.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs font-bold text-foreground hover:underline mt-2 flex items-center gap-1"
              >
                <Link href="/candidate-profile">
                  Complete Profile <ArrowUpRight className="h-3.5 w-3.5 text-foreground" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Your profile has all recommended details.</span>
            </div>
          )}
        </div>

        {/* Career Tips & Footer Navigation */}
        <div className="px-2 text-center text-xs text-muted-foreground space-y-2">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-medium">
            <Link href="/about" className="hover:text-foreground hover:underline transition-colors">
              About
            </Link>
            <Link href="/help" className="hover:text-foreground hover:underline transition-colors">
              Help Center
            </Link>
            <Link href="/privacy-policy" className="hover:text-foreground hover:underline transition-colors">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground hover:underline transition-colors">
              Terms
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground/70">
            JobHub Platform © 2026. All rights reserved.
          </p>
        </div>
      </div>
    </aside>
  );
}
