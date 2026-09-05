'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bookmark, Building2, MapPin, Trash2 } from 'lucide-react';
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
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(requestedTab || 'applied');

  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  const { savedJobs, toggleSaveJob } = useLocalSavedJobs();
  const { inProgressJobs } = useLocalInProgressJobs();

  const renderApplicationGrid = (apps: JobApplicationResponse[], emptyMessage: string) => {
    if (apps.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-xl mt-4 border-border">
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        {apps.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex flex-wrap gap-2 justify-start h-auto p-1 bg-muted/50 rounded-xl border border-border">
        <TabsTrigger value="saved" className="rounded-lg text-xs font-semibold">
          Saved ({savedJobs.length})
        </TabsTrigger>
        <TabsTrigger value="in-progress" className="rounded-lg text-xs font-semibold">
          In-Progress ({inProgressJobs.length})
        </TabsTrigger>
        <TabsTrigger value="applied" className="rounded-lg text-xs font-semibold">
          Applied ({applied.length})
        </TabsTrigger>
        <TabsTrigger value="in-review" className="rounded-lg text-xs font-semibold">
          In Review ({inReview.length})
        </TabsTrigger>
        <TabsTrigger value="shortlisted" className="rounded-lg text-xs font-semibold">
          Shortlisted ({shortlisted.length})
        </TabsTrigger>
        <TabsTrigger value="accepted" className="rounded-lg text-xs font-semibold">
          Accepted ({accepted.length})
        </TabsTrigger>
        <TabsTrigger value="rejected" className="rounded-lg text-xs font-semibold">
          Rejected ({rejected.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="saved">
        {savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 border border-dashed border-border rounded-2xl mt-4 p-6 text-center bg-card">
            <Bookmark className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-bold text-foreground">You have no saved jobs</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Bookmark interesting opportunities while browsing to keep track of them here.
            </p>
            <Button asChild size="sm" className="mt-4 bg-primary text-black font-bold text-xs rounded-xl hover:bg-primary/90 shadow-xs">
              <Link href="/home">Browse Jobs</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {savedJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="border border-border p-5 rounded-2xl shadow-xs bg-card flex flex-col justify-between hover:border-foreground/20 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/find-job/${job.jobId}`}
                          className="font-bold text-base text-foreground hover:underline line-clamp-1 block"
                        >
                          {job.jobTitle}
                        </Link>
                        <p className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span className="truncate">{job.companyName}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSaveJob(job)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Remove from saved"
                        aria-label="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {job.location && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Saved {new Date(job.savedAt).toLocaleDateString()}
                    </span>
                    <Button
                      asChild
                      size="sm"
                      className="h-8 px-3 text-xs font-bold bg-primary text-black hover:bg-primary/90 rounded-xl shadow-xs cursor-pointer"
                    >
                      <Link href={`/find-job/${job.jobId}`}>
                        View & Apply
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="in-progress">
        {inProgressJobs.length === 0 ? (
          <div className="flex items-center justify-center h-48 border border-dashed border-border rounded-xl mt-4">
            <p className="text-muted-foreground text-sm">You have no applications in progress.</p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-muted-foreground mb-4 text-xs">Drafts are stored locally on this browser.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {inProgressJobs.map((job) => (
                <div key={job.jobId} className="border border-border p-4 rounded-xl shadow-xs bg-card">
                  <h3 className="font-bold text-sm text-foreground">{job.jobTitle}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{job.companyName}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-2">
                    Last updated: {new Date(job.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
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
