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
  const jobs = await fetchWithAuth<RecruiterJobSummaryResponse[]>("/recruiter/jobs", { cache: "no-store" }).catch(() => []);
  const requestedJobId = valueOf(params.jobId);
  const isSpecificJob = Boolean(requestedJobId && requestedJobId !== "all" && jobs.some((job) => job.id === requestedJobId));
  const selectedJobId = isSpecificJob ? requestedJobId! : "all";

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

  const queryString = query.toString();
  const querySuffix = queryString ? `?${queryString}` : "";
  const jobMap = new Map(jobs.map((job) => [job.id, job.title]));

  let candidates: CandidateDashboardResponse[] = [];

  if (selectedJobId === "all") {
    const lists = await Promise.all(
      jobs.map(async (job) => {
        try {
          const list = await fetchWithAuth<CandidateDashboardResponse[]>(
            `/recruiter/jobs/${job.id}/candidates${querySuffix}`,
            { cache: "no-store" }
          );
          return list.map((c) => ({
            ...c,
            jobId: c.jobId || job.id,
            jobTitle: c.jobTitle || job.title,
          }));
        } catch {
          return [];
        }
      })
    );
    candidates = lists.flat();
  } else {
    try {
      const selectedJob = jobs.find((job) => job.id === selectedJobId);
      const list = await fetchWithAuth<CandidateDashboardResponse[]>(
        `/recruiter/jobs/${selectedJobId}/candidates${querySuffix}`,
        { cache: "no-store" }
      );
      candidates = list.map((c) => ({
        ...c,
        jobId: c.jobId || selectedJobId,
        jobTitle: c.jobTitle || selectedJob?.title,
      }));
    } catch {
      candidates = [];
    }
  }

  // Ensure each candidate has the job title populated
  candidates = candidates.map((c) => ({
    ...c,
    jobTitle: c.jobTitle || (c.jobId ? jobMap.get(c.jobId) : undefined),
  }));

  const activeTab = valueOf(params.tab) === "details" ? "details" : "candidates";

  return (
    <CandidatesPipeline
      jobs={jobs}
      candidates={candidates}
      selectedJobId={selectedJobId}
      defaultTab={activeTab}
    />
  );
}
