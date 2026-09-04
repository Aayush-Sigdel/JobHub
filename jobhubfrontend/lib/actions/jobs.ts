'use server';

import { fetchWithAuth } from "@/lib/service-api";
import { revalidatePath } from "next/cache";
import type {
  ApplyJobRequest,
  CreateJobPostRequest,
  JobApplicationResponse,
  JobPostDetailResponse,
  JobPostResponse,
  RecordTabSwitchRequest,
  RecordTabSwitchResponse,
  UpdateJobPostRequest,
} from "@/types/api/jobs";

export async function createJobAction(payload: CreateJobPostRequest): Promise<JobPostResponse> {
  const result = await fetchWithAuth<JobPostResponse>("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  revalidatePath("/manage-jobs");
  revalidatePath("/find-job");
  return result;
}

export async function updateJobAction(jobId: string, payload: UpdateJobPostRequest): Promise<JobPostResponse> {
  const result = await fetchWithAuth<JobPostResponse>(`/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  revalidatePath("/manage-jobs");
  revalidatePath(`/find-job/${jobId}`);
  return result;
}

export async function deleteJobAction(jobId: string) {
  await fetchWithAuth(`/jobs/${jobId}`, {
    method: "DELETE",
  });
  revalidatePath("/manage-jobs");
  return { success: true };
}

export async function applyJobAction(jobId: string, payload: ApplyJobRequest) {
  try {
    const result = await fetchWithAuth<JobApplicationResponse>(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        tabSwitchCount: payload.tabSwitchCount ?? 0,
        tabSwitchEvents: payload.tabSwitchEvents ?? [],
      }),
    });
    revalidatePath(`/find-job/${jobId}`);
    revalidatePath("/job-tracker");
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("already applied")) {
      return { success: true, alreadyApplied: true };
    }
    return { success: false, error: error instanceof Error ? error.message : "Unable to submit your application." };
  }
}

export async function getJobDetailAction(jobId: string): Promise<JobPostDetailResponse> {
  return fetchWithAuth<JobPostDetailResponse>(`/jobs/${jobId}`, { cache: "no-store" });
}

export async function recordTabSwitchAction(jobId: string, data: RecordTabSwitchRequest): Promise<RecordTabSwitchResponse> {
  const result = await fetchWithAuth<RecordTabSwitchResponse>(`/jobs/${jobId}/tab-switch`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return result;
}
