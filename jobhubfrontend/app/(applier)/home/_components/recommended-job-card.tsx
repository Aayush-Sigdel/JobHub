"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  isBookmarked: initialBookmarked = false,
  onToggleBookmark,
}: RecommendedJobCardProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
    onToggleBookmark?.(job.id);
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
  const matchedSkills = userSkills.filter((skill) => {
    const text = `${job.title} ${job.description} ${job.requirements || ""}`.toLowerCase();
    return text.includes(skill.toLowerCase());
  });

  const getCompanyInitials = (name: string) => {
    if (!name) return "CO";
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="group relative rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Company Avatar */}
            <div className="rounded-xl border border-border/60 bg-muted/40 p-1 shrink-0">
              <Avatar className="h-11 w-11 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {getCompanyInitials(job.companyName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Title and Company */}
            <div className="min-w-0">
              <Link
                href={`/find-job/${job.id}`}
                className="font-bold text-[17px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1 block"
              >
                {job.title}
              </Link>
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground mt-0.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{job.companyName}</span>
              </div>
            </div>
          </div>

          {/* Right Top: Bookmark */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmarkClick}
              className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg transition-colors"
              aria-label={bookmarked ? "Remove bookmark" : "Save job"}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary fill-primary/20" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Job Tags Row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium text-muted-foreground">
          {job.location && (
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md text-foreground/80">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="truncate max-w-[130px]">{job.location}</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md text-foreground/80">
            <Briefcase className="h-3 w-3 text-muted-foreground" />
            <span>{formatJobType(job.jobType)}</span>
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground font-semibold">
            {formatWorkplace(job.workplaceType)}
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
            {formatExpLevel(job.experienceLevel)}
          </span>

          {job.salaryMin && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-md">
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
          {job.description}
        </p>

        {/* Matched Skills / Badges */}
        {matchedSkills.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-border/50 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mr-1">
              <Zap className="h-3 w-3 text-amber-500 fill-amber-500/20" /> Matching Skills:
            </span>
            {matchedSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <span>✓</span> {skill}
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
            <span className="font-semibold text-muted-foreground">Includes Assessments:</span>
            {job.hasProgrammingTask && (
              <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium px-2 py-0.5 rounded">
                <Code className="h-3 w-3" /> Coding
              </span>
            )}
            {job.hasDesignTask && (
              <span className="inline-flex items-center gap-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-medium px-2 py-0.5 rounded">
                <PenTool className="h-3 w-3" /> UI/Design
              </span>
            )}
            {job.hasSqlTask && (
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium px-2 py-0.5 rounded">
                <Database className="h-3 w-3" /> SQL
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
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle className="h-3.5 w-3.5" /> Applied
            </span>
          ) : (
            <Button
              asChild
              size="sm"
              className="h-8 px-3.5 rounded-xl font-bold text-xs gap-1 shadow-sm"
            >
              <Link href={`/find-job/${job.id}`}>
                View Details
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
