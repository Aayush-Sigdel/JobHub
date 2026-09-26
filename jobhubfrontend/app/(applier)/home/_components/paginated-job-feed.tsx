"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { paginateFeed } from "@/lib/feed-pagination";
import type { JobPostResponse } from "@/types/api/jobs";

export function PaginatedJobFeed({
  jobs,
  appliedIds,
}: {
  jobs: JobPostResponse[];
  appliedIds: Set<string>;
}) {
  const [page, setPage] = useState(1);
  const feedTop = useRef<HTMLDivElement>(null);
  const pagination = paginateFeed(jobs, page);

  // Removing the final saved job on a page should return to a populated page.
  if (page !== pagination.page) setPage(pagination.page);

  function changePage(nextPage: number) {
    setPage(nextPage);
    feedTop.current?.focus({ preventScroll: true });
    feedTop.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }

  return (
    <div>
      <div
        ref={feedTop}
        tabIndex={-1}
        className="scroll-mt-24 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
      >
        <p role="status" className="pt-4 text-xs tabular-nums text-muted-foreground">
          Showing {pagination.start + 1}–{pagination.end} of {jobs.length} jobs
        </p>
        {pagination.items.map((job) => (
          <JobCard key={job.id} job={job} isApplied={appliedIds.has(job.id)} />
        ))}
      </div>
      {pagination.pageCount > 1 && (
        <nav
          aria-label="Job feed pagination"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"
        >
          <p className="text-xs tabular-nums text-muted-foreground">
            Page {pagination.page} of {pagination.pageCount}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-lg"
              aria-label="Previous page of jobs"
              disabled={pagination.page === 1}
              onClick={() => changePage(pagination.page - 1)}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            {pagination.pages.map((number) => (
              <Button
                key={number}
                variant={number === pagination.page ? "default" : "ghost"}
                size="icon"
                className="size-9 rounded-lg tabular-nums"
                aria-label={`Go to page ${number}`}
                aria-current={number === pagination.page ? "page" : undefined}
                onClick={() => changePage(number)}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-lg"
              aria-label="Next page of jobs"
              disabled={pagination.page === pagination.pageCount}
              onClick={() => changePage(pagination.page + 1)}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
