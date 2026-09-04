"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Building2,
} from "lucide-react";
import { LinkedInEasyApplyModal } from "@/components/jobs/LinkedInEasyApplyModal";
import { getJobApplicationAvailability } from "@/lib/job-application-availability";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobPostDetailResponse } from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";
import { calculateSupportedOverallSimilarity } from "@/lib/semantic-match";

function displayEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSalary(min?: number, max?: number, currency?: string) {
  if (min === undefined && max === undefined) return "Not disclosed";
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  });
  if (min !== undefined && max !== undefined)
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  return `${formatter.format(min ?? max ?? 0)}+`;
}

function formatDeadline(deadline?: string) {
  if (!deadline) return "No deadline listed";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(deadline)
  );
}

interface JobDetailViewProps {
  detail: JobPostDetailResponse;
  profile: UserProfileResponse | null;
}

export function JobDetailView({ detail, profile }: JobDetailViewProps) {
  const { job } = detail;
  const hasTasks = job.hasDesignTask || job.hasProgrammingTask || job.hasSqlTask;
  const availability = getJobApplicationAvailability(job);
  const similaritySources = [
    ["JobHub platform", detail.platformSimilarity],
    ["GitHub", detail.githubSimilarity],
    ["Dev.to", detail.devtoSimilarity],
    ["ORCID", detail.orcidSimilarity],
    ["Stack Overflow", detail.stackoverflowSimilarity],
  ] as const;
  const availableSimilaritySources = similaritySources.filter(([, value]) => typeof value === "number");
  const overallSimilarity = calculateSupportedOverallSimilarity(detail);
  const hasMatchEvidence = overallSimilarity !== null || availableSimilaritySources.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl py-6 md:py-8">
      {/* Navigation Breadcrumb */}
      <Link
        href="/find-job"
        className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors mb-4"
      >
        ← Back to all roles
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Main Column */}
        <main className="space-y-8 min-w-0">
          {/* Header Card */}
          <header className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Building2 className="size-4" />
              <span>{job.companyName}</span>
            </div>

            <h1 className="mt-2.5 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-xs font-medium text-muted-foreground">
              {job.location && (
                <span className="inline-flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg text-foreground/90">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  {job.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg text-foreground/90">
                <BriefcaseBusiness className="size-3.5 text-muted-foreground" />
                {displayEnum(job.jobType)}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg text-foreground/90">
                <Clock3 className="size-3.5 text-muted-foreground" />
                {displayEnum(job.workplaceType)}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg text-foreground/90">
                <CalendarDays className="size-3.5 text-muted-foreground" />
                Deadline: {formatDeadline(job.deadline)}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-semibold text-xs">
                {displayEnum(job.experienceLevel)}
              </Badge>
              {hasTasks && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 font-bold text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" /> Practical Assessment Required
                </Badge>
              )}
              {!availability.canApply && (
                <Badge variant="destructive" className="font-bold text-xs">
                  Applications Closed
                </Badge>
              )}
            </div>
          </header>

          {/* About the Role */}
          <section className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-foreground">About the Role</h2>
            <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground text-sm">
              {job.description}
            </div>
          </section>

          {/* Requirements */}
          {job.requirements && (
            <section className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Requirements &amp; Qualifications
              </h2>
              <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground text-sm">
                {job.requirements}
              </div>
            </section>
          )}

        </main>

        {/* Right Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <section className="rounded-3xl border border-primary/25 bg-primary/[0.04] p-6" aria-labelledby="match-evidence-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p id="match-evidence-title" className="text-sm font-semibold text-foreground">Match evidence</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Raw cosine similarity from each available professional source. Values range from 0.000 to 1.000.
                </p>
              </div>
              <Sparkles className="size-5 shrink-0 text-primary" aria-hidden="true" />
            </div>
            {hasMatchEvidence ? (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <span className="text-sm font-semibold">Overall similarity</span>
                  <span className="font-mono text-base font-bold tabular-nums">{overallSimilarity?.toFixed(3) ?? "N/A"}</span>
                </div>
                <dl className="space-y-2.5">
                  {similaritySources.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-mono font-medium tabular-nums">{typeof value === "number" ? value.toFixed(3) : "Not available"}</dd>
                    </div>
                  ))}
                </dl>
                {detail.hasApplied && typeof detail.allTasksPassed === "boolean" && (
                  <div className="flex items-center justify-between border-t border-border/70 pt-3 text-sm">
                    <span className="text-muted-foreground">All required tasks passed</span>
                    <span className="font-semibold">{detail.allTasksPassed ? "Yes" : "No"}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5">
                <p className="text-sm font-semibold text-foreground">No matching evidence available</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Add professional details or supported profile links, then refresh matching data.</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/candidate-profile">Update profile</Link>
                </Button>
              </div>
            )}
          </section>

          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Offered Compensation
            </p>
            <p className="mt-1 text-2xl font-black text-foreground">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </p>

            {/* LinkedIn-style Easy Apply button & flow */}
            <div className="mt-6 border-t border-border/70 pt-6 flex flex-col gap-3">
              <LinkedInEasyApplyModal detail={detail} profile={profile} />

              <p className="text-center text-xs text-muted-foreground font-medium">
                {detail.applicantCount} applicant{detail.applicantCount === 1 ? "" : "s"} so far
              </p>
            </div>

          </div>

          {job.tabLock && (
            <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                This role tracks assessment tab activity. Warning limit:{" "}
                <strong className="text-foreground">{job.tabLockWarningLimit}</strong>.
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
