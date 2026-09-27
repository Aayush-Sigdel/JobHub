"use client";

import { useQuery } from "@tanstack/react-query";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { getCandidateSnapshotsAction } from "@/lib/actions/recruiter";
import {
  getSimilarityContributions,
  getSimilaritySources,
} from "@/lib/semantic-match";
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
  const contributions = getSimilarityContributions(candidate);
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
    <section className="min-w-0 space-y-8" aria-label="Candidate job match">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">Match to the role</h3>
          <p className="mt-2 break-words text-sm text-muted-foreground">
            {candidate.jobTitle || "Selected role"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Overall match</p>
          <p
            className={`mt-1 w-fit font-semibold tracking-tight tabular-nums ${sources.length ? "bg-primary px-2 py-1 text-4xl text-primary-foreground" : "text-lg"}`}
          >
            {candidateMatchLabel(candidate)}
          </p>
        </div>
      </header>
      {sources.length ? (
        <div className="space-y-3">
          <div
            role="region"
            aria-label="Match score breakdown"
            tabIndex={0}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[360px] text-left text-sm">
              <caption className="sr-only">
                Available sources and their contribution to the overall match
              </caption>
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th scope="col" className="pb-3 font-medium">
                    Source
                  </th>
                  <th scope="col" className="pb-3 text-right font-medium">
                    Match
                  </th>
                  <th scope="col" className="pb-3 pl-4 text-right font-medium">
                    Weight
                  </th>
                  <th scope="col" className="pb-3 pl-4 text-right font-medium">
                    Contribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => {
                  const contribution = contributions.find(
                    (item) => item.key === source.key,
                  )!;
                  return (
                    <tr key={source.key}>
                      <th scope="row" className="py-3 pr-4 font-medium">
                        {source.label}
                      </th>
                      <td className="py-3 text-right tabular-nums">
                        {Math.round(source.value * 100)}%
                      </td>
                      <td className="py-3 pl-4 text-right tabular-nums text-muted-foreground">
                        {(contribution.normalizedWeight * 100).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 1 },
                        )}
                        %
                      </td>
                      <td className="py-3 pl-4 text-right font-medium tabular-nums">
                        {contribution.points.toLocaleString(undefined, {
                          maximumFractionDigits: 1,
                        })}{" "}
                        pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="max-w-prose text-xs leading-5 text-muted-foreground">
            Overall match uses the scored sources listed here. Each contributes
            its match score × its weight. Weights adjust to total 100% when a
            source is missing. Contributions are rounded for display.
          </p>
        </div>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          No source scores are available for this application. Connected profile
          evidence, when available, is shown below.
        </p>
      )}
      {!jobId || jobId === "all" ? (
        <p className="text-sm text-muted-foreground">
          Open an application for a specific job to view its snapshots.
        </p>
      ) : query.isPending ? (
        <div role="status" className="space-y-4">
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
        <div role="alert" className="space-y-3">
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
        <p className="text-sm text-muted-foreground">
          No connected-profile snapshots are available for this candidate yet.
        </p>
      )}
    </section>
  );
}
