import React from 'react';
import { fetchWithAuth } from '@/lib/service-api';
import { HomeFeed } from './_components/home-feed';

interface JobPostResponse {
  id: string;
  title: string;
  companyName: string;
  description: string;
  requirements?: string;
  location?: string;
  jobType: string;
  workplaceType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  tabLock: boolean;
  tabLockWarningLimit: number;
  deadline?: string;
  isActive: boolean;
  postedById: string;
  postedByName: string;
  hasDesignTask: boolean;
  hasProgrammingTask: boolean;
  hasSqlTask: boolean;
  designTaskId?: string;
  programmingTaskId?: string;
  sqlTaskId?: string;
  similarityScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default async function HomePage() {
  let recommendedJobs: JobPostResponse[] = [];
  let recentJobs: JobPostResponse[] = [];

  try {
    [recommendedJobs, recentJobs] = await Promise.all([
      fetchWithAuth<JobPostResponse[]>('/jobs?semanticSearch=true&sortBy=similarity').catch(() => []),
      fetchWithAuth<JobPostResponse[]>('/jobs?sortBy=date').catch(() => []),
    ]);
  } catch (err) {
    // Fail gracefully
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-lg">Here are jobs matched to your profile.</p>
      </div>
      <HomeFeed recommendedJobs={recommendedJobs} recentJobs={recentJobs} />
    </div>
  );
}
