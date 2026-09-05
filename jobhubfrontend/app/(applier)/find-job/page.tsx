import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { SearchBar } from "@/components/jobs/SearchBar";
import { fetchWithAuth } from "@/lib/service-api";
import { Button } from "@/components/ui/button";
import { Briefcase, X, RotateCcw } from "lucide-react";
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
    sortBy: (valueOf(searchParams.sortBy) as JobSearchParams["sortBy"]) || "similarity",
  };
}

function toQueryString(params: JobSearchParams) {
  return new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      value === undefined || value === false || value === "" ? [] : [[key, String(value)]]
    )
  ).toString();
}

function removeFilterUrl(params: JobSearchParams, keyToRemove: keyof JobSearchParams) {
  const updated = { ...params };
  delete updated[keyToRemove];
  const qs = toQueryString(updated);
  return qs ? `/find-job?${qs}` : "/find-job";
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

  // Build active filter pills for top bar
  const activePills: { key: keyof JobSearchParams; label: string }[] = [];
  if (filters.query) activePills.push({ key: "query", label: `"${filters.query}"` });
  if (filters.location) activePills.push({ key: "location", label: filters.location });
  if (filters.workplaceType) {
    const map: Record<string, string> = { REMOTE: "Remote", HYBRID: "Hybrid", ON_SITE: "On-site" };
    activePills.push({
      key: "workplaceType",
      label: map[filters.workplaceType] || filters.workplaceType,
    });
  }
  if (filters.jobType) {
    const map: Record<string, string> = {
      FULL_TIME: "Full-time",
      PART_TIME: "Part-time",
      CONTRACT: "Contract",
      INTERNSHIP: "Internship",
    };
    activePills.push({ key: "jobType", label: map[filters.jobType] || filters.jobType });
  }
  if (filters.experienceLevel) {
    const map: Record<string, string> = {
      BEGINNER: "Junior / Entry",
      INTERMEDIATE: "Mid-Level",
      EXPERT: "Senior / Lead",
    };
    activePills.push({
      key: "experienceLevel",
      label: map[filters.experienceLevel] || filters.experienceLevel,
    });
  }
  if (filters.hasTasks) activePills.push({ key: "hasTasks", label: "Assessments required" });
  if (filters.salaryMin) activePills.push({ key: "salaryMin", label: `$${filters.salaryMin.toLocaleString()}+` });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8 md:py-10">
      {/* Page Header */}
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Find work worth doing
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
          Search verified roles, review requirements, and apply with your structured evidence.
        </p>
      </div>

      {/* Dual Search & Quick Discovery Bar */}
      <SearchBar />

      {/* Main Content Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        {/* Left Sidebar Filters */}
        <JobFilters />

        {/* Right Job Listings Grid */}
        <section aria-live="polite" className="flex flex-col gap-4">
          {/* Active Filter Pills & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1.5 border-b border-border/60">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <strong className="text-foreground font-bold">{jobs.length}</strong>{" "}
              {jobs.length === 1 ? "role" : "roles"}
            </p>

            {/* Removable Filter Pills */}
            {activePills.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activePills.map((pill) => (
                  <Link
                    key={pill.key}
                    href={removeFilterUrl(filters, pill.key)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors group"
                  >
                    <span>{pill.label}</span>
                    <X className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                  </Link>
                ))}
                <Link
                  href="/find-job"
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 ml-1 cursor-pointer font-semibold"
                >
                  Reset all
                </Link>
              </div>
            )}
          </div>

          {/* Listings, Error, or Empty State */}
          {errorMessage ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive font-medium">
              {errorMessage}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">No roles match these filters</h2>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Try searching with a broader keyword, relaxing location restrictions, or resetting your active filters.
              </p>
              <div className="mt-5 flex justify-center">
                <Button
                  asChild
                  className="h-10 px-5 rounded-xl text-sm font-bold bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-2"
                >
                  <Link href="/find-job">
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset All Filters</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
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
