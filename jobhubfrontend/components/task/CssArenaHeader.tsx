"use client";

import React, { memo } from "react";
import Link from "next/link";
import { Flame, Star, ArrowLeft, ShieldCheck } from "lucide-react";
import { DesignTask, ScoreResult, PASSING_TOLERANCE } from "@/lib/task/css_data";

interface CssArenaHeaderProps {
  task: DesignTask;
  lastScore: ScoreResult | null;
  isTargetScoreMet: boolean;
  jobId?: string | null;
  tabLockEnabled?: boolean;
  tabSwitchCount?: number;
  tabLockWarningLimit?: number;
}

export const CssArenaHeader = memo(
  ({ task, lastScore, isTargetScoreMet, jobId, tabLockEnabled, tabSwitchCount = 0, tabLockWarningLimit = 0 }: CssArenaHeaderProps) => {
    return (
      <header className="h-12 bg-card border-b border-border px-6 flex items-center justify-between text-xs shrink-0 select-none whitespace-nowrap">
        {/* Left: Breadcrumbs & Target Title */}
        <div className="flex items-center gap-3">
          {jobId ? (
            <Link
              href={`/find-job/${jobId}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-primary" />
              <span>Back to Job</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs">
              <Flame className="w-3.5 h-3.5 text-tomato-500 shrink-0" />
              <span className="hover:text-foreground transition-colors cursor-pointer">
                Tasks
              </span>
              <span className="text-muted-foreground/30">/</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">
                CSS Battle
              </span>
              <span className="text-muted-foreground/30">/</span>
            </div>
          )}

          <span className="font-bold text-foreground text-sm tracking-tight">
            {task.title}
          </span>

          {/* Difficulty Tag */}
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-card text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
            {task.skillLevel === "BEGINNER" ? "Easy" : task.skillLevel}
          </span>
        </div>

        {/* Right: Target Requirement, Last Score, and Canvas Dimensions */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {tabLockEnabled && (
            <div className={`flex items-center gap-1.5 font-semibold ${tabSwitchCount >= tabLockWarningLimit ? "text-red-600" : "text-amber-600"}`}>
              <ShieldCheck className="size-3.5" />
              <span>Monitored · {tabSwitchCount}/{tabLockWarningLimit}</span>
            </div>
          )}
          {/* Target Score Requirement with Color Status Dot */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isTargetScoreMet ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-muted-foreground">
              Target:{" "}
              <strong
                className={
                  isTargetScoreMet
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-amber-500 dark:text-amber-400 font-semibold"
                }
              >
                ≥ {task.minimumMatchingScore}%
              </strong>
            </span>
          </div>

          {lastScore && (
            <>
              <div className="h-4 w-[1px] bg-border shrink-0" />
              <div className="flex items-center gap-1.5 text-xs text-foreground">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                <span>
                  Score: <strong>{lastScore.score}</strong>
                </span>
                <span
                  className={`font-bold ${
                    lastScore.matchPct >= task.minimumMatchingScore - PASSING_TOLERANCE
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-500 dark:text-amber-400"
                  }`}
                >
                  ({lastScore.matchPct}%)
                </span>
              </div>
            </>
          )}

          <div className="h-4 w-[1px] bg-border shrink-0" />

          <span className="text-muted-foreground">
            Canvas:{" "}
            <strong className="text-foreground font-semibold">
              {task.viewport.width} × {task.viewport.height} px
            </strong>
          </span>
        </div>
      </header>
    );
  }
);

CssArenaHeader.displayName = "CssArenaHeader";
export default CssArenaHeader;
