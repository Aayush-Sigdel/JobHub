import ManageJobsWorkspace from "@/components/recruiter/ManageJobsWorkspace";
import { fetchWithAuth } from "@/lib/service-api";
import type { RecruiterJobSummaryResponse } from "@/types/api/recruiter";

export default async function ManageJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  let jobs: RecruiterJobSummaryResponse[] = [];
  let error: string | null = null;
  try {
    jobs = await fetchWithAuth<RecruiterJobSummaryResponse[]>(
      "/recruiter/jobs",
      { cache: "no-store" },
    );
  } catch {
    error = "Your job listings could not be loaded. Please try again.";
  }
  return (
    <ManageJobsWorkspace
      jobs={jobs}
      error={error}
      initialJobId={typeof params.jobId === "string" ? params.jobId : undefined}
      initialTab={params.tab === "candidates" ? "candidates" : "details"}
    />
  );
}
