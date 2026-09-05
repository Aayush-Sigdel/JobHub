import React from "react";
import { fetchWithAuth } from "@/lib/service-api";
import { HomeContainer } from "./_components/home-container";
import type { JobPostResponse, JobApplicationResponse } from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";

interface HomePageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialTab = resolvedParams?.tab || "recommended";

  let profile: UserProfileResponse | null = null;
  let recommendedJobs: JobPostResponse[] = [];
  let recentJobs: JobPostResponse[] = [];
  let applications: JobApplicationResponse[] = [];

  try {
    const results = await Promise.allSettled([
      fetchWithAuth<UserProfileResponse>("/user/profile"),
      fetchWithAuth<JobPostResponse[]>("/jobs?semanticSearch=true&sortBy=similarity"),
      fetchWithAuth<JobPostResponse[]>("/jobs?sortBy=date"),
      fetchWithAuth<JobApplicationResponse[]>("/jobs/my-applications"),
    ]);

    if (results[0].status === "fulfilled") profile = results[0].value;
    if (results[1].status === "fulfilled") recommendedJobs = results[1].value;
    if (results[2].status === "fulfilled") recentJobs = results[2].value;
    if (results[3].status === "fulfilled") applications = results[3].value;
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
        initialTab={initialTab}
      />
    </div>
  );
}
