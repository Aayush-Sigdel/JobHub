"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import JobMarkdown from "@/components/jobs/JobMarkdown";
import { TaskWorkspace } from "@/components/task/TaskWorkspace";
import { TaskResult } from "@/components/task/TaskResult";
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
import ProgramEditor, { createStarterCode } from "./ProgramEditor";
import ProgramArenaHeader from "./ProgramArenaHeader";
import { toast } from "sonner";

interface Props {
  tasks: ProgrammingTaskDto[];
  initialTaskId?: string | null;
  jobId?: string | null;
  jobTask?: ProgrammingTaskDto | null;
  tabLock: boolean;
  tabLockWarningLimit: number;
  requiredTaskTypes: TaskType[];
}

function runnerUnavailable(message?: string) {
  return Boolean(
    message &&
    ([
      "error: file not found: Solution.java",
      "error: file not found: Driver.java",
      "Cannot connect to the Docker daemon",
      "Failed to relax sandbox work directory permissions",
    ].some((text) => message.includes(text)) ||
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
}: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState(
    initialTaskId || tasks[0]?.id,
  );
  const task = jobId
    ? jobTask
    : tasks.find((item) => item.id === selectedTaskId);
  const [language, setLanguage] = useState<"JAVA" | "PYTHON">("JAVA");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [results, setResults] = useState<
    Record<string, TaskSubmissionResponse>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const result = task ? results[task.id] : undefined;
  const recorded = Boolean(result?.id && !runnerUnavailable(result.message));
  const draftKey = `${task?.id}-${language}`;
  const code =
    drafts[draftKey] ?? (task ? createStarterCode(task, language) : "");
  const { tabSwitchCount } = useTabLock({
    jobId: jobId || "",
    enabled: Boolean(jobId && tabLock),
    warningLimit: tabLockWarningLimit,
  });

  useEffect(() => {
    if (!jobId || !task?.id) return;
    const taskId = task.id;
    const timer = window.setTimeout(() => {
      const saved = loadJobAssessmentSubmission(jobId, "PROGRAMMING", taskId);
      if (saved) setResults((previous) => ({ ...previous, [taskId]: saved }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [jobId, task?.id]);

  function submit() {
    if (!task || recorded || inFlight.current) return;
    if (!code.trim()) {
      setError("Write your solution before submitting.");
      return;
    }
    inFlight.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const response = await submitTaskAction({
          taskId: task.id,
          code,
          taskType: "PROGRAMMING",
          language,
        });
        setResults((previous) => ({ ...previous, [task.id]: response }));
        if (runnerUnavailable(response.message)) {
          setError(
            "The code runner is unavailable. Your code is still here; try again when the service is restored.",
          );
          return;
        }
        if (!response.id) {
          setError("No submission was recorded. Please try again.");
          return;
        }
        if (jobId) {
          try {
            saveJobAssessmentSubmission(jobId, response, {
              taskId: task.id,
              taskType: "PROGRAMMING",
            });
            const request = buildVerifiedApplicationRequest(
              jobId,
              requiredTaskTypes,
            );
            if (request) {
              const application = await applyJobAction(jobId, request);
              if (application.success) {
                clearJobApplicationDraft(jobId);
                toast.success("Your application has been submitted.");
              } else
                toast.error(
                  "Assessment saved. Return to the job to finish your application.",
                );
            }
          } catch {
            toast.error(
              "Assessment recorded, but application progress could not be saved on this device.",
            );
          }
        }
      } catch {
        setError(
          "The evaluation service couldn't complete your submission. Your code is still here; please try again.",
        );
      } finally {
        inFlight.current = false;
      }
    });
  }

  return (
    <TaskWorkspace
      header={
        <ProgramArenaHeader
          task={task ?? undefined}
          language={language}
          setLanguage={setLanguage}
          onSubmit={submit}
          isSubmitting={isPending}
          isSubmitted={recorded}
          jobId={jobId}
          tabLockEnabled={Boolean(jobId && tabLock)}
          tabSwitchCount={tabSwitchCount}
          tabLockWarningLimit={tabLockWarningLimit}
        />
      }
      sidebar={
        <div className="space-y-6 p-5">
          {!jobId && tasks.length > 1 && (
            <details className="border-b pb-4">
              <summary className="cursor-pointer text-sm font-medium">
                Choose assessment
              </summary>
              <div className="mt-3 space-y-1">
                {tasks.map((item) => (
                  <button
                    key={item.id}
                    disabled={isPending}
                    aria-pressed={task?.id === item.id}
                    onClick={() => {
                      setSelectedTaskId(item.id);
                      setError(null);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted ${task?.id === item.id ? "bg-muted font-medium" : "text-muted-foreground"}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </details>
          )}
          {task ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Instructions</h2>
                <span className="rounded-md bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
                  {task.skillLevel.toLowerCase()}
                </span>
              </div>
              <JobMarkdown>{task.instructions}</JobMarkdown>
              <section className="space-y-3 border-t pt-5">
                <h3 className="text-sm font-medium">Function signature</h3>
                <dl className="space-y-2 font-mono text-xs leading-relaxed">
                  <div>
                    <dt className="text-muted-foreground">Method</dt>
                    <dd className="break-all">{task.methodName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Parameters</dt>
                    <dd className="break-words">
                      {task.parameters
                        .map(
                          (parameter) =>
                            `${parameter.name} (${parameter.type})`,
                        )
                        .join(", ") || "None"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Returns</dt>
                    <dd>{task.returnType}</dd>
                  </div>
                </dl>
              </section>
              <section className="space-y-3 border-t pt-5">
                <h3 className="text-sm font-medium">Example cases</h3>
                {task.exampleTestCases?.length ? (
                  task.exampleTestCases.map((example, index) => (
                    <div
                      key={index}
                      className="space-y-2 rounded-lg bg-muted/40 p-3"
                    >
                      <p className="text-xs text-muted-foreground">
                        Example {index + 1}
                      </p>
                      <dl className="space-y-2 text-xs">
                        <div>
                          <dt className="text-muted-foreground">Input</dt>
                          <dd className="mt-1 whitespace-pre-wrap break-all font-mono">
                            {JSON.stringify(example.input)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Expected output
                          </dt>
                          <dd className="mt-1 whitespace-pre-wrap break-all font-mono">
                            {JSON.stringify(example.expectedOutput)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No example cases provided.
                  </p>
                )}
                <p className="text-xs leading-relaxed text-muted-foreground">
                  These are reference examples. Submit your solution to evaluate
                  it against the assessment tests.
                </p>
              </section>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No assessment is available. Return to the job and try again.
            </p>
          )}
        </div>
      }
    >
      {task && (
        <div className="min-h-[400px] flex-1 overflow-hidden lg:min-h-0">
          <ProgramEditor
            task={task}
            language={language}
            code={code}
            setCode={(next) =>
              setDrafts((previous) => ({ ...previous, [draftKey]: next }))
            }
            readOnly={isPending}
          />
        </div>
      )}
      <TaskResult result={result} error={error} jobId={jobId} />
    </TaskWorkspace>
  );
}
