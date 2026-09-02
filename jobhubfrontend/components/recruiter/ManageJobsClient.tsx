"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Archive, ExternalLink, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteJobAction, updateJobAction } from "@/lib/actions/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RecruiterJobSummaryResponse } from "@/types/api/recruiter";

function displayEnum(value: string) {
  return value.toLowerCase().split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

export function ManageJobsClient({ initialJobs }: { initialJobs: RecruiterJobSummaryResponse[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const visibleJobs = useMemo(() => jobs.filter((job) => `${job.title} ${job.companyName} ${job.location || ""}`.toLowerCase().includes(query.toLowerCase())), [jobs, query]);

  const toggleListing = (job: RecruiterJobSummaryResponse) => {
    startTransition(async () => {
      try {
        const updated = await updateJobAction(job.id, { isActive: !job.isActive });
        setJobs((current) => current.map((item) => item.id === job.id ? { ...item, isActive: updated.isActive } : item));
        toast.success(updated.isActive ? "Job reopened." : "Job closed.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to update this job.");
      }
    });
  };

  const removeListing = (job: RecruiterJobSummaryResponse) => {
    if (!window.confirm(`Delete ${job.title}? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteJobAction(job.id);
        setJobs((current) => current.filter((item) => item.id !== job.id));
        toast.success("Job deleted.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to delete this job.");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl py-6 md:py-10">
      <div className="flex flex-col gap-5 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div><p className="text-sm font-medium text-primary">Employer workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Manage jobs</h1><p className="mt-2 text-muted-foreground">Track live listings and move directly to each candidate pipeline.</p></div>
        <Button asChild size="lg"><Link href="/post-job"><Plus />Post a job</Link></Button>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your jobs" className="max-w-md" /><p className="shrink-0 text-sm text-muted-foreground">{visibleJobs.length} listing{visibleJobs.length === 1 ? "" : "s"}</p></div>

      {visibleJobs.length === 0 ? (
        <div className="mt-7 rounded-lg border border-dashed p-12 text-center"><h2 className="font-semibold">No job listings found</h2><p className="mt-2 text-sm text-muted-foreground">Create a job or adjust your search.</p></div>
      ) : (
        <div className="mt-7 overflow-hidden rounded-lg border bg-card">
          <div className="divide-y">
            {visibleJobs.map((job) => (
              <article key={job.id} className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{job.title}</h2><Badge variant={job.isActive ? "secondary" : "outline"}>{job.isActive ? "Live" : "Closed"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{job.companyName}{job.location ? ` · ${job.location}` : ""}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{displayEnum(job.jobType)}</span><span>{displayEnum(job.workplaceType)}</span>{(job.hasDesignTask || job.hasProgrammingTask || job.hasSqlTask) && <span>Assessment attached</span>}</div></div>
                <div className="flex flex-wrap items-center gap-3 md:justify-end"><span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Users className="size-4" />{job.totalApplicants} applicants</span><Button variant="outline" asChild><Link href={`/candidates?jobId=${job.id}`}><ExternalLink />Candidates</Link></Button><Button variant="outline" disabled={isPending} onClick={() => toggleListing(job)}><Archive />{job.isActive ? "Close" : "Reopen"}</Button><Button variant="destructive" size="icon" disabled={isPending} onClick={() => removeListing(job)} aria-label={`Delete ${job.title}`}><Trash2 /></Button></div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
