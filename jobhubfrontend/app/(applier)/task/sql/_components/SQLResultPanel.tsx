"use client";
import React from "react";

export default function SQLResultPanel({ result }: { result: any }) {
  return (
    <div className={`p-4 rounded border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <h3 className={`font-bold ${result.passed ? 'text-green-800' : 'text-red-800'}`}>{result.passed ? "Assertions Passed!" : "Assertions Failed"}</h3>
      <p className="text-sm mt-1">Score: {result.achievedScore} / {result.requiredScore}</p>
      {result.message && <p className="text-xs mt-2 font-mono bg-white p-2 rounded">{result.message}</p>}
    </div>
  );
}
