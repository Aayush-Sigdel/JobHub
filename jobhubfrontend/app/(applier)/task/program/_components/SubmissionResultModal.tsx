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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 border border-gray-100">
        <div
          className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto ${
            isPassed ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {isPassed ? (
            <CheckCircle2 className="w-9 h-9" />
          ) : (
            <XCircle className="w-9 h-9" />
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isPassed ? "Assessment Passed!" : "Assessment Recorded"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isPassed
              ? "All test assertions passed successfully."
              : "Your solution has been evaluated and recorded for the hiring team."}
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-1.5">
          <div className="flex justify-between text-gray-600">
            <span>Score Achieved:</span>
            <span className="font-bold text-gray-900">
              {result.achievedScore ?? 0} / {result.requiredScore ?? 100}
            </span>
          </div>
          {result.message && (
            <div className="pt-2 text-left border-t border-gray-200">
              <span className="text-[11px] text-gray-400 block mb-0.5">Runner Output:</span>
              <p className="font-mono text-gray-700 text-[11px] bg-white p-2 rounded-lg border border-gray-100 overflow-x-auto max-h-24">
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
