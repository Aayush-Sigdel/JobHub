"use client";

import { useMemo } from "react";
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconMapPin,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculateSupportedOverallSimilarity } from "@/lib/semantic-match";
import { paginateCandidates } from "@/lib/candidate-pagination";
import { cn } from "@/lib/utils";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import type { ApplicationStatus } from "@/types/api/jobs";
import {
  candidateStages,
  candidateSubmissions,
  reviewDate,
} from "./candidate-review-utils";
import CandidatePagination from "./CandidatePagination";
import CandidateHighlight from "./CandidateHighlight";

const stageStyles: Record<ApplicationStatus, string> = {
  APPLIED: "border-border bg-muted/50 text-muted-foreground",
  IN_REVIEW:
    "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-400",
  SHORTLISTED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  ACCEPTED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  REJECTED: "border-border bg-muted/50 text-muted-foreground",
};

const columns =
  "@4xl/candidate-list:grid-cols-[minmax(220px,2fr)_minmax(140px,1.1fr)_110px_80px_90px]";

function Stage({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-medium",
        stageStyles[status],
      )}
    >
      {candidateStages.find((stage) => stage.id === status)?.label || status}
    </span>
  );
}

export default function CandidateList({
  candidates,
  onSelect,
  search = "",
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  candidates: CandidateDashboardResponse[];
  search?: string;
  onSelect: (candidate: CandidateDashboardResponse) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const pagination = useMemo(
    () => paginateCandidates(candidates, page, pageSize),
    [candidates, page, pageSize],
  );

  return (
    <div className="@container/candidate-list mt-4 min-w-0 border-t border-border bg-background">
      <div
        aria-hidden="true"
        className={cn(
          "hidden items-center gap-5 border-b border-border bg-muted/35 px-5 py-3 text-xs font-medium text-muted-foreground @4xl/candidate-list:grid",
          columns,
        )}
      >
        <span>Candidate</span>
        <span>Assessments</span>
        <span>Stage</span>
        <span className="text-right">Job match</span>
        <span />
      </div>
      <ul
        aria-label="Candidate applications"
        className="divide-y divide-border/70"
      >
        {pagination.items.map((candidate) => {
          const match = calculateSupportedOverallSimilarity(candidate);
          const submissions = candidateSubmissions(candidate);
          const passed = submissions.filter(({ data }) => data.passed).length;
          const status = candidate.status || "APPLIED";
          const skills = candidate.skills ?? [];
          return (
            <li
              key={
                candidate.applicationId ||
                `${candidate.jobId}:${candidate.candidateId}`
              }
            >
              <div
                className={cn(
                  "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 px-3 py-4 text-left transition-colors hover:bg-muted/40 focus-within:bg-primary/10 sm:px-5 @4xl/candidate-list:gap-5",
                  columns,
                )}
              >
                <span className="order-1 flex min-w-0 items-start gap-3">
                  <Avatar className="size-10 shrink-0 rounded-md">
                    <AvatarImage src={candidate.imageUrl} alt="" />
                    <AvatarFallback className="rounded-md bg-muted text-sm font-medium">
                      {candidate.name
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((name) => name[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0">
                    <button
                      type="button"
                      data-candidate-review={
                        candidate.applicationId || candidate.candidateId
                      }
                      data-review-action="name"
                      aria-label={`Review ${candidate.name}'s application${candidate.jobTitle ? ` for ${candidate.jobTitle}` : ""}`}
                      onClick={() => onSelect(candidate)}
                      className="min-h-9 rounded text-left text-sm font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      <CandidateHighlight
                        text={candidate.name}
                        query={search}
                      />
                    </button>
                    <span className="mt-0.5 block break-words text-sm text-muted-foreground">
                      <CandidateHighlight
                        text={candidate.title || candidate.email || "Applicant"}
                        query={search}
                      />
                    </span>
                    {candidate.title &&
                      search.trim() &&
                      candidate.email
                        ?.toLowerCase()
                        .includes(search.trim().toLowerCase()) && (
                        <span className="mt-1 block break-all text-xs text-muted-foreground">
                          <CandidateHighlight
                            text={candidate.email}
                            query={search}
                          />
                        </span>
                      )}
                    <span className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                      {candidate.location && (
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <IconMapPin className="size-3 shrink-0" />
                          <span className="truncate">{candidate.location}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <IconCalendar className="size-3 shrink-0" />
                        {candidate.appliedAt
                          ? `Applied ${reviewDate(candidate.appliedAt)}`
                          : "Date unavailable"}
                      </span>
                    </span>
                    {skills.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {[...skills]
                          .sort((a, b) => {
                            const query = search.trim().toLowerCase();
                            return (
                              Number(
                                Boolean(query) &&
                                  b.name.toLowerCase().includes(query),
                              ) -
                              Number(
                                Boolean(query) &&
                                  a.name.toLowerCase().includes(query),
                              )
                            );
                          })
                          .slice(0, 3)
                          .map((skill) => (
                            <span
                              key={skill.id}
                              className="max-w-full truncate rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              <CandidateHighlight
                                text={skill.name}
                                query={search}
                              />
                            </span>
                          ))}
                        {skills.length > 3 && (
                          <span className="self-center text-xs text-muted-foreground">
                            +{skills.length - 3}
                          </span>
                        )}
                      </span>
                    )}
                    <span className="mt-2 block @4xl/candidate-list:hidden">
                      <Stage status={status} />
                    </span>
                  </span>
                </span>

                <span className="order-3 min-w-0 border-t border-border/60 pt-3 @4xl/candidate-list:order-2 @4xl/candidate-list:border-0 @4xl/candidate-list:pt-0">
                  {submissions.length ? (
                    <>
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium",
                          passed === submissions.length
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-foreground",
                        )}
                      >
                        {passed === submissions.length && (
                          <IconCheck className="size-3.5" />
                        )}
                        {passed} of {submissions.length} passed
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {submissions.map(({ label, data }) => (
                          <span
                            key={label}
                            title={`${label}: ${data.passed ? "passed" : "not passed"}`}
                            className={cn(
                              "rounded border px-1.5 py-0.5 text-xs",
                              data.passed
                                ? "border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                : "border-amber-500/20 text-amber-800 dark:text-amber-400",
                            )}
                          >
                            {label}
                            <span className="sr-only">
                              : {data.passed ? "passed" : "not passed"}
                            </span>
                          </span>
                        ))}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block text-xs text-muted-foreground">
                        No submissions
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Assessments
                      </span>
                    </>
                  )}
                </span>

                <span className="order-3 hidden @4xl/candidate-list:block">
                  <Stage status={status} />
                </span>

                <span className="order-2 flex flex-col items-end self-start @4xl/candidate-list:order-4 @4xl/candidate-list:self-center">
                  <span className="text-xl font-semibold tracking-tight tabular-nums">
                    {match === null ? "N/A" : `${Math.round(match * 100)}%`}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    job match
                  </span>
                  {match !== null && (
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1 w-14 overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${match * 100}%` }}
                      />
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  data-candidate-review={
                    candidate.applicationId || candidate.candidateId
                  }
                  data-review-action="review"
                  aria-label={`Review ${candidate.name}'s application${candidate.jobTitle ? ` for ${candidate.jobTitle}` : ""}`}
                  onClick={() => onSelect(candidate)}
                  className="order-4 inline-flex min-h-11 items-center justify-center gap-1.5 self-end rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground @4xl/candidate-list:order-5 @4xl/candidate-list:self-center"
                >
                  Review
                  <IconArrowRight aria-hidden="true" className="size-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <CandidatePagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        pageSize={pageSize}
        total={candidates.length}
        start={pagination.start}
        end={pagination.end}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
