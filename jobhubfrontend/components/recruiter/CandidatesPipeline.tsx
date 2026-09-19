"use client";

import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { updateJobAction, deleteJobAction } from "@/lib/actions/jobs";
import type {
  RecruiterJobSummaryResponse,
  CandidateDashboardResponse,
} from "@/types/api/recruiter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import KanbanView from "@/components/recruiter/KanbanView";
import CandidateDetailDrawer from "@/components/recruiter/CandidateDetailDrawer";
import CandidatePagination from "@/components/recruiter/CandidatePagination";
import {
  IconSearch,
  IconFilter,
  IconX,
  IconEye,
  IconArrowRight,
  IconCircleCheck,
  IconAlertCircle,
  IconShieldExclamation,
  IconShieldCheck,
  IconLayoutKanban,
  IconList,
  IconBriefcase,
  IconUsers,
  IconPencil,
  IconPlus,
  IconExternalLink,
  IconSparkles,
  IconPower,
  IconTrash,
  IconCode,
  IconDatabase,
  IconPaint,
} from "@tabler/icons-react";
import { calculateSupportedOverallSimilarity } from "@/lib/semantic-match";
import { paginateCandidates } from "@/lib/candidate-pagination";

interface CandidatesPipelineProps {
  jobs: RecruiterJobSummaryResponse[];
  candidates: CandidateDashboardResponse[];
  selectedJobId: string;
  defaultTab?: "candidates" | "details";
}

function isJobActive(job: RecruiterJobSummaryResponse) {
  return job.isActive ?? job.active ?? false;
}

