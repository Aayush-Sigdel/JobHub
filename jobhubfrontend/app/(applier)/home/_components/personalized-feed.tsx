"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/jobs/JobCard";
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
    collaboration: "Collaboration",
  };
  if (extraLabels[activeTab])
    tabs.push({ id: activeTab, label: extraLabels[activeTab] });

  return (
    <section aria-label="Your job feed" className="min-w-0">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">
          {activeTab === "collaboration"
            ? "Connect with your peers"
            : "Opportunities to explore"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeTab === "collaboration"
            ? "Practice, learn, and build together."
            : "Explore your recommendations or catch up on the latest roles."}
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
          {activeTab === "collaboration" ? (
            <div className="flex flex-col gap-4">
              {/* Collaboration Hub Header */}
              <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Candidate Peer Collaboration Hub
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                    Connect with fellow engineers for mock interviews, pair
                    programming on real-world projects, or assemble teams for
                    upcoming hackathons.
                  </p>
                </div>
                <Button className="bg-primary text-black font-bold text-xs h-9 px-4 rounded-xl hover:bg-primary/90 shadow-xs shrink-0 cursor-pointer">
                  + Host Collaboration Room
                </Button>
              </div>

              {/* Active Collaboration Rooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room 1 */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-foreground">
                          Mock Technical Interview
                        </span>
                        <h3 className="font-bold text-base text-foreground mt-2">
                          System Design & Frontend Architecture
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Active Now
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Practice 45-minute simulated system design for
                      high-traffic web applications with peer review and rubric
                      scoring.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        Next.js
                      </span>
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        Web Performance
                      </span>
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        State Architecture
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Host: Sarah L. · 2/3 Slots Filled
                    </span>
                    <Button
                      size="sm"
                      className="bg-primary text-black font-bold text-xs h-8 px-3.5 rounded-xl hover:bg-primary/90 shadow-xs cursor-pointer"
                    >
                      Join Room
                    </Button>
                  </div>
                </div>

                {/* Room 2 */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-foreground">
                          Pair Coding Sprint
                        </span>
                        <h3 className="font-bold text-base text-foreground mt-2">
                          Algorithms & Data Structures Prep
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Active Now
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Live pair coding session tackling LeetCode Medium/Hard
                      problems on graphs, dynamic programming, and heaps.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        TypeScript
                      </span>
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        Python
                      </span>
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        Graphs & DP
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Host: David M. · 1 Slot Available
                    </span>
                    <Button
                      size="sm"
                      className="bg-primary text-black font-bold text-xs h-8 px-3.5 rounded-xl hover:bg-primary/90 shadow-xs cursor-pointer"
                    >
                      Join Room
                    </Button>
                  </div>
                </div>

                {/* Room 3 */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-foreground">
                          Hackathon Project Squad
                        </span>
                        <h3 className="font-bold text-base text-foreground mt-2">
                          AI Job Intelligence & Resume Screener
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                        Starting 6 PM
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Building an open-source evaluation dashboard for vector
                      matching engines. Looking for 1 backend developer
                      proficient in Python/FastAPI.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        FastAPI
                      </span>
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        PostgreSQL
                      </span>
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        Docker
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Host: Alex R. · 3/4 Members
                    </span>
                    <Button
                      size="sm"
                      className="bg-primary text-black font-bold text-xs h-8 px-3.5 rounded-xl hover:bg-primary/90 shadow-xs cursor-pointer"
                    >
                      Request to Join
                    </Button>
                  </div>
                </div>

                {/* Room 4 */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-foreground">
                          Peer Code Review
                        </span>
                        <h3 className="font-bold text-base text-foreground mt-2">
                          Full-Stack Portfolio & PR Review
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                        Open Queue
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Bring your pull request or portfolio project to get
                      actionable feedback from peer engineers on architecture,
                      security, and clean code.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        Code Review
                      </span>
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        Architecture
                      </span>
                      <span className="text-[11px] font-medium bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        Testing
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Host: Elena K. · 2 Slots Open
                    </span>
                    <Button
                      size="sm"
                      className="bg-primary text-black font-bold text-xs h-8 px-3.5 rounded-xl hover:bg-primary/90 shadow-xs cursor-pointer"
                    >
                      Join Room
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : jobs.length ? (
            <div>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isApplied={appliedIds.has(job.id)}
                />
              ))}
            </div>
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
