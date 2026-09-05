"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import CodeEditor from "@/components/task/CodeEditor";
import CssArenaHeader from "@/components/task/CssArenaHeader";
import CodeOutputCanvas from "@/components/task/CodeOutputCanvas";
import TargetGoalCanvas from "@/components/task/TargetGoalCanvas";
import SubmitConfirmModal from "@/components/task/SubmitConfirmModal";
import {
  DEFAULT_CSS_TASK,
  PASSING_TOLERANCE,
  ScoreResult,
  DesignTask,
} from "@/lib/task/css_data";
import { evaluateCssCode } from "@/lib/task/css_evaluator";
import { submitTaskAction } from "@/lib/actions/tasks";
import { applyJobAction, getJobDetailAction } from "@/lib/actions/jobs";
import { buildVerifiedApplicationRequest, clearJobApplicationDraft, loadJobAssessmentSubmission, saveJobAssessmentSubmission } from "@/lib/job-assessment-submissions";
import { getJobApplicationAvailability } from "@/lib/job-application-availability";
import { useTabLock } from "@/lib/hooks/use-tab-lock";
import { toast } from "sonner";
import type { TaskSubmissionResponse, TaskType } from "@/types/api/tasks";

function imageDataUrl(imageBytes: string, contentType?: string) {
  return `data:${contentType || "image/png"};base64,${imageBytes}`;
}

function CSSBattleContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const requestedTaskId = searchParams.get("taskId");

  const [currentTask, setCurrentTask] = useState<
    DesignTask & { imageBytes?: string; imageContentType?: string }
  >(DEFAULT_CSS_TASK);

  // Live Editor Code Ref & Debounced Preview State
  const latestCodeRef = useRef<string>(DEFAULT_CSS_TASK.initialCode);
  const [debouncedPreviewCode, setDebouncedPreviewCode] = useState<string>(
    DEFAULT_CSS_TASK.initialCode
  );

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastScore, setLastScore] = useState<ScoreResult | null>(null);
  const [highScore, setHighScore] = useState<ScoreResult | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false);
  const [backendSubmission, setBackendSubmission] = useState<TaskSubmissionResponse | null>(null);
  const [codeLength, setCodeLength] = useState(DEFAULT_CSS_TASK.initialCode.length);
  const [tabLock, setTabLock] = useState(false);
  const [tabLockWarningLimit, setTabLockWarningLimit] = useState(0);
  const [requiredTaskTypes, setRequiredTaskTypes] = useState<TaskType[]>([]);
  const [jobTaskState, setJobTaskState] = useState<"loading" | "ready" | "error" | "closed">(
    jobId ? "loading" : "ready"
  );
  const [jobTaskError, setJobTaskError] = useState("We could not load the assessment assigned to this job.");
  const { tabSwitchCount } = useTabLock({
    jobId: jobId || "",
    enabled: Boolean(jobId && tabLock),
    warningLimit: tabLockWarningLimit,
  });

  useEffect(() => {
    async function loadJobTask() {
      if (!jobId) {
        setJobTaskState("ready");
        return;
      }

      setJobTaskState("loading");
      try {
        const detail = await getJobDetailAction(jobId);
        const availability = getJobApplicationAvailability(detail.job);
        if (!availability.canApply) {
          setJobTaskError(availability.reason);
          setJobTaskState("closed");
          return;
        }
        const designTask = detail.designTask;
        if (!designTask || (requestedTaskId && designTask.id !== requestedTaskId)) {
          throw new Error("The assigned design assessment is unavailable.");
        }

        setTabLock(detail.job.tabLock);
        setTabLockWarningLimit(detail.job.tabLockWarningLimit);
        setRequiredTaskTypes([
          detail.job.hasDesignTask && "DESIGN",
          detail.job.hasProgrammingTask && "PROGRAMMING",
          detail.job.hasSqlTask && "SQL",
        ].filter((taskType): taskType is TaskType => Boolean(taskType)));
        setCurrentTask((previousTask) => ({
          ...previousTask,
          id: designTask.id,
          title: designTask.title,
          instructions: designTask.instructions,
          minimumMatchingScore: designTask.minimumMatchingScore,
          skillLevel: designTask.skillLevel,
          imageBytes: designTask.imageBytes,
          imageContentType: designTask.imageContentType,
        }));
        const existingSubmission = loadJobAssessmentSubmission(jobId, "DESIGN", designTask.id);
        if (existingSubmission) {
          setBackendSubmission(existingSubmission);
          setHasSubmittedSuccessfully(true);
        }
        setJobTaskState("ready");
      } catch {
        setJobTaskState("error");
      }
    }
    loadJobTask();
  }, [jobId, requestedTaskId]);

  // Target score qualification check
  const isTargetScoreMet = useMemo(() => {
    return (
      lastScore !== null &&
      lastScore.matchPct >= currentTask.minimumMatchingScore - PASSING_TOLERANCE
    );
  }, [lastScore, currentTask.minimumMatchingScore]);

  const isSubmitLocked = hasSubmittedSuccessfully || (!jobId && !isTargetScoreMet);
  const submitLockMessage = hasSubmittedSuccessfully
    ? "This assessment is already recorded. Return to the job to continue your application."
    : jobId
    ? "Submit your current solution for server-side evaluation. The recruiter can review both passing and non-passing submissions."
    : `Submission locked: Reach ≥ ${currentTask.minimumMatchingScore}% match to submit (Current: ${
    lastScore ? `${lastScore.matchPct}%` : "Not tested yet"
  })`;

  // Debounce iframe rendering for 120 FPS typing performance
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleCodeChange = useCallback((code: string) => {
    latestCodeRef.current = code;
    setCodeLength(code.length);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedPreviewCode(code);
    }, 75);
  }, []);

  // Run Test Evaluation using the dedicated evaluator engine
  const handleTest = useCallback(async () => {
    setIsTesting(true);
    toast.info("Evaluating code...");
    try {
      const isImage = Boolean(currentTask.imageBytes && currentTask.imageBytes.length > 0);
      const targetSource = isImage
        ? imageDataUrl(currentTask.imageBytes!, currentTask.imageContentType)
        : currentTask.targetHtml;

      const result = await evaluateCssCode(
        latestCodeRef.current,
        targetSource,
        currentTask.viewport.width,
        currentTask.viewport.height,
        isImage
      );
      setLastScore(result);
      setHighScore((prev) =>
        !prev || result.score > prev.score ? result : prev
      );

      if (result.matchPct >= currentTask.minimumMatchingScore - PASSING_TOLERANCE) {
        toast.success(
          `Target met: ${result.matchPct}% match.`
        );
      } else {
        toast.info(
          jobId
            ? `Preview score: ${result.matchPct}%. You can still submit this result for recruiter review.`
            : `Test result: ${result.matchPct}% match. Reach ${currentTask.minimumMatchingScore}% to submit.`
        );
      }
    } catch {
      toast.error("Evaluation failed. Please check your syntax.");
    } finally {
      setIsTesting(false);
    }
  }, [currentTask, jobId]);

  // Client-side UI final submission confirmation and backend API submission
  const handleConfirmSubmit = useCallback(async () => {
    if (isSubmitLocked) {
      toast.warning(submitLockMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      const isImage = Boolean(currentTask.imageBytes && currentTask.imageBytes.length > 0);
      const targetSource = isImage
        ? imageDataUrl(currentTask.imageBytes!, currentTask.imageContentType)
        : currentTask.targetHtml;

      const localResult = await evaluateCssCode(
        latestCodeRef.current,
        targetSource,
        currentTask.viewport.width,
        currentTask.viewport.height,
        isImage
      );
      setLastScore(localResult);
      setHighScore((prev) =>
        !prev || localResult.score > prev.score ? localResult : prev
      );

      // Submit to backend
      const submissionResponse = await submitTaskAction({
        taskId: currentTask.id,
        taskType: "DESIGN",
        code: latestCodeRef.current,
      });
      setBackendSubmission(submissionResponse);

      if (!submissionResponse.id) {
        toast.error("The server verified the task but returned no submission ID. Restart the backend with the latest task-submission fix, then submit again.");
        return;
      }

      if (jobId) {
        saveJobAssessmentSubmission(jobId, submissionResponse, {
          taskId: currentTask.id,
          taskType: "DESIGN",
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

      setHasSubmittedSuccessfully(true);
      toast.success("CSS Battle Assessment submitted and attached to your application!");
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please check your code.");
    } finally {
      setIsSubmitting(false);
    }
  }, [currentTask, isSubmitLocked, jobId, requiredTaskTypes, submitLockMessage]);

  if (jobTaskState === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading assigned design assessment...</div>;
  }

  if (jobTaskState === "error") {
    return <div className="mx-auto mt-16 max-w-md rounded-lg border bg-card p-6 text-center"><h1 className="text-lg font-semibold">Design assessment unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{jobTaskError} Return to the job and try again.</p>{jobId && <Button asChild className="mt-5"><Link href={`/find-job/${jobId}`}>Return to job</Link></Button>}</div>;
  }

  if (jobTaskState === "closed") {
    return <div className="mx-auto mt-16 max-w-md rounded-lg border bg-card p-6 text-center"><h1 className="text-lg font-semibold">Assessment unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{jobTaskError}</p>{jobId && <Button asChild className="mt-5"><Link href={`/find-job/${jobId}`}>Return to job</Link></Button>}</div>;
  }

  return (
    <div className="-mx-16 -my-2 flex flex-col h-[calc(100vh-105px)] bg-background text-foreground font-sans overflow-hidden">
      {/* 1. Header Bar */}
      <CssArenaHeader
        task={currentTask}
        lastScore={lastScore}
        isTargetScoreMet={isTargetScoreMet}
        jobId={jobId}
        tabLockEnabled={Boolean(jobId && tabLock)}
        tabSwitchCount={tabSwitchCount}
        tabLockWarningLimit={tabLockWarningLimit}
      />

      {/* 2. 3-Column Arena Layout */}
      <main className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border min-h-0 overflow-hidden bg-background">
        {/* Column 1: Code Editor */}
        <div className="flex-1 min-w-95 h-full flex flex-col min-h-0 overflow-hidden bg-card">
          <CodeEditor
            initialCode={currentTask.initialCode}
            onChange={handleCodeChange}
            fileName="index.html"
            onTest={handleTest}
            onSubmitFinal={() => setShowSubmitModal(true)}
            isTesting={isTesting}
            isSubmitting={isSubmitting}
            isSubmitLocked={isSubmitLocked}
            submitLockMessage={submitLockMessage}
          />
        </div>

        {/* Column 2: Code Output Stage */}
        <CodeOutputCanvas
          task={currentTask}
          debouncedPreviewCode={debouncedPreviewCode}
          lastScore={lastScore}
          highScore={highScore}
          isTargetScoreMet={isTargetScoreMet}
        />

        {/* Column 3: Recreate Target Goal */}
        <TargetGoalCanvas task={currentTask} />
      </main>

      {/* 3. Final Submission Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
        }}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        task={currentTask}
        lastScore={lastScore}
        codeLength={codeLength}
        jobId={jobId}
        hasSubmittedSuccessfully={hasSubmittedSuccessfully}
        submission={backendSubmission}
      />
    </div>
  );
}

export default function CSSBattlePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground">
          Loading CSS Battle Arena...
        </div>
      }
    >
      <CSSBattleContent />
    </Suspense>
  );
}