export default function CandidatesPipeline({
  jobs,
  candidates,
  selectedJobId,
  defaultTab = "candidates",
}: CandidatesPipelineProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobsState, setJobsState] = useState(jobs);
  const [previousJobs, setPreviousJobs] = useState(jobs);
  if (previousJobs !== jobs) {
    setPreviousJobs(jobs);
    setJobsState(jobs);
  }
  const [isActionPending, startActionTransition] = useTransition();

  const [jobSearch, setJobSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "similarity",
  );
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateDashboardResponse | null>(null);
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidatePageSize, setCandidatePageSize] = useState(10);

  const activeTab =
    (searchParams.get("tab") as "candidates" | "details") || defaultTab;
  const status = searchParams.get("status") || "ALL";
  const minSimilarity = searchParams.get("minSimilarity") || "ALL";
  const fromDateTime = searchParams.get("fromDateTime") || "";
  const toDateTime = searchParams.get("toDateTime") || "";

  const isAllJobs = selectedJobId === "all";

  const selectedJob = useMemo(
    () => (isAllJobs ? null : jobsState.find((j) => j.id === selectedJobId)),
    [isAllJobs, jobsState, selectedJobId],
  );

  const totalApplicantsAcrossAllJobs = useMemo(
    () => jobsState.reduce((sum, j) => sum + (j.totalApplicants || 0), 0),
    [jobsState],
  );

  // Jobs sorted by latest created (newest first, Gemini-style)
  const sortedJobs = useMemo(() => {
    return [...jobsState].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [jobsState]);

  // Jobs filtered by sidebar search
  const filteredJobs = useMemo(() => {
    if (!jobSearch.trim()) return sortedJobs;
    const q = jobSearch.trim().toLowerCase();
    return sortedJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.workplaceType.toLowerCase().includes(q) ||
        job.jobType.toLowerCase().includes(q),
    );
  }, [sortedJobs, jobSearch]);

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const toggleListing = (job: RecruiterJobSummaryResponse) => {
    const currentlyActive = isJobActive(job);
    startActionTransition(async () => {
      try {
        const updated = await updateJobAction(job.id, {
          isActive: !currentlyActive,
          active: !currentlyActive,
        });
        const nextActive =
          updated.isActive ?? updated.active ?? !currentlyActive;
        setJobsState((current) =>
          current.map((item) =>
            item.id === job.id
              ? { ...item, isActive: nextActive, active: nextActive }
              : item,
          ),
        );
        toast.success(
          nextActive ? "Job listing activated." : "Job listing deactivated.",
        );
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update job status.",
        );
      }
    });
  };

  const removeListing = (job: RecruiterJobSummaryResponse) => {
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`))
      return;
    startActionTransition(async () => {
      try {
        await deleteJobAction(job.id);
        setJobsState((current) => current.filter((item) => item.id !== job.id));
        toast.success("Job listing deleted.");
        if (selectedJobId === job.id) {
          updateFilters("jobId", "all");
        }
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to delete job listing.",
        );
      }
    });
  };

  const dateTimeInputValue = (value: string) =>
    value ? value.slice(0, 16) : "";
  const updateDateFilter = (key: string, value: string) => {
    updateFilters(key, value ? new Date(value).toISOString() : "");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== (searchParams.get("search") || "")) {
        updateFilters("search", search);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [search, searchParams, updateFilters]);

  // Aggregate stats across candidates for the pipeline stage tabs
  const stats = useMemo(() => {
    const total = candidates.length;
    const applied = candidates.filter(
      (c) => (c.status || "APPLIED") === "APPLIED",
    ).length;
    const inReview = candidates.filter((c) => c.status === "IN_REVIEW").length;
    const shortlisted = candidates.filter(
      (c) => c.status === "SHORTLISTED",
    ).length;
    const accepted = candidates.filter((c) => c.status === "ACCEPTED").length;
    const rejected = candidates.filter((c) => c.status === "REJECTED").length;
    return { total, applied, inReview, shortlisted, accepted, rejected };
  }, [candidates]);

  const strongMatchesCount = useMemo(
    () =>
      candidates.filter(
        (c) => (calculateSupportedOverallSimilarity(c) ?? 0) >= 0.75,
      ).length,
    [candidates],
  );

  const passedAllTasksCount = useMemo(
    () => candidates.filter((c) => c.allTasksPassed).length,
    [candidates],
  );

  // Real-time client-side sorting across candidates
  const sortedCandidates = useMemo(() => {
    const list = [...candidates];
    switch (sortBy) {
      case "similarity":
        return list.sort(
          (a, b) =>
            (calculateSupportedOverallSimilarity(b) ?? -1) -
            (calculateSupportedOverallSimilarity(a) ?? -1),
        );
      case "similarity_asc":
        return list.sort(
          (a, b) =>
            (calculateSupportedOverallSimilarity(a) ?? 999) -
            (calculateSupportedOverallSimilarity(b) ?? 999),
        );
      case "date":
        return list.sort(
          (a, b) =>
            new Date(b.appliedAt || 0).getTime() -
            new Date(a.appliedAt || 0).getTime(),
        );
      case "date_asc":
        return list.sort(
          (a, b) =>
            new Date(a.appliedAt || 0).getTime() -
            new Date(b.appliedAt || 0).getTime(),
        );
      case "score":
        return list.sort((a, b) => {
          const scoreA =
            (a.designSubmission?.achievedScore || 0) +
            (a.programmingSubmission?.achievedScore || 0) +
            (a.sqlSubmission?.achievedScore || 0);
          const scoreB =
            (b.designSubmission?.achievedScore || 0) +
            (b.programmingSubmission?.achievedScore || 0) +
            (b.sqlSubmission?.achievedScore || 0);
          return scoreB - scoreA;
        });
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "flags":
        return list.sort(
          (a, b) => (a.tabSwitchCount || 0) - (b.tabSwitchCount || 0),
        );
      case "status":
        return list.sort((a, b) =>
          (a.status || "").localeCompare(b.status || ""),
        );
      default:
        return list;
    }
  }, [candidates, sortBy]);

  const candidatePagination = useMemo(
    () =>
      paginateCandidates(sortedCandidates, candidatePage, candidatePageSize),
    [candidatePage, candidatePageSize, sortedCandidates],
  );

  const activeAdvancedFilterCount = [
    minSimilarity !== "ALL",
    Boolean(fromDateTime),
    Boolean(toDateTime),
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100dvh-5.5rem)] w-full min-h-0 overflow-hidden animate-in fade-in duration-200">
      {/* Left Sidebar: Claude/Gemini-Style Job Navigator */}
      <aside className="w-full lg:w-80 xl:w-88 shrink-0 flex flex-col rounded-2xl bg-card border border-border shadow-xs overflow-hidden h-full">
        {/* Sidebar Fixed Top Header */}
        <div className="p-3.5 space-y-3 border-b border-border/70 shrink-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <IconBriefcase className="size-4.5 text-foreground" />
              <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Job Postings
              </span>
            </div>
            <Badge
              variant="secondary"
              className="font-mono text-xs font-semibold px-2.5 py-0.5"
            >
              {jobsState.length}
            </Badge>
          </div>

          {/* Top Action: Post a Job */}
          <Button
            asChild
            className="w-full h-10.5 rounded-xl bg-primary text-black hover:bg-primary/90 font-bold text-sm justify-start px-4 gap-2.5 shadow-xs cursor-pointer"
          >
            <Link href="/post-job">
              <IconPlus className="size-4.5 shrink-0 text-black stroke-[3]" />
              <span>Post a Job</span>
            </Link>
          </Button>

          {/* Search Listings Input */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search job listings..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="h-9.5 pl-9 pr-8 text-sm rounded-xl bg-secondary/50 border-border"
            />
            {jobSearch && (
              <button
                type="button"
                onClick={() => setJobSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>

          {/* Pinned Item: All Job Postings */}
          <button
            type="button"
            onClick={() => updateFilters("jobId", "all")}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
              isAllJobs
                ? "bg-muted text-foreground border-2 border-foreground/30 font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-transparent font-medium"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isAllJobs
                    ? "bg-primary text-black"
                    : "bg-secondary text-foreground"
                }`}
              >
                <IconUsers className="size-4" />
              </div>
              <div className="text-left truncate">
                <span className="block truncate font-bold text-sm text-foreground">
                  All Job Postings
                </span>
                <span className="text-xs block font-normal text-muted-foreground">
                  Across {jobsState.length} listings
                </span>
              </div>
            </div>
            <span
              className={`font-mono text-xs px-2.5 py-0.5 rounded-full shrink-0 ${
                isAllJobs
                  ? "bg-primary text-black font-bold"
                  : "bg-secondary text-foreground font-semibold"
              }`}
            >
              {totalApplicantsAcrossAllJobs}
            </span>
          </button>
        </div>

        {/* Scrollable Job Listings List (Independent Scrollbar) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          <div className="flex items-center justify-between px-1.5 pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Recent Postings ({filteredJobs.length})
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Latest first
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No matching listings found.
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              const active = isJobActive(job);

              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => updateFilters("jobId", job.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? "bg-muted text-foreground border-2 border-foreground/30 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-transparent"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2.5 rounded-full shrink-0 ${
                          active
                            ? "bg-emerald-600 dark:bg-emerald-400"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <span className="truncate text-sm font-semibold text-foreground group-hover:text-foreground">
                        {job.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 truncate pl-4.5">
                      <span>{job.workplaceType}</span>
                      <span>•</span>
                      <span>{job.jobType}</span>
                      {job.createdAt && (
                        <>
                          <span>•</span>
                          <span className="font-mono">
                            {formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: false,
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span
                    className={`font-mono text-xs px-2.5 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? "bg-primary text-black font-bold"
                        : "bg-secondary text-foreground font-semibold group-hover:bg-muted"
                    }`}
                  >
                    {job.totalApplicants || 0}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Sidebar Bottom Bar */}
        <div className="p-3 border-t border-border/70 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-secondary transition-colors font-semibold"
          >
            <span>Dashboard</span>
            <IconArrowRight className="size-3.5" />
          </Link>
        </div>
      </aside>

      {/* Right Main Content Area: Chatbot-Style Active Workspace */}
      <main className="flex-1 min-w-0 h-full flex flex-col rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
        {/* Main Workspace Sticky Top Bar (Claude / Gemini Style) */}
        <div className="px-5 py-3.5 border-b border-border bg-card/95 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Left: Active Scope Title & Metadata */}
          <div className="min-w-0 flex-1">
            {isAllJobs ? (
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                  All Job Postings & Candidates
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Managing {jobsState.length} listings • {candidates.length}{" "}
                  total applicant pool
                </p>
              </div>
            ) : selectedJob ? (
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                    {selectedJob.title}
                  </h1>
                  <Badge
                    className={`text-xs font-semibold px-2 py-0.5 ${
                      isJobActive(selectedJob)
                        ? "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}
                  >
                    {isJobActive(selectedJob) ? "Active" : "Closed"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold px-2 py-0.5 bg-secondary border-border"
                  >
                    {selectedJob.workplaceType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold px-2 py-0.5 bg-secondary border-border"
                  >
                    {selectedJob.jobType}
                  </Badge>
                  {selectedJob.tabLock && (
                    <Badge className="bg-secondary text-foreground border-border text-xs font-semibold px-2 py-0.5 gap-1">
                      <IconShieldCheck className="size-3 text-foreground" />
                      <span>Tab Lock</span>
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedJob.location ||
                    selectedJob.companyName ||
                    "Employer Listing"}{" "}
                  • {candidates.length} applicant
                  {candidates.length === 1 ? "" : "s"}
                </p>
              </div>
            ) : null}
          </div>

          {/* Center: View Switcher (Claude / Gemini Style Segment Tabs) */}
          <div className="flex items-center p-1 rounded-xl bg-secondary border border-border shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => updateFilters("tab", "candidates")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "candidates"
                  ? "bg-primary text-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconUsers className="size-4" />
              <span>Candidates</span>
              <span
                className={`font-mono text-xs px-2 py-0.2 rounded-full ${
                  activeTab === "candidates"
                    ? "bg-black text-white font-bold"
                    : "bg-muted text-foreground font-semibold"
                }`}
              >
                {candidates.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateFilters("tab", "details")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "details"
                  ? "bg-primary text-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconBriefcase className="size-4" />
              <span>{isAllJobs ? "Manage Listings" : "Job Overview"}</span>
            </button>
          </div>

          {/* Right: Quick Action Controls */}
          {selectedJob && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={isJobActive(selectedJob) ? "outline" : "default"}
                size="sm"
                onClick={() => toggleListing(selectedJob)}
                disabled={isActionPending}
                className={`h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer ${
                  isJobActive(selectedJob)
                    ? "text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                    : "bg-primary text-black hover:bg-primary/90 font-bold"
                }`}
                title={
                  isJobActive(selectedJob)
                    ? "Deactivate job listing"
                    : "Activate job listing"
                }
              >
                <IconPower className="size-3.5" />
                <span>
                  {isJobActive(selectedJob) ? "Deactivate" : "Activate"}
                </span>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 border-border hover:bg-muted"
              >
                <Link href={`/manage-jobs/${selectedJob.id}/edit`}>
                  <IconPencil className="size-3.5" />
                  <span>Edit</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 border-border hover:bg-muted"
              >
                <Link href={`/find-job/${selectedJob.id}`} target="_blank">
                  <IconExternalLink className="size-3.5" />
                  <span>View Post</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => removeListing(selectedJob)}
                disabled={isActionPending}
                className="h-9 w-9 p-0 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-border cursor-pointer"
                title="Delete job listing"
              >
                <IconTrash className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable Main Workspace Body (Independent Scrollbar) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          {activeTab === "details" ? (
            /* TAB 1: JOB DETAILS & LISTING MANAGEMENT VIEW */
            selectedJob ? (
              /* Specific Job Management Overview */
              <div className="space-y-6 max-w-5xl">
                {/* Hero Summary Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-3 rounded-full shrink-0 ${
                          isJobActive(selectedJob)
                            ? "bg-emerald-600 dark:bg-emerald-400"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Listing Status:{" "}
                        {isJobActive(selectedJob)
                          ? "Live & Accepting Applicants"
                          : "Deactivated"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground truncate">
                      {selectedJob.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedJob.companyName} •{" "}
                      {selectedJob.location || "Location not specified"} •
                      Created{" "}
                      {selectedJob.createdAt
                        ? format(new Date(selectedJob.createdAt), "PPP")
                        : "recently"}
                    </p>
                  </div>

                  <Button
                    onClick={() => updateFilters("tab", "candidates")}
                    className="h-11 px-5 rounded-xl font-bold text-sm bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer shrink-0 gap-2"
                  >
                    <IconUsers className="size-4.5 text-black" />
                    <span>Review {candidates.length} Applicants</span>
                    <IconArrowRight className="size-4 text-black stroke-[2.5]" />
                  </Button>
                </div>

                {/* 4 Performance Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Applicants
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1 font-mono">
                      {selectedJob.totalApplicants || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Candidates submitted
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Pending Review
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1 font-mono">
                      {selectedJob.pendingReviewCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Need screening
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Shortlisted
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1 font-mono">
                      {selectedJob.shortlistedCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      High fit candidates
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Anti-Cheat
                    </p>
                    <p className="text-base font-bold text-foreground mt-2 flex items-center gap-1.5">
                      <IconShieldCheck className="size-4.5 text-foreground" />
                      <span>
                        {selectedJob.tabLock ? "Enforced" : "Disabled"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Browser tab monitor
                    </p>
                  </div>
                </div>

                {/* Role Details & Assessment Tasks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: Role Specification */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                      <IconBriefcase className="size-4.5 text-foreground" />
                      <h3 className="font-bold text-base text-foreground">
                        Role Specifications
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">
                          Workplace Model
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedJob.workplaceType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">
                          Employment Type
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedJob.jobType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">
                          Location
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedJob.location || "Remote / Unspecified"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">
                          Company Name
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedJob.companyName}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl text-xs font-semibold gap-1.5 flex-1"
                      >
                        <Link href={`/manage-jobs/${selectedJob.id}/edit`}>
                          <IconPencil className="size-3.5" />
                          <span>Edit Role Details</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl text-xs font-semibold gap-1.5 flex-1"
                      >
                        <Link
                          href={`/find-job/${selectedJob.id}`}
                          target="_blank"
                        >
                          <IconExternalLink className="size-3.5" />
                          <span>Public Preview</span>
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Right: Technical Assessments Attached */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                      <IconCode className="size-4.5 text-foreground" />
                      <h3 className="font-bold text-base text-foreground">
                        Technical Assessments
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2">
                          <IconPaint className="size-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            UI/Design Challenge
                          </span>
                        </div>
                        <Badge
                          className={`text-xs font-semibold px-2 py-0.5 ${
                            selectedJob.hasDesignTask
                              ? "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800"
                              : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          {selectedJob.hasDesignTask ? "Configured" : "None"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2">
                          <IconCode className="size-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            Programming Challenge
                          </span>
                        </div>
                        <Badge
                          className={`text-xs font-semibold px-2 py-0.5 ${
                            selectedJob.hasProgrammingTask
                              ? "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800"
                              : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          {selectedJob.hasProgrammingTask
                            ? "Configured"
                            : "None"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2">
                          <IconDatabase className="size-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            SQL Database Challenge
                          </span>
                        </div>
                        <Badge
                          className={`text-xs font-semibold px-2 py-0.5 ${
                            selectedJob.hasSqlTask
                              ? "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800"
                              : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          {selectedJob.hasSqlTask ? "Configured" : "None"}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground pt-1">
                      Candidates must pass attached challenges to receive the
                      verified badge on their application.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* All Listings Management Arena */
              <div className="space-y-4 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      All Job Listings
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Manage active postings, toggle statuses, and jump into
                      candidate pipelines.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="h-10 rounded-xl bg-primary text-black hover:bg-primary/90 font-bold text-sm px-4 gap-2 shrink-0"
                  >
                    <Link href="/post-job">
                      <IconPlus className="size-4 text-black stroke-[3]" />
                      <span>Post a New Job</span>
                    </Link>
                  </Button>
                </div>

                <div className="space-y-3">
                  {filteredJobs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
                      <p className="font-bold text-foreground">
                        No listings found matching your search.
                      </p>
                    </div>
                  ) : (
                    filteredJobs.map((job) => {
                      const active = isJobActive(job);
                      return (
                        <div
                          key={job.id}
                          className="rounded-2xl border border-border bg-card p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-foreground/30 transition-all"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`size-2.5 rounded-full shrink-0 ${
                                  active
                                    ? "bg-emerald-600 dark:bg-emerald-400"
                                    : "bg-muted-foreground"
                                }`}
                              />
                              <h3 className="font-bold text-base text-foreground truncate">
                                {job.title}
                              </h3>
                              <Badge
                                className={`text-xs font-semibold px-2 py-0.5 ${
                                  active
                                    ? "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800"
                                    : "bg-secondary text-muted-foreground border-border"
                                }`}
                              >
                                {active ? "Active" : "Closed"}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {job.companyName} • {job.location || "Remote"} •{" "}
                              {job.workplaceType} • {job.jobType}
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                            <Button
                              size="sm"
                              onClick={() => {
                                updateFilters("jobId", job.id);
                                updateFilters("tab", "candidates");
                              }}
                              className="h-9 px-3.5 rounded-xl font-bold text-xs bg-primary text-black hover:bg-primary/90 gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <IconUsers className="size-3.5 text-black" />
                              <span>{job.totalApplicants || 0} Candidates</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleListing(job)}
                              disabled={isActionPending}
                              className="h-9 px-3 rounded-xl text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <IconPower className="size-3.5" />
                              <span>{active ? "Deactivate" : "Activate"}</span>
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 rounded-xl text-xs font-semibold gap-1"
                            >
                              <Link href={`/manage-jobs/${job.id}/edit`}>
                                <IconPencil className="size-3.5" />
                                <span>Edit</span>
                              </Link>
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 rounded-xl text-xs font-semibold gap-1"
                            >
                              <Link
                                href={`/find-job/${job.id}`}
                                target="_blank"
                              >
                                <IconExternalLink className="size-3.5" />
                              </Link>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeListing(job)}
                              disabled={isActionPending}
                              className="h-9 w-9 p-0 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <IconTrash className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )
          ) : (
            /* TAB 2: CANDIDATES & PIPELINE VIEW */
            <>
              {/* Candidate Overview Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Pool
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-0.5 font-mono">
                      {candidates.length}
                    </p>
                  </div>
                  <div className="size-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                    <IconUsers className="size-4.5 text-foreground" />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Strong Matches
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-0.5 font-mono">
                      {strongMatchesCount}
                    </p>
                  </div>
                  <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-200">
                    <IconSparkles className="size-4.5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Passed Tasks
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-0.5 font-mono">
                      {passedAllTasksCount}
                    </p>
                  </div>
                  <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-200">
                    <IconCircleCheck className="size-4.5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Shortlisted
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-0.5 font-mono">
                      {stats.shortlisted}
                    </p>
                  </div>
                  <div className="size-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-800 dark:text-indigo-200">
                    <IconBriefcase className="size-4.5 text-indigo-700 dark:text-indigo-400" />
                  </div>
                </div>
              </div>

              {/* Interactive Pipeline Stage Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "ALL", label: "All Candidates", count: stats.total },
                  { id: "APPLIED", label: "Applied", count: stats.applied },
                  {
                    id: "IN_REVIEW",
                    label: "In Screening",
                    count: stats.inReview,
                  },
                  {
                    id: "SHORTLISTED",
                    label: "Shortlisted",
                    count: stats.shortlisted,
                  },
                  { id: "ACCEPTED", label: "Accepted", count: stats.accepted },
                  { id: "REJECTED", label: "Archived", count: stats.rejected },
                ].map((stage) => {
                  const isActive =
                    (status === "ALL" && stage.id === "ALL") ||
                    status === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() =>
                        updateFilters(
                          "status",
                          stage.id === "ALL" ? "" : stage.id,
                        )
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-primary text-black font-bold shadow-xs"
                          : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                      }`}
                    >
                      <span>{stage.label}</span>
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-black text-white dark:bg-black dark:text-white font-bold"
                            : "bg-secondary text-foreground font-semibold"
                        }`}
                      >
                        {stage.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Candidate Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border shadow-xs">
                {/* Left: Search + Stage Filter + Sort + Advanced */}
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                    <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search candidate, skill, title..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9.5 pr-8 h-10 rounded-xl text-sm bg-secondary/50 border-border"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <IconX className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Stage Filter */}
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      updateFilters("status", value === "ALL" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-10 w-[145px] rounded-xl text-sm font-medium bg-secondary/50 border-border">
                      <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ALL">All Stages</SelectItem>
                      <SelectItem value="APPLIED">Applied</SelectItem>
                      <SelectItem value="IN_REVIEW">In Screening</SelectItem>
                      <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Dropdown */}
                  <Select
                    value={sortBy}
                    onValueChange={(val) => {
                      setSortBy(val);
                      updateFilters("sortBy", val);
                    }}
                  >
                    <SelectTrigger className="h-10 w-[165px] rounded-xl text-sm font-medium bg-secondary/50 border-border">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="similarity">
                        Match (High-Low)
                      </SelectItem>
                      <SelectItem value="similarity_asc">
                        Match (Low-High)
                      </SelectItem>
                      <SelectItem value="date">Newest Applied</SelectItem>
                      <SelectItem value="date_asc">Oldest Applied</SelectItem>
                      <SelectItem value="score">Assessment Score</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="flags">Cleanest (No Flags)</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Advanced Filters Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={
                          activeAdvancedFilterCount > 0 ? "default" : "outline"
                        }
                        size="sm"
                        className={`h-10 px-3.5 rounded-xl text-sm font-semibold gap-1.5 cursor-pointer ${
                          activeAdvancedFilterCount > 0
                            ? "bg-primary text-black hover:bg-primary/90 font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <IconFilter className="size-4" />
                        <span>Filters</span>
                        {activeAdvancedFilterCount > 0 && (
                          <span className="size-4 rounded-full bg-black text-white font-mono text-[10px] flex items-center justify-center font-bold">
                            {activeAdvancedFilterCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-80 p-4 space-y-3.5 rounded-2xl"
                      align="start"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-2.5">
                        <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                          Advanced Filters
                        </span>
                        {activeAdvancedFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const params = new URLSearchParams(
                                searchParams.toString(),
                              );
                              params.delete("minSimilarity");
                              params.delete("fromDateTime");
                              params.delete("toDateTime");
                              router.push(`?${params.toString()}`);
                            }}
                            className="text-xs text-foreground font-semibold hover:underline cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">
                          Min Similarity
                        </Label>
                        <Select
                          value={minSimilarity}
                          onValueChange={(val) =>
                            updateFilters(
                              "minSimilarity",
                              val === "ALL" ? "" : val,
                            )
                          }
                        >
                          <SelectTrigger className="w-full h-10 rounded-xl text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="ALL">Any Match Score</SelectItem>
                            <SelectItem value="0.25">25%+ match</SelectItem>
                            <SelectItem value="0.50">50%+ match</SelectItem>
                            <SelectItem value="0.75">75%+ match</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="pop-from"
                          className="text-xs font-semibold text-foreground"
                        >
                          Applied From
                        </Label>
                        <Input
                          id="pop-from"
                          type="datetime-local"
                          value={dateTimeInputValue(fromDateTime)}
                          onChange={(e) =>
                            updateDateFilter("fromDateTime", e.target.value)
                          }
                          className="h-10 rounded-xl text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="pop-to"
                          className="text-xs font-semibold text-foreground"
                        >
                          Applied To
                        </Label>
                        <Input
                          id="pop-to"
                          type="datetime-local"
                          value={dateTimeInputValue(toDateTime)}
                          onChange={(e) =>
                            updateDateFilter("toDateTime", e.target.value)
                          }
                          className="h-10 rounded-xl text-sm"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Right: View Toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 rounded-xl bg-secondary border border-border">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        viewMode === "list"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Table view"
                    >
                      <IconList className="size-4" />
                      <span>List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("kanban")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        viewMode === "kanban"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Kanban view"
                    >
                      <IconLayoutKanban className="size-4" />
                      <span>Kanban</span>
                    </button>
                  </div>

                  {(search ||
                    status !== "ALL" ||
                    minSimilarity !== "ALL" ||
                    fromDateTime ||
                    toDateTime) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        router.push(
                          selectedJobId !== "all"
                            ? `?jobId=${selectedJobId}`
                            : "?",
                        );
                      }}
                      className="h-10 px-3 text-sm text-foreground font-semibold hover:underline"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Candidate Table or Kanban Arena */}
              <div className="flex-1 min-h-[400px]">
                {sortedCandidates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-14 text-center bg-card space-y-2.5">
                    <div className="size-11 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                      <IconUsers className="size-5" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      No candidates match your criteria
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      {search || status !== "ALL" || minSimilarity !== "ALL"
                        ? "Try clearing filters or adjusting your search query."
                        : "No applications have been received for this selection yet."}
                    </p>
                    {(search ||
                      status !== "ALL" ||
                      minSimilarity !== "ALL") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch("");
                          router.push(
                            selectedJobId !== "all"
                              ? `?jobId=${selectedJobId}`
                              : "?",
                          );
                        }}
                        className="mt-1 rounded-xl text-xs font-semibold"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : viewMode === "kanban" ? (
                  <KanbanView
                    candidates={sortedCandidates}
                    onCandidateSelect={setSelectedCandidate}
                  />
                ) : (
                  /* High-Density Clean Scannable Candidate Table */
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-secondary/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <th className="py-3.5 px-5">Candidate</th>
                            {isAllJobs && (
                              <th className="py-3.5 px-4">Role Applied</th>
                            )}
                            <th className="py-3.5 px-4">Applied</th>
                            <th className="py-3.5 px-4">Match Evidence</th>
                            <th className="py-3.5 px-4">Evaluations</th>
                            <th className="py-3.5 px-4">Stage</th>
                            <th className="py-3.5 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                          {candidatePagination.items.map((candidate) => {
                            const similarity =
                              calculateSupportedOverallSimilarity(candidate);
                            const matchTier =
                              similarity === null
                                ? null
                                : similarity >= 0.75
                                  ? {
                                      label: "Strong Match",
                                      bg: "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800",
                                    }
                                  : similarity >= 0.45
                                    ? {
                                        label: "Good Match",
                                        bg: "bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800",
                                      }
                                    : {
                                        label: "Base Fit",
                                        bg: "bg-secondary text-foreground border-border",
                                      };

                            const stageStyle =
                              candidate.status === "SHORTLISTED"
                                ? "bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-800"
                                : candidate.status === "ACCEPTED"
                                  ? "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800"
                                  : candidate.status === "IN_REVIEW"
                                    ? "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800"
                                    : candidate.status === "REJECTED"
                                      ? "bg-zinc-200 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
                                      : "bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800";

                            return (
                              <tr
                                key={
                                  candidate.candidateId ||
                                  candidate.applicationId
                                }
                                onClick={() => setSelectedCandidate(candidate)}
                                className="hover:bg-muted/40 transition-colors cursor-pointer group"
                              >
                                {/* Candidate Identity + Skills */}
                                <td className="py-4.5 px-5">
                                  <div className="flex items-start gap-3.5 min-w-0">
                                    <Avatar className="size-12 rounded-xl border border-border shrink-0">
                                      <AvatarImage
                                        src={candidate.imageUrl}
                                        className="object-cover"
                                      />
                                      <AvatarFallback className="bg-foreground text-background font-bold text-sm">
                                        {candidate.name
                                          .substring(0, 2)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <span className="font-bold text-base text-foreground block truncate group-hover:underline transition-all">
                                        {candidate.name}
                                      </span>
                                      <span className="text-sm text-foreground/80 font-medium block truncate">
                                        {candidate.title || "Applicant"}
                                        {candidate.location
                                          ? ` • ${candidate.location}`
                                          : ""}
                                      </span>

                                      {/* Top Skills Preview */}
                                      {candidate.skills &&
                                        candidate.skills.length > 0 && (
                                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {candidate.skills
                                              .slice(0, 3)
                                              .map((skill) => (
                                                <span
                                                  key={skill.id}
                                                  className="text-xs px-2 py-0.5 rounded-md bg-secondary text-foreground font-medium border border-border"
                                                >
                                                  {skill.name}
                                                </span>
                                              ))}
                                            {candidate.skills.length > 3 && (
                                              <span className="text-xs text-muted-foreground font-mono">
                                                +{candidate.skills.length - 3}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </td>

                                {/* Applied Role (Only shown when viewing all jobs) */}
                                {isAllJobs && (
                                  <td className="py-4.5 px-4 min-w-[150px]">
                                    {candidate.jobTitle ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (candidate.jobId)
                                            updateFilters(
                                              "jobId",
                                              candidate.jobId,
                                            );
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary hover:bg-muted border border-border text-xs font-semibold text-foreground transition-colors truncate max-w-full text-left cursor-pointer"
                                        title="Filter to this job in sidebar"
                                      >
                                        <IconBriefcase className="size-3.5 text-muted-foreground shrink-0" />
                                        <span className="truncate">
                                          {candidate.jobTitle}
                                        </span>
                                      </button>
                                    ) : (
                                      <span className="text-xs text-muted-foreground italic">
                                        Unassigned
                                      </span>
                                    )}
                                  </td>
                                )}

                                {/* Applied Date */}
                                <td className="py-4.5 px-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                                  {candidate.appliedAt
                                    ? formatDistanceToNow(
                                        new Date(candidate.appliedAt),
                                        { addSuffix: true },
                                      )
                                    : "Recently"}
                                </td>

                                {/* Match Evidence */}
                                <td className="py-4.5 px-4 whitespace-nowrap">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums">
                                      {similarity !== null
                                        ? similarity.toFixed(3)
                                        : "N/A"}
                                    </span>
                                    {matchTier && (
                                      <span
                                        className={`text-xs font-semibold px-2 py-0.5 rounded-md border w-fit ${matchTier.bg}`}
                                      >
                                        {matchTier.label}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Technical Evaluations */}
                                <td className="py-4.5 px-4">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {candidate.allTasksPassed ? (
                                      <Badge className="bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800 text-xs font-semibold px-2.5 py-1 gap-1.5">
                                        <IconCircleCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                                        <span>Passed All</span>
                                      </Badge>
                                    ) : candidate.designSubmission ||
                                      candidate.programmingSubmission ||
                                      candidate.sqlSubmission ? (
                                      <Badge className="bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800 text-xs font-medium px-2.5 py-1 gap-1.5">
                                        <IconAlertCircle className="size-3.5 text-amber-700 dark:text-amber-400" />
                                        <span>In Review</span>
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">
                                        None
                                      </span>
                                    )}

                                    {candidate.tabSwitchLimitExceeded && (
                                      <Badge className="bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800 text-xs font-medium px-2.5 py-1 gap-1.5">
                                        <IconShieldExclamation className="size-3.5 text-rose-700 dark:text-rose-400" />
                                        <span>Flagged</span>
                                      </Badge>
                                    )}
                                  </div>
                                </td>

                                {/* Stage */}
                                <td className="py-4.5 px-4 whitespace-nowrap">
                                  <Badge
                                    className={`text-xs font-semibold px-2.5 py-1 border ${stageStyle}`}
                                  >
                                    {candidate.status || "APPLIED"}
                                  </Badge>
                                </td>

                                {/* Actions */}
                                <td className="py-4.5 px-5 text-right whitespace-nowrap">
                                  <div
                                    className="flex items-center justify-end gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {candidate.candidateId && (
                                      <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="h-9.5 w-9.5 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                        title="Public profile preview"
                                      >
                                        <Link
                                          href={`/preview/${candidate.candidateId}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <IconEye className="size-4" />
                                        </Link>
                                      </Button>
                                    )}

                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        setSelectedCandidate(candidate)
                                      }
                                      className="h-9.5 px-4 rounded-xl text-sm font-bold bg-primary text-black hover:bg-primary/90 shadow-xs gap-1.5 cursor-pointer"
                                    >
                                      <span>Review</span>
                                      <IconArrowRight className="size-4 text-black stroke-[2.5]" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <CandidatePagination
                      page={candidatePagination.page}
                      pageCount={candidatePagination.pageCount}
                      pageSize={candidatePageSize}
                      total={sortedCandidates.length}
                      start={candidatePagination.start}
                      end={candidatePagination.end}
                      onPageChange={setCandidatePage}
                      onPageSizeChange={(nextPageSize) => {
                        setCandidatePageSize(nextPageSize);
                        setCandidatePage(1);
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Candidate Detail Drawer */}
      {selectedCandidate && (
        <CandidateDetailDrawer
          candidate={selectedCandidate}
          jobId={selectedJobId}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedCandidate(null);
          }}
        />
      )}
    </div>
  );
}
