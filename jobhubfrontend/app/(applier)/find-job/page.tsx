import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { SearchBar } from "@/components/jobs/SearchBar";
import { fetchWithAuth } from "@/lib/service-api";
import type { JobPostResponse, JobSearchParams } from "@/types/api/jobs";

type SearchParamValue = string | string[] | undefined;

function valueOf(value: SearchParamValue) {
  return typeof value === "string" ? value : undefined;
}

function buildSearchParams(searchParams: Record<string, SearchParamValue>): JobSearchParams {
  const salaryMin = Number(valueOf(searchParams.salaryMin));
  const hasTasks = valueOf(searchParams.hasTasks);
  const semanticSearch = valueOf(searchParams.semanticSearch);

  return {
    query: valueOf(searchParams.query),
    jobType: valueOf(searchParams.jobType) as JobSearchParams["jobType"],
    workplaceType: valueOf(searchParams.workplaceType) as JobSearchParams["workplaceType"],
    experienceLevel: valueOf(searchParams.experienceLevel) as JobSearchParams["experienceLevel"],
    location: valueOf(searchParams.location),
    salaryMin: Number.isFinite(salaryMin) && salaryMin > 0 ? salaryMin : undefined,
    hasTasks: hasTasks === "true" ? true : hasTasks === "false" ? false : undefined,
    semanticSearch: semanticSearch === "true",
    sortBy: (valueOf(searchParams.sortBy) as JobSearchParams["sortBy"]) || "date",
  };
}

function toQueryString(params: JobSearchParams) {
  return new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      value === undefined || value === false || value === "" ? [] : [[key, String(value)]],
    ),
  ).toString();
}

export default async function FindJobPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const filters = buildSearchParams(await searchParams);
  let jobs: JobPostResponse[] = [];
  let errorMessage: string | null = null;

  try {
    jobs = await fetchWithAuth<JobPostResponse[]>(`/jobs?${toQueryString(filters)}`, {
      cache: "no-store",
    });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Unable to load jobs.";
  }

  return (
    <div className="mx-auto w-full max-w-7xl py-8 md:py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Find work worth doing</h1>
        <p className="mt-2 text-muted-foreground">Search roles, review requirements, and apply with your verified profile.</p>
      </div>

      <SearchBar />

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <JobFilters />
        <section aria-live="polite">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{jobs.length} role{jobs.length === 1 ? "" : "s"} found</p>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <h2 className="font-semibold">No roles match these filters</h2>
              <p className="mt-2 text-sm text-muted-foreground">Try removing a filter or searching with a broader term.</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
