"use client";
import React from "react";
import type { ProgrammingTaskDto } from "../page";

export default function ProgramTaskSelector({
  tasks,
  selectedTaskId,
  onSelect,
}: {
  tasks: ProgrammingTaskDto[];
  selectedTaskId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="p-4 space-y-4 text-foreground">
      <h2 className="font-semibold text-sm">Programming tasks</h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            type="button"
            key={task.id}
            onClick={() => onSelect(task.id)}
            className={`w-full p-3 border rounded-xl cursor-pointer transition-colors text-left ${selectedTaskId === task.id ? "bg-tomato-500/5 border-tomato-500" : "bg-card border-border hover:bg-muted"}`}
          >
            <h3 className="font-medium text-sm">{task.title}</h3>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{task.skillLevel.toLowerCase()}</span>
              <span>{task.scope.toLowerCase()}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
