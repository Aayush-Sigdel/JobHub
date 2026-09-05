"use client";

import React, { useState } from "react";
import { UserProfileSidebar } from "./user-profile-sidebar";
import { PersonalizedFeed } from "./personalized-feed";
import { SkillsSidebar } from "./skills-sidebar";
import type { JobPostResponse, JobApplicationResponse } from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";

interface HomeContainerProps {
  profile: UserProfileResponse | null;
  recommendedJobs: JobPostResponse[];
  recentJobs: JobPostResponse[];
  applications: JobApplicationResponse[];
  initialTab?: string;
}

export function HomeContainer({
  profile,
  recommendedJobs,
  recentJobs,
  applications,
  initialTab = "recommended",
}: HomeContainerProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 pb-16">
      {/* LEFT COLUMN: Mini Profile & Discovery Navigation (Sticky on Desktop) */}
      <UserProfileSidebar
        profile={profile}
        applications={applications}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* CENTER COLUMN: Personalized Feed, Match Filters & Spotlight */}
      <PersonalizedFeed
        profile={profile}
        recommendedJobs={recommendedJobs}
        recentJobs={recentJobs}
        applications={applications}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* RIGHT COLUMN: Skills & Profile Strength & Career Insights (Sticky on Desktop) */}
      <SkillsSidebar profile={profile} onTabChange={setActiveTab} />
    </div>
  );
}
