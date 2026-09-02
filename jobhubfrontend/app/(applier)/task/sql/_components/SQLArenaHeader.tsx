"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";
import type { SQLTaskDto } from "../page";

export default function SQLArenaHeader({
  task,
  onSubmit,
  isSubmitting,
  isSubmitted,
  jobId,
  tabLockEnabled,
  tabSwitchCount = 0,
  tabLockWarningLimit = 0,
}: {
  task?: SQLTaskDto;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
  jobId?: string | null;
  tabLockEnabled?: boolean;
  tabSwitchCount?: number;
  tabLockWarningLimit?: number;
}) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {jobId && (
          <Link
            href={`/find-job/${jobId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job</span>
          </Link>
        )}
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-600" />
          <h1 className="text-lg font-bold text-gray-900">SQL Arena</h1>
        </div>
        {task && (
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-md">
            {task.skillLevel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {tabLockEnabled && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tabSwitchCount >= tabLockWarningLimit ? "text-red-600" : "text-amber-600"}`}>
            <ShieldCheck className="size-3.5" /> Monitored · {tabSwitchCount}/{tabLockWarningLimit}
          </span>
        )}
        <button
          onClick={onSubmit}
          disabled={!task || isSubmitting || isSubmitted}
          className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-green-700 transition shadow-sm cursor-pointer"
        >
          {isSubmitting ? "Submitting..." : isSubmitted ? "Assessment Submitted" : "Execute & Submit Query"}
        </button>
      </div>
    </header>
  );
}
