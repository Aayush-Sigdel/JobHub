import type { TaskSubmissionResponse, TaskType } from "@/types/api/tasks";
import type { ApplyJobRequest } from "@/types/api/jobs";
import { userStorageKey } from "./local-session-storage.ts";

function storageKey(jobId: string, taskType: TaskType) {
  return `job_submission_${jobId}_${taskType}`;
}

function applicationDraftKey(jobId: string) {
  return `job_application_draft_${jobId}`;
}

interface ApplicationDraft {
  coverNote?: string;
}

export function saveJobAssessmentSubmission(
  userId: string | undefined,
  jobId: string,
  submission: TaskSubmissionResponse,
  assignedTask?: { taskId: string; taskType: TaskType },
) {
  if (typeof window === "undefined") return;

  const normalizedSubmission = assignedTask
    ? {
        ...submission,
        taskId: assignedTask.taskId,
        taskType: assignedTask.taskType,
      }
    : submission;

  const key = userStorageKey(
    userId,
    storageKey(jobId, normalizedSubmission.taskType),
  );
  if (!key) return;
  window.localStorage.setItem(key, JSON.stringify(normalizedSubmission));
  window.dispatchEvent(new Event("job-assessment-submission"));
}

export function loadJobAssessmentSubmission(
  userId: string | undefined,
  jobId: string,
  taskType: TaskType,
  expectedTaskId?: string,
): TaskSubmissionResponse | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const key = userStorageKey(userId, storageKey(jobId, taskType));
    if (!key) return undefined;
    const value = window.localStorage.getItem(key);
    if (!value) return undefined;
    const submission = JSON.parse(value) as TaskSubmissionResponse;
    if (
      !submission.id ||
      submission.taskType !== taskType ||
      (expectedTaskId && submission.taskId !== expectedTaskId)
    ) {
      return undefined;
    }
    return submission;
  } catch {
    return undefined;
  }
}

export function saveJobApplicationDraft(
  userId: string | undefined,
  jobId: string,
  coverNote: string,
) {
  if (typeof window === "undefined") return;
  const key = userStorageKey(userId, applicationDraftKey(jobId));
  if (!key) return;

  let existingDraft: ApplicationDraft | undefined;
  try {
    const value = window.localStorage.getItem(key);
    existingDraft = value ? (JSON.parse(value) as ApplicationDraft) : undefined;
  } catch {
    existingDraft = undefined;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify({ coverNote: coverNote || existingDraft?.coverNote }),
  );
}

export function clearJobApplicationDraft(
  userId: string | undefined,
  jobId: string,
) {
  if (typeof window === "undefined") return;
  const key = userStorageKey(userId, applicationDraftKey(jobId));
  if (key) window.localStorage.removeItem(key);
}

export function hasCompletedRequiredAssessments(
  userId: string | undefined,
  jobId: string,
  requiredTaskTypes: TaskType[],
): boolean {
  return requiredTaskTypes.every((taskType) =>
    Boolean(loadJobAssessmentSubmission(userId, jobId, taskType)?.id),
  );
}

export function buildVerifiedApplicationRequest(
  userId: string | undefined,
  jobId: string,
  requiredTaskTypes: TaskType[],
): ApplyJobRequest | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const key = userStorageKey(userId, applicationDraftKey(jobId));
    if (!key) return undefined;
    const draftValue = window.localStorage.getItem(key);
    if (!draftValue) return undefined;
    const draft = JSON.parse(draftValue) as ApplicationDraft;
    const submissions = {
      DESIGN: loadJobAssessmentSubmission(userId, jobId, "DESIGN"),
      PROGRAMMING: loadJobAssessmentSubmission(userId, jobId, "PROGRAMMING"),
      SQL: loadJobAssessmentSubmission(userId, jobId, "SQL"),
    };

    if (requiredTaskTypes.some((taskType) => !submissions[taskType]?.id)) {
      return undefined;
    }

    return {
      coverNote: draft.coverNote || undefined,
      designSubmissionId: submissions.DESIGN?.id,
      programmingSubmissionId: submissions.PROGRAMMING?.id,
      sqlSubmissionId: submissions.SQL?.id,
    };
  } catch {
    return undefined;
  }
}
