'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalSavedJobs, useLocalInProgressJobs } from '@/lib/hooks/use-local-jobs';
import { ApplicationCard, JobApplicationResponse } from '@/components/job-tracker/ApplicationCard';

interface JobTrackerTabsProps {
  applied: JobApplicationResponse[];
  inReview: JobApplicationResponse[];
  shortlisted: JobApplicationResponse[];
  accepted: JobApplicationResponse[];
  rejected: JobApplicationResponse[];
}

export function JobTrackerTabs({ applied, inReview, shortlisted, accepted, rejected }: JobTrackerTabsProps) {
  const { savedJobs } = useLocalSavedJobs();
  const { inProgressJobs } = useLocalInProgressJobs();

  const renderApplicationGrid = (apps: JobApplicationResponse[], emptyMessage: string) => {
    if (apps.length === 0) {
      return (<div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg mt-4"><p className="text-muted-foreground">{emptyMessage}</p></div>);
    }
    return (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">{apps.map((app) => (<ApplicationCard key={app.id} application={app} />))}</div>);
  };

  return (
    <Tabs defaultValue="applied" className="w-full">
      <TabsList className="flex flex-wrap gap-2 justify-start h-auto p-1 bg-muted/50 rounded-lg">
        <TabsTrigger value="saved">Saved ({savedJobs.length})</TabsTrigger>
        <TabsTrigger value="in-progress">In-Progress ({inProgressJobs.length})</TabsTrigger>
        <TabsTrigger value="applied">Applied ({applied.length})</TabsTrigger>
        <TabsTrigger value="in-review">In Review ({inReview.length})</TabsTrigger>
        <TabsTrigger value="shortlisted">Shortlisted ({shortlisted.length})</TabsTrigger>
        <TabsTrigger value="accepted">Accepted ({accepted.length})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="saved">
        {savedJobs.length === 0 ? (<div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg mt-4"><p className="text-muted-foreground">You have no saved jobs.</p></div>) : (
          <div className="mt-4"><p className="text-muted-foreground mb-4">Saved jobs are stored locally on this browser.</p><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{savedJobs.map((job) => (<div key={job.jobId} className="border p-4 rounded-lg shadow-sm bg-card"><h3 className="font-bold">{job.jobTitle}</h3><p className="text-sm text-muted-foreground">{job.companyName}</p><p className="text-xs text-muted-foreground mt-2">Saved on: {new Date(job.savedAt).toLocaleDateString()}</p></div>))}</div></div>
        )}
      </TabsContent>
      <TabsContent value="in-progress">
        {inProgressJobs.length === 0 ? (<div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg mt-4"><p className="text-muted-foreground">You have no applications in progress.</p></div>) : (
          <div className="mt-4"><p className="text-muted-foreground mb-4">Drafts are stored locally on this browser.</p><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{inProgressJobs.map((job) => (<div key={job.jobId} className="border p-4 rounded-lg shadow-sm bg-card"><h3 className="font-bold">{job.jobTitle}</h3><p className="text-sm text-muted-foreground">{job.companyName}</p><p className="text-xs text-muted-foreground mt-2">Last updated: {new Date(job.updatedAt).toLocaleDateString()}</p></div>))}</div></div>
        )}
      </TabsContent>
      <TabsContent value="applied">{renderApplicationGrid(applied, "No applications currently in 'Applied' status.")}</TabsContent>
      <TabsContent value="in-review">{renderApplicationGrid(inReview, "No applications currently in 'In Review' status.")}</TabsContent>
      <TabsContent value="shortlisted">{renderApplicationGrid(shortlisted, "No applications currently in 'Shortlisted' status.")}</TabsContent>
      <TabsContent value="accepted">{renderApplicationGrid(accepted, "No applications currently in 'Accepted' status.")}</TabsContent>
      <TabsContent value="rejected">{renderApplicationGrid(rejected, "No applications currently in 'Rejected' status.")}</TabsContent>
    </Tabs>
  );
}
