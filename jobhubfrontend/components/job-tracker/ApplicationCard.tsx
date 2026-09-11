import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { formatJobDate } from "@/lib/job-display";

interface TaskSubmissionResponse {
  taskId: string;
  taskType: string;
  passed: boolean;
  achievedScore: number;
  requiredScore: number;
  message?: string;
}

type ApplicationStatus =
  | "APPLIED"
  | "IN_REVIEW"
  | "SHORTLISTED"
  | "ACCEPTED"
  | "REJECTED";

export interface JobApplicationResponse {
  id: string;
  jobPostId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: ApplicationStatus;
  similarityScore: number | null;
  tabSwitchCount: number;
  coverNote: string | null;
  designSubmission: TaskSubmissionResponse | null;
  programmingSubmission: TaskSubmissionResponse | null;
  sqlSubmission: TaskSubmissionResponse | null;
  createdAt: string;
  updatedAt: string;
}

const statuses: Record<ApplicationStatus, { label: string; dot: string }> = {
  APPLIED: { label: "Applied", dot: "bg-muted-foreground" },
  IN_REVIEW: { label: "In review", dot: "bg-amber-500" },
  SHORTLISTED: { label: "Shortlisted", dot: "bg-primary" },
  ACCEPTED: { label: "Accepted", dot: "bg-emerald-500" },
  REJECTED: { label: "Not selected", dot: "bg-muted-foreground/50" },
};

export function ApplicationCard({
  application,
}: {
  application: JobApplicationResponse;
}) {
  const status = statuses[application.status] || statuses.APPLIED;
  const date = formatJobDate(application.createdAt);
  const match =
    application.similarityScore != null &&
    Number.isFinite(application.similarityScore)
      ? Math.round(
          application.similarityScore <= 1
            ? application.similarityScore * 100
            : application.similarityScore,
        )
      : null;
  const submissions = [
    { label: "Programming", submission: application.programmingSubmission },
    { label: "Design", submission: application.designSubmission },
    { label: "SQL", submission: application.sqlSubmission },
  ].filter((item) => item.submission !== null);

  return (
    <article className="border-b border-border/70 py-5 last:border-b-0">
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_130px_130px] sm:gap-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">
            <Link
              href={`/find-job/${application.jobPostId}`}
              className="hover:underline underline-offset-4"
            >
              {application.jobTitle}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {application.companyName}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className={`size-1.5 shrink-0 rounded-full ${status.dot}`}
          />
          {status.label}
        </span>
        <span className="text-sm text-muted-foreground sm:text-right">
          {date ? (
            <>
              <span className="sm:sr-only">Applied </span>
              {date}
            </>
          ) : (
            "Date unavailable"
          )}
        </span>
      </div>
      <details className="group mt-3">
        <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
          Application details{" "}
          <ChevronDown className="size-3.5 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="mt-3 space-y-5 rounded-xl bg-muted/30 p-4 sm:p-5">
          <dl className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Applied on</dt>
              <dd className="mt-1">{date || "Not available"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Last updated</dt>
              <dd className="mt-1">
                {formatJobDate(application.updatedAt) || "Not available"}
              </dd>
            </div>
            {match !== null && (
              <div>
                <dt className="text-xs text-muted-foreground">Profile match</dt>
                <dd className="mt-1">{match}%</dd>
              </div>
            )}
          </dl>
          {submissions.length > 0 ? (
            <section aria-label="Assessment results">
              <h3 className="mb-2 text-sm font-medium">Assessment results</h3>
              <div className="divide-y divide-border/60">
                {submissions.map(
                  ({ label, submission }) =>
                    submission && (
                      <div key={label} className="py-2 text-sm">
                        <div className="flex flex-wrap justify-between gap-2">
                          <span>{label}</span>
                          <span className="text-muted-foreground">
                            {submission.passed ? "Passed" : "Not passed"} ·
                            Score {submission.achievedScore} / required{" "}
                            {submission.requiredScore}
                          </span>
                        </div>
                        {submission.message && (
                          <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">
                            {submission.message}
                          </p>
                        )}
                      </div>
                    ),
                )}
              </div>
            </section>
          ) : (
            <p className="text-sm text-muted-foreground">
              No assessment submissions attached.
            </p>
          )}
          {application.coverNote && (
            <div>
              <h3 className="text-sm font-medium">Your cover note</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                {application.coverNote}
              </p>
            </div>
          )}
          {application.tabSwitchCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {application.tabSwitchCount} tab{" "}
              {application.tabSwitchCount === 1
                ? "switch recorded"
                : "switches recorded"}{" "}
              during assessment.
            </p>
          )}
        </div>
      </details>
    </article>
  );
}
