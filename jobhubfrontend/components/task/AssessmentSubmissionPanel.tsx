"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { evaluationRequiresOverride } from "@/lib/task/assessment-submission";
import type { TaskSubmissionResponse } from "@/types/api/tasks";

export function AssessmentSubmissionPanel({
  result,
  error,
  jobId,
  busy,
  disabled,
  onSubmit,
  onRetry,
  onEdit,
}: {
  result?: TaskSubmissionResponse;
  error: string | null;
  jobId?: string | null;
  busy: "testing" | "submitting" | null;
  disabled: boolean;
  onSubmit: () => void;
  onRetry: () => void;
  onEdit: () => void;
}) {
  const submitted = Boolean(result?.id);
  const failed = result && evaluationRequiresOverride(result);
  return (
    <section
      aria-label="Test and submit"
      className="max-h-64 shrink-0 overflow-y-auto border-t bg-muted/20 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div
          className="min-w-0 flex-1 basis-52"
          role="status"
          aria-live="polite"
        >
          <p className="flex items-center gap-2 text-sm font-medium">
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : submitted || (result && !failed) ? (
              <CheckCircle2 className="size-4" />
            ) : result || error ? (
              <CircleAlert className="size-4" />
            ) : null}
            {busy === "testing"
              ? "Testing your code..."
              : busy === "submitting"
                ? "Submitting your solution..."
                : submitted
                  ? "Assessment submitted"
                  : error
                    ? "Something went wrong"
                    : result
                      ? failed
                        ? "Some checks did not pass"
                        : "Ready to submit"
                      : "Test your code when you’re ready"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {submitted
              ? jobId
                ? "Your result is saved. Return to the job to continue your application."
                : "Your result is saved."
              : busy === "testing"
                ? "Running the assessment checks. This does not submit your solution."
                : result
                  ? `Score: ${result.achievedScore} / ${result.requiredScore}. ${failed ? "Edit and test again, or send this result anyway." : "Review your result, then submit below."}`
                  : "Write your solution, test it, then choose when to submit."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {submitted && jobId ? (
            <Button asChild size="sm">
              <Link href={`/find-job/${jobId}`}>
                Return to job <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : !submitted && result ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onClick={onEdit}
              >
                Keep editing
              </Button>
              <Button
                type="button"
                size="sm"
                variant={failed ? "outline" : "default"}
                disabled={disabled}
                onClick={onSubmit}
              >
                {busy === "submitting"
                  ? "Submitting..."
                  : failed
                    ? "Send anyway"
                    : "Submit solution"}
                <ArrowRight className="size-3.5" />
              </Button>
            </>
          ) : error && !busy ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={onRetry}
            >
              Try testing again
            </Button>
          ) : null}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs leading-5 text-destructive">
          {error}
        </p>
      )}
      {result?.message && (
        <details className="mt-3" open={failed || undefined}>
          <summary className="cursor-pointer text-xs font-medium">
            Test output
          </summary>
          <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-background p-3 font-mono text-xs leading-5">
            {result.message}
          </pre>
        </details>
      )}
      {result && !submitted && jobId && (
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
          Submitting saves this assessment result. You’ll submit your
          application separately on the job page.
        </p>
      )}
    </section>
  );
}
