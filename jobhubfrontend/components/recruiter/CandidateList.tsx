"use client";

import { useMemo, useState } from "react";
import {
  IconArrowUpRight,
  IconCalendar,
  IconCheck,
  IconFileText,
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
        "inline-flex w-fit items-center rounded-md border px-2 py-1 text-[11px] font-medium",
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
}: {
  candidates: CandidateDashboardResponse[];
  onSelect: (candidate: CandidateDashboardResponse) => void;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pagination = useMemo(
    () => paginateCandidates(candidates, page, pageSize),
    [candidates, page, pageSize],
  );

  return (
    <div className="@container/candidate-list mt-5 overflow-hidden rounded-xl border border-border bg-background">
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
            <li key={candidate.applicationId || candidate.candidateId}>
              <button
                type="button"
                aria-label={`Review ${candidate.name}'s application`}
                onClick={() => onSelect(candidate)}
                className={cn(
                  "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-5 px-4 py-5 text-left outline-none transition-colors hover:bg-muted/25 focus-visible:bg-muted/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 @4xl/candidate-list:gap-5",
                  columns,
                )}
              >
                <span className="order-1 flex min-w-0 items-start gap-3">
                  <Avatar className="size-11 shrink-0 rounded-xl border border-border/60">
                    <AvatarImage src={candidate.imageUrl} alt="" />
                    <AvatarFallback className="rounded-xl bg-muted text-sm font-medium">
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
                    <span className="block truncate text-sm font-semibold">
                      {candidate.name}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {candidate.title || candidate.email || "Applicant"}
                    </span>
                    <span className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
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
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill.id}
                            className="max-w-full truncate rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span className="self-center text-[11px] text-muted-foreground">
                            +{skills.length - 3}
                          </span>
                        )}
                      </span>
                    )}
                    {candidate.coverNote?.trim() && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <IconFileText className="size-3" />
                        Cover letter included
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
                              "rounded border px-1.5 py-0.5 text-[10px]",
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
                      <span className="mt-1 block text-[11px] text-muted-foreground">
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
                  <span className="mt-0.5 text-[11px] text-muted-foreground @4xl/candidate-list:hidden">
                    job match
                  </span>
                  {match !== null && (
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1 w-14 overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        className="block h-full rounded-full bg-foreground/60"
                        style={{ width: `${match * 100}%` }}
                      />
                    </span>
                  )}
                </span>

                <span className="order-4 inline-flex items-center justify-center gap-1.5 self-end rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium transition-colors group-hover:border-foreground/20 group-hover:bg-muted group-focus-visible:bg-muted @4xl/candidate-list:order-5 @4xl/candidate-list:self-center">
                  Review
                  <IconArrowUpRight className="size-3.5" />
                </span>
              </button>
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
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
      />
    </div>
  );
}
