import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { JobApplicationModal } from "@/components/jobs/JobApplicationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobPostDetailResponse } from "@/types/api/jobs";

function displayEnum(value: string) {
  return value.toLowerCase().split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function formatSalary(min?: number, max?: number, currency?: string) {
  if (min === undefined && max === undefined) return "Not disclosed";
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  });
  if (min !== undefined && max !== undefined) return `${formatter.format(min)} - ${formatter.format(max)}`;
  return `${formatter.format(min ?? max ?? 0)}+`;
}

function formatDeadline(deadline?: string) {
  if (!deadline) return "No deadline listed";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(deadline));
}

export function JobDetailView({ detail }: { detail: JobPostDetailResponse }) {
  const { job } = detail;
  const hasTasks = job.hasDesignTask || job.hasProgrammingTask || job.hasSqlTask;

  return (
    <div className="mx-auto w-full max-w-6xl py-8 md:py-10">
      <Link href="/find-job" className="text-sm font-medium text-muted-foreground hover:text-foreground">Back to roles</Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <main>
          <header className="border-b pb-7">
            <p className="text-sm font-medium text-primary">{job.companyName}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{job.title}</h1>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
              {job.location && <span className="inline-flex items-center gap-2"><MapPin className="size-4" />{job.location}</span>}
              <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="size-4" />{displayEnum(job.jobType)}</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="size-4" />{displayEnum(job.workplaceType)}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" />Deadline: {formatDeadline(job.deadline)}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary">{displayEnum(job.experienceLevel)}</Badge>
              {hasTasks && <Badge variant="outline">Assessment required</Badge>}
              {job.similarityScore !== undefined && <Badge variant="outline">{Math.round(job.similarityScore * 100)}% profile match</Badge>}
            </div>
          </header>

          <section className="py-7">
            <h2 className="text-xl font-semibold">About the role</h2>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-muted-foreground">{job.description}</p>
          </section>

          {job.requirements && (
            <section className="border-t py-7">
              <h2 className="text-xl font-semibold">Requirements</h2>
              <p className="mt-4 whitespace-pre-wrap leading-7 text-muted-foreground">{job.requirements}</p>
            </section>
          )}

          {hasTasks && (
            <section className="border-t py-7">
              <h2 className="text-xl font-semibold">Application assessments</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Complete the assessments requested by the employer before submitting your application.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.hasDesignTask && <Badge variant="secondary">Design task</Badge>}
                {job.hasProgrammingTask && <Badge variant="secondary">Programming task</Badge>}
                {job.hasSqlTask && <Badge variant="secondary">SQL task</Badge>}
              </div>
              <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-950 dark:text-amber-200">
                Assessment results can be completed in the current frontend, but the available API does not return a submission identifier needed to attach them to this application. Direct submission is intentionally unavailable for assessed roles.
              </div>
            </section>
          )}
        </main>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Compensation</p>
            <p className="mt-1 text-xl font-semibold">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
            <div className="mt-5 border-t pt-5">
              {hasTasks ? (
                <Button disabled className="w-full">Assessment application unavailable</Button>
              ) : (
                <JobApplicationModal jobId={job.id} jobTitle={job.title} companyName={job.companyName} hasTasks={false} hasApplied={detail.hasApplied} />
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">{detail.applicantCount} applicant{detail.applicantCount === 1 ? "" : "s"}</p>
            </div>
          </div>

          {job.tabLock && (
            <div className="mt-4 flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span>This role tracks assessment tab switches. The employer warning limit is {job.tabLockWarningLimit}.</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
