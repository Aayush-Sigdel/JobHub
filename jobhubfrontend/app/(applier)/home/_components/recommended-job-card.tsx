"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Code,
  PenTool,
  Database,
  Building2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { formatSkillName, stripHtml } from "@/lib/utils";
import { useLocalSavedJobs } from "@/lib/hooks/use-local-jobs";
import type { JobPostResponse } from "@/types/api/jobs";

interface RecommendedJobCardProps {
  job: JobPostResponse;
  userSkills?: string[];
  isApplied?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (jobId: string) => void;
}

export function RecommendedJobCard({
  job,
  userSkills = [],
  isApplied = false,
  isBookmarked: externalBookmarked,
  onToggleBookmark,
}: RecommendedJobCardProps) {
  const { isSaved, toggleSaveJob } = useLocalSavedJobs();
  const bookmarked =
    externalBookmarked !== undefined ? externalBookmarked : isSaved(job.id);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(job.id);
    } else {
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

  // Format Workplace Type
  const formatWorkplace = (type: string) => {
    switch (type) {
      case "REMOTE":
        return "Remote";
      case "HYBRID":
        return "Hybrid";
      case "ON_SITE":
        return "On-Site";
      default:
        return type?.replace("_", " ") || "Full-time";
    }
  };

  // Format Job Type
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

  // Format Experience Level
  const formatExpLevel = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "Junior / Entry";
      case "INTERMEDIATE":
        return "Mid-Level";
      case "EXPERT":
        return "Senior / Lead";
      default:
        return level || "Mid-Level";
    }
  };

  // Identify matching skills between user and job text/requirements
  const matchedSkills = userSkills
    .filter((skill) => {
      const text = `${job.title} ${job.description} ${job.requirements || ""}`.toLowerCase();
      return text.includes(skill.toLowerCase());
    })
    .map(formatSkillName);

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-foreground/20 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top Header Row - Title & Company on Left, Bookmark on Right */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={`/find-job/${job.id}`}
              className="font-bold text-[17px] sm:text-[18px] leading-snug text-foreground hover:underline line-clamp-1 block"
            >
              {job.title}
            </Link>
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground mt-1">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate font-semibold text-foreground/85">
                {job.companyName}
              </span>
            </div>
          </div>

          {/* Right Top: Bookmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleBookmarkClick}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                bookmarked
                  ? "bg-primary text-black border-primary shadow-xs"
                  : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              aria-label={bookmarked ? "Remove bookmark" : "Save job"}
              title={bookmarked ? "Bookmarked (saved to tracker)" : "Bookmark job"}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-black" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Job Tags Row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium text-muted-foreground">
          {job.location && (
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md text-foreground border border-border/50">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="truncate max-w-[130px]">{job.location}</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md text-foreground border border-border/50">
            <Briefcase className="h-3 w-3 text-muted-foreground" />
            <span>{formatJobType(job.jobType)}</span>
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/60 text-foreground font-medium border border-border/50">
            {formatWorkplace(job.workplaceType)}
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/60 text-foreground font-medium border border-border/50">
            {formatExpLevel(job.experienceLevel)}
          </span>

          {job.salaryMin && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-md border border-emerald-500/25">
              <DollarSign className="h-3 w-3" />
              <span>
                {job.salaryCurrency || "$"}
                {job.salaryMin.toLocaleString()}
                {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : "+"}
              </span>
            </span>
          )}
        </div>

        {/* Description Snippet */}
        <p className="text-[13px] text-muted-foreground mt-3.5 line-clamp-2 leading-relaxed">
          {stripHtml(job.description)}
        </p>

        {/* Matched Skills / Badges - Clean Neutral Pills without greenish tint */}
        {matchedSkills.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-border/50 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1">
              Matching skills:
            </span>
            {matchedSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-medium bg-muted text-foreground px-2.5 py-0.5 rounded-md border border-border/80"
              >
                {skill}
              </span>
            ))}
            {matchedSkills.length > 4 && (
              <span className="text-[10px] text-muted-foreground font-medium">
                +{matchedSkills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Assessment Badges */}
        {(job.hasProgrammingTask || job.hasDesignTask || job.hasSqlTask) && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="font-semibold text-muted-foreground">Assessments:</span>
            {job.hasProgrammingTask && (
              <span className="inline-flex items-center gap-1 bg-muted/60 text-foreground font-medium px-2 py-0.5 rounded-md border border-border/50">
                <Code className="h-3 w-3 text-muted-foreground" /> Coding
              </span>
            )}
            {job.hasDesignTask && (
              <span className="inline-flex items-center gap-1 bg-muted/60 text-foreground font-medium px-2 py-0.5 rounded-md border border-border/50">
                <PenTool className="h-3 w-3 text-muted-foreground" /> UI/Design
              </span>
            )}
            {job.hasSqlTask && (
              <span className="inline-flex items-center gap-1 bg-muted/60 text-foreground font-medium px-2 py-0.5 rounded-md border border-border/50">
                <Database className="h-3 w-3 text-muted-foreground" /> SQL
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {job.createdAt
              ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
              : "Recently"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isApplied ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25 shadow-xs">
              <CheckCircle className="h-3.5 w-3.5" /> Applied
            </span>
          ) : (
            <Button
              asChild
              size="sm"
              className="h-9 px-4 rounded-xl font-bold text-xs gap-1.5 bg-primary text-black hover:bg-primary/90 shadow-xs transition-all duration-200 cursor-pointer"
            >
              <Link href={`/find-job/${job.id}`}>
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5 text-black" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
