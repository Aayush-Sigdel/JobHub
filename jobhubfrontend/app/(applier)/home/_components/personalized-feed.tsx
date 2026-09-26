"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginatedJobFeed } from "./paginated-job-feed";
import { useLocalSavedJobs } from "@/lib/hooks/use-local-jobs";
import type { JobPostResponse, JobApplicationResponse } from "@/types/api/jobs";

interface PersonalizedFeedProps {
  recommendedJobs: JobPostResponse[];
  recentJobs: JobPostResponse[];
  applications: JobApplicationResponse[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PersonalizedFeed({
  recommendedJobs,
  recentJobs,
  applications,
  activeTab,
  onTabChange,
}: PersonalizedFeedProps) {
  const { savedJobs } = useLocalSavedJobs();
  const allJobs = Array.from(
    new Map(
      [...recommendedJobs, ...recentJobs].map((job) => [job.id, job]),
    ).values(),
  );
  const appliedIds = new Set(
    applications.map((application) => application.jobPostId),
  );
  const jobs =
    activeTab === "recent"
      ? recentJobs.length
        ? recentJobs
        : recommendedJobs
      : activeTab === "saved"
        ? allJobs.filter((job) =>
            savedJobs.some((saved) => saved.jobId === job.id),
          )
        : activeTab === "remote"
          ? allJobs.filter((job) => job.workplaceType === "REMOTE")
          : activeTab === "tasks"
            ? allJobs.filter(
                (job) =>
                  job.hasProgrammingTask || job.hasDesignTask || job.hasSqlTask,
              )
            : recommendedJobs.length
              ? recommendedJobs
              : recentJobs;
  const tabs = [
    { id: "recommended", label: "For you" },
    { id: "recent", label: "Latest jobs" },
  ];
  const extraLabels: Record<string, string> = {
    saved: "Saved jobs",
    remote: "Remote",
    tasks: "Assessments",
  };
  if (extraLabels[activeTab])
    tabs.push({ id: activeTab, label: extraLabels[activeTab] });

  return (
    <section id="job-feed" aria-label="Your job feed" className="min-w-0 scroll-mt-24">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Opportunities to explore</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore your recommendations or catch up on the latest roles.
        </p>
      </header>
      <Tabs value={activeTab} onValueChange={onTabChange} className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-1">
          <TabsList
            variant="line"
            aria-label="Job feed"
            className="h-10 gap-5 p-0"
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-0 py-2 data-[state=active]:text-foreground data-[state=active]:after:opacity-100"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Link
            href="/find-job"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Browse all jobs <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <TabsContent value={activeTab} className="mt-0">
          {jobs.length ? (
            <PaginatedJobFeed
              key={activeTab}
              jobs={jobs}
              appliedIds={appliedIds}
            />
          ) : (
            <div className="py-16 text-center">
              <h2 className="text-base font-semibold">
                {activeTab === "saved"
                  ? "No saved jobs yet"
                  : "No opportunities here yet"}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {activeTab === "saved"
                  ? "Save a role using its bookmark button to come back to it later."
                  : "Browse all jobs to explore more roles and find something that fits."}
              </p>
              <Button asChild variant="outline" className="mt-5 rounded-xl">
                <Link href="/find-job">Find jobs</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
