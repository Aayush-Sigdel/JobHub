import React from 'react';
import { fetchWithAuth } from '@/lib/service-api';
import { JobTrackerTabs } from '@/components/job-tracker/JobTrackerTabs';
import type { JobApplicationResponse } from '@/components/job-tracker/ApplicationCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default async function JobTrackerPage() {
  let applications: JobApplicationResponse[] = [];
  let errorMsg = '';

  try {
    applications = await fetchWithAuth<JobApplicationResponse[]>('/jobs/my-applications', { cache: 'no-store' });
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load your applications. Please try again later.';
  }

  if (errorMsg) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Job Tracker</h1>
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{errorMsg}</AlertDescription></Alert>
      </div>
    );
  }

  const applied = applications.filter((a) => a.status === 'APPLIED');
  const inReview = applications.filter((a) => a.status === 'IN_REVIEW');
  const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED');
  const accepted = applications.filter((a) => a.status === 'ACCEPTED');
  const rejected = applications.filter((a) => a.status === 'REJECTED');

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Job Tracker</h1>
      <JobTrackerTabs applied={applied} inReview={inReview} shortlisted={shortlisted} accepted={accepted} rejected={rejected} />
    </div>
  );
}
