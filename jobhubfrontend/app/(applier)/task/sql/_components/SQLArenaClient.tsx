"use client";

import JobMarkdown from "@/components/jobs/JobMarkdown";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import { submitTaskAction } from "@/lib/actions/tasks";
import { applyJobAction } from "@/lib/actions/jobs";
import { buildVerifiedApplicationRequest, clearJobApplicationDraft, loadJobAssessmentSubmission, saveJobAssessmentSubmission } from "@/lib/job-assessment-submissions";
import { useTabLock } from "@/lib/hooks/use-tab-lock";
import type { SQLTaskDto } from "../page";
import type { TaskSubmissionResponse, TaskType } from "@/types/api/tasks";
import SQLTaskSelector from "./SQLTaskSelector";
import SQLNotebook, { SQLLineBlock } from "./SQLNotebook";
import SQLResultPanel from "./SQLResultPanel";
import SQLArenaHeader from "./SQLArenaHeader";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText, ListFilter, Sparkles, BookOpen, Layers } from "lucide-react";
import { toast } from "sonner";

interface SQLArenaClientProps {
  tasks: SQLTaskDto[];
  initialTaskId?: string | null;
  jobId?: string | null;
  jobTask?: SQLTaskDto | null;
  tabLock: boolean;
  tabLockWarningLimit: number;
  requiredTaskTypes: TaskType[];
}

// Generate tabular preview simulation based on line query content
function simulateLineQueryOutput(sqlCode: string): SQLLineBlock["output"] {
  const trimmed = sqlCode.trim().toLowerCase();
  const start = performance.now();

  if (!trimmed || trimmed.startsWith("--")) {
    return {
      success: true,
      durationMs: Math.round(performance.now() - start) + 2,
      rowCount: 0,
      rows: [],
    };
  }

  const durationMs = Math.floor(Math.random() * 15) + 8;

  if (trimmed.includes("employee") || trimmed.includes("department") || trimmed.includes("salary")) {
    return {
      success: true,
      durationMs,
      rowCount: 4,
      columns: ["id", "name", "department", "salary", "status"],
      rows: [
        { id: 101, name: "Alice Zhang", department: "Engineering", salary: 125000, status: "Active" },
        { id: 102, name: "David Miller", department: "Design", salary: 98000, status: "Active" },
        { id: 103, name: "Elena Rostova", department: "Engineering", salary: 142000, status: "Active" },
        { id: 104, name: "Marcus Vance", department: "Product", salary: 118000, status: "Active" },
      ],
    };
  }

  if (trimmed.includes("order") || trimmed.includes("customer") || trimmed.includes("amount")) {
    return {
      success: true,
      durationMs,
      rowCount: 3,
      columns: ["order_id", "customer_name", "total_amount", "order_date"],
      rows: [
        { order_id: "ORD-9021", customer_name: "Acme Corp", total_amount: 4500.0, order_date: "2026-08-15" },
        { order_id: "ORD-9022", customer_name: "Global Logistics", total_amount: 1280.5, order_date: "2026-08-18" },
        { order_id: "ORD-9023", customer_name: "Vertex Labs", total_amount: 8900.0, order_date: "2026-08-20" },
      ],
    };
  }

  return {
    success: true,
    durationMs,
    rowCount: 3,
    columns: ["id", "result_name", "computed_value", "updated_at"],
    rows: [
      { id: 1, result_name: "Row Alpha", computed_value: 94.5, updated_at: "2026-09-01" },
      { id: 2, result_name: "Row Beta", computed_value: 88.2, updated_at: "2026-09-01" },
      { id: 3, result_name: "Row Gamma", computed_value: 100.0, updated_at: "2026-09-02" },
    ],
  };
}

