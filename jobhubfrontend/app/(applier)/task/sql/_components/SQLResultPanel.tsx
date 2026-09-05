"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TaskSubmissionResponse } from "@/types/api/tasks";

export default function SQLResultPanel({
  result,
  jobId,
}: {
  result: TaskSubmissionResponse;
  jobId?: string | null;
}) {
  const isPassed = Boolean(result.passed);

  return (
    <div
      className={`p-4 rounded-2xl border ${
        isPassed
          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
          : "bg-red-50/70 border-red-200 text-red-950"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isPassed ? (
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="size-5 text-red-600 shrink-0" />
          )}
          <div>
            <h3 className="font-bold text-sm">
              {isPassed ? "SQL Query Passed!" : "Execution Finished with Failures"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Score: {result.achievedScore ?? 0} / {result.requiredScore ?? 100}
            </p>
          </div>
        </div>

        {jobId && (
          <Button
            asChild
            size="sm"
            className="rounded-xl font-bold text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shrink-0"
          >
            <Link href={`/find-job/${jobId}`}>
              <span>Return to Job</span>
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        )}
      </div>

      {result.message && (
        <p className="text-xs mt-3 font-mono bg-white p-2.5 rounded-xl border border-gray-200 text-gray-800 overflow-x-auto max-h-24">
          {result.message}
        </p>
      )}
    </div>
  );
}
