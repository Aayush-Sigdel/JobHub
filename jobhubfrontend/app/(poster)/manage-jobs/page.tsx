import { ManageJobsClient } from "@/components/recruiter/ManageJobsClient";
import { fetchWithAuth } from "@/lib/service-api";
import type { RecruiterJobSummaryResponse } from "@/types/api/recruiter";

export default async function ManageJobsPage() {
  const jobs = await fetchWithAuth<RecruiterJobSummaryResponse[]>("/recruiter/jobs", { cache: "no-store" });
  return <ManageJobsClient initialJobs={jobs} />;
}
