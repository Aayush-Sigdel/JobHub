"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

const workplaceOptions = [
  ["REMOTE", "Remote"],
  ["HYBRID", "Hybrid"],
  ["ON_SITE", "On-site"],
];
const jobTypeOptions = [
  ["FULL_TIME", "Full-time"],
  ["PART_TIME", "Part-time"],
  ["CONTRACT", "Contract"],
  ["INTERNSHIP", "Internship"],
];
const experienceOptions = [
  ["BEGINNER", "Entry level"],
  ["INTERMEDIATE", "Mid-level"],
  ["EXPERT", "Senior level"],
];
const filterKeys = [
  "jobType",
  "workplaceType",
  "experienceLevel",
  "hasTasks",
  "salaryMin",
  "sortBy",
];

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const advancedCount = ["experienceLevel", "hasTasks", "salaryMin"].filter(
    (key) => searchParams.has(key),
  ).length;
  const [advancedOpen, setAdvancedOpen] = useState(advancedCount > 0);
  const activeCount = filterKeys.filter(
    (key) =>
      searchParams.has(key) &&
      !(key === "sortBy" && searchParams.get(key) === "similarity"),
  ).length;

  function updateFilter(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() =>
      router.push(`${pathname}?${params}`, { scroll: false }),
    );
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    filterKeys.forEach((key) => params.delete(key));
    startTransition(() =>
      router.push(`${pathname}?${params}`, { scroll: false }),
    );
  }

  function options(title: string, key: string, items: string[][]) {
    return (
      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm font-medium">{title}</legend>
        <div className="grid grid-cols-2 gap-x-4 lg:grid-cols-1">
          {items.map(([value, label]) => (
            <label
              key={value}
              className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm text-muted-foreground has-checked:text-foreground"
            >
              <input
                type="checkbox"
                checked={searchParams.get(key) === value}
                onChange={(event) =>
                  updateFilter(key, event.target.checked ? value : undefined)
                }
                className="size-3.5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <aside
      aria-label="Job filters"
      aria-busy={isPending}
      className="min-w-0 self-start border-b border-border pb-5 lg:sticky lg:top-24 lg:border-b-0 lg:border-r lg:pr-6"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="hidden text-sm font-semibold lg:block">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {activeCount}
            </span>
          )}
        </h2>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="job-filter-options"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex min-h-9 items-center gap-2 text-sm font-medium lg:hidden"
        >
          Filters
          {activeCount > 0 && (
            <span className="text-xs text-muted-foreground">{activeCount}</span>
          )}
          <ChevronDown className={`size-4 ${expanded ? "rotate-180" : ""}`} />
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="min-h-9 text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
          >
            Reset
          </button>
        )}
      </div>
      <fieldset
        id="job-filter-options"
        aria-label="Filter options"
        disabled={isPending}
        className={`${expanded ? "flex" : "hidden"} mt-5 min-w-0 flex-col gap-6 lg:flex disabled:opacity-50`}
      >
        <div>
          <label htmlFor="job-sort" className="mb-2 block text-sm font-medium">
            Sort by
          </label>
          <select
            id="job-sort"
            value={searchParams.get("sortBy") || "similarity"}
            onChange={(event) => updateFilter("sortBy", event.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <option value="similarity">Best match</option>
            <option value="date">Newest first</option>
            <option value="salary">Highest salary</option>
          </select>
        </div>
        {options("Workplace", "workplaceType", workplaceOptions)}
        {options("Job type", "jobType", jobTypeOptions)}
        <div className="border-t border-border/70 pt-3">
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            aria-expanded={advancedOpen}
            aria-controls="additional-job-filters"
            className="flex min-h-9 w-full items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <span>
              More filters
              {advancedCount > 0 && (
                <span className="ml-1 text-xs">({advancedCount})</span>
              )}
            </span>
            <ChevronDown
              className={`size-3.5 ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>
          <div
            id="additional-job-filters"
            hidden={!advancedOpen}
            className="space-y-6 pt-4"
          >
            {options("Experience", "experienceLevel", experienceOptions)}
            {options("Minimum salary", "salaryMin", [
              ["30000", "30,000+"],
              ["60000", "60,000+"],
              ["100000", "100,000+"],
            ])}
            {searchParams.has("salaryMin") &&
              !["30000", "60000", "100000"].includes(
                searchParams.get("salaryMin")!,
              ) && (
                <button
                  type="button"
                  onClick={() => updateFilter("salaryMin")}
                  className="text-xs text-muted-foreground underline"
                >
                  Clear minimum: {searchParams.get("salaryMin")}
                </button>
              )}
            {options("Assessment", "hasTasks", [
              ["true", "Required"],
              ["false", "Not required"],
            ])}
          </div>
        </div>
      </fieldset>
    </aside>
  );
}
