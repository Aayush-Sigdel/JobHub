import type { JobPostDetailResponse, JobPostResponse } from "@/types/api/jobs";
import type { RecruiterJobSummaryResponse } from "@/types/api/recruiter";

type Fetcher = <T>(endpoint: string, options: RequestInit) => Promise<T>;

// Some API deployments expose job details only through /jobs/:id.
// Preserve the recruiter ownership check before using that public read endpoint.
export async function loadRecruiterJob(
  jobId: string,
  fetcher: Fetcher,
): Promise<JobPostResponse> {
  const id = encodeURIComponent(jobId);
  const options = { cache: "no-store" as const };
  try {
    return await fetcher<JobPostResponse>(`/recruiter/jobs/${id}`, options);
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? error.status
        : undefined;
    if (
      typeof status !== "number" ||
      ![404, 405, 500, 501, 502, 503, 504].includes(status)
    )
      throw error;
    const ownedJobs = await fetcher<RecruiterJobSummaryResponse[]>(
      "/recruiter/jobs",
      options,
    );
    if (!ownedJobs.some((job) => job.id === jobId)) throw error;
    const detail = await fetcher<JobPostDetailResponse>(`/jobs/${id}`, options);
    if (!detail?.job || detail.job.id !== jobId)
      throw new Error(
        "The job service returned incomplete details. Please try again.",
      );
    return detail.job;
  }
}
