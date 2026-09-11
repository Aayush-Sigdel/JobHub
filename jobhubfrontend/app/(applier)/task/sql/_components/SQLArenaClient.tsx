"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import JobMarkdown from "@/components/jobs/JobMarkdown";
import CodeEditor from "@/components/task/CodeEditor";
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
import { sqlLinesForSubmission } from "@/lib/task/sql-lines";
import { useTabLock } from "@/lib/hooks/use-tab-lock";
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
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const result = task ? results[task.id] : undefined;
  const code = task
    ? (drafts[task.id] ?? "")
    : "";
  const { tabSwitchCount } = useTabLock({
    jobId: jobId || "",
    enabled: Boolean(jobId && tabLock),
    warningLimit: tabLockWarningLimit,
  });

  useEffect(() => {
    if (!jobId || !task?.id) return;
    const taskId = task.id;
    const timer = window.setTimeout(() => {
      const saved = loadJobAssessmentSubmission(jobId, "SQL", taskId);
      if (saved) setResults((previous) => ({ ...previous, [taskId]: saved }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [jobId, task?.id]);

  function submit() {
    if (!task || result?.id || inFlight.current) return;
    const queries = sqlLinesForSubmission(code);
    if (!queries.length) {
      setError("Write at least one SQL statement before submitting.");
      return;
    }
    inFlight.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const response = await submitTaskAction({
          taskId: task.id,
          taskType: "SQL",
          codes: queries,
        });
        setResults((previous) => ({ ...previous, [task.id]: response }));
        if (!response.id) {
          setError("No submission was recorded. Please try again.");
          return;
        }
        if (jobId) {
          try {
            saveJobAssessmentSubmission(jobId, response, {
              taskId: task.id,
              taskType: "SQL",
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
          "The evaluation service couldn't complete your submission. Your SQL is still here; please try again.",
        );
      } finally {
        inFlight.current = false;
      }
    });
  }

  return (
    <TaskWorkspace
      header={
        <SQLArenaHeader
          task={task ?? undefined}
          onSubmit={submit}
          isSubmitting={isPending}
          isSubmitted={Boolean(result?.id)}
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
                <h3 className="text-sm font-medium">Writing your solution</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Write one complete query per line using the tables described
                  above. Each non-empty line is sent and executed separately.
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Submit your solution to run it against the assessment
                  database. The result appears below your editor.
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
          <CodeEditor
            value={code}
            onChange={(next) =>
              setDrafts((previous) => ({ ...previous, [task.id]: next }))
            }
            fileName="solution.sql"
            language="SQL"
            readOnly={isPending}
          />
        </div>
      )}
      <TaskResult result={result} error={error} jobId={jobId} />
    </TaskWorkspace>
  );
}
