"use client";
import React, { useState, useTransition } from "react";
import { submitTaskAction } from "@/lib/actions/tasks";
import type { SQLTaskDto } from "../page";
import SQLTaskSelector from "./SQLTaskSelector";
import SQLEditor from "./SQLEditor";
import SQLResultPanel from "./SQLResultPanel";
import SQLArenaHeader from "./SQLArenaHeader";

export default function SQLArenaClient({ tasks }: { tasks: SQLTaskDto[] }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleSubmit = () => {
    if (!selectedTaskId) return;
    startTransition(async () => {
      try { const res = await submitTaskAction({ taskId: selectedTaskId, codes: [code], taskType: "SQL" }); setResult(res); }
      catch (error) { console.error(error); }
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      <SQLArenaHeader task={selectedTask} onSubmit={handleSubmit} isSubmitting={isPending} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto"><SQLTaskSelector tasks={tasks} selectedTaskId={selectedTaskId} onSelect={setSelectedTaskId} /></div>
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {selectedTask ? (
            <>
              <div className="bg-white p-4 rounded shadow-sm overflow-auto max-h-48"><h3 className="font-bold mb-2">Instructions</h3><p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTask.instructions}</p></div>
              <div className="flex-1 border rounded bg-white overflow-hidden flex flex-col"><SQLEditor code={code} setCode={setCode} /></div>
              {result && <SQLResultPanel result={result} />}
            </>
          ) : (<div className="flex flex-1 items-center justify-center text-gray-500">Select a task to begin</div>)}
        </div>
      </div>
    </div>
  );
}
