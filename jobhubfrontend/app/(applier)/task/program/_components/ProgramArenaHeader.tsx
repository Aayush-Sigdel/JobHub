"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Code2, ShieldCheck } from "lucide-react";
import type { ProgrammingTaskDto } from "../page";

export default function ProgramArenaHeader({
  task,
  language,
  setLanguage,
  onSubmit,
  isSubmitting,
  isSubmitted,
  jobId,
  tabLockEnabled,
  tabSwitchCount = 0,
  tabLockWarningLimit = 0,
}: {
  task?: ProgrammingTaskDto;
  language: "JAVA" | "PYTHON";
  setLanguage: (lang: "JAVA" | "PYTHON") => void;
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
          <Code2 className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900">Programming Arena</h1>
        </div>
        {task && (
          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-md">
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
        <select
          className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={language}
          onChange={(e) => setLanguage(e.target.value as "JAVA" | "PYTHON")}
        >
          <option value="JAVA">Java 17</option>
          <option value="PYTHON">Python 3</option>
        </select>
        <button
          onClick={onSubmit}
          disabled={!task || isSubmitting || isSubmitted}
          className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-green-700 transition shadow-sm cursor-pointer"
        >
          {isSubmitting ? "Submitting..." : isSubmitted ? "Assessment Submitted" : "Submit Code"}
        </button>
      </div>
    </header>
  );
}
