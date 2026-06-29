"use client";

import { TabsContent } from "../ui/animated-tabs";
import JobCard from "./JobCard";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  posted: string;
  logo?: string;
  connections?: number;
  easyApply?: boolean;
};

type InProgressProps = {
  type: "draft" | "clicked-apply";
  jobs?: Job[];
};

export default function InProgress({ type, jobs = [] }: InProgressProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-base font-medium text-foreground">No matches</p>
        <p className="text-sm text-muted-foreground">
          No {type === "draft" ? "draft" : "clicked apply"} jobs yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-[1fr_120px_160px_120px] gap-2 border-b px-4 py-2 text-xs font-bold text-muted-foreground">
        <span>Jobs</span>
        <span>Connections</span>
        <span>Notes</span>
        <span></span>
      </div>

      {jobs.map((job) => (
        <div
          key={job.id}
          className="grid grid-cols-[1fr_120px_160px_120px] items-center gap-2 px-4 py-3 border-b border-border hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border border-border flex items-center justify-center overflow-hidden shrink-0">
              {job.logo?.trim() ? (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {job.company?.[0] ?? "?"}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium cursor-pointer">{job.title}</p>
              <p className="text-xs text-muted-foreground">
                {job.company} · {job.location}
              </p>
              <p className="text-xs text-muted-foreground">
                Posted {job.posted}
              </p>
            </div>
          </div>

          {/* Connections */}
          <div className="flex items-center">
            {job.connections ? (
              <span className="text-xs text-muted-foreground">
                +{job.connections}
              </span>
            ) : null}
          </div>

          {/* Note */}
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            + Add note
          </button>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs font-medium border border-blue-500 text-blue-600 rounded-full px-3 py-1 hover:bg-blue-50">
              {job.easyApply && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1 rounded-sm">
                  in
                </span>
              )}
              {job.easyApply ? "Easy apply" : "Apply ↗"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
