"use client";
import React from "react";
import type { ProgrammingTaskDto } from "../page";

export default function ProgramArenaHeader({ task, language, setLanguage, onSubmit, isSubmitting }: { task?: ProgrammingTaskDto; language: "JAVA" | "PYTHON"; setLanguage: (lang: "JAVA" | "PYTHON") => void; onSubmit: () => void; isSubmitting: boolean }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Programming Arena</h1>
        {task && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{task.skillLevel}</span>}
      </div>
      <div className="flex items-center gap-4">
        <select className="border rounded p-1 text-sm" value={language} onChange={e => setLanguage(e.target.value as any)}><option value="JAVA">Java</option><option value="PYTHON">Python</option></select>
        <button onClick={onSubmit} disabled={!task || isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded font-medium disabled:opacity-50 hover:bg-green-700 transition">{isSubmitting ? "Submitting..." : "Submit Code"}</button>
      </div>
    </header>
  );
}
