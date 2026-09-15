"use client";

import Link from "next/link";
import { CheckCircle2, CircleAlert, ArrowRight } from "lucide-react";
import type { TaskSubmissionResponse } from "@/types/api/tasks";

export function TaskResult({
  result,
  jobId,
  error,
}: {
  result?: TaskSubmissionResponse | null;
  jobId?: string | null;
  error?: string | null;
}) {
  if (!result && !error) return null;
  return (
    <section
      aria-label="Evaluation result"
      aria-live="polite"
      className="max-h-64 shrink-0 overflow-auto border-t bg-muted/20 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {result?.id && !error ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          )}
          <div>
            <h3 className="text-sm font-medium">
              {error || !result?.id
                ? "Evaluation unavailable"
                : result.passed
                  ? "Assessment passed"
                  : "Assessment submitted · Target not met"}
            </h3>
            {error ? (
              <p role="alert" className="mt-1 text-xs text-muted-foreground">
                {error}
              </p>
            ) : result?.id ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted solution ·{" "}
                {result.taskType === "DESIGN" ? "Visual match" : "Score"}:{" "}
                <span className="font-medium text-foreground">
                  {Number.isFinite(result.achievedScore)
                    ? result.achievedScore
                    : "—"}
                  {result.taskType === "DESIGN" ? "%" : ""}
                </span>
                {" · "}Required:{" "}
                {Number.isFinite(result.requiredScore)
                  ? result.requiredScore
                  : "—"}
                {result.taskType === "DESIGN" ? "%" : ""}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                No submission was recorded. Please try again.
              </p>
            )}
          </div>
        </div>
        {jobId && result?.id && !error && (
          <Link
            href={`/find-job/${jobId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
          >
            Return to job <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      {result?.message && (
        <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border bg-background p-3 font-mono text-xs leading-relaxed">
          {result.message}
        </pre>
      )}
    </section>
  );
}
