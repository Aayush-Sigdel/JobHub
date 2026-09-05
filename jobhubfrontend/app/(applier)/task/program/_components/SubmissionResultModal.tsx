"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TaskSubmissionResponse } from "@/types/api/tasks";

export default function SubmissionResultModal({
  result,
  onClose,
  jobId,
}: {
  result: TaskSubmissionResponse;
  onClose: () => void;
  jobId?: string | null;
}) {
  const isPassed = Boolean(result.passed);
  const isRunnerUnavailable = Boolean(
    (result.message &&
      [
        "error: file not found: Solution.java",
        "error: file not found: Driver.java",
        "Cannot connect to the Docker daemon",
        "Failed to relax sandbox work directory permissions",
      ].some((errorText) => result.message?.includes(errorText))) ||
    (result.message?.includes("Docker image '") &&
      result.message.includes("' does not exist")),
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-card text-foreground rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 border border-border">
        <div
          className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto ${
            isRunnerUnavailable
              ? "bg-destructive/10 text-destructive"
              : isPassed
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          {isPassed ? (
            <CheckCircle2 className="w-9 h-9" />
          ) : (
            <XCircle className="w-9 h-9" />
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isRunnerUnavailable
              ? "Code runner unavailable"
              : isPassed
                ? "Assessment Passed!"
                : "Assessment Recorded"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isRunnerUnavailable
              ? "Your code could not be evaluated because the execution service could not access its workspace. The editor remains unlocked."
              : isPassed
                ? "All test assertions passed successfully."
                : "Your solution has been evaluated and recorded for the hiring team."}
          </p>
        </div>

        <div className="bg-muted/30 rounded-2xl p-4 border border-border text-xs space-y-1.5">
          {!isRunnerUnavailable && (
            <div className="flex justify-between text-muted-foreground">
              <span>Score Achieved:</span>
              <span className="font-bold text-foreground">
                {result.achievedScore ?? 0} / {result.requiredScore ?? 100}
              </span>
            </div>
          )}
          {result.message && (
            <div className="pt-2 text-left border-t border-border">
              <span className="text-[11px] text-muted-foreground block mb-0.5">
                Runner output:
              </span>
              <p className="font-mono text-foreground text-[11px] bg-background p-2 rounded-lg border border-border overflow-x-auto max-h-24">
                {result.message}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {jobId && (
            <Button
              asChild
              className="w-full sm:w-auto rounded-xl font-bold text-xs h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Link href={`/find-job/${jobId}`}>
                <span>Return to Job Application</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl font-bold text-xs h-10"
          >
            Stay in Arena
          </Button>
        </div>
      </div>
    </div>
  );
}
