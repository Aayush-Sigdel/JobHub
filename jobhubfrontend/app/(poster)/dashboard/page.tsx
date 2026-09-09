import Link from "next/link";
import {
  IconArrowRight,
  IconBriefcase,
  IconUsers,
  IconClock,
  IconUserCheck,
  IconPlus,
  IconChevronRight,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchWithAuth } from "@/lib/service-api";
import type {
  CandidateDashboardResponse,
  RecruiterJobSummaryResponse,
} from "@/types/api/recruiter";

const isLive = (job: RecruiterJobSummaryResponse) =>
  job.isActive ?? job.active ?? false;
const readable = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
const jobUrl = (id: string) => `/manage-jobs?jobId=${encodeURIComponent(id)}`;

export default async function EmployerDashboardPage() {
  let jobs: RecruiterJobSummaryResponse[] = [];
  let loadError = false;
  try {
    jobs = await fetchWithAuth<RecruiterJobSummaryResponse[]>(
      "/recruiter/jobs",
      { cache: "no-store" },
    );
  } catch {
    loadError = true;
  }

  const recentJobs = [...jobs].sort(
    (a, b) =>
      (Date.parse(b.createdAt || "") || 0) -
      (Date.parse(a.createdAt || "") || 0),
  );
  const reviewJobs = [...jobs]
    .filter((job) => job.pendingReviewCount > 0)
    .sort((a, b) => b.pendingReviewCount - a.pendingReviewCount);
  const liveCount = jobs.filter(isLive).length;
  const applicantCount = jobs.reduce(
    (sum, job) => sum + (job.totalApplicants || 0),
    0,
  );
  const pendingCount = jobs.reduce(
    (sum, job) => sum + (job.pendingReviewCount || 0),
    0,
  );
  const shortlistedCount = jobs.reduce(
    (sum, job) => sum + (job.shortlistedCount || 0),
    0,
  );
  const assessedCount = jobs.filter(
    (job) => job.hasDesignTask || job.hasProgrammingTask || job.hasSqlTask,
  ).length;
  const sourceJobs = recentJobs.slice(0, 4);
  const responses = await Promise.allSettled(
    sourceJobs.map(async (job) => {
      const candidates = await fetchWithAuth<CandidateDashboardResponse[]>(
        `/recruiter/jobs/${encodeURIComponent(job.id)}/candidates?sortBy=date`,
        { cache: "no-store" },
      );
      return candidates.map((candidate) => ({
        ...candidate,
        jobId: job.id,
        jobTitle: job.title,
      }));
    }),
  );
  const applications = responses
    .flatMap((response) =>
      response.status === "fulfilled" ? response.value : [],
    )
    .sort(
      (a, b) =>
        (Date.parse(b.appliedAt || "") || 0) -
        (Date.parse(a.appliedAt || "") || 0),
    )
    .slice(0, 5);
  const applicationsError = responses.some(
    (response) => response.status === "rejected",
  );
  const metrics = [
    {
      label: "Live jobs",
      value: liveCount,
      detail: `${jobs.length} total listings`,
      icon: IconBriefcase,
    },
    {
      label: "Applications",
      value: applicantCount,
      detail: "Across all your jobs",
      icon: IconUsers,
    },
    {
      label: "Awaiting review",
      value: pendingCount,
      detail: `${reviewJobs.length} jobs need attention`,
      icon: IconClock,
    },
    {
      label: "Shortlisted",
      value: shortlistedCount,
      detail: "Across all your jobs",
      icon: IconUserCheck,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-1 py-5 sm:px-3 sm:py-7">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hiring dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Track your listings and keep applications moving.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-lg">
            <Link href="/post-task">
              <IconClipboardCheck className="size-4" />
              Assessments
            </Link>
          </Button>
          <Button asChild className="rounded-lg">
            <Link href="/manage-jobs">
              <IconPlus className="size-4" />
              New job
            </Link>
          </Button>
        </div>
      </header>

      {loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="font-medium">Your dashboard couldn’t be loaded.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try again to load your hiring data.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <a href="/dashboard">Try again</a>
          </Button>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {metrics.map(({ label, value, detail, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-card p-4 sm:p-5"
              >
                <dt className="flex items-center justify-between gap-2 text-xs text-muted-foreground sm:text-sm">
                  <span>{label}</span>
                  <Icon className="size-4 shrink-0" />
                </dt>
                <dd className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
                  {value}
                </dd>
                <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
              </div>
            ))}
          </dl>

          <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 space-y-5">
              <section
                className="overflow-hidden rounded-xl border border-border bg-card"
                aria-labelledby="jobs-heading"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                  <h2 id="jobs-heading" className="text-sm font-semibold">
                    Job listings
                  </h2>
                  <Link
                    href="/manage-jobs"
                    className="inline-flex items-center gap-1.5 rounded text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    View all
                    <IconArrowRight className="size-3.5" />
                  </Link>
                </div>
                {recentJobs.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-muted/35 text-xs text-muted-foreground">
                        <tr>
                          <th scope="col" className="px-5 py-3 font-medium">
                            Role
                          </th>
                          <th scope="col" className="px-3 py-3 font-medium">
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-right font-medium"
                          >
                            Applicants
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-right font-medium"
                          >
                            To review
                          </th>
                          <th scope="col" className="px-5 py-3">
                            <span className="sr-only">Review candidates</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {recentJobs.slice(0, 5).map((job) => (
                          <tr key={job.id} className="hover:bg-muted/20">
                            <td className="max-w-64 px-5 py-4">
                              <Link
                                href={jobUrl(job.id)}
                                className="block truncate rounded font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {job.title}
                              </Link>
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {job.location || readable(job.workplaceType)}
                              </p>
                            </td>
                            <td className="px-3 py-4">
                              <span
                                className={`rounded-md px-2 py-1 text-xs ${isLive(job) ? "bg-primary/15 text-foreground" : "bg-muted text-muted-foreground"}`}
                              >
                                {isLive(job) ? "Live" : "Closed"}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-right tabular-nums">
                              {job.totalApplicants || 0}
                            </td>
                            <td className="px-3 py-4 text-right tabular-nums">
                              {job.pendingReviewCount || 0}
                            </td>
                            <td className="px-5 py-4">
                              <Link
                                href={`${jobUrl(job.id)}&tab=candidates`}
                                className="rounded text-xs font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label={`Review candidates for ${job.title}`}
                              >
                                Review
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-5 py-10">
                    <h3 className="text-sm font-medium">No job listings yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create a job to start receiving applications.
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <Link href="/manage-jobs">
                        Create a job
                        <IconArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </section>

              <section
                className="rounded-xl border border-border bg-card"
                aria-labelledby="applications-heading"
              >
                <div className="border-b border-border px-5 py-4">
                  <h2
                    id="applications-heading"
                    className="text-sm font-semibold"
                  >
                    Recent applications
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sourceJobs.length
                      ? `From your ${sourceJobs.length} most recent job${sourceJobs.length === 1 ? "" : "s"}`
                      : "New applications will appear here"}
                  </p>
                </div>
                {applicationsError && (
                  <p
                    role="status"
                    className="px-5 pt-4 text-xs text-muted-foreground"
                  >
                    Some applications couldn’t be loaded. Open a job to try
                    again.
                  </p>
                )}
                {applications.length ? (
                  <div className="divide-y divide-border/60">
                    {applications.map((candidate) => (
                      <Link
                        key={`${candidate.jobId}-${candidate.applicationId || candidate.candidateId}`}
                        href={`${jobUrl(candidate.jobId)}&tab=candidates`}
                        className="flex items-center gap-3 px-5 py-4 outline-none hover:bg-muted/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      >
                        <Avatar className="size-9 rounded-lg">
                          <AvatarImage src={candidate.imageUrl} alt="" />
                          <AvatarFallback className="rounded-lg text-xs">
                            {candidate.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {candidate.name}
                          </span>
                          <span className="mt-1 block truncate text-xs text-muted-foreground">
                            {candidate.jobTitle}
                          </span>
                        </span>
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {readable(candidate.status || "APPLIED")}
                        </span>
                        <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="px-5 py-8 text-sm text-muted-foreground">
                    {applicationsError
                      ? "Application data is currently unavailable."
                      : "No applications yet. You’ll see candidates here as they apply."}
                  </p>
                )}
              </section>
            </div>

            <aside className="space-y-5">
              <section
                className="rounded-xl border border-border bg-card"
                aria-labelledby="review-heading"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <h2 id="review-heading" className="text-sm font-semibold">
                    Needs review
                  </h2>
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium tabular-nums">
                    {pendingCount}
                  </span>
                </div>
                {reviewJobs.length ? (
                  <div className="divide-y divide-border/60 px-5">
                    {reviewJobs.slice(0, 4).map((job) => (
                      <Link
                        key={job.id}
                        href={`${jobUrl(job.id)}&tab=candidates`}
                        className="flex items-center gap-3 rounded py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {job.title}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {job.pendingReviewCount} awaiting review
                          </span>
                        </span>
                        <IconArrowRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-6">
                    <IconUserCheck className="mb-3 size-5 text-muted-foreground" />
                    <p className="text-sm font-medium">You’re all caught up</p>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                      Jobs with applications waiting for review will appear
                      here.
                    </p>
                  </div>
                )}
              </section>
              <section
                className="rounded-xl border border-border bg-card p-5"
                aria-labelledby="overview-heading"
              >
                <h2 id="overview-heading" className="text-sm font-semibold">
                  Listings overview
                </h2>
                <dl className="mt-5 space-y-4 text-sm">
                  {[
                    ["Live", liveCount],
                    ["Closed", jobs.length - liveCount],
                    ["With assessments", assessedCount],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3"
                    >
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href="/post-task"
                  className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground hover:text-foreground"
                >
                  Manage assessments
                  <IconArrowRight className="size-3.5" />
                </Link>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
