"use client";
import React from "react";

export default function SubmissionResultModal({ result, onClose }: { result: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4">{result.passed ? "Success!" : "Failed"}</h2>
        <p className="mb-2">Score: {result.achievedScore} / {result.requiredScore}</p>
        {result.message && <p className="text-sm text-gray-600 mb-6">{result.message}</p>}
        <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
      </div>
    </div>
  );
}
