import React from "react";
import { requireUserRole } from "@/lib/server-user-role";
import { fetchWithAuth } from "@/lib/service-api";
import { HomeContainer } from "./_components/home-container";
import type { JobPostResponse, JobApplicationResponse } from "@/types/api/jobs";
import { applicationLoadError } from "@/lib/application-load-error";
import type { HomeApplicationError } from "./_components/home-overview";

interface HomePageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { profile } = await requireUserRole(false);

  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialTab = resolvedParams?.tab || "recommended";

  let recommendedJobs: JobPostResponse[] = [];
  let recentJobs: JobPostResponse[] = [];
  let applications: JobApplicationResponse[] = [];
  let applicationError: HomeApplicationError | undefined;

  try {
    const results = await Promise.allSettled([
      fetchWithAuth<JobPostResponse[]>(
        "/jobs?semanticSearch=true&sortBy=similarity",
      ),
      fetchWithAuth<JobPostResponse[]>("/jobs?sortBy=date"),
      fetchWithAuth<JobApplicationResponse[]>("/jobs/my-applications"),
    ]);

    if (results[0].status === "fulfilled") recommendedJobs = results[0].value;
    if (results[1].status === "fulfilled") recentJobs = results[1].value;
    if (results[2].status === "fulfilled") applications = results[2].value;
    else applicationError = applicationLoadError(results[2].reason);
  } catch (err) {
    // Fail gracefully with fallback states
    console.error("Failed to load initial home feed data:", err);
  }

  return (
    <div className="py-4 md:py-6">
      <HomeContainer
        profile={profile}
        recommendedJobs={recommendedJobs}
        recentJobs={recentJobs}
        applications={applications}
        applicationError={applicationError}
        initialTab={initialTab}
      />
    </div>
  );
}
