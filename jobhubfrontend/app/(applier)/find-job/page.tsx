import Link from "next/link";
import Image from "next/image";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { SearchBar } from "@/components/jobs/SearchBar";
import { RetryLoadButton } from "@/components/jobs/RetryLoadButton";
import { fetchWithAuth } from "@/lib/service-api";
import { Button } from "@/components/ui/button";
import { Briefcase, RotateCcw } from "lucide-react";
import type { JobPostResponse, JobSearchParams } from "@/types/api/jobs";

type SearchParamValue = string | string[] | undefined;

function valueOf(value: SearchParamValue) {
  return typeof value === "string" ? value : undefined;
}

function buildSearchParams(
  searchParams: Record<string, SearchParamValue>,
): JobSearchParams {
  const salaryMin = Number(valueOf(searchParams.salaryMin));
  const hasTasks = valueOf(searchParams.hasTasks);
  const semanticSearch = valueOf(searchParams.semanticSearch);

  return {
    query: valueOf(searchParams.query),
    jobType: valueOf(searchParams.jobType) as JobSearchParams["jobType"],
    workplaceType: valueOf(
      searchParams.workplaceType,
    ) as JobSearchParams["workplaceType"],
    experienceLevel: valueOf(
      searchParams.experienceLevel,
    ) as JobSearchParams["experienceLevel"],
    location: valueOf(searchParams.location),
    salaryMin:
      Number.isFinite(salaryMin) && salaryMin > 0 ? salaryMin : undefined,
    hasTasks:
      hasTasks === "true" ? true : hasTasks === "false" ? false : undefined,
    semanticSearch: semanticSearch === "true",
    sortBy:
      (valueOf(searchParams.sortBy) as JobSearchParams["sortBy"]) ||
      "similarity",
  };
}

function toQueryString(params: JobSearchParams) {
  return new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      value === undefined ||
      value === "" ||
      (key === "semanticSearch" && value === false)
        ? []
        : [[key, String(value)]],
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
    jobs = await fetchWithAuth<JobPostResponse[]>(
      `/jobs?${toQueryString(filters)}`,
      {
        cache: "no-store",
      },
    );
  } catch {
    errorMessage =
      "We couldn’t load jobs right now. Your filters are still here — please try again.";
  }

  const hasFilters = Boolean(
    filters.query ||
    filters.location ||
    filters.workplaceType ||
    filters.jobType ||
    filters.experienceLevel ||
    filters.salaryMin ||
    filters.hasTasks !== undefined,
  );

  return (
    <div className="mx-auto w-full max-w-6xl py-4 md:py-6">
      {/* Page Header */}
      <div className="mb-6 flex min-h-36 items-center justify-between gap-5 overflow-hidden rounded-2xl border border-border bg-card pl-6 sm:pl-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Find your next role
        </h1>
        <div className="relative h-36 w-32 shrink-0 sm:w-56" aria-hidden="true">
          <Image
            src="/jobhub-team-illustration.png"
            alt=""
            fill
            sizes="(max-width: 639px) 128px, 224px"
            className="object-cover object-[50%_35%] dark:brightness-90"
          />
        </div>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Main Content Layout */}
      <div className="mt-8 grid gap-6 lg:gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        {/* Left Sidebar Filters */}
        <JobFilters />

        {/* Job results */}
        <section aria-label="Job results" className="min-w-0">
          {/* Results count */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-border/60">
            <p
              role="status"
              className="text-sm text-muted-foreground font-medium shrink-0"
            >
              {errorMessage ? (
                "Jobs unavailable"
              ) : (
                <>
                  <strong className="text-foreground font-bold">
                    {jobs.length}
                  </strong>{" "}
                  {jobs.length === 1 ? "role" : "roles"} found
                </>
              )}
            </p>
          </div>

          {/* Listings, Error, or Empty State */}
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-2xl border border-border bg-card p-6 text-sm"
            >
              <h2 className="font-semibold text-foreground">
                Jobs couldn’t be loaded
              </h2>
              <p className="mt-2 text-muted-foreground">{errorMessage}</p>
              <RetryLoadButton />
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-10 sm:p-12 text-center bg-card">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {hasFilters
                  ? "No roles match these filters"
                  : "No open roles just yet"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {hasFilters
                  ? "Try a broader keyword or remove a filter to see more opportunities."
                  : "Check back soon for new opportunities, or update your profile while you wait."}
              </p>
              <div className="mt-5 flex justify-center">
                <Button
                  asChild
                  className="h-10 px-5 rounded-xl text-sm font-bold bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-2"
                >
                  <Link href={hasFilters ? "/find-job" : "/candidate-profile"}>
                    <RotateCcw className="h-4 w-4" />
                    <span>
                      {hasFilters ? "Clear filters" : "Update profile"}
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
