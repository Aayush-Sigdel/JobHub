import React, { Suspense } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/service-api';
import { JobTrackerTabs } from '@/components/job-tracker/JobTrackerTabs';
import type { JobApplicationResponse } from '@/components/job-tracker/ApplicationCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

function TrackerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-full sm:w-96 bg-muted/60 rounded-full border border-border" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-56 bg-card border border-border rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default async function JobTrackerPage() {
  let applications: JobApplicationResponse[] = [];
  let errorMsg = '';

  try {
    applications = await fetchWithAuth<JobApplicationResponse[]>('/jobs/my-applications', { cache: 'no-store' });
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load your applications. Please try again later.';
  }

  const applied = applications.filter((a) => a.status === 'APPLIED');
  const inReview = applications.filter((a) => a.status === 'IN_REVIEW');
  const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED');
  const accepted = applications.filter((a) => a.status === 'ACCEPTED');
  const rejected = applications.filter((a) => a.status === 'REJECTED');

  return (
    <div className="min-h-[100dvh] bg-background p-4 sm:p-6 md:p-8 lg:p-10 text-foreground">
      <div className="max-w-[1240px] mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Job Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your job applications, monitor status updates, and manage saved opportunities.
            </p>
          </div>
          <Button
            asChild
            className="bg-primary text-black font-bold hover:bg-primary/90 shadow-xs rounded-xl h-10 px-4 gap-2 self-start sm:self-auto cursor-pointer shrink-0"
          >
            <Link href="/find-job">
              <Search className="h-4 w-4 text-black" />
              <span>Explore Roles</span>
            </Link>
          </Button>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="mb-6 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Notice</AlertTitle>
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <Suspense fallback={<TrackerSkeleton />}>
          <JobTrackerTabs
            applied={applied}
            inReview={inReview}
            shortlisted={shortlisted}
            accepted={accepted}
            rejected={rejected}
          />
        </Suspense>
      </div>
    </div>
  );
}

