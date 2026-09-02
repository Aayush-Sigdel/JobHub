"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecruiterJobSummaryResponse, CandidateDashboardResponse } from "@/lib/types/recruiter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import KanbanView from "@/components/recruiter/KanbanView";
import CandidateCard from "@/components/recruiter/CandidateCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CandidatesPipeline({ jobs, candidates, selectedJobId }: { jobs: RecruiterJobSummaryResponse[], candidates: CandidateDashboardResponse[], selectedJobId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "similarity");

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) { params.set(key, value); } else { params.delete(key); }
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== (searchParams.get("search") || "")) { updateFilters("search", search); }
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="p-8 h-screen flex flex-col space-y-6">
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
      <div className="flex items-center space-x-4">
        <Input placeholder="Search candidates..." className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={sortBy} onValueChange={(val) => { setSortBy(val); updateFilters("sortBy", val); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="similarity">Match Score</SelectItem>
            <SelectItem value="date">Applied Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value === "list" ? "list" : "kanban")}>
            <TabsList><TabsTrigger value="kanban">Kanban</TabsTrigger><TabsTrigger value="list">List</TabsTrigger></TabsList>
          </Tabs>
        </div>
      </div>
      <div className="flex-1 overflow-hidden min-h-[500px]">
        {!selectedJobId ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">Please select a job to view candidates.</div>
        ) : (
          <Tabs value={viewMode} className="h-full">
            <TabsContent value="kanban" className="h-full m-0"><KanbanView candidates={candidates} jobId={selectedJobId} /></TabsContent>
            <TabsContent value="list" className="h-full m-0 overflow-auto">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{candidates.map(c => <CandidateCard key={c.candidateId} candidate={c} />)}</div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
