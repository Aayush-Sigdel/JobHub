"use client";
import React from "react";
import type { TestCase } from "../page";

export default function TestCasePanel({
  testCases,
}: {
  testCases: TestCase[];
}) {
  return (
    <div className="h-full flex flex-col bg-card text-foreground">
      <div className="bg-muted/40 border-b border-border px-5 py-2.5 flex items-center justify-between text-sm shrink-0">
        <span className="font-bold">Example test cases</span>
        <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
          {testCases.length} visible
        </span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {testCases.map((tc, idx) => (
          <div
            key={idx}
            className="p-3 border border-border rounded-xl bg-muted/20 text-xs font-mono space-y-1.5"
          >
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Example {idx + 1}
            </span>
            <div className="truncate">
              <strong className="text-muted-foreground">Input: </strong>
              {JSON.stringify(tc.input)}
            </div>
            <div className="truncate">
              <strong className="text-muted-foreground">Expected: </strong>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {JSON.stringify(tc.expectedOutput)}
              </span>
            </div>
          </div>
        ))}
        {testCases.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No example cases are available for this task.
          </p>
        )}
      </div>
    </div>
  );
}
