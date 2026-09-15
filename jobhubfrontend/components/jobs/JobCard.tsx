"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Bookmark, BookmarkCheck } from "lucide-react";
import JobMarkdown from "./JobMarkdown";
import { formatJobSalary, jobLabel } from "@/lib/job-display";
import { useLocalSavedJobs } from "@/lib/hooks/use-local-jobs";
import { useJobProfileMatch } from "@/lib/hooks/use-job-profile-match";
import type { JobPostResponse } from "@/types/api/jobs";

export function JobCard({
  job,
  isApplied = false,
}: {
  job: JobPostResponse;
  isApplied?: boolean;
}) {
  const { isSaved, toggleSaveJob } = useLocalSavedJobs();
  const saved = isSaved(job.id);
  const date =
    job.createdAt && !Number.isNaN(Date.parse(job.createdAt))
      ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
      : null;
  const hasAssessment =
    job.hasProgrammingTask || job.hasDesignTask || job.hasSqlTask;
  const { elementRef, match } = useJobProfileMatch(job.id);
  const metadata = [
    job.location,
    job.workplaceType && jobLabel(job.workplaceType),
    job.jobType && jobLabel(job.jobType),
  ].filter(Boolean);

  return (
    <article ref={elementRef} className="group border-b border-border/70 py-6 last:border-b-0">
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          aria-hidden="true"
          className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-sm font-semibold text-muted-foreground sm:flex"
        >
          {job.companyName?.slice(0, 2).toUpperCase() || "J"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold leading-snug sm:text-lg">
                <Link
                  href={`/find-job/${job.id}`}
                  className="hover:underline underline-offset-4"
                >
                  {job.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.companyName}
              </p>
            </div>
            <button
              type="button"
              aria-label={`${saved ? "Unsave" : "Save"} ${job.title}`}
              aria-pressed={saved}
              onClick={() =>
                toggleSaveJob({
                  jobId: job.id,
                  jobTitle: job.title,
                  companyName: job.companyName,
                  savedAt: new Date().toISOString(),
                  location: job.location,
                  salaryMin: job.salaryMin,
                  salaryMax: job.salaryMax,
                  salaryCurrency: job.salaryCurrency,
                  jobType: job.jobType,
                  workplaceType: job.workplaceType,
                })
              }
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-ring ${saved ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {saved ? (
                <BookmarkCheck className="size-4" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {metadata.join(" · ")}
          </p>
          {(job.salaryMin != null || job.salaryMax != null) && (
            <p className="mt-1 text-sm font-medium">
              {formatJobSalary(
                job.salaryMin,
                job.salaryMax,
                job.salaryCurrency,
              )}
            </p>
          )}
          <div className="mt-2 max-h-7 overflow-hidden" aria-label="Job description preview">
            <JobMarkdown compact>{job.description || ""}</JobMarkdown>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {isApplied ? (
                <span className="font-medium text-foreground">Applied</span>
              ) : (
                match !== null && (
                  <span className="font-medium text-foreground">
                    {match}% match
                  </span>
                )
              )}
              {hasAssessment && <span>Assessment required</span>}
              {date && <span>{date}</span>}
            </div>
            <Link
              href={`/find-job/${job.id}`}
              className="inline-flex min-h-8 items-center gap-1 text-sm font-medium hover:underline underline-offset-4"
            >
              View role <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
