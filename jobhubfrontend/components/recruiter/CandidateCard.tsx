"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconExternalLink,
  IconCheck,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import type { ApplicationStatus } from "@/types/api/jobs";
import {
  candidateMatchLabel,
  candidateStages,
  candidateSubmissions,
  reviewDate,
} from "./candidate-review-utils";
import CandidateHighlight from "./CandidateHighlight";

export default function CandidateCard({
  candidate,
  onSelect,
  onStageChange,
  isPending = false,
  showJobTitle = true,
  search = "",
}: {
  candidate: CandidateDashboardResponse;
  onSelect?: (candidate: CandidateDashboardResponse) => void;
  onStageChange?: (status: ApplicationStatus) => void;
  isPending?: boolean;
  showJobTitle?: boolean;
  search?: string;
}) {
  const submissions = candidateSubmissions(candidate);
  const passed = submissions.filter(({ data }) => data.passed).length;
  const candidateKey = candidate.applicationId || candidate.candidateId;
  const reviewLabel = `Review ${candidate.name}'s application`;
  return (
    <article className="rounded-md border border-border bg-background p-4 transition-colors hover:border-foreground/30 focus-within:border-foreground/40">
      <div className="flex items-start gap-3">
        <Avatar className="size-9 shrink-0 rounded-md">
          <AvatarImage src={candidate.imageUrl} alt="" />
          <AvatarFallback className="rounded-md text-xs">
            {candidate.name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold">
            <button
              type="button"
              aria-label={reviewLabel}
              data-candidate-review={candidateKey}
              data-review-action="name"
              onClick={() => onSelect?.(candidate)}
              className="min-h-9 break-words text-left underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground"
            >
              <CandidateHighlight text={candidate.name} query={search} />
            </button>
          </h4>
          <p className="mt-0.5 break-words text-xs leading-5 text-muted-foreground">
            <CandidateHighlight
              text={candidate.title || candidate.email || "Applicant"}
              query={search}
            />
          </p>
        </div>
      </div>
      {showJobTitle && candidate.jobTitle && (
        <p className="mt-2 break-words text-xs text-muted-foreground">
          {candidate.jobTitle}
        </p>
      )}
      {candidate.title &&
        search.trim() &&
        candidate.email
          ?.toLowerCase()
          .includes(search.trim().toLowerCase()) && (
          <p className="mt-2 break-all text-xs text-muted-foreground">
            <CandidateHighlight text={candidate.email} query={search} />
          </p>
        )}
      {search.trim() &&
        candidate.skills?.some((skill) =>
          skill.name.toLowerCase().includes(search.trim().toLowerCase()),
        ) && (
          <p className="mt-2 break-words text-xs text-muted-foreground">
            <CandidateHighlight
              text={candidate.skills
                .filter((skill) =>
                  skill.name
                    .toLowerCase()
                    .includes(search.trim().toLowerCase()),
                )
                .map((skill) => skill.name)
                .join(", ")}
              query={search}
            />
          </p>
        )}
      <dl className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Job match</dt>
          <dd className="bg-primary/15 px-2 py-1 text-sm font-semibold tabular-nums">
            {candidateMatchLabel(candidate)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Assessments</dt>
          <dd className="flex items-center gap-1 text-right font-medium">
            {submissions.length > 0 && passed === submissions.length && (
              <IconCheck
                aria-hidden="true"
                className="size-3.5 text-emerald-700 dark:text-emerald-400"
              />
            )}
            {submissions.length
              ? `${passed} of ${submissions.length} passed`
              : "No submissions"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Applied</dt>
          <dd className="text-right text-muted-foreground">
            {reviewDate(candidate.appliedAt)}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          aria-label={reviewLabel}
          data-candidate-review={candidateKey}
          data-review-action="review"
          onClick={() => onSelect?.(candidate)}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Review <IconArrowRight aria-hidden="true" className="size-4" />
        </button>
        <Link
          href={`/preview/${encodeURIComponent(candidate.candidateId)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Preview ${candidate.name}'s profile (opens in a new tab)`}
          title="Open public profile"
          className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <IconExternalLink aria-hidden="true" className="size-4" />
        </Link>
      </div>
      {onStageChange && (
        <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="shrink-0">Move to</span>
          <select
            aria-label={`Move ${candidate.name} to stage`}
            data-stage-action={candidateKey}
            disabled={isPending || !candidate.applicationId}
            value=""
            onChange={(event) => {
              if (event.target.value)
                onStageChange(event.target.value as ApplicationStatus);
            }}
            className="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:h-9"
          >
            <option value="" disabled>
              {isPending ? "Saving…" : "Choose stage"}
            </option>
            {candidateStages
              .filter((stage) => stage.id !== (candidate.status || "APPLIED"))
              .map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
          </select>
        </label>
      )}
    </article>
  );
}
