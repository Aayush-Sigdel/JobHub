"use client";

import React, { useState, useTransition } from "react";
import { submitTaskAction } from "@/lib/actions/tasks";
import type { ProgrammingTaskDto } from "../page";
import ProgramTaskSelector from "./ProgramTaskSelector";
import ProgramEditor from "./ProgramEditor";
import TestCasePanel from "./TestCasePanel";
import ProgramArenaHeader from "./ProgramArenaHeader";
import SubmissionResultModal from "./SubmissionResultModal";

export default function ProgramArenaClient({ tasks }: { tasks: ProgrammingTaskDto[] }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<"JAVA" | "PYTHON">("JAVA");
  const [result, setResult] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleSubmit = () => {
    if (!selectedTaskId) return;
    startTransition(async () => {
      try {
        const res = await submitTaskAction({ taskId: selectedTaskId, code, taskType: "PROGRAMMING", language });
        setResult(res);
      } catch (error) { console.error(error); }
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      <ProgramArenaHeader task={selectedTask} language={language} setLanguage={setLanguage} onSubmit={handleSubmit} isSubmitting={isPending} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
          <ProgramTaskSelector tasks={tasks} selectedTaskId={selectedTaskId} onSelect={setSelectedTaskId} />
        </div>
        <div className="flex-1 flex flex-col">
          {selectedTask ? (
            <>
              <div className="flex-1 p-4 overflow-hidden"><ProgramEditor task={selectedTask} language={language} code={code} setCode={setCode} /></div>
              <div className="h-1/3 border-t border-gray-200 bg-white"><TestCasePanel testCases={selectedTask.exampleTestCases} /></div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500">Select a task to begin</div>
          )}
        </div>
      </div>
      {result && <SubmissionResultModal result={result} onClose={() => setResult(null)} />}
    </div>
  );
}
