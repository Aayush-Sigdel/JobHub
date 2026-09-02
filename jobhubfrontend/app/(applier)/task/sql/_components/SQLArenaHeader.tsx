"use client";
import React from "react";
import type { SQLTaskDto } from "../page";

export default function SQLArenaHeader({ task, onSubmit, isSubmitting }: { task?: SQLTaskDto; onSubmit: () => void; isSubmitting: boolean }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">SQL Arena</h1>
        {task && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{task.skillLevel}</span>}
      </div>
      <button onClick={onSubmit} disabled={!task || isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded font-medium disabled:opacity-50 hover:bg-green-700 transition">{isSubmitting ? "Submitting..." : "Run Query"}</button>
    </header>
  );
}
