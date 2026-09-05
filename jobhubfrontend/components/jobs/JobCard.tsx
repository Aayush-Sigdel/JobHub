"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Bookmark,
  BookmarkCheck,
  Target,
  Code,
  PenTool,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { stripHtml } from "@/lib/utils";
import { useLocalSavedJobs } from "@/lib/hooks/use-local-jobs";
import type { JobPostResponse } from "@/types/api/jobs";

interface JobCardProps {
  job: JobPostResponse;
}

const COMMON_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Go",
  "Golang",
  "Rust",
  "Java",
  "C++",
  "PostgreSQL",
  "SQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "GraphQL",
  "Tailwind",
  "Figma",
  "UI/UX",
  "CI/CD",
  "Git",
];

function extractSkills(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = new Set<string>();
  for (const skill of COMMON_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace("+", "\\+").toLowerCase()}\\b`, "i");
    if (pattern.test(lower)) {
      matched.add(skill === "Golang" ? "Go" : skill);
      if (matched.size >= 4) break;
    }
  }
  return Array.from(matched);
}

export function JobCard({ job }: JobCardProps) {
  const { isSaved, toggleSaveJob } = useLocalSavedJobs();
  const bookmarked = isSaved(job.id);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  const formatWorkplace = (type: string) => {
    switch (type) {
      case "REMOTE":
        return "Remote";
      case "HYBRID":
        return "Hybrid";
      case "ON_SITE":
        return "On-site";
      default:
        return type?.replace("_", " ") || "Full-time";
    }
  };

  const formatJobType = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Full-time";
      case "PART_TIME":
        return "Part-time";
      case "CONTRACT":
        return "Contract";
      case "INTERNSHIP":
        return "Internship";
      default:
        return type?.replace("_", " ") || "Full-time";
    }
  };

  const formatExpLevel = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "Junior";
      case "INTERMEDIATE":
        return "Mid-Level";
      case "EXPERT":
        return "Senior";
      default:
        return level || "Mid-Level";
    }
  };

  const combinedText = `${job.title} ${job.description} ${job.requirements || ""}`;
  const detectedSkills = extractSkills(combinedText).slice(0, 3);

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-foreground/20 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Header: Title, Company Name, Location & Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/find-job/${job.id}`}
              className="font-bold text-lg sm:text-[19px] leading-snug text-foreground hover:underline line-clamp-1 block"
            >
              {job.title}
            </Link>

            {/* Company & Location sub-row */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span className="font-semibold text-foreground/90 truncate max-w-[200px] sm:max-w-[260px]">
                {job.companyName}
              </span>
              {job.location && (
                <>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground truncate max-w-[180px]">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all cursor-pointer border shrink-0 ${
              bookmarked
                ? "bg-primary text-black border-primary shadow-xs"
                : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label={bookmarked ? "Remove bookmark" : "Save job"}
            title={bookmarked ? "Bookmarked (saved to tracker)" : "Bookmark job"}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4.5 w-4.5 text-black" />
            ) : (
              <Bookmark className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        {/* Clean Attributes Row: Match Score, Salary & Essential Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {job.matchPercentage && job.matchPercentage >= 40 && (
            <span className="inline-flex items-center gap-1.5 bg-primary text-black font-bold px-2.5 py-1 rounded-lg text-xs shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-black" />
              <span>{Math.round(job.matchPercentage)}% Match</span>
            </span>
          )}

          {job.salaryMin && job.salaryMin > 0 && (
            <span className="inline-flex items-center gap-1 bg-muted/80 text-foreground font-bold px-3 py-1 rounded-lg border border-border text-xs sm:text-sm">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {job.salaryCurrency || "$"}
                {job.salaryMin.toLocaleString()}
                {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : "+"}
              </span>
            </span>
          )}

          <span className="inline-flex items-center gap-1 bg-muted/50 px-2.5 py-1 rounded-lg text-foreground border border-border/50 text-xs font-medium">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formatJobType(job.jobType)}</span>
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-muted/50 text-foreground border border-border/50 text-xs font-medium">
            {formatWorkplace(job.workplaceType)}
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-muted/50 text-foreground border border-border/50 text-xs font-medium">
            {formatExpLevel(job.experienceLevel)}
          </span>
        </div>

        {/* Description Snippet: Readable text-sm with comfortable line-height */}
        <p className="text-sm text-muted-foreground mt-3.5 line-clamp-2 leading-relaxed font-normal">
          {stripHtml(job.description)}
        </p>

        {/* Extracted Skills: Clean, limited to top 3, text-xs */}
        {detectedSkills.length > 0 && (
          <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
            {detectedSkills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium bg-muted/70 text-foreground px-2.5 py-0.5 rounded-md border border-border/70"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Row: Timestamp & Prominent CTA Button */}
      <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
            {job.createdAt
              ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
              : "Recently"}
          </span>

          {(job.hasDesignTask || job.hasProgrammingTask || job.hasSqlTask) && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-muted/60 text-foreground px-2.5 py-0.5 rounded-md border border-border/60">
              <Target className="h-3.5 w-3.5 text-foreground" />
              <span>Assessment</span>
              {job.hasProgrammingTask && <Code className="h-3 w-3 ml-0.5 text-muted-foreground" />}
              {job.hasDesignTask && <PenTool className="h-3 w-3 ml-0.5 text-muted-foreground" />}
              {job.hasSqlTask && <Database className="h-3 w-3 ml-0.5 text-muted-foreground" />}
            </span>
          )}
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 px-4 rounded-xl font-bold text-sm gap-1.5 bg-primary text-black hover:bg-primary/90 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Link href={`/find-job/${job.id}`}>
            <span>View Role</span>
            <ArrowRight className="h-4 w-4 text-black" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
