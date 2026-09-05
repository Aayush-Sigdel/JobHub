import type { TaskSubmissionResponse, TaskType } from "@/types/api/tasks";
import type { ApplyJobRequest } from "@/types/api/jobs";

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
  jobId: string,
  submission: TaskSubmissionResponse,
  assignedTask?: { taskId: string; taskType: TaskType }
) {
  if (typeof window === "undefined") return;

  const normalizedSubmission = assignedTask
    ? {
        ...submission,
        taskId: assignedTask.taskId,
        taskType: assignedTask.taskType,
      }
    : submission;

  window.localStorage.setItem(
    storageKey(jobId, normalizedSubmission.taskType),
    JSON.stringify(normalizedSubmission)
  );
  window.dispatchEvent(new Event("job-assessment-submission"));
}

export function loadJobAssessmentSubmission(
  jobId: string,
  taskType: TaskType,
  expectedTaskId?: string
): TaskSubmissionResponse | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const value = window.localStorage.getItem(storageKey(jobId, taskType));
    if (!value) return undefined;
    const submission = JSON.parse(value) as TaskSubmissionResponse;
    if (!submission.id || (expectedTaskId && submission.taskId !== expectedTaskId)) {
      return undefined;
    }
    return submission;
  } catch {
    return undefined;
  }
}

export function saveJobApplicationDraft(jobId: string, coverNote: string) {
  if (typeof window === "undefined") return;

  let existingDraft: ApplicationDraft | undefined;
  try {
    const value = window.localStorage.getItem(applicationDraftKey(jobId));
    existingDraft = value ? JSON.parse(value) as ApplicationDraft : undefined;
  } catch {
    existingDraft = undefined;
  }

  window.localStorage.setItem(
    applicationDraftKey(jobId),
    JSON.stringify({ coverNote: coverNote || existingDraft?.coverNote })
  );
}

export function clearJobApplicationDraft(jobId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(applicationDraftKey(jobId));
}

export function buildVerifiedApplicationRequest(
  jobId: string,
  requiredTaskTypes: TaskType[]
): ApplyJobRequest | undefined {
  if (typeof window === "undefined") return undefined;

  const draftValue = window.localStorage.getItem(applicationDraftKey(jobId));
  if (!draftValue) return undefined;

  try {
    const draft = JSON.parse(draftValue) as ApplicationDraft;
    const submissions = {
      DESIGN: loadJobAssessmentSubmission(jobId, "DESIGN"),
      PROGRAMMING: loadJobAssessmentSubmission(jobId, "PROGRAMMING"),
      SQL: loadJobAssessmentSubmission(jobId, "SQL"),
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
