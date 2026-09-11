"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ArrowUpRight,
  BookmarkCheck,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RetryLoadButton } from "@/components/jobs/RetryLoadButton";
import {
  useLocalSavedJobs,
  useLocalInProgressJobs,
} from "@/lib/hooks/use-local-jobs";
import { formatJobDate, formatJobSalary, jobLabel } from "@/lib/job-display";
import {
  ApplicationCard,
  type JobApplicationResponse,
} from "./ApplicationCard";
import {
  applicationStages as stages,
  resolveTrackerTab,
  matchesTrackedRole,
  matchesApplicationStage,
  compareTrackedDates,
} from "@/lib/application-tracker-view";

interface JobTrackerTabsProps {
  applied: JobApplicationResponse[];
  inReview: JobApplicationResponse[];
  shortlisted: JobApplicationResponse[];
  accepted: JobApplicationResponse[];
  rejected: JobApplicationResponse[];
  loadError?: string;
  errorTitle?: string;
  signInRequired?: boolean;
}

export function JobTrackerTabs({
  applied,
  inReview,
  shortlisted,
  accepted,
  rejected,
  loadError,
  errorTitle = "Applications couldn’t be loaded",
  signInRequired = false,
}: JobTrackerTabsProps) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [previousTab, setPreviousTab] = useState(requestedTab);
  const [selection, setSelection] = useState(() =>
    resolveTrackerTab(requestedTab),
  );
  const [query, setQuery] = useState("");
  const [oldestFirst, setOldestFirst] = useState(false);
  const { savedJobs, toggleSaveJob } = useLocalSavedJobs();
  const { inProgressJobs, removeInProgressJob } = useLocalInProgressJobs();
  if (requestedTab !== previousTab) {
    setPreviousTab(requestedTab);
    setSelection(resolveTrackerTab(requestedTab));
  }

  const allApplications = [
    ...applied,
    ...inReview,
    ...shortlisted,
    ...accepted,
    ...rejected,
  ];
  const matches = (title: string, company: string) =>
    matchesTrackedRole(title, company, query);
  const byDate = (a: string, b: string) =>
    compareTrackedDates(a, b, oldestFirst);
  const applications = allApplications
    .filter(
      (app) =>
        matches(app.jobTitle, app.companyName) &&
        matchesApplicationStage(app.status, selection.stage),
    )
    .sort((a, b) => byDate(a.createdAt, b.createdAt));
  const saved = savedJobs
    .filter((job) => matches(job.jobTitle, job.companyName))
    .sort((a, b) => byDate(a.savedAt, b.savedAt));
  const drafts = inProgressJobs
    .filter((job) => matches(job.jobTitle, job.companyName))
    .sort((a, b) => byDate(a.updatedAt, b.updatedAt));
  const tabs = [
    {
      id: "applications",
      label: "Applications",
      count: loadError ? null : allApplications.length,
    },
    { id: "saved", label: "Saved", count: savedJobs.length },
    { id: "in-progress", label: "Drafts", count: inProgressJobs.length },
  ];

  function emptyState(title: string, description: string) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-base font-semibold">
          {query.trim() ? "No matching roles" : title}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {query.trim() ? "Try another title or company name." : description}
        </p>
        {query.trim() ? (
          <Button
            variant="outline"
            onClick={() => setQuery("")}
            className="mt-5 rounded-xl"
          >
            Clear search
          </Button>
        ) : selection.tab === "applications" && selection.stage !== "all" ? (
          <Button
            variant="outline"
            onClick={() => setSelection({ ...selection, stage: "all" })}
            className="mt-5 rounded-xl"
          >
            View all applications
          </Button>
        ) : (
          <Button asChild variant="outline" className="mt-5 rounded-xl">
            <Link href="/find-job">Find jobs</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Tabs
      value={selection.tab}
      onValueChange={(tab) => setSelection({ ...selection, tab })}
      className="gap-0"
    >
      <div className="overflow-x-auto border-b border-border pb-1">
        <TabsList
          variant="line"
          aria-label="Your job activity"
          className="h-11 gap-6 p-0"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-2 px-0 py-2 data-[state=active]:text-foreground data-[state=active]:after:opacity-100"
            >
              {tab.label}
              {tab.count !== null && (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 py-5">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
          <input
            aria-label="Search tracked roles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search roles or companies"
            className="h-10 w-full rounded-xl border border-border bg-transparent pl-9 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOldestFirst(!oldestFirst)}
          aria-label={`Sorted ${oldestFirst ? "oldest" : "newest"} first. Switch to ${oldestFirst ? "newest" : "oldest"} first`}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {oldestFirst ? (
            <ArrowUpWideNarrow className="size-3.5" />
          ) : (
            <ArrowDownWideNarrow className="size-3.5" />
          )}
          {oldestFirst ? "Oldest first" : "Newest first"}
        </button>
      </div>
      <TabsContent value="applications" className="mt-0">
        <div
          aria-label="Filter by application stage"
          className="mb-2 flex flex-wrap gap-x-1 gap-y-2"
        >
          {stages.map((stage) => (
            <button
              key={stage.id}
              type="button"
              aria-pressed={selection.stage === stage.id}
              onClick={() => setSelection({ ...selection, stage: stage.id })}
              className={`min-h-8 rounded-lg px-3 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring ${selection.stage === stage.id ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            >
              {stage.label}
            </button>
          ))}
        </div>
        {loadError ? (
          <div role="alert" className="py-8">
            <h2 className="font-semibold">{errorTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
            {signInRequired ? (
              <Button asChild className="mt-4 rounded-xl bg-primary text-black">
                <Link href="/sign-in?callbackUrl=%2Fjob-tracker">
                  Sign in again
                </Link>
              </Button>
            ) : (
              <RetryLoadButton />
            )}
          </div>
        ) : applications.length ? (
          <>
            <div className="hidden grid-cols-[minmax(0,1fr)_130px_130px] gap-6 border-b border-border pb-3 pt-4 text-xs text-muted-foreground sm:grid">
              <span>Role</span>
              <span>Status</span>
              <span className="text-right">Applied on</span>
            </div>
            <div>
              {applications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          </>
        ) : (
          emptyState(
            selection.stage === "all"
              ? "No applications yet"
              : "No applications at this stage",
            "Your submitted applications will appear here as you apply and hear back.",
          )
        )}
      </TabsContent>
      <TabsContent value="saved" className="mt-0">
        {saved.length
          ? saved.map((job) => (
              <article
                key={job.jobId}
                className="flex items-start justify-between gap-4 border-b border-border/70 py-5 last:border-b-0"
              >
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">
                    <Link
                      href={`/find-job/${job.jobId}`}
                      className="hover:underline underline-offset-4"
                    >
                      {job.jobTitle}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[
                      job.companyName,
                      job.location,
                      job.workplaceType && jobLabel(job.workplaceType),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {(job.salaryMin != null || job.salaryMax != null) && (
                    <p className="mt-2 text-sm">
                      {formatJobSalary(
                        job.salaryMin,
                        job.salaryMax,
                        job.salaryCurrency,
                      )}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Saved {formatJobDate(job.savedAt) || "recently"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/find-job/${job.jobId}`}
                    aria-label={`View ${job.jobTitle}`}
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                  >
                    <ArrowUpRight className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleSaveJob(job)}
                    aria-label={`Unsave ${job.jobTitle}`}
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                  >
                    <BookmarkCheck className="size-4" />
                  </button>
                </div>
              </article>
            ))
          : emptyState(
              "No saved jobs yet",
              "Bookmark a role while browsing to keep it here for later.",
            )}
      </TabsContent>
      <TabsContent value="in-progress" className="mt-0">
        {drafts.length
          ? drafts.map((job) => (
              <article
                key={job.jobId}
                className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 py-5 last:border-b-0"
              >
                <div className="min-w-0 flex-1 basis-48">
                  <h2 className="text-base font-semibold">
                    <Link
                      href={`/find-job/${job.jobId}`}
                      className="hover:underline underline-offset-4"
                    >
                      {job.jobTitle}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.companyName}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Last edited {formatJobDate(job.updatedAt) || "recently"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/find-job/${job.jobId}`}
                    className="inline-flex min-h-9 items-center gap-1 text-sm font-medium hover:underline underline-offset-4"
                  >
                    Continue <ArrowUpRight className="size-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeInProgressJob(job.jobId)}
                    aria-label={`Discard draft for ${job.jobTitle}`}
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))
          : emptyState(
              "No unfinished applications",
              "Applications you save before submitting will appear here.",
            )}
      </TabsContent>
    </Tabs>
  );
}
