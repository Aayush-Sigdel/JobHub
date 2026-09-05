"use client";

import React, { useEffect, useState, useTransition } from "react";
import { submitTaskAction } from "@/lib/actions/tasks";
import { applyJobAction } from "@/lib/actions/jobs";
import {
  buildVerifiedApplicationRequest,
  clearJobApplicationDraft,
  loadJobAssessmentSubmission,
  saveJobAssessmentSubmission,
} from "@/lib/job-assessment-submissions";
import { useTabLock } from "@/lib/hooks/use-tab-lock";
import type { ProgrammingTaskDto } from "../page";
import type { TaskSubmissionResponse, TaskType } from "@/types/api/tasks";
import ProgramTaskSelector from "./ProgramTaskSelector";
import ProgramEditor from "./ProgramEditor";
import TestCasePanel from "./TestCasePanel";
import ProgramArenaHeader from "./ProgramArenaHeader";
import SubmissionResultModal from "./SubmissionResultModal";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ListFilter, Sparkles, Code2 } from "lucide-react";
import { toast } from "sonner";

interface ProgramArenaClientProps {
  tasks: ProgrammingTaskDto[];
  initialTaskId?: string | null;
  jobId?: string | null;
  jobTask?: ProgrammingTaskDto | null;
  tabLock: boolean;
  tabLockWarningLimit: number;
  requiredTaskTypes: TaskType[];
}

const RUNNER_INFRASTRUCTURE_ERRORS = [
  "error: file not found: Solution.java",
  "error: file not found: Driver.java",
  "Cannot connect to the Docker daemon",
  "Failed to relax sandbox work directory permissions",
];

function isRunnerInfrastructureFailure(message?: string) {
  return Boolean(
    message &&
    (RUNNER_INFRASTRUCTURE_ERRORS.some((errorText) =>
      message.includes(errorText),
    ) ||
      (message.includes("Docker image '") &&
        message.includes("' does not exist"))),
  );
}

