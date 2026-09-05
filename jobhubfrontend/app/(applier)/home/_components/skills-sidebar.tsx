"use client";

import React from "react";
import Link from "next/link";
import { Zap, Plus, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserProfileResponse } from "@/types/api/user";

interface SkillsSidebarProps {
  profile: UserProfileResponse | null;
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

export function SkillsSidebar({ profile }: SkillsSidebarProps) {
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
        {/* Your Skills & Match Strength Card */}
        <div className="border border-border bg-card rounded-2xl shadow-sm p-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Zap className="h-4 w-4 fill-amber-500/20" />
              </div>
              <h3 className="font-bold text-[15px] text-foreground">
                Your Skills
              </h3>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-lg"
            >
              <Link href="/candidate-profile">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Link>
            </Button>
          </div>

          {userSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userSkills.map((skill) => (
                <div
                  key={skill.id || skill.name}
                  className="group inline-flex items-center gap-1.5 bg-muted/80 hover:bg-primary/10 hover:border-primary/30 border border-border text-foreground text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all"
                >
                  <span>{skill.name}</span>
                  {skill.level && (
                    <span className="text-[10px] font-bold text-primary/80 bg-background/80 px-1.5 py-0.2 rounded-md">
                      {formatLevel(skill.level)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 text-center">
              <Sparkles className="h-6 w-6 text-muted-foreground/60 mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground font-medium">
                No skills added yet. Add your skills to get high-accuracy AI recommendations.
              </p>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-2.5 h-7 text-xs font-bold rounded-lg"
              >
                <Link href="/candidate-profile">Add Skills</Link>
              </Button>
            </div>
          )}

          {/* Trending Tech Suggestions */}
          <div className="mt-5 pt-4 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-2.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>Trending in Job Market</span>
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
                    className="text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-border"
                  >
                    +{trendingSkill}
                  </Link>
                ))}
            </div>
          </div>
        </div>

        {/* Matching evidence checklist */}
        <div className="border border-border bg-card rounded-2xl shadow-sm p-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-foreground">
                  Matching data
                </h3>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {completedEvidenceItems} of {evidenceItemCount}
            </span>
          </div>

          {missingItems.length > 0 ? (
            <div className="mt-3.5 bg-muted/50 rounded-xl p-3 border border-border/50">
              <div className="flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">Next recommended step:</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    {missingItems[0]} to improve match accuracy.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs font-bold text-primary mt-2 flex items-center gap-1"
              >
                <Link href="/candidate-profile">
                  Complete Profile <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Your profile is fully optimized for top recruiters!</span>
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
