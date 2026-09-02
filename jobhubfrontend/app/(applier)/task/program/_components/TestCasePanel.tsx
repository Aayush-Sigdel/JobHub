"use client";
import React from "react";
import type { TestCase } from "../page";

export default function TestCasePanel({ testCases }: { testCases: TestCase[] }) {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-2 text-sm font-semibold border-b">Example Test Cases</div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {testCases.map((tc, idx) => (
          <div key={idx} className="p-3 border rounded bg-gray-50 text-sm font-mono">
            <div><strong>Input:</strong> {JSON.stringify(tc.input)}</div>
            <div><strong>Expected Output:</strong> {JSON.stringify(tc.expectedOutput)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