export default function ProgramArenaClient({
  tasks,
  initialTaskId,
  jobId,
  jobTask,
  tabLock,
  tabLockWarningLimit,
  requiredTaskTypes,
}: ProgramArenaClientProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialTaskId || (tasks.length > 0 ? tasks[0].id : null),
  );
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<"JAVA" | "PYTHON">("JAVA");
  const [result, setResult] = useState<TaskSubmissionResponse | null>(null);
  const [hasRecordedSubmission, setHasRecordedSubmission] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { tabSwitchCount } = useTabLock({
    jobId: jobId || "",
    enabled: Boolean(jobId && tabLock),
    warningLimit: tabLockWarningLimit,
  });

  const selectedTask =
    tasks.find((t) => t.id === selectedTaskId) ||
    jobTask ||
    (tasks.length > 0 ? tasks[0] : null);

  useEffect(() => {
    if (!jobId || !selectedTask?.id) return;
    const refreshTimer = window.setTimeout(() => {
      setHasRecordedSubmission(
        Boolean(
          loadJobAssessmentSubmission(jobId, "PROGRAMMING", selectedTask.id),
        ),
      );
    }, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [jobId, selectedTask?.id]);

  const handleSubmit = () => {
    if (hasRecordedSubmission) {
      toast.info(
        "This assessment is already recorded. Return to the job to continue your application.",
      );
      return;
    }
    if (!selectedTask?.id) return;
    if (!code.trim()) {
      toast.error("Please write your solution code before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitTaskAction({
          taskId: selectedTask.id,
          code,
          taskType: "PROGRAMMING",
          language,
        });
        setResult(res);

        if (isRunnerInfrastructureFailure(res.message)) {
          toast.error(
            "The code runner is unavailable. Your editor remains unlocked so you can try again after it is restored.",
          );
          return;
        }

        if (!res.id) {
          toast.error(
            "The server verified the task but returned no submission ID. Restart the backend with the latest task-submission fix, then submit again.",
          );
          return;
        }
        setHasRecordedSubmission(true);

        if (jobId) {
          saveJobAssessmentSubmission(jobId, res, {
            taskId: selectedTask.id,
            taskType: "PROGRAMMING",
          });
          const applicationRequest = buildVerifiedApplicationRequest(
            jobId,
            requiredTaskTypes,
          );
          if (applicationRequest) {
            const application = await applyJobAction(jobId, applicationRequest);
            if (application.success) {
              clearJobApplicationDraft(jobId);
              toast.success(
                "All assessments are verified. Your application has been submitted.",
              );
            } else {
              toast.error(
                application.error ||
                  "Assessment recorded, but the application could not be submitted.",
              );
            }
          }
        }

        if (res.passed) {
          toast.success("All test cases passed! Result saved to application.");
        } else {
          toast.info("Assessment submitted and recorded for the hiring team.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Submission failed. Please check your syntax.");
      }
    });
  };

  return (
    <div className="-mx-16 -my-2 flex h-[calc(100vh-105px)] bg-background text-foreground font-sans flex-col overflow-hidden">
      <ProgramArenaHeader
        task={selectedTask || undefined}
        language={language}
        setLanguage={setLanguage}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        isSubmitted={hasRecordedSubmission}
        jobId={jobId}
        tabLockEnabled={Boolean(jobId && tabLock)}
        tabSwitchCount={tabSwitchCount}
        tabLockWarningLimit={tabLockWarningLimit}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden divide-x divide-border">
        {/* Left Side: Problem Description & Task List */}
        <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 h-full flex flex-col bg-card overflow-hidden">
          <Tabs defaultValue="description" className="h-full flex flex-col">
            <div className="px-4 py-2 border-b border-border bg-muted/30 shrink-0">
              <TabsList className="h-8 p-1 bg-muted rounded-xl">
                <TabsTrigger
                  value="description"
                  className="text-xs font-bold gap-1.5 rounded-lg"
                >
                  <FileText className="size-3.5" />
                  <span>Problem</span>
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

            {/* Problem Tab */}
            <TabsContent
              value="description"
              className="flex-1 overflow-y-auto p-5 space-y-5 m-0"
            >
              {selectedTask ? (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h2 className="text-xl font-bold text-foreground">
                        {selectedTask.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
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

                  {/* Problem Instructions */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Description
                    </h3>
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/30 p-4 rounded-2xl border border-border">
                      {selectedTask.instructions}
                    </div>
                  </div>

                  {/* Method Signature Specs */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Function Signature
                    </h3>
                    <div className="p-3.5 bg-muted/40 rounded-xl border border-border font-mono text-xs space-y-1">
                      <div className="text-muted-foreground">
                        Method:{" "}
                        <strong className="text-foreground">
                          {selectedTask.methodName}
                        </strong>
                      </div>
                      <div className="text-muted-foreground">
                        Parameters:{" "}
                        <span className="text-foreground">
                          {selectedTask.parameters
                            ?.map((p) => `${p.name} (${p.type})`)
                            .join(", ") || "None"}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Return:{" "}
                        <span className="text-primary font-bold">
                          {selectedTask.returnType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Example Test Cases */}
                  {selectedTask.exampleTestCases?.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Example Test Cases
                      </h3>
                      <div className="space-y-2">
                        {selectedTask.exampleTestCases.map((tc, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-border bg-muted/20 font-mono text-xs space-y-1"
                          >
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              Example {idx + 1}
                            </span>
                            <div>
                              <strong className="text-muted-foreground">
                                Input:{" "}
                              </strong>
                              <span className="text-foreground">
                                {JSON.stringify(tc.input)}
                              </span>
                            </div>
                            <div>
                              <strong className="text-muted-foreground">
                                Expected:{" "}
                              </strong>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {JSON.stringify(tc.expectedOutput)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <Code2 className="size-8 mb-2 opacity-50" />
                  <p className="text-xs font-medium">
                    Select a task to view description
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Task List Tab */}
            {tasks.length > 1 && (
              <TabsContent
                value="tasks"
                className="flex-1 overflow-y-auto p-3 m-0"
              >
                <ProgramTaskSelector
                  tasks={tasks}
                  selectedTaskId={selectedTaskId}
                  onSelect={(id) => setSelectedTaskId(id)}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right Side: Code Editor & Test Case Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-card overflow-hidden">
          {selectedTask ? (
            <>
              {/* Code Editor */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ProgramEditor
                  task={selectedTask}
                  language={language}
                  setCode={setCode}
                />
              </div>

              {/* Bottom Test Case Panel */}
              <div className="h-[220px] shrink-0 border-t border-border bg-muted/20 overflow-hidden flex flex-col">
                <TestCasePanel
                  testCases={selectedTask.exampleTestCases || []}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Select a task to start coding
            </div>
          )}
        </div>
      </div>

      {result && (
        <SubmissionResultModal
          result={result}
          onClose={() => setResult(null)}
          jobId={jobId}
        />
      )}
    </div>
  );
}
