"use client";

import React, { useState } from "react";
import { UserProfileSidebar } from "./user-profile-sidebar";
import { PersonalizedFeed } from "./personalized-feed";
import { HomeOverview, type HomeApplicationError } from "./home-overview";
import type { JobPostResponse, JobApplicationResponse } from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";

interface HomeContainerProps {
  profile: UserProfileResponse | null;
  recommendedJobs: JobPostResponse[];
  recentJobs: JobPostResponse[];
  applications: JobApplicationResponse[];
  initialTab?: string;
  applicationError?: HomeApplicationError;
}

const feedTabs = ["recommended", "saved", "tasks", "recent", "remote"];
const resolveTab = (tab: string) =>
  feedTabs.includes(tab) ? tab : "recommended";

export function HomeContainer({
  profile,
  recommendedJobs,
  recentJobs,
  applications,
  initialTab = "recommended",
  applicationError,
}: HomeContainerProps) {
  const [activeTab, setActiveTab] = useState<string>(resolveTab(initialTab));
  const [previousInitialTab, setPreviousInitialTab] = useState(initialTab);

  if (initialTab !== previousInitialTab) {
    setPreviousInitialTab(initialTab);
    setActiveTab(resolveTab(initialTab));
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-8">
      <HomeOverview
        profile={profile}
        applicationCount={applications.length}
        applicationError={applicationError}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] items-start gap-10 lg:gap-10">
        {/* CENTER COLUMN: Personalized Feed, Match Filters & Spotlight */}
        <PersonalizedFeed
          recommendedJobs={recommendedJobs}
          recentJobs={recentJobs}
          applications={applications}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="min-w-0 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-1">
          <UserProfileSidebar
            profile={profile}
            applications={applications}
            activityUnavailable={Boolean(applicationError)}
          />
        </div>
      </div>
    </div>
  );
}
