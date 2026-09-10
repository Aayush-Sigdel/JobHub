"use client";

import Link from "next/link";
import { IconArrowRight, IconExternalLink } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import { candidateMatchLabel } from "./candidate-review-utils";

export default function CandidateCard({
  candidate,
  onSelect,
}: {
  candidate: CandidateDashboardResponse;
  onSelect?: (candidate: CandidateDashboardResponse) => void;
}) {
  const submissions = [
    candidate.designSubmission,
    candidate.programmingSubmission,
    candidate.sqlSubmission,
  ].filter(Boolean);
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/25">
      <button
        type="button"
        onClick={() => onSelect?.(candidate)}
        className="block w-full p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
      >
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0 rounded-lg">
            <AvatarImage src={candidate.imageUrl} alt="" />
            <AvatarFallback className="rounded-lg text-xs">
              {candidate.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold">{candidate.name}</h4>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {candidate.title || "Applicant"}
            </p>
          </div>
        </div>
        {candidate.jobTitle && (
          <p className="mt-3 truncate text-xs text-muted-foreground">
            {candidate.jobTitle}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Match</span>
          <span className="text-sm font-semibold tabular-nums">
            {candidateMatchLabel(candidate)}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {submissions.length
            ? `${submissions.length} assessment${submissions.length === 1 ? "" : "s"} submitted`
            : "No assessment submissions"}
        </p>
        <span className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs font-medium">
          Review application
          <IconArrowRight className="size-3.5" />
        </span>
      </button>
      <Link
        href={`/preview/${encodeURIComponent(candidate.candidateId)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-4 mb-3 inline-flex min-h-8 items-center gap-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-foreground"
      >
        Profile preview
        <IconExternalLink className="size-3" />
        <span className="sr-only"> (opens in a new tab)</span>
      </Link>
    </article>
  );
}
