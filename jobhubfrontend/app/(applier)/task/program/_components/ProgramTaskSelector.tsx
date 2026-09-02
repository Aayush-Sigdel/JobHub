"use client";
import React from "react";
import type { ProgrammingTaskDto } from "../page";

export default function ProgramTaskSelector({ tasks, selectedTaskId, onSelect }: { tasks: ProgrammingTaskDto[]; selectedTaskId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold text-lg">Programming Tasks</h2>
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} onClick={() => onSelect(task.id)} className={`p-3 border rounded cursor-pointer transition-colors ${selectedTaskId === task.id ? "bg-blue-50 border-blue-400" : "bg-white hover:bg-gray-50"}`}>
            <h3 className="font-medium text-sm">{task.title}</h3>
            <div className="mt-1 flex items-center justify-between text-xs text-gray-500"><span>{task.skillLevel}</span><span>{task.scope}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
