"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import JobMarkdown from "@/components/jobs/JobMarkdown";
import CodeEditor from "@/components/task/CodeEditor";
import { TaskWorkspace } from "@/components/task/TaskWorkspace";
import { AssessmentSubmissionPanel } from "@/components/task/AssessmentSubmissionPanel";
import { evaluateTaskAction, submitTaskAction } from "@/lib/actions/tasks";
import {
  hasCompletedRequiredAssessments,
  loadJobAssessmentSubmission,
  saveJobAssessmentSubmission,
} from "@/lib/job-assessment-submissions";
import { sqlStatementsFromPaste } from "@/lib/task/sql-statements";
import { AssessmentSession } from "@/components/task/AssessmentSession";
import type { SQLTaskDto } from "../page";
import type { TaskSubmissionResponse, TaskType } from "@/types/api/tasks";
import SQLArenaHeader from "./SQLArenaHeader";
import { toast } from "sonner";

interface Props {
  tasks: SQLTaskDto[];
  initialTaskId?: string | null;
  jobId?: string | null;
  jobTask?: SQLTaskDto | null;
  tabLock: boolean;
  tabLockWarningLimit: number;
  requiredTaskTypes: TaskType[];
}

export default function SQLArenaClient({
  tasks,
  initialTaskId,
  jobId,
  jobTask,
  tabLock,
  tabLockWarningLimit,
  requiredTaskTypes,
}: Props) {
  const router = useRouter();
  const [selectedTaskId, setSelectedTaskId] = useState(
    initialTaskId || tasks[0]?.id,
  );
  const task = jobId
    ? jobTask
    : tasks.find((item) => item.id === selectedTaskId);
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
  const code = task ? (drafts[task.id] ?? "") : "";

  useEffect(() => {
    if (!jobId || !task?.id) return;
    const taskId = task.id;
    const timer = window.setTimeout(() => {
      const saved = loadJobAssessmentSubmission(jobId, "SQL", taskId);
      if (saved) setResults((previous) => ({ ...previous, [taskId]: saved }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [jobId, task?.id]);

  function testSolution() {
    if (!task || result?.id || inFlight.current) return;
    const queries = sqlStatementsFromPaste(code);
    if (!queries.length) {
      setError("Write at least one SQL statement before testing.");
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
          taskType: "SQL",
          codes: queries,
        });
        setResults((previous) => ({ ...previous, [task.id]: response }));
      } catch {
        const message =
          "The evaluation service couldn't test your SQL. Nothing has been recorded.";
        setError(message);
      } finally {
        inFlight.current = false;
        setOperation(null);
      }
    });
  }

  function submitSolution() {
    if (!task || !result || result.id || inFlight.current) return;
    const queries = sqlStatementsFromPaste(code);
    if (!queries.length) return;
    inFlight.current = true;
    setError(null);
    setOperation("submitting");
    startTransition(async () => {
      try {
        const response = await submitTaskAction({
          taskId: task.id,
          taskType: "SQL",
          codes: queries,
        });
        if (!response.id) {
          setError("No submission was recorded. Please try again.");
          return;
        }
        setResults((previous) => ({ ...previous, [task.id]: response }));
        if (jobId) {
          try {
            saveJobAssessmentSubmission(jobId, response, {
              taskId: task.id,
              taskType: "SQL",
            });
            if (hasCompletedRequiredAssessments(jobId, requiredTaskTypes)) {
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
          "The submission could not be recorded. Your SQL is still here; please try again.",
        );
      } finally {
        inFlight.current = false;
        setOperation(null);
      }
    });
  }

  return (
    <AssessmentSession
      key={`${jobId}:${task?.id}`}
      jobId={jobId}
      taskId={task?.id}
      title={task?.title || "Assessment"}
      kind="SQL"
      monitored={tabLock}
      warningLimit={tabLockWarningLimit}
      completed={Boolean(result?.id)}
    >
      <TaskWorkspace
        header={
          <SQLArenaHeader
            task={task ?? undefined}
            onSubmit={testSolution}
            isSubmitting={isPending}
            isSubmitted={Boolean(result?.id)}
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
                  <h3 className="text-sm font-medium">Writing your solution</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Use the tables described above. Queries can span multiple
                    lines; separate complete queries with semicolons.
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Test your solution against the assessment database before
                    deciding whether to submit it.
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
            <CodeEditor
              value={code}
              onChange={(next) => {
                setDrafts((previous) => ({ ...previous, [task.id]: next }));
                if (!result?.id) {
                  setResults((previous) => {
                    const nextResults = { ...previous };
                    delete nextResults[task.id];
                    return nextResults;
                  });
                  setError(null);
                }
              }}
              fileName="solution.sql"
              language="SQL"
              readOnly={isPending || Boolean(result?.id)}
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
