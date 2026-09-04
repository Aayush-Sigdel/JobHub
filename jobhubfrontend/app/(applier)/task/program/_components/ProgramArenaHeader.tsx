"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Braces, Loader2, Send, ShieldCheck } from "lucide-react";
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
    <header className="h-12 bg-card border-b border-border px-6 flex items-center justify-between text-xs shrink-0 select-none whitespace-nowrap">
      <div className="flex items-center gap-4">
        {jobId && (
          <Link
            href={`/find-job/${jobId}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job</span>
          </Link>
        )}
        <div className="flex items-center gap-2.5">
          <Braces className="size-4 text-tomato-500" />
          <div className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground">
              Programming
            </span>
            <span className="text-muted-foreground/40">/</span>
            <h1 className="text-sm font-bold text-foreground">
              {task?.title ?? "Select a task"}
            </h1>
          </div>
        </div>
        {task && (
          <span className="px-2 py-0.5 bg-card text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-[11px] font-mono font-bold rounded-md">
            {task.skillLevel === "BEGINNER"
              ? "Easy"
              : task.skillLevel.toLowerCase()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {tabLockEnabled && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tabSwitchCount >= tabLockWarningLimit ? "text-red-600" : "text-amber-600"}`}
          >
            <ShieldCheck className="size-3.5" /> Monitored {tabSwitchCount}/
            {tabLockWarningLimit}
          </span>
        )}
        <select
          className="h-8 border border-border rounded-lg px-2.5 text-xs font-semibold bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          value={language}
          onChange={(e) => setLanguage(e.target.value as "JAVA" | "PYTHON")}
        >
          <option value="JAVA">Java 17</option>
          <option value="PYTHON">Python 3</option>
        </select>
        <button
          onClick={onSubmit}
          disabled={!task || isSubmitting || isSubmitted}
          className="h-8 px-4 bg-tomato-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-tomato-600 active:scale-[0.98] transition shadow-sm cursor-pointer inline-flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" />
          )}
          {isSubmitting
            ? "Submitting..."
            : isSubmitted
              ? "Assessment submitted"
              : "Submit code"}
        </button>
      </div>
    </header>
  );
}
