import CandidatesPipeline from "@/components/recruiter/CandidatesPipeline";
import { fetchWithAuth } from "@/lib/service-api";
import type { CandidateDashboardResponse, RecruiterJobSummaryResponse } from "@/types/api/recruiter";

type SearchParamValue = string | string[] | undefined;

function valueOf(value: SearchParamValue) {
  return typeof value === "string" ? value : undefined;
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const jobs = await fetchWithAuth<RecruiterJobSummaryResponse[]>("/recruiter/jobs", { cache: "no-store" });
  const requestedJobId = valueOf(params.jobId);
  const selectedJobId = jobs.some((job) => job.id === requestedJobId) ? requestedJobId! : jobs[0]?.id || "";
  const query = new URLSearchParams();
  const search = valueOf(params.search);
  const sortBy = valueOf(params.sortBy);
  const status = valueOf(params.status);
  const minSimilarity = valueOf(params.minSimilarity);
  const fromDateTime = valueOf(params.fromDateTime);
  const toDateTime = valueOf(params.toDateTime);
  if (search) query.set("search", search);
  if (sortBy) query.set("sortBy", sortBy);
  if (status) query.set("status", status);
  if (minSimilarity) query.set("minSimilarity", minSimilarity);
  if (fromDateTime) query.set("fromDateTime", fromDateTime);
  if (toDateTime) query.set("toDateTime", toDateTime);

  const candidates = selectedJobId
    ? await fetchWithAuth<CandidateDashboardResponse[]>(`/recruiter/jobs/${selectedJobId}/candidates?${query}`, { cache: "no-store" })
    : [];

  return <CandidatesPipeline jobs={jobs} candidates={candidates} selectedJobId={selectedJobId} />;
}
