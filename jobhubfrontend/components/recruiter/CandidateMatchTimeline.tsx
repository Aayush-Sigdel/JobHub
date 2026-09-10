"use client";

import { useQuery } from "@tanstack/react-query";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { getCandidateSnapshotsAction } from "@/lib/actions/recruiter";
import { getSimilaritySources } from "@/lib/semantic-match";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import { candidateMatchLabel } from "./candidate-review-utils";
import SnapshotReplay from "./SnapshotReplay";

export default function CandidateMatchTimeline({
  candidate,
  jobId,
}: {
  candidate: CandidateDashboardResponse;
  jobId?: string;
}) {
  const sources = getSimilaritySources(candidate);
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Inside the match</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow every source note and summary from this candidate’s saved
            snapshots.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">
            {candidateMatchLabel(candidate)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">overall match</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Match by source">
        {sources.map((source) => (
          <div
            key={source.key}
            className="rounded-lg border border-border px-3 py-2 text-xs"
          >
            <span className="text-muted-foreground">{source.label}</span>
            <span className="ml-3 font-semibold tabular-nums">
              {Math.round(source.value * 100)}%
            </span>
          </div>
        ))}
        {!sources.length && (
          <p className="text-sm text-muted-foreground">
            No source scores are available yet.
          </p>
        )}
      </div>
      {!jobId || jobId === "all" ? (
        <p className="text-sm text-muted-foreground">
          Open an application for a specific job to view its snapshots.
        </p>
      ) : query.isPending ? (
        <div
          role="status"
          className="space-y-4 rounded-xl border border-border p-5"
        >
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
        <div role="alert" className="rounded-xl border border-border p-5">
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
        <SnapshotReplay key={query.dataUpdatedAt} snapshots={query.data} />
      ) : (
        <p className="rounded-xl border border-border p-5 text-sm text-muted-foreground">
          No connected-profile snapshots are available for this candidate yet.
        </p>
      )}
    </div>
  );
}
