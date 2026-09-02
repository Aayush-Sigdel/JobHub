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
import type { JobPostDetailResponse } from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";

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
              {job.similarityScore !== undefined && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs"
                >
                  {Math.round(job.similarityScore * 100)}% Profile Match
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
