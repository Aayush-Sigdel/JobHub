import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  Users,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  MapPin,
  Code,
  Database,
  PenTool,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Check,
  Layers,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchWithAuth } from "@/lib/service-api";
import type {
  RecruiterJobSummaryResponse,
  CandidateDashboardResponse,
} from "@/types/api/recruiter";
import type { UserProfileResponse } from "@/types/api/user";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "U";
}

function formatWorkplace(type?: string) {
  switch (type) {
    case "REMOTE":
      return "Remote";
    case "HYBRID":
      return "Hybrid";
    case "ON_SITE":
      return "On-site";
    default:
      return type?.replace("_", " ") || "On-site";
  }
}

function formatJobType(type?: string) {
  switch (type) {
    case "FULL_TIME":
      return "Full-time";
    case "PART_TIME":
      return "Part-time";
    case "CONTRACT":
      return "Contract";
    case "INTERNSHIP":
      return "Internship";
    default:
      return type?.replace("_", " ") || "Full-time";
  }
}

export default async function EmployerDashboardPage() {
  let profile: UserProfileResponse | null = null;
  let jobs: RecruiterJobSummaryResponse[] = [];
  let recentCandidates: CandidateDashboardResponse[] = [];

  try {
    profile = await fetchWithAuth<UserProfileResponse>("/user/profile");
  } catch {
    // Guest or unauthenticated
  }

  try {
    jobs = await fetchWithAuth<RecruiterJobSummaryResponse[]>("/recruiter/jobs", {
      cache: "no-store",
    });
  } catch {
    jobs = [];
  }

  // Load priority / recent candidates from the top active jobs
  if (jobs.length > 0) {
    try {
      const activeJobs = jobs.filter((j) => j.isActive ?? j.active ?? true);
      const targetJobs = (activeJobs.length > 0 ? activeJobs : jobs).slice(0, 3);
      const candidatesLists = await Promise.all(
        targetJobs.map((j) =>
          fetchWithAuth<CandidateDashboardResponse[]>(
            `/recruiter/jobs/${j.id}/candidates?sortBy=date`,
            { cache: "no-store" }
          ).catch(() => [])
        )
      );
      recentCandidates = candidatesLists.flat().slice(0, 6);
    } catch {
      recentCandidates = [];
    }
  }

  // Real metric computations
  const activeJobs = jobs.filter((j) => j.isActive ?? j.active ?? false);
  const activeJobsCount = activeJobs.length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (Number(j.totalApplicants) || 0), 0);
  const pendingReview = jobs.reduce((sum, j) => sum + (Number(j.pendingReviewCount) || 0), 0);
  const shortlisted = jobs.reduce((sum, j) => sum + (Number(j.shortlistedCount) || 0), 0);

  const employerName = profile?.name || "Employer";
  const companyName = jobs[0]?.companyName || profile?.title || "Company Workspace";

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pb-6 border-b border-border/70">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {employerName}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary text-black shadow-2xs">
              <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
              <span>Verified Employer</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {companyName} • Manage active job listings, review AI-matched candidates, and track assessment results.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            asChild
            variant="outline"
            className="h-9 px-3.5 rounded-xl font-semibold text-xs cursor-pointer shadow-2xs gap-1.5"
          >
            <Link href="/candidates">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>Candidate Pipeline</span>
            </Link>
          </Button>

          <Button
            asChild
            className="h-9 px-4 rounded-xl font-bold text-xs bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-1.5"
          >
            <Link href="/post-job">
              <Plus className="w-4 h-4 text-black stroke-[3]" />
              <span>Post a Job</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4-Stat Hiring Snapshot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Roles */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Listings
            </span>
            <div className="h-8 w-8 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
              <Briefcase className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {activeJobsCount}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {jobs.length} total {jobs.length === 1 ? "posting" : "postings"} created
            </p>
          </div>
        </div>

        {/* Total Candidates */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Applicants
            </span>
            <div className="h-8 w-8 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {totalApplicants}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Received across all active pipelines
            </p>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Needs Review
            </span>
            <div className="h-8 w-8 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {pendingReview}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting initial screening
            </p>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Shortlisted
            </span>
            <div className="h-8 w-8 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {shortlisted}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Qualified for assessment or interview
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column (flex-1) */}
        <div className="flex-1 w-full space-y-6">
          {/* Active Job Postings Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
                  <Briefcase className="h-4.5 w-4.5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Active Job Listings</h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Live positions accepting applications
                  </p>
                </div>
              </div>

              {jobs.length > 0 && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground gap-1"
                >
                  <Link href="/manage-jobs">
                    <span>Manage all ({jobs.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              )}
            </div>

            {jobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 sm:p-10 text-center bg-muted/10">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-foreground">
                  <Briefcase className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">No active job postings</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Post your first role to start matching with vetted talent and evaluate candidates with practical tests.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-5 h-9 px-4 rounded-xl font-bold text-xs bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-1.5"
                >
                  <Link href="/post-job">
                    <Plus className="w-4 h-4 text-black stroke-[3]" />
                    <span>Post Your First Job</span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {jobs.slice(0, 5).map((job) => {
                  const isActive = job.isActive ?? job.active ?? true;
                  return (
                    <div
                      key={job.id}
                      className="group rounded-xl border border-border/80 bg-background p-4 sm:p-5 hover:border-foreground/20 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/candidates?jobId=${job.id}`}
                            className="font-bold text-base text-foreground hover:underline truncate"
                          >
                            {job.title}
                          </Link>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-emerald-600 dark:bg-emerald-400" : "bg-muted-foreground"
                              }`}
                            />
                            <span>{isActive ? "Active" : "Closed"}</span>
                          </span>
                        </div>

                        {/* Meta tags */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {job.location && (
                            <span className="inline-flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                              <span>{job.location}</span>
                            </span>
                          )}
                          <span className="font-medium">{formatWorkplace(job.workplaceType)}</span>
                          <span>•</span>
                          <span className="font-medium">{formatJobType(job.jobType)}</span>

                          {/* Assessment badges */}
                          {(job.hasProgrammingTask || job.hasSqlTask || job.hasDesignTask) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 text-foreground border border-border/60 text-[11px] font-medium ml-1">
                              <span>Assessments:</span>
                              {job.hasProgrammingTask && (
                                <span title="Coding Task">
                                  <Code className="w-3 h-3 text-muted-foreground" />
                                </span>
                              )}
                              {job.hasSqlTask && (
                                <span title="SQL Task">
                                  <Database className="w-3 h-3 text-muted-foreground" />
                                </span>
                              )}
                              {job.hasDesignTask && (
                                <span title="Design Task">
                                  <PenTool className="w-3 h-3 text-muted-foreground" />
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right stats & action buttons */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-sm font-bold text-foreground block">
                            {job.totalApplicants} {job.totalApplicants === 1 ? "Applicant" : "Applicants"}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            {job.pendingReviewCount} in review
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            asChild
                            size="sm"
                            className="h-8.5 px-3 rounded-xl font-bold text-xs bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-1"
                          >
                            <Link href={`/candidates?jobId=${job.id}`}>
                              <span>Pipeline</span>
                              <ArrowRight className="w-3.5 h-3.5 text-black" />
                            </Link>
                          </Button>

                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8.5 px-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                            title="Edit job listing"
                          >
                            <Link href={`/manage-jobs/${job.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent & Priority Candidates Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
                  <Users className="h-4.5 w-4.5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Recent Applicants</h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Candidates awaiting evaluation across active roles
                  </p>
                </div>
              </div>

              {recentCandidates.length > 0 && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground gap-1"
                >
                  <Link href="/candidates">
                    <span>All candidates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              )}
            </div>

            {recentCandidates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/10">
                <p className="text-sm font-semibold text-foreground">No recent applicants</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                  Applications will appear here once candidates apply to your posted jobs.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentCandidates.map((cand) => (
                  <div
                    key={cand.candidateId || cand.applicationId}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 rounded-xl border border-border shrink-0">
                        <AvatarImage src={cand.imageUrl} alt={cand.name} className="object-cover rounded-xl" />
                        <AvatarFallback className="bg-primary text-black font-bold text-xs rounded-xl">
                          {getInitials(cand.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground truncate">
                            {cand.name}
                          </span>
                          {cand.matchPercentage && cand.matchPercentage >= 40 && (
                            <span className="inline-flex items-center gap-1 bg-primary text-black font-bold px-2 py-0.5 rounded-md text-[10px] shadow-2xs">
                              <Sparkles className="w-3 h-3 text-black" />
                              <span>{Math.round(cand.matchPercentage)}% Match</span>
                            </span>
                          )}
                          {cand.allTasksPassed && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                              <span>Passed Tasks</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="truncate">{cand.jobTitle || "Job Application"}</span>
                          {cand.appliedAt && (
                            <>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(new Date(cand.appliedAt), { addSuffix: true })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {cand.candidateId && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer gap-1"
                          title="Preview candidate profile in new tab"
                        >
                          <Link
                            href={`/preview/${cand.candidateId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </Link>
                        </Button>
                      )}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        <Link href={`/candidates?jobId=${cand.jobId || ""}`}>
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (w-full lg:w-[340px]) */}
        <div className="w-full lg:w-[340px] space-y-6 shrink-0">
          {/* Quick Actions Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-3.5">
            <h2 className="text-base font-bold text-foreground">Hiring Actions</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fast shortcuts for recruiting operations and pipeline workflows.
            </p>

            <div className="space-y-2 pt-1">
              <Button
                asChild
                className="w-full h-10 rounded-xl font-bold text-xs bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-2"
              >
                <Link href="/post-job">
                  <Plus className="w-4 h-4 text-black stroke-[3]" />
                  <span>Post a New Job</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-10 rounded-xl font-semibold text-xs cursor-pointer gap-2"
              >
                <Link href="/candidates">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Review Candidate Pipeline</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-10 rounded-xl font-semibold text-xs cursor-pointer gap-2"
              >
                <Link href="/post-task">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <span>Create Assessment Task</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-10 rounded-xl font-semibold text-xs cursor-pointer gap-2"
              >
                <Link href="/manage-jobs">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>Manage All Listings</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Pipeline Breakdown Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-foreground">Pipeline Breakdown</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Status distribution across all candidate applications.
            </p>

            <div className="space-y-3 text-xs pt-1">
              <div>
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-foreground">In Screening / Review</span>
                  <span className="text-muted-foreground font-mono">{pendingReview}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all"
                    style={{
                      width: totalApplicants > 0 ? `${(pendingReview / totalApplicants) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-foreground">Shortlisted for Interview</span>
                  <span className="text-muted-foreground font-mono">{shortlisted}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: totalApplicants > 0 ? `${(shortlisted / totalApplicants) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-foreground">Total Applications</span>
                  <span className="text-muted-foreground font-mono">{totalApplicants}</span>
                </div>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs font-semibold h-9 mt-2"
            >
              <Link href="/candidates">Open Full Pipeline</Link>
            </Button>
          </div>

          {/* Automated Assessments Highlight */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-foreground" />
              <h2 className="text-base font-bold text-foreground">Evidence-Based Hiring</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              JobHub lets you attach isolated coding environments, SQL assertions, and design tasks to any job posting to verify candidate skills before interviewing.
            </p>
            <div className="pt-1">
              <Link
                href="/post-task"
                className="text-xs font-semibold text-foreground hover:underline inline-flex items-center gap-1"
              >
                <span>Configure assessment tasks</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
