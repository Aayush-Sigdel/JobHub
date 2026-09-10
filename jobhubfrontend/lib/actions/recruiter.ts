"use server";

import { fetchWithAuth, ServiceApiError } from "@/lib/service-api";
import { loadRecruiterJob } from "@/lib/recruiter-job-loader";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus } from "@/types/api/jobs";
import type { TaskLibraryOption } from "@/types/api/tasks";
import type {
  CandidateDashboardResponse,
  CandidateSocialSnapshotDto,
} from "@/types/api/recruiter";

export async function getRecruiterJobAction(jobId: string) {
  return loadRecruiterJob(jobId, fetchWithAuth);
}

export async function getRecruiterJobResultAction(jobId: string) {
  try {
    return { job: await getRecruiterJobAction(jobId), error: null };
  } catch (error) {
    const status = error instanceof ServiceApiError ? error.status : undefined;
    const message =
      status === 401
        ? "Your session has expired. Sign in again to view this job."
        : status === 403
          ? "You do not have permission to view this job."
          : status === 404
            ? "This job is no longer available or does not belong to your account."
            : "The job service could not return this listing. Please try again shortly.";
    return { job: null, error: message };
  }
}

export async function getJobCandidatesAction(jobId: string) {
  return fetchWithAuth<CandidateDashboardResponse[]>(
    `/recruiter/jobs/${encodeURIComponent(jobId)}/candidates`,
    { cache: "no-store" },
  );
}

export async function getCandidateSnapshotsAction(
  jobId: string,
  candidateId: string,
) {
  if (!jobId || jobId === "all" || !candidateId) {
    throw new Error("Select a job application to view its evidence.");
  }
  const snapshots = await fetchWithAuth<CandidateSocialSnapshotDto[]>(
    `/recruiter/jobs/${encodeURIComponent(jobId)}/candidates/${encodeURIComponent(candidateId)}/snapshots`,
    { cache: "no-store" },
  );
  if (!Array.isArray(snapshots))
    throw new Error("Evidence could not be read. Please try again.");
  return snapshots;
}

export async function getJobTaskOptionsAction() {
  const results = await Promise.allSettled(
    ["design", "programming", "sql"].map(async (type) => {
      const [available, owned] = await Promise.all([
        fetchWithAuth<TaskLibraryOption[]>(`/task/${type}/getAll`, {
          cache: "no-store",
        }),
        fetchWithAuth<TaskLibraryOption[]>(`/task/${type}/get`, {
          cache: "no-store",
        }),
      ]);
      const ownedIds = new Set(owned.map((task) => task.id));
      return available.map(
        ({ id, title, instructions, skillLevel, scope }) => ({
          id,
          title,
          instructions,
          skillLevel,
          scope,
          isOwned: ownedIds.has(id),
        }),
      );
    }),
  );
  const options = results.map((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  return {
    designTasks: options[0],
    programmingTasks: options[1],
    sqlTasks: options[2],
    error: results.some((result) => result.status === "rejected")
      ? "Some assessments could not be loaded. Retry before changing attached assessments."
      : null,
  };
}

export async function updateApplicationStatusAction(
  applicationId: string,
  status: ApplicationStatus,
) {
  const result = await fetchWithAuth(
    `/recruiter/applications/${applicationId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
  );
  revalidatePath("/dashboard");
  revalidatePath("/candidates");
  revalidatePath("/manage-jobs");
  return result;
}
