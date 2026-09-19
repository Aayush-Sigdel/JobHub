"use client";

import { useQuery } from "@tanstack/react-query";
import { IconLoader2, IconChartBar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { getCandidateSnapshotsAction } from "@/lib/actions/recruiter";
import { getSimilaritySources } from "@/lib/semantic-match";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import { candidateMatchLabel } from "./candidate-review-utils";
import CandidateEvidenceReport from "./CandidateEvidenceReport";

export default function CandidateMatchTimeline({
  candidate,
  jobId,
}: {
  candidate: CandidateDashboardResponse;
  jobId?: string;
}) {
  const sources = getSimilaritySources(candidate).sort(
    (a, b) => b.value - a.value,
  );
  const query = useQuery({
    queryKey: [
      "recruiter",
      "candidate-snapshots",
      jobId,
      candidate.candidateId,
    ],
    queryFn: () => getCandidateSnapshotsAction(jobId!, candidate.candidateId),
    enabled: Boolean(jobId && jobId !== "all" && candidate.candidateId),
    staleTime: 60_000,
    retry: false,
  });
  return (
    <section
      className="overflow-hidden rounded-xl border border-border"
      aria-label="Candidate job match"
    >
      <header className="flex flex-wrap items-start justify-between gap-5 bg-muted/20 p-5 sm:p-6">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <IconChartBar className="size-4 text-muted-foreground" />
            Job match
          </h3>
          <p className="mt-1.5 break-words text-xs text-muted-foreground">
            {candidate.jobTitle || "Match to this role"}
          </p>
          {sources.length > 0 && (
            <div
              className="mt-4 flex flex-wrap gap-x-4 gap-y-2"
              aria-label="Match by source"
            >
              {sources.map((source) => (
                <div
                  key={source.key}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="text-muted-foreground">{source.label}</span>
                  <span className="font-semibold tabular-nums">
                    {Math.round(source.value * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">Overall match</p>
          <p
            className={`mt-1 font-semibold tracking-tight tabular-nums ${sources.length ? "text-4xl" : "text-lg"}`}
          >
            {candidateMatchLabel(candidate)}
          </p>
        </div>
      </header>
      {!jobId || jobId === "all" ? (
        <p className="p-5 text-sm text-muted-foreground">
          Open an application for a specific job to view its snapshots.
        </p>
      ) : query.isPending ? (
        <div role="status" className="space-y-4 border-t border-border p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconLoader2 className="size-4 motion-safe:animate-spin" />
            Loading candidate snapshots…
          </p>
          {["w-4/5", "w-3/5", "w-2/3"].map((width) => (
            <div
              key={width}
              className={`h-3 rounded bg-muted motion-safe:animate-pulse ${width}`}
            />
          ))}
        </div>
      ) : query.isError ? (
        <div role="alert" className="border-t border-border p-5">
          <p className="text-sm text-muted-foreground">
            The snapshots couldn’t be loaded. Your candidate details are still
            available.
          </p>
          <Button
            variant="outline"
            className="mt-3 rounded-lg"
            onClick={() => query.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : query.data?.length ? (
        <CandidateEvidenceReport
          snapshots={query.data}
          match={candidate}
          socialLinks={candidate.socialLinks}
        />
      ) : (
        <p className="border-t border-border p-5 text-sm text-muted-foreground">
          No connected-profile snapshots are available for this candidate yet.
        </p>
      )}
    </section>
  );
}
