"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TaskHeader } from "@/components/task/TaskWorkspace";
import { CssBattleWorkspace } from "@/components/task/CssBattleWorkspace";
import { submitTaskAction, getDesignTasksAction } from "@/lib/actions/tasks";
import { applyJobAction, getJobDetailAction } from "@/lib/actions/jobs";
import {
  buildVerifiedApplicationRequest,
  clearJobApplicationDraft,
  loadJobAssessmentSubmission,
  saveJobAssessmentSubmission,
} from "@/lib/job-assessment-submissions";
import { getJobApplicationAvailability } from "@/lib/job-application-availability";
import { useTabLock } from "@/lib/hooks/use-tab-lock";
import { toast } from "sonner";
import type {
  DesignTaskDto,
  TaskSubmissionResponse,
  TaskType,
} from "@/types/api/tasks";

const INITIAL_CODE = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; }
    /* Recreate the target with your styles. */
  </style>
</head>
<body>
  <div></div>
</body>
</html>`;

function CSSAssessment() {
  const params = useSearchParams();
  const jobId = params.get("jobId");
  const requestedTaskId = params.get("taskId");
  const [task, setTask] = useState<DesignTaskDto | null>(null);
  const [code, setCode] = useState(INITIAL_CODE);
  const [preview, setPreview] = useState(INITIAL_CODE);
  const [result, setResult] = useState<TaskSubmissionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [tabLock, setTabLock] = useState(false);
  const [warningLimit, setWarningLimit] = useState(0);
  const [requiredTaskTypes, setRequiredTaskTypes] = useState<TaskType[]>([]);
  const { tabSwitchCount } = useTabLock({
    jobId: jobId || "",
    enabled: Boolean(jobId && tabLock),
    warningLimit,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setPreview(code), 150);
    return () => window.clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setTask(null);
      setLoadError(null);
      setResult(null);
      setCode(INITIAL_CODE);
      setPreview(INITIAL_CODE);
      setError(null);
      setTabLock(false);
      setWarningLimit(0);
      setRequiredTaskTypes([]);
      try {
        let selected: DesignTaskDto | undefined;
        if (jobId) {
          const detail = await getJobDetailAction(jobId);
          if (cancelled) return;
          const availability = getJobApplicationAvailability(detail.job);
          if (!availability.canApply) throw new Error(availability.reason);
          selected = detail.designTask;
          setTabLock(detail.job.tabLock);
          setWarningLimit(detail.job.tabLockWarningLimit);
          setRequiredTaskTypes(
            [
              detail.job.hasDesignTask && "DESIGN",
              detail.job.hasProgrammingTask && "PROGRAMMING",
              detail.job.hasSqlTask && "SQL",
            ].filter((type): type is TaskType => Boolean(type)),
          );
        } else {
          const tasks = await getDesignTasksAction();
          selected = requestedTaskId
            ? tasks.find((item) => item.id === requestedTaskId)
            : tasks[0];
        }
        if (cancelled) return;
        if (!selected || (requestedTaskId && selected.id !== requestedTaskId)) {
          setLoadError(
            "The assigned design assessment is unavailable. Return to the job to check its assessments.",
          );
          return;
        }
        setTask(selected);
        if (jobId)
          setResult(
            loadJobAssessmentSubmission(jobId, "DESIGN", selected.id) ?? null,
          );
      } catch {
        if (!cancelled)
          setLoadError(
            "We couldn't load this assessment. The job may be closed or the service may be unavailable.",
          );
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [jobId, requestedTaskId, retry]);

  async function submit() {
    if (!task || result?.id || submitInFlight.current) return;
    if (!code.trim()) {
      setError("Write your solution before submitting.");
      return;
    }
    submitInFlight.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      // The submitted HTML is scored only by /task/submit. Preview never determines a score or pass/fail.
      const response = await submitTaskAction({
        taskId: task.id,
        taskType: "DESIGN",
        code,
      });
      setResult(response);
      if (!response.id) {
        setError("No submission was recorded. Please try again.");
        return;
      }
      if (jobId) {
        try {
          saveJobAssessmentSubmission(jobId, response, {
            taskId: task.id,
            taskType: "DESIGN",
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
      setIsSubmitting(false);
      submitInFlight.current = false;
    }
  }

  if (loadError)
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-lg font-semibold">Assessment unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        <div className="mt-5 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </Button>
          <Button asChild>
            <Link href={jobId ? `/find-job/${jobId}` : "/find-job"}>
              Return to jobs
            </Link>
          </Button>
        </div>
      </div>
    );
  if (!task)
    return (
      <div className="p-10 text-sm text-muted-foreground" role="status">
        Loading design assessment…
      </div>
    );

  return (
    <CssBattleWorkspace
      key={task.id}
      header={
        <TaskHeader
          title={task.title}
          kind="HTML & CSS"
          jobId={jobId}
          onSubmit={submit}
          isSubmitting={isSubmitting}
          isSubmitted={Boolean(result?.id)}
          tabLockEnabled={tabLock}
          tabSwitchCount={tabSwitchCount}
          tabLockWarningLimit={warningLimit}
        />
      }
      task={task}
      code={code}
      preview={preview}
      onCodeChange={setCode}
      isSubmitting={isSubmitting}
      result={result}
      error={error}
      jobId={jobId}
    />
  );
}

export default function CSSAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-sm text-muted-foreground">
          Loading assessment…
        </div>
      }
    >
      <CSSAssessment />
    </Suspense>
  );
}
