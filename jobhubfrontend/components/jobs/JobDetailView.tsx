"use client";

import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconCode,
  IconDatabase,
  IconMapPin,
  IconPalette,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { LinkedInEasyApplyModal } from "@/components/jobs/LinkedInEasyApplyModal";
import { getJobApplicationAvailability } from "@/lib/job-application-availability";
import { Button } from "@/components/ui/button";
import JobMarkdown from "./JobMarkdown";
import type { JobPostDetailResponse } from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";
import {
  calculateSupportedOverallSimilarity,
  getSimilarityContributions,
  getSimilaritySources,
} from "@/lib/semantic-match";
import { formatJobDate, formatJobSalary, jobLabel } from "@/lib/job-display";

interface JobDetailViewProps {
  detail: JobPostDetailResponse;
  profile: UserProfileResponse | null;
}

export function JobDetailView({ detail, profile }: JobDetailViewProps) {
  const { job } = detail;
  const availability = getJobApplicationAvailability(job);
  const sources = getSimilaritySources(detail);
  const contributions = getSimilarityContributions(detail);
  const overall =
    typeof detail.matchPercentage === "number" && Number.isFinite(detail.matchPercentage)
      ? detail.matchPercentage / 100
      : calculateSupportedOverallSimilarity(detail);
  const posted = formatJobDate(job.createdAt);
  const deadline = formatJobDate(job.deadline);
  const assessments = [
    {
      required: job.hasDesignTask,
      label: "CSS & design",
      icon: IconPalette,
      task: detail.designTask,
    },
    {
      required: job.hasProgrammingTask,
      label: "Programming",
      icon: IconCode,
      task: detail.programmingTask,
    },
    {
      required: job.hasSqlTask,
      label: "SQL",
      icon: IconDatabase,
      task: detail.sqlTask,
    },
  ].filter(({ required }) => required);
  const requirements = job.requirements?.trim();
  const applicantCount = Number.isFinite(detail.applicantCount)
    ? Math.max(0, detail.applicantCount)
    : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-3 sm:py-6">
      <Link
        href="/find-job"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft className="size-4" /> All jobs
      </Link>

      <header className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
                <IconBuilding className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">
                  {job.companyName}
                </p>
                {posted && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Posted {posted}
                  </p>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
              {detail.hasApplied ? (
                <>
                  <IconCheck className="size-3.5" /> Applied
                </>
              ) : availability.canApply ? (
                <>
                  <span className="size-1.5 rounded-full bg-foreground" />{" "}
                  Accepting applications
                </>
              ) : (
                "Applications closed"
              )}
            </span>
          </div>
          <h1 className="max-w-3xl break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <IconMapPin className="size-4 shrink-0" />
              {job.location || "Location not specified"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconBriefcase className="size-4 shrink-0" />
              {jobLabel(job.jobType)}
            </span>
            <span>{jobLabel(job.workplaceType)}</span>
          </div>
        </div>
        <dl className="grid divide-y divide-border border-t border-border bg-muted/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Experience", jobLabel(job.experienceLevel)],
            ["Workplace", jobLabel(job.workplaceType)],
            [
              "Assessments",
              assessments.length
                ? `${assessments.length} required`
                : "None required",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 px-5 py-4 sm:block sm:px-7"
            >
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium sm:mt-1.5">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="order-2 min-w-0 overflow-hidden rounded-xl border border-border bg-card lg:order-none lg:col-start-1 lg:row-start-1">
          <nav
            aria-label="Job sections"
            className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border px-5 py-4 text-sm sm:px-7"
          >
            <a
              href="#role-overview"
              className="font-medium hover:underline underline-offset-4"
            >
              Overview
            </a>
            {requirements && (
              <a
                href="#role-requirements"
                className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
              >
                Requirements
              </a>
            )}
            {assessments.length > 0 && (
              <a
                href="#role-assessments"
                className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
              >
                Assessments{" "}
                <span className="ml-1 text-xs">{assessments.length}</span>
              </a>
            )}
          </nav>
          <div className="divide-y divide-border px-5 sm:px-7">
            <section
              id="role-overview"
              className="scroll-mt-24 space-y-5 py-6 sm:py-7"
            >
              <h2 className="text-lg font-semibold">About the role</h2>
              <JobMarkdown>
                {job.description?.trim() ||
                  "The employer hasn't added a role description yet."}
              </JobMarkdown>
            </section>
            {requirements && (
              <section
                id="role-requirements"
                className="scroll-mt-24 space-y-5 py-6 sm:py-7"
              >
                <h2 className="text-lg font-semibold">What you’ll bring</h2>
                <JobMarkdown>{requirements}</JobMarkdown>
              </section>
            )}
            {assessments.length > 0 && (
              <section
                id="role-assessments"
                className="scroll-mt-24 space-y-5 py-6 sm:py-7"
              >
                <div>
                  <h2 className="text-lg font-semibold">
                    A chance to show your skills
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Complete{" "}
                    {assessments.length === 1
                      ? "this assessment"
                      : "these assessments"}{" "}
                    as part of your application. Review the tasks below before
                    you begin.
                  </p>
                </div>
                <div className="divide-y divide-border rounded-lg border border-border px-4">
                  {assessments.map(({ label, icon: Icon, task }) => (
                    <div key={label} className="py-4">
                      <div className="flex items-start gap-3">
                        <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-sm font-medium">
                            {task?.title || `${label} assessment`}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {label}
                            {task?.skillLevel
                              ? ` · ${jobLabel(task.skillLevel)}`
                              : ""}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Required
                        </span>
                      </div>
                      {task?.instructions && (
                        <details className="group mt-3 pl-8">
                          <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-xs font-medium [&::-webkit-details-marker]:hidden">
                            View instructions{" "}
                            <IconChevronDown className="size-3.5 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                          </summary>
                          <div className="mt-3 min-w-0">
                            <JobMarkdown>{task.instructions}</JobMarkdown>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
                {job.tabLock && (
                  <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-4">
                    <IconShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="text-xs leading-5 text-muted-foreground">
                      This employer tracks tab switches during assessments.
                      Warning limit:{" "}
                      <span className="font-medium text-foreground">
                        {job.tabLockWarningLimit}
                      </span>
                      .
                    </p>
                  </div>
                )}
              </section>
            )}
            <section
              className="space-y-4 py-6 sm:py-7"
              aria-labelledby="hiring-team-title"
            >
              <h2 id="hiring-team-title" className="text-lg font-semibold">
                Your hiring contact
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium"
                    aria-hidden="true"
                  >
                    {(job.postedByName || job.companyName)
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium">
                      {job.postedByName || job.companyName}
                    </p>
                    {job.postedByName && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {job.companyName}
                      </p>
                    )}
                  </div>
                </div>
                {job.postedById && (
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href={`/preview/${job.postedById}`}>
                      View profile <IconArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </section>
          </div>
        </article>

        <aside className="contents lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:block lg:space-y-5">
          <section
            className="order-1 min-w-0 rounded-xl border border-border bg-card p-5"
            aria-labelledby="apply-title"
          >
            <h2 id="apply-title" className="text-sm font-medium">
              Compensation
            </h2>
            <p className="mt-2 break-words text-2xl font-semibold tracking-tight">
              {formatJobSalary(
                job.salaryMin,
                job.salaryMax,
                job.salaryCurrency,
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {job.salaryMin != null || job.salaryMax != null
                ? `${job.salaryCurrency || "USD"} · Pay period not specified`
                : "Ask the hiring team for details."}
            </p>
            <div className="my-5 space-y-3 border-y border-border py-4 text-xs text-muted-foreground">
              <p className="flex items-start gap-2">
                <IconCalendar className="size-4 shrink-0" />
                <span>
                  {deadline
                    ? `Apply by ${deadline} (UTC)`
                    : "No application deadline listed"}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <IconUsers className="size-4 shrink-0" />
                {applicantCount}{" "}
                {applicantCount === 1 ? "application" : "applications"}
              </p>
            </div>
            <LinkedInEasyApplyModal detail={detail} profile={profile} />
            {detail.hasApplied ? (
              <Link
                href="/job-tracker"
                className="mt-3 flex items-center justify-center gap-1 text-xs font-medium hover:underline"
              >
                Track your application <IconArrowUpRight className="size-3.5" />
              </Link>
            ) : availability.canApply ? (
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                {assessments.length
                  ? "Review your profile, complete the tasks, then apply."
                  : "Apply with your profile and an optional cover note."}
              </p>
            ) : null}
          </section>

          <section
            className="order-3 min-w-0 rounded-xl border border-border bg-card p-5"
            aria-labelledby="profile-match-title"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="profile-match-title" className="text-sm font-medium">
                Your profile match
              </h2>
              <Link
                href="/candidate-profile"
                aria-label="Edit your candidate profile"
                className="text-muted-foreground hover:text-foreground"
              >
                <IconArrowUpRight className="size-4" />
              </Link>
            </div>
            {overall !== null ? (
              <>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight tabular-nums">
                    {Math.round(overall * 100)}
                    <span className="text-xl">%</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    match to this role
                  </span>
                </div>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="meter"
                  aria-label="Profile match"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(overall * 100)}
                >
                  <div
                    className="h-full rounded-full bg-foreground"
                    style={{ width: `${overall * 100}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {sources.length > 0
                    ? `Based on ${sources.length} available profile ${sources.length === 1 ? "source" : "sources"} compared with this role.`
                    : "Based on your JobHub profile compared with this role."}
                </p>
                {sources.length > 0 && <details className="group mt-4 border-t border-border pt-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium [&::-webkit-details-marker]:hidden">
                    How your match is calculated{" "}
                    <IconChevronDown className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                  </summary>
                  <dl className="mt-4 space-y-4">
                    {sources.map((source) => {
                      const contribution = contributions.find(
                        (item) => item.key === source.key,
                      )!;
                      return (
                        <div
                          key={source.key}
                          className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-xs"
                        >
                          <dt>{source.label}</dt>
                          <dd className="font-medium tabular-nums">
                            {Math.round(source.value * 100)}% match
                          </dd>
                          <dd className="col-span-2 leading-5 text-muted-foreground">
                            {(contribution.normalizedWeight * 100).toFixed(1)}%
                            weighting · {contribution.points.toFixed(1)} points
                            toward your overall score
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                  <p className="mt-4 text-xs leading-5 text-muted-foreground">
                    The score is a weighted average of these sources. Weights
                    adjust to the sources available.
                  </p>
                </details>}
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium">
                  Your match isn’t available yet
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  Add your experience, skills, and connected profiles to help
                  match your background to this role.
                </p>
                <Button asChild variant="outline" className="w-full rounded-lg">
                  <Link href="/candidate-profile">Update your profile</Link>
                </Button>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