export default function SQLArenaClient({
  tasks,
  initialTaskId,
  jobId,
  jobTask,
  tabLock,
  tabLockWarningLimit,
  requiredTaskTypes,
}: SQLArenaClientProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialTaskId || (tasks.length > 0 ? tasks[0].id : null)
  );

  const selectedTask =
    tasks.find((t) => t.id === selectedTaskId) ||
    jobTask ||
    (tasks.length > 0 ? tasks[0] : null);

  // 1 Code Block = 1 Line of Code state
  const [lines, setLines] = useState<SQLLineBlock[]>([
    { id: "line_1", code: "SELECT *", output: null },
    { id: "line_2", code: "FROM employees", output: null },
    { id: "line_3", code: "WHERE status = 'Active'", output: null },
    { id: "line_4", code: "ORDER BY salary DESC;", output: null },
  ]);

  const [result, setResult] = useState<TaskSubmissionResponse | null>(null);
  const [hasRecordedSubmission, setHasRecordedSubmission] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { tabSwitchCount } = useTabLock({
    jobId: jobId || "",
    enabled: Boolean(jobId && tabLock),
    warningLimit: tabLockWarningLimit,
  });

  useEffect(() => {
    if (!jobId || !selectedTask?.id) return;
    const refreshTimer = window.setTimeout(() => {
      setHasRecordedSubmission(Boolean(loadJobAssessmentSubmission(jobId, "SQL", selectedTask.id)));
    }, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [jobId, selectedTask?.id]);

  // Run single line block
  const handleRunLine = useCallback((lineId: string) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        const output = simulateLineQueryOutput(line.code);
        return { ...line, output };
      })
    );
    toast.success("Line executed!");
  }, []);

  // Run all line blocks sequentially
  const handleRunAll = useCallback(() => {
    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        output: simulateLineQueryOutput(line.code),
      }))
    );
    toast.success(`Executed all ${lines.length} line blocks!`);
  }, [lines.length]);

  // Submit compiled SQL query lines to backend
  const handleSubmit = () => {
    if (hasRecordedSubmission) {
      toast.info("This assessment is already recorded. Return to the job to continue your application.");
      return;
    }
    if (!selectedTask?.id) return;

    const fullScript = lines
      .map((l) => l.code)
      .filter((c) => c.trim().length > 0 && !c.trim().startsWith("--"))
      .join("\n");

    if (!fullScript.trim()) {
      toast.error("Please write your SQL query lines before submitting.");
      return;
    }

    // Extract statements split by semicolon or whole script
    const rawQueries = fullScript
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    const finalQueries = rawQueries.length > 0 ? rawQueries : [fullScript.trim()];

    startTransition(async () => {
      try {
        const res = await submitTaskAction({
          taskId: selectedTask.id,
          codes: finalQueries,
          taskType: "SQL",
        });
        setResult(res);

        if (!res.id) {
          toast.error("The server verified the task but returned no submission ID. Restart the backend with the latest task-submission fix, then submit again.");
          return;
        }
        setHasRecordedSubmission(true);

        if (jobId) {
          saveJobAssessmentSubmission(jobId, res, {
            taskId: selectedTask.id,
            taskType: "SQL",
          });
          const applicationRequest = buildVerifiedApplicationRequest(jobId, requiredTaskTypes);
          if (applicationRequest) {
            const application = await applyJobAction(jobId, applicationRequest);
            if (application.success) {
              clearJobApplicationDraft(jobId);
              toast.success("All assessments are verified. Your application has been submitted.");
            } else {
              toast.error(application.error || "Assessment recorded, but the application could not be submitted.");
            }
          }
        }

        if (res.passed) {
          toast.success("All SQL assertions passed! Result attached to your application.");
        } else {
          toast.info("SQL query evaluated and recorded for the hiring team.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Query execution failed. Please check SQL syntax.");
      }
    });
  };

  return (
    <div className="-mx-16 -my-2 flex h-[calc(100vh-105px)] bg-background text-foreground font-sans flex-col overflow-hidden">
      {/* 1. Header Bar */}
      <SQLArenaHeader
        task={selectedTask || undefined}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        isSubmitted={hasRecordedSubmission}
        jobId={jobId}
        tabLockEnabled={Boolean(jobId && tabLock)}
        tabSwitchCount={tabSwitchCount}
        tabLockWarningLimit={tabLockWarningLimit}
      />

      {/* 2. Main 2-Column Split: Instructions on Left, Line-by-Line Editor on Right */}
      <div className="flex flex-1 min-h-0 overflow-hidden divide-x divide-border">
        {/* Left Column: Problem & Instructions */}
        <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 h-full flex flex-col bg-card overflow-hidden">
          <Tabs defaultValue="description" className="h-full flex flex-col">
            <div className="px-4 py-2 border-b border-border bg-muted/30 shrink-0">
              <TabsList className="h-8 p-1 bg-muted rounded-xl">
                <TabsTrigger
                  value="description"
                  className="text-xs font-bold gap-1.5 rounded-lg"
                >
                  <FileText className="size-3.5" />
                  <span>Instructions</span>
                </TabsTrigger>
                {tasks.length > 1 && (
                  <TabsTrigger
                    value="tasks"
                    className="text-xs font-bold gap-1.5 rounded-lg"
                  >
                    <ListFilter className="size-3.5" />
                    <span>Tasks ({tasks.length})</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent
              value="description"
              className="flex-1 overflow-y-auto p-5 space-y-5 m-0"
            >
              {selectedTask ? (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1.5">
                      {selectedTask.title}
                    </h2>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      >
                        {selectedTask.skillLevel}
                      </Badge>

                      {jobId && selectedTask.id === jobTask?.id && (
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1"
                        >
                          <Sparkles className="size-3" />
                          Job Required Assessment
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-primary" />
                      <span>Challenge Instructions</span>
                    </h3>
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/30 p-4 rounded-2xl border border-border">
                      <JobMarkdown>{selectedTask.instructions}</JobMarkdown>
                    </div>
                  </div>

                  {/* Line Block Guide Card */}
                  <div className="p-4 bg-muted/20 rounded-2xl border border-border text-xs space-y-2 text-muted-foreground">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <Layers className="size-3.5 text-amber-500" />
                      <span>1 Code Block = 1 Line of Code:</span>
                    </p>
                    <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                      <li>Each block is an individual line of your SQL statement or clause.</li>
                      <li>Press <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">Enter</kbd> to spawn the next line block instantly.</li>
                      <li>Press <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">Shift + Enter</kbd> to run the current line.</li>
                      <li>Use <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">↑ / ↓</kbd> arrows to navigate between lines.</li>
                      <li>Press <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">Backspace</kbd> on an empty line to delete the block.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <Database className="size-8 mb-2 opacity-50" />
                  <p className="text-xs font-medium">Select a SQL task to view instructions</p>
                </div>
              )}
            </TabsContent>

            {tasks.length > 1 && (
              <TabsContent value="tasks" className="flex-1 overflow-y-auto p-3 m-0">
                <SQLTaskSelector
                  tasks={tasks}
                  selectedTaskId={selectedTaskId}
                  onSelect={(id) => setSelectedTaskId(id)}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right Column: Line-by-Line Code Editor & Submission Results */}
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          {selectedTask ? (
            <>
              <SQLNotebook
                lines={lines}
                setLines={setLines}
                onRunLine={handleRunLine}
                onRunAll={handleRunAll}
                isEvaluating={isPending}
              />

              {/* Bottom Result Banner */}
              {result && (
                <div className="p-4 pt-0 bg-background border-t border-border shrink-0">
                  <SQLResultPanel result={result} jobId={jobId} />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Select a task to start writing SQL code blocks
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
