"use client";

import React from "react";
import Link from "next/link";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconArrowRight,
  IconCircleCheck,
  IconAlertCircle,
  IconEye,
  IconShieldExclamation,
  IconBriefcase,
} from "@tabler/icons-react";
import { calculateSupportedOverallSimilarity, getSimilaritySources } from "@/lib/semantic-match";

interface CandidateCardProps {
  candidate: CandidateDashboardResponse;
  onSelect?: (candidate: CandidateDashboardResponse) => void;
}

function getMatchQualityLabel(similarity: number | null) {
  if (similarity === null) return { label: "Pending", color: "text-muted-foreground" };
  if (similarity >= 0.8) return { label: "Strong Match", color: "text-emerald-700 dark:text-emerald-400" };
  if (similarity >= 0.6) return { label: "Good Match", color: "text-blue-700 dark:text-blue-400" };
  if (similarity >= 0.4) return { label: "Partial Match", color: "text-amber-700 dark:text-amber-400" };
  return { label: "Low Match", color: "text-muted-foreground" };
}

export default function CandidateCard({
  candidate,
  onSelect,
}: CandidateCardProps) {
  const evidenceSources = getSimilaritySources(candidate);
  const overallSimilarity = calculateSupportedOverallSimilarity(candidate);
  const matchQuality = getMatchQualityLabel(overallSimilarity);

  return (
    <Card
      className="bg-card border border-border shadow-xs hover:border-foreground/30 hover:shadow-sm transition-all rounded-2xl cursor-pointer"
      onClick={() => onSelect?.(candidate)}
    >
      <CardContent className="space-y-4 p-5">
        {/* Top Header: Identity & Similarity Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3.5 min-w-0">
            <Avatar className="h-12 w-12 rounded-xl border border-border shrink-0">
              <AvatarImage src={candidate.imageUrl} className="object-cover" />
              <AvatarFallback className="bg-foreground text-background font-bold text-sm">
                {candidate.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h4 className="font-bold text-base text-foreground leading-tight truncate">
                {candidate.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {candidate.title || "Applicant"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 text-right">
            <span className="font-mono text-xl font-bold tabular-nums text-foreground">
              {overallSimilarity?.toFixed(3) ?? "N/A"}
            </span>
            <span className={`text-xs font-semibold ${matchQuality.color}`}>
              {matchQuality.label}
            </span>
          </div>
        </div>

        {/* Job Listing Tag */}
        {candidate.jobTitle && (
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border truncate">
            <IconBriefcase className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{candidate.jobTitle}</span>
          </div>
        )}

        {/* Skills preview if available */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {candidate.skills.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="text-xs px-2.5 py-0.5 rounded-md bg-secondary text-foreground font-medium border border-border"
              >
                {s.name}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="text-xs px-1.5 py-0.5 text-muted-foreground font-mono">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Assessments & Flags Strip */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {candidate.allTasksPassed ? (
            <Badge
              variant="outline"
              className="bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800 text-xs font-medium px-2.5 py-0.5 gap-1"
            >
              <IconCircleCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Passed All Tasks</span>
            </Badge>
          ) : candidate.designSubmission ||
            candidate.programmingSubmission ||
            candidate.sqlSubmission ? (
            <Badge
              variant="outline"
              className="bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800 text-xs font-medium px-2.5 py-0.5 gap-1"
            >
              <IconAlertCircle className="size-3.5 text-amber-700 dark:text-amber-400" />
              <span>Tasks In Review</span>
            </Badge>
          ) : null}

          {candidate.tabSwitchLimitExceeded && (
            <Badge
              variant="outline"
              className="bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800 text-xs font-medium px-2.5 py-0.5 gap-1"
            >
              <IconShieldExclamation className="size-3.5 text-rose-700 dark:text-rose-400" />
              <span>Tab Limit Flagged</span>
            </Badge>
          )}

          {evidenceSources.length > 0 && (
            <span className="text-xs text-muted-foreground ml-auto self-center font-mono">
              {evidenceSources.length}/5 sources
            </span>
          )}
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
          {candidate.candidateId && (
            <Link
              href={`/preview/${candidate.candidateId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 font-semibold text-xs text-muted-foreground hover:text-foreground transition-colors hover:underline"
              title="Preview candidate profile in new tab"
            >
              <IconEye className="size-3.5" />
              <span>Preview</span>
            </Link>
          )}

          <span className="inline-flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors ml-auto shadow-2xs">
            <span>Review</span>
            <IconArrowRight className="size-3.5 text-black stroke-[2.5]" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
