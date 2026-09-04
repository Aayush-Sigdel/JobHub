"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { RecruiterJobSummaryResponse, CandidateDashboardResponse } from "@/types/api/recruiter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import KanbanView from "@/components/recruiter/KanbanView";
import CandidateCard from "@/components/recruiter/CandidateCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CandidateDetailDrawer from "@/components/recruiter/CandidateDetailDrawer";

export default function CandidatesPipeline({ jobs, candidates, selectedJobId }: { jobs: RecruiterJobSummaryResponse[], candidates: CandidateDashboardResponse[], selectedJobId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "similarity");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDashboardResponse | null>(null);
  const status = searchParams.get("status") || "ALL";
  const minSimilarity = searchParams.get("minSimilarity") || "ALL";
  const fromDateTime = searchParams.get("fromDateTime") || "";
  const toDateTime = searchParams.get("toDateTime") || "";

  const dateTimeInputValue = (value: string) => value ? value.slice(0, 16) : "";
  const updateDateFilter = (key: string, value: string) => {
    updateFilters(key, value ? new Date(value).toISOString() : "");
  };

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) { params.set(key, value); } else { params.delete(key); }
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== (searchParams.get("search") || "")) { updateFilters("search", search); }
    }, 500);
    return () => clearTimeout(handler);
  }, [search, searchParams, updateFilters]);

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">Manage job applicants and move them through the pipeline.</p>
        </div>
        <Select value={selectedJobId} onValueChange={(val) => updateFilters("jobId", val)}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select a job" /></SelectTrigger>
          <SelectContent>
            {jobs.map((job) => (<SelectItem key={job.id} value={job.id}>{job.title} ({job.totalApplicants})</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_11rem_11rem_12rem_12rem_auto] xl:items-end">
        <div className="space-y-1.5"><Label htmlFor="candidate-search">Search</Label><Input id="candidate-search" placeholder="Name, email, title, or skill" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Application status</Label><Select value={status} onValueChange={(value) => updateFilters("status", value === "ALL" ? "" : value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem><SelectItem value="APPLIED">Applied</SelectItem><SelectItem value="IN_REVIEW">In review</SelectItem><SelectItem value="SHORTLISTED">Shortlisted</SelectItem><SelectItem value="ACCEPTED">Accepted</SelectItem><SelectItem value="REJECTED">Rejected</SelectItem></SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Minimum similarity</Label><Select value={minSimilarity} onValueChange={(value) => updateFilters("minSimilarity", value === "ALL" ? "" : value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Any value</SelectItem><SelectItem value="0.25">0.25</SelectItem><SelectItem value="0.50">0.50</SelectItem><SelectItem value="0.75">0.75</SelectItem><SelectItem value="0.90">0.90</SelectItem></SelectContent></Select></div>
        <div className="space-y-1.5"><Label htmlFor="applied-from">Applied from</Label><Input id="applied-from" type="datetime-local" value={dateTimeInputValue(fromDateTime)} onChange={(event) => updateDateFilter("fromDateTime", event.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="applied-to">Applied to</Label><Input id="applied-to" type="datetime-local" value={dateTimeInputValue(toDateTime)} onChange={(event) => updateDateFilter("toDateTime", event.target.value)} /></div>
        <div className="flex items-end gap-2">
          <Select value={sortBy} onValueChange={(val) => { setSortBy(val); updateFilters("sortBy", val); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent><SelectItem value="similarity">Similarity</SelectItem><SelectItem value="date">Applied date</SelectItem><SelectItem value="score">Task score</SelectItem><SelectItem value="name">Name</SelectItem></SelectContent>
          </Select>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value === "list" ? "list" : "kanban")}>
            <TabsList><TabsTrigger value="kanban">Kanban</TabsTrigger><TabsTrigger value="list">List</TabsTrigger></TabsList>
          </Tabs>
        </div>
      </div>
      <div className="flex-1 overflow-hidden min-h-[500px]">
        {!selectedJobId ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">Please select a job to view candidates.</div>
        ) : candidates.length === 0 ? (
          <div className="flex h-full min-h-80 items-center justify-center rounded-lg border border-dashed px-6 text-center text-sm text-muted-foreground">No candidates match the current filters.</div>
        ) : (
          <Tabs value={viewMode} className="h-full">
            <TabsContent value="kanban" className="h-full m-0"><KanbanView candidates={candidates} onCandidateSelect={setSelectedCandidate} /></TabsContent>
            <TabsContent value="list" className="h-full m-0 overflow-auto">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{candidates.map(c => <CandidateCard key={c.candidateId} candidate={c} onSelect={setSelectedCandidate} />)}</div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      {selectedCandidate && (
        <CandidateDetailDrawer
          candidate={selectedCandidate}
          jobId={selectedJobId}
          open
          onOpenChange={(open) => { if (!open) setSelectedCandidate(null); }}
        />
      )}
    </div>
  );
}
