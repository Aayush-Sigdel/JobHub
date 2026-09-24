"use client";

import { useSession } from "next-auth/react";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import JobMarkdown from "@/components/jobs/JobMarkdown";
import { TaskWorkspace } from "@/components/task/TaskWorkspace";
import { AssessmentSubmissionPanel } from "@/components/task/AssessmentSubmissionPanel";
import { evaluateTaskAction, submitTaskAction } from "@/lib/actions/tasks";
import {
  hasCompletedRequiredAssessments,
  loadJobAssessmentSubmission,
  saveJobAssessmentSubmission,
} from "@/lib/job-assessment-submissions";
import { AssessmentSession } from "@/components/task/AssessmentSession";
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

export default function ProgramArenaClient({
  tasks,
  initialTaskId,
  jobId,
  jobTask,
  tabLock,
  tabLockWarningLimit,
  requiredTaskTypes,
}: Props) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
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
  const [operation, setOperation] = useState<"testing" | "submitting" | null>(
    null,
  );
  const editorContainer = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const result = task ? results[task.id] : undefined;
  const recorded = Boolean(result?.id);
  const draftKey = `${task?.id}-${language}`;
  const code =
    drafts[draftKey] ?? (task ? createStarterCode(task, language) : "");

  useEffect(() => {
    if (!jobId || !task?.id) return;
    const taskId = task.id;
    const timer = window.setTimeout(() => {
      const saved = loadJobAssessmentSubmission(userId, jobId, "PROGRAMMING", taskId);
      if (saved) setResults((previous) => ({ ...previous, [taskId]: saved }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [userId, jobId, task?.id]);

  function testSolution() {
    if (!task || recorded || inFlight.current) return;
    if (!code.trim()) {
      setError("Write your solution before testing.");
      return;
    }
    inFlight.current = true;
    setError(null);
    setOperation("testing");
    setResults((previous) => {
      const next = { ...previous };
      delete next[task.id];
      return next;
    });
    startTransition(async () => {
      try {
        const response = await evaluateTaskAction({
          taskId: task.id,
          code,
          taskType: "PROGRAMMING",
          language,
        });
        setResults((previous) => ({ ...previous, [task.id]: response }));
      } catch {
        const message =
          "The evaluation service couldn't test your code. Nothing has been recorded.";
        setError(message);
      } finally {
        inFlight.current = false;
        setOperation(null);
      }
    });
  }

  function submitSolution() {
    if (!task || !result || recorded || inFlight.current) return;
    inFlight.current = true;
    setError(null);
    setOperation("submitting");
    startTransition(async () => {
      try {
        const response = await submitTaskAction({
          taskId: task.id,
          code,
          taskType: "PROGRAMMING",
          language,
        });
        if (!response.id) {
          setError("No submission was recorded. Please try again.");
          return;
        }
        setResults((previous) => ({ ...previous, [task.id]: response }));
        if (jobId) {
          try {
            saveJobAssessmentSubmission(userId, jobId, response, {
              taskId: task.id,
              taskType: "PROGRAMMING",
            });
            if (hasCompletedRequiredAssessments(userId, jobId, requiredTaskTypes)) {
              toast.success(
                "All assessments are complete. Review and submit your application.",
              );
              router.replace(`/find-job/${jobId}`);
              return;
            }
          } catch {
            toast.error(
              "Assessment recorded, but application progress could not be saved on this device.",
            );
          }
        }
      } catch {
        setError(
          "The submission could not be recorded. Your code is still here; please try again.",
        );
      } finally {
        inFlight.current = false;
        setOperation(null);
      }
    });
  }

  return (
    <AssessmentSession
      userId={userId}
      key={`${jobId}:${task?.id}`}
      jobId={jobId}
      taskId={task?.id}
      title={task?.title || "Assessment"}
      kind="Programming"
      monitored={tabLock}
      warningLimit={tabLockWarningLimit}
      completed={recorded}
    >
      <TaskWorkspace
        header={
          <ProgramArenaHeader
            task={task ?? undefined}
            language={language}
            setLanguage={(nextLanguage) => {
              setLanguage(nextLanguage);
              if (!recorded && task) {
                setResults((previous) => {
                  const next = { ...previous };
                  delete next[task.id];
                  return next;
                });
                setError(null);
              }
            }}
            onSubmit={testSolution}
            isSubmitting={isPending}
            isSubmitted={recorded}
            pendingLabel={
              operation === "submitting" ? "Submitting..." : "Testing..."
            }
            actionLabel={result ? "Test again" : "Test code"}
            jobId={jobId}
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
                        setResults((previous) =>
                          Object.fromEntries(
                            Object.entries(previous).filter(
                              ([, saved]) => saved.id,
                            ),
                          ),
                        );
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
                    These are reference examples. Test your solution to evaluate
                    it against the assessment cases before submitting.
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
          <div
            ref={editorContainer}
            className="min-h-[400px] flex-1 overflow-hidden lg:min-h-0"
          >
            <ProgramEditor
              task={task}
              language={language}
              code={code}
              setCode={(next) => {
                setDrafts((previous) => ({ ...previous, [draftKey]: next }));
                if (!recorded) {
                  setResults((previous) => {
                    const nextResults = { ...previous };
                    delete nextResults[task.id];
                    return nextResults;
                  });
                  setError(null);
                }
              }}
              readOnly={isPending || recorded}
            />
          </div>
        )}
        <AssessmentSubmissionPanel
          result={result}
          error={error}
          jobId={jobId}
          busy={operation}
          disabled={isPending || !task}
          onEdit={() =>
            editorContainer.current
              ?.querySelector<HTMLElement>('[contenteditable="true"]')
              ?.focus()
          }
          onRetry={testSolution}
          onSubmit={submitSolution}
        />
      </TaskWorkspace>
    </AssessmentSession>
  );
}
