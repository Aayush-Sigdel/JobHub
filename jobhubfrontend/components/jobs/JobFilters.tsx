"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, ArrowUpDown } from "lucide-react";

type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
type WorkplaceType = "REMOTE" | "HYBRID" | "ON_SITE";
type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";

const JOB_TYPE_OPTIONS: { id: JobType; label: string }[] = [
  { id: "FULL_TIME", label: "Full-time" },
  { id: "PART_TIME", label: "Part-time" },
  { id: "CONTRACT", label: "Contract" },
  { id: "INTERNSHIP", label: "Internship" },
];

const WORKPLACE_OPTIONS: { id: WorkplaceType; label: string }[] = [
  { id: "REMOTE", label: "Remote" },
  { id: "HYBRID", label: "Hybrid" },
  { id: "ON_SITE", label: "On-site" },
];

const EXPERIENCE_OPTIONS: { id: ExperienceLevel; label: string }[] = [
  { id: "BEGINNER", label: "Junior / Entry" },
  { id: "INTERMEDIATE", label: "Mid-Level" },
  { id: "EXPERT", label: "Senior / Lead" },
];

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === false || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const activeJobType = searchParams.get("jobType");
  const activeWorkplace = searchParams.get("workplaceType");
  const activeExperience = searchParams.get("experienceLevel");
  const activeHasTasks = searchParams.get("hasTasks") === "true";
  const activeSalary = searchParams.get("salaryMin") || "";
  const activeSort = searchParams.get("sortBy") || "similarity";

  // Calculate count of active filters
  const activeCount = [
    activeJobType,
    activeWorkplace,
    activeExperience,
    activeHasTasks,
    activeSalary,
    activeSort !== "similarity" ? activeSort : null,
  ].filter(Boolean).length;

  return (
    <aside className="sticky top-20 self-start h-fit rounded-2xl border border-border bg-card p-4.5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-foreground" />
          <h2 className="text-sm sm:text-base font-bold text-foreground">Filters</h2>
          {activeCount > 0 && (
            <span className="text-xs font-black bg-primary text-black px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 1. Sort By (At top of hierarchy) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Sort By</span>
        </div>
        <select
          id="job-sort"
          value={activeSort}
          onChange={(event) => handleFilterChange("sortBy", event.target.value)}
          className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer transition-all"
        >
          <option value="similarity">Best Profile Match</option>
          <option value="date">Newest First</option>
          <option value="salary">Highest Salary</option>
        </select>
      </div>

      <div className="h-px bg-border/60" />

      {/* 2. Workplace Type (Compact Chips) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Workplace
        </span>
        <div className="flex flex-wrap gap-1.5">
          {WORKPLACE_OPTIONS.map((opt) => {
            const isSelected = activeWorkplace === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  handleFilterChange("workplaceType", isSelected ? undefined : opt.id)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-primary text-black border-primary shadow-xs font-bold"
                    : "bg-muted/50 text-foreground border-border/80 hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Job Type (Compact Chips) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Job Type
        </span>
        <div className="flex flex-wrap gap-1.5">
          {JOB_TYPE_OPTIONS.map((opt) => {
            const isSelected = activeJobType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  handleFilterChange("jobType", isSelected ? undefined : opt.id)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-primary text-black border-primary shadow-xs font-bold"
                    : "bg-muted/50 text-foreground border-border/80 hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Experience Level (Compact Chips) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Experience
        </span>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE_OPTIONS.map((opt) => {
            const isSelected = activeExperience === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  handleFilterChange("experienceLevel", isSelected ? undefined : opt.id)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-primary text-black border-primary shadow-xs font-bold"
                    : "bg-muted/50 text-foreground border-border/80 hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Minimum Salary (Quick Presets) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Min Salary
          </span>
          {activeSalary && (
            <span className="text-xs font-bold text-foreground">
              ${Number(activeSalary).toLocaleString()}+
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[30000, 60000, 100000].map((preset) => {
            const isSelected = activeSalary === String(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  handleFilterChange(
                    "salaryMin",
                    isSelected ? undefined : preset
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-primary text-black border-primary shadow-xs font-bold"
                    : "bg-muted/50 text-foreground border-border/80 hover:bg-muted"
                }`}
              >
                ${preset / 1000}k+
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Assessment Required (Single Row) */}
      <div className="pt-2 border-t border-border/60">
        <label className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground font-medium cursor-pointer select-none hover:text-foreground/80">
          <Checkbox
            id="has-tasks"
            checked={activeHasTasks}
            onCheckedChange={(checked) =>
              handleFilterChange("hasTasks", checked ? "true" : undefined)
            }
          />
          <span>Assessment required</span>
        </label>
      </div>
    </aside>
  );
}
