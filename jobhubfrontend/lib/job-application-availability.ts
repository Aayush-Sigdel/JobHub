import type { JobPostResponse } from "@/types/api/jobs";

type JobAvailabilityFields = Pick<JobPostResponse, "isActive" | "active" | "deadline">;

export function getJobApplicationAvailability(job: JobAvailabilityFields) {
  const isJobActive = job.isActive ?? job.active ?? false;
  if (!isJobActive) {
    return {
      canApply: false,
      reason: "This job is no longer accepting applications.",
    } as const;
  }

  if (job.deadline) {
    const deadlineTime = Date.parse(job.deadline);
    if (!Number.isNaN(deadlineTime) && deadlineTime < Date.now()) {
      return {
        canApply: false,
        reason: "The application deadline for this job has passed.",
      } as const;
    }
  }

  return { canApply: true, reason: undefined } as const;
}
