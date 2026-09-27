"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconChevronRight,
  IconChevronDown,
  IconAdjustmentsHorizontal,
  IconLayoutSidebar,
  IconLayoutKanban,
  IconList,
  IconPencil,
  IconPlus,
  IconSearch,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobPostForm } from "@/components/post-job/JobPostForm";
import CandidateDetailDrawer from "@/components/recruiter/CandidateDetailDrawer";
import KanbanView, { type StagePages } from "@/components/recruiter/KanbanView";
import CandidateHighlight from "./CandidateHighlight";
import CandidateList from "@/components/recruiter/CandidateList";
import JobMarkdown from "@/components/jobs/JobMarkdown";
import {
  getJobCandidatesAction,
  getJobTaskOptionsAction,
  getRecruiterJobResultAction,
} from "@/lib/actions/recruiter";
import { deleteJobAction, updateJobAction } from "@/lib/actions/jobs";
import { filterCandidates } from "@/lib/candidate-listing";
import { candidateStages } from "./candidate-review-utils";
import listingStyles from "./candidate-listing.module.css";
import { cn } from "@/lib/utils";
import type { JobPostResponse } from "@/types/api/jobs";
import type {
  CandidateDashboardResponse,
  RecruiterJobSummaryResponse,
} from "@/types/api/recruiter";

type Tab = "details" | "candidates";
type Mode = "start" | "create" | "view" | "edit";
type TaskOptions = Awaited<ReturnType<typeof getJobTaskOptionsAction>>;
type JobData = {
  id: string;
  job: JobPostResponse | null;
  candidates: CandidateDashboardResponse[];
  jobError: string | null;
  candidatesError: boolean;
};

const readable = (value?: string) =>
  value
    ? value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase())
    : "Not specified";
const active = (job: { isActive?: boolean; active?: boolean }) =>
  job.isActive ?? job.active ?? false;
const dateLabel = (value?: string) =>
  value && !Number.isNaN(Date.parse(value))
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not specified";
const control =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function subscribeToDraft(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("jobhub-draft-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("jobhub-draft-changed", callback);
  };
}

function readDraftTitle(): string | null {
  try {
    const draft = JSON.parse(
      localStorage.getItem("jobhub_job_post_draft_v1") || "null",
    );
    return draft
      ? typeof draft.title === "string" && draft.title
        ? draft.title
        : "Untitled job"
      : null;
  } catch {
    return null;
  }
}

const emptyDraft = () => null;

export default function ManageJobsWorkspace({
  jobs: initialJobs,
  error,
  initialJobId,
  initialTab,
}: {
  jobs: RecruiterJobSummaryResponse[];
  error: string | null;
  initialJobId?: string;
  initialTab: Tab;
}) {
  const router = useRouter();
  const initialSelection = initialJobs.some((job) => job.id === initialJobId)
    ? initialJobId!
    : null;
  const [jobs, setJobs] = useState(initialJobs);
  const [previousJobs, setPreviousJobs] = useState(initialJobs);
  if (previousJobs !== initialJobs) {
    setPreviousJobs(initialJobs);
    setJobs(initialJobs);
  }
  const [selectedId, setSelectedId] = useState<string | null>(initialSelection);
  const [mode, setMode] = useState<Mode>(initialSelection ? "view" : "start");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const [role, setRole] = useState("");
  const [restoreDraft, setRestoreDraft] = useState(false);
  const savedDraftTitle = useSyncExternalStore(
    subscribeToDraft,
    readDraftTitle,
    emptyDraft,
  );
  const [data, setData] = useState<JobData | null>(null);
  const [reload, setReload] = useState(0);
  const [tasks, setTasks] = useState<TaskOptions | null>(null);
  const [taskAttempt, setTaskAttempt] = useState(0);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateView, setCandidateView] = useState<"list" | "kanban">("list");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("match");
  const [minMatch, setMinMatch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidatePageSize, setCandidatePageSize] = useState(10);
  const [candidateStagePages, setCandidateStagePages] = useState<StagePages>(
    {},
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<{ id: string | null } | null>(
    null,
  );
  const [formPending, setFormPending] = useState(false);
  const [actionPending, startAction] = useTransition();
  const panel = useRef<HTMLDivElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const candidateSearchInput = useRef<HTMLInputElement>(null);
  const reviewBackButton = useRef<HTMLButtonElement>(null);
  const jobSearchInput = useRef<HTMLInputElement>(null);
  const sidebarToggle = useRef<HTMLButtonElement>(null);
  const workspaceTitle = useRef<HTMLHeadingElement>(null);
  const sidebarWasOpen = useRef(false);
  const sidebarFocusTarget = useRef<"toggle" | "title">("toggle");
  const reviewReturn = useRef({
    id: "",
    action: "review",
    scrollTop: 0,
    boardLeft: 0,
    stage: "APPLIED",
    restore: false,
  });
  const isForm = mode === "create" || mode === "edit";
  const selectedJob = jobs.find((job) => job.id === selectedId);
  const currentData = data?.id === selectedId ? data : null;
  const job = currentData?.job;
  const selectedCandidate = currentData?.candidates.find(
    (candidate) =>
      (candidate.applicationId || candidate.candidateId) === candidateId,
  );

  useEffect(() => {
    if (!selectedId) return;
    let ignore = false;
    Promise.allSettled([
      getRecruiterJobResultAction(selectedId),
      getJobCandidatesAction(selectedId),
    ]).then(([detail, applicants]) => {
      if (ignore) return;
      setData({
        id: selectedId,
        job: detail.status === "fulfilled" ? detail.value.job : null,
        candidates:
          applicants.status === "fulfilled"
            ? applicants.value.map((candidate) => ({
                ...candidate,
                jobId: selectedId,
              }))
            : [],
        jobError:
          detail.status === "fulfilled"
            ? detail.value.error
            : "Unable to reach the job service. Please try again.",
        candidatesError: applicants.status === "rejected",
      });
    });
    return () => {
      ignore = true;
    };
  }, [selectedId, reload]);

  useEffect(() => {
    if (!isForm) return;
    let ignore = false;
    getJobTaskOptionsAction()
      .then((options) => {
        if (!ignore) setTasks(options);
      })
      .catch(() => {
        if (!ignore)
          setTasks({
            designTasks: [],
            programmingTasks: [],
            sqlTasks: [],
            error:
              "Assessments could not be loaded. You can still save the job details.",
          });
      });
    return () => {
      ignore = true;
    };
  }, [isForm, taskAttempt]);

  useLayoutEffect(() => {
    const previous = reviewReturn.current;
    if (!candidateId && previous.restore) {
      previous.restore = false;
      const trigger = Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          "[data-candidate-review]",
        ) || [],
      ).find(
        (element) =>
          element.dataset.candidateReview === previous.id &&
          element.dataset.reviewAction === previous.action,
      );
      (trigger || resultsHeading.current)?.focus({ preventScroll: true });
      panel.current?.scrollTo({ top: trigger ? previous.scrollTop : 0 });
      const board = panel.current?.querySelector<HTMLElement>(
        "[data-candidate-board]",
      );
      if (board) board.scrollLeft = previous.boardLeft;
      if (
        board &&
        trigger &&
        trigger.closest<HTMLElement>("[data-candidate-stage]")?.dataset
          .candidateStage !== previous.stage
      ) {
        trigger.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    } else {
      panel.current?.scrollTo({ top: 0 });
      if (candidateId) reviewBackButton.current?.focus({ preventScroll: true });
    }
  }, [selectedId, mode, tab, candidateId]);

  useLayoutEffect(() => {
    if (sidebarOpen) jobSearchInput.current?.focus();
    else if (sidebarWasOpen.current) {
      (sidebarFocusTarget.current === "title"
        ? workspaceTitle.current
        : sidebarToggle.current
      )?.focus();
    }
    sidebarWasOpen.current = sidebarOpen;
  }, [sidebarOpen]);

  const sortedJobs = useMemo(
    () =>
      [...jobs].sort(
        (a, b) =>
          (Date.parse(b.createdAt || "") || 0) -
          (Date.parse(a.createdAt || "") || 0),
      ),
    [jobs],
  );
  const visibleJobs = sortedJobs.filter((item) =>
    `${item.title} ${item.companyName} ${item.location || ""}`
      .toLowerCase()
      .includes(jobSearch.toLowerCase().trim()),
  );
  const candidates = useMemo(
    () =>
      filterCandidates(currentData?.candidates || [], {
        search: candidateSearch,
        status,
        sort,
        minMatch,
        fromDate,
        toDate,
      }),
    [currentData, candidateSearch, status, sort, minMatch, fromDate, toDate],
  );

  function updateCandidateFilter(
    setValue: (value: string) => void,
    value: string,
  ) {
    setValue(value);
    setCandidatePage(1);
    setCandidateStagePages({});
  }

  function clearCandidateFilters() {
    setCandidateSearch("");
    setStatus("ALL");
    setMinMatch("");
    setFromDate("");
    setToDate("");
    setCandidatePage(1);
    setCandidateStagePages({});
  }

  function openCandidate(candidate: CandidateDashboardResponse) {
    const id = candidate.applicationId || candidate.candidateId;
    reviewReturn.current = {
      id,
      action:
        document.activeElement instanceof HTMLElement
          ? document.activeElement.dataset.reviewAction || "review"
          : "review",
      scrollTop: panel.current?.scrollTop || 0,
      boardLeft:
        panel.current?.querySelector<HTMLElement>("[data-candidate-board]")
          ?.scrollLeft || 0,
      stage: candidate.status || "APPLIED",
      restore: false,
    };
    setCandidateId(id);
  }

  function closeCandidate() {
    reviewReturn.current.restore = true;
    setCandidateId(null);
  }

  const activeFilters = [
    ...(candidateSearch.trim()
      ? [
          {
            label: `Search: ${candidateSearch.trim()}`,
            clear: () => updateCandidateFilter(setCandidateSearch, ""),
          },
        ]
      : []),
    ...(status !== "ALL"
      ? [
          {
            label:
              candidateStages.find((stage) => stage.id === status)?.label ||
              readable(status),
            clear: () => updateCandidateFilter(setStatus, "ALL"),
          },
        ]
      : []),
    ...(minMatch
      ? [
          {
            label: `${minMatch}%+ match`,
            clear: () => updateCandidateFilter(setMinMatch, ""),
          },
        ]
      : []),
    ...(fromDate
      ? [
          {
            label: `From ${dateLabel(`${fromDate}T00:00:00`)}`,
            clear: () => updateCandidateFilter(setFromDate, ""),
          },
        ]
      : []),
    ...(toDate
      ? [
          {
            label: `Through ${dateLabel(`${toDate}T00:00:00`)}`,
            clear: () => updateCandidateFilter(setToDate, ""),
          },
        ]
      : []),
  ];
  const advancedFilterCount = [minMatch, fromDate, toDate].filter(
    Boolean,
  ).length;

  function syncUrl(id: string | null, nextTab: Tab) {
    const url = new URL(window.location.href);
    url.search = "";
    if (id) {
      url.searchParams.set("jobId", id);
      url.searchParams.set("tab", nextTab);
    }
    window.history.replaceState(null, "", url);
  }

  function selectJob(id: string | null) {
    setSelectedId(id);
    setMode(id ? "view" : "start");
    setTab("details");
    setCandidateId(null);
    setCandidatePage(1);
    setCandidateStagePages({});
    setFiltersOpen(false);
    sidebarFocusTarget.current = "title";
    setSidebarOpen(false);
    setDeleteConfirm(false);
    setLeaveTarget(null);
    setCandidateSearch("");
    setStatus("ALL");
    setMinMatch("");
    setFromDate("");
    setToDate("");
    syncUrl(id, "details");
  }

  function navigate(id: string | null) {
    if (formPending || actionPending) return;
    if (isForm) {
      setLeaveTarget({ id });
      sidebarFocusTarget.current = "title";
      setSidebarOpen(false);
      return;
    }
    selectJob(id);
  }

  function onSaved(saved: JobPostResponse) {
    setJobs((previous) => {
      const existing = previous.find((item) => item.id === saved.id);
      const summary: RecruiterJobSummaryResponse = {
        ...saved,
        totalApplicants: existing?.totalApplicants ?? 0,
        pendingReviewCount: existing?.pendingReviewCount ?? 0,
        shortlistedCount: existing?.shortlistedCount ?? 0,
      };
      return [summary, ...previous.filter((item) => item.id !== saved.id)];
    });
    setData({
      id: saved.id,
      job: saved,
      candidates: currentData?.id === saved.id ? currentData.candidates : [],
      jobError: null,
      candidatesError: false,
    });
    setFormPending(false);
    setRole("");
    selectJob(saved.id);
    setReload((value) => value + 1);
  }

  function toggleListing() {
    if (!job) return;
    startAction(async () => {
      try {
        const updated = await updateJobAction(job.id, {
          isActive: !active(job),
          active: !active(job),
        });
        setData((previous) =>
          previous ? { ...previous, job: updated } : previous,
        );
        setJobs((previous) =>
          previous.map((item) =>
            item.id === job.id ? { ...item, ...updated } : item,
          ),
        );
        toast.success(active(updated) ? "Job reopened." : "Job closed.");
      } catch (cause) {
        toast.error(
          cause instanceof Error
            ? cause.message
            : "Unable to update the listing.",
        );
      }
    });
  }

  function deleteListing() {
    if (!job) return;
    startAction(async () => {
      try {
        await deleteJobAction(job.id);
        setJobs((previous) => previous.filter((item) => item.id !== job.id));
        selectJob(null);
        toast.success("Job deleted.");
      } catch (cause) {
        toast.error(
          cause instanceof Error
            ? cause.message
            : "Unable to delete the listing.",
        );
      }
    });
  }

  const retryData = () => {
    setData(null);
    setReload((value) => value + 1);
  };
  const switchTab = (next: Tab) => {
    setTab(next);
    setCandidateId(null);
    syncUrl(selectedId, next);
  };

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-96 overflow-hidden bg-background lg:h-[calc(100dvh-6.5rem)]">
      <aside
        aria-label="Job listings"
        className={cn(
          "flex w-full shrink-0 flex-col bg-background md:w-64 md:border-r md:border-border lg:w-72",
          sidebarOpen ? "flex" : "hidden md:flex",
        )}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <div>
            <h2 className="text-sm font-semibold">Your jobs</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Choose a role to manage applicants
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 md:hidden focus-visible:ring-foreground"
            aria-label="Close job listings"
            onClick={() => {
              sidebarFocusTarget.current = "toggle";
              setSidebarOpen(false);
            }}
          >
            <IconX aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <div className="px-3">
          <Button
            onClick={() => navigate(null)}
            disabled={formPending || actionPending}
            className="h-11 w-full justify-start gap-3 rounded-md bg-primary px-3 text-primary-foreground shadow-none focus-visible:ring-foreground"
          >
            <IconPlus aria-hidden="true" className="size-5" />
            New job
          </Button>
          <div className="relative mt-4">
            <IconSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
            />
            <Input
              ref={jobSearchInput}
              aria-label="Search jobs by title, company or location"
              placeholder="Search your jobs"
              value={jobSearch}
              onChange={(event) => setJobSearch(event.target.value)}
              className="h-11 rounded-md border-foreground/40 bg-background pl-9 pr-11 shadow-none focus-visible:ring-foreground"
            />
            {jobSearch && (
              <button
                type="button"
                aria-label="Clear job search"
                onClick={() => {
                  setJobSearch("");
                  jobSearchInput.current?.focus();
                }}
                className="absolute top-0 right-0 flex size-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground"
              >
                <IconX aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-5">
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mb-2 px-3 text-xs font-medium text-muted-foreground"
          >
            {jobSearch
              ? `${visibleJobs.length} of ${jobs.length} jobs found`
              : "Recent jobs · Newest first"}
          </p>
          {error && (
            <div role="alert" className="px-3 py-4 text-sm">
              <p className="text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.refresh()}
              >
                Retry
              </Button>
            </div>
          )}
          {!error && visibleJobs.length === 0 && (
            <div className="px-3 py-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                {jobSearch
                  ? "No jobs match your search."
                  : "Your published jobs will appear here."}
              </p>
              {jobSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setJobSearch("");
                    jobSearchInput.current?.focus();
                  }}
                  className="mt-2 min-h-11 rounded text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-foreground"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
          <div className="space-y-1">
            {visibleJobs.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={selectedId === item.id ? "page" : undefined}
                disabled={formPending || actionPending}
                onClick={() => navigate(item.id)}
                className={cn(
                  "group w-full rounded-md px-3 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground disabled:opacity-50",
                  selectedId === item.id
                    ? "bg-primary/15 text-foreground"
                    : "hover:bg-muted/70",
                )}
              >
                <span className="flex items-start justify-between gap-2 text-sm font-medium">
                  <span className="line-clamp-2 break-words">
                    <CandidateHighlight text={item.title} query={jobSearch} />
                  </span>
                  {selectedId === item.id && (
                    <IconCheck
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0"
                    />
                  )}
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  <CandidateHighlight
                    text={item.companyName}
                    query={jobSearch}
                  />
                </span>
                <span className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <span
                    className={
                      active(item) ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {active(item) ? "Live" : "Closed"}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.totalApplicants || 0} applicants
                  </span>
                </span>
                {jobSearch.trim() &&
                  item.location
                    ?.toLowerCase()
                    .includes(jobSearch.trim().toLowerCase()) && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      <CandidateHighlight
                        text={item.location}
                        query={jobSearch}
                      />
                    </span>
                  )}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-border/60 px-6 py-4 text-xs text-muted-foreground">
          {jobs.length} job{jobs.length === 1 ? "" : "s"} in your workspace
        </div>
      </aside>

      <section
        aria-label="Job workspace"
        className={cn(
          "min-w-0 flex-1 flex-col",
          sidebarOpen ? "hidden md:flex" : "flex",
        )}
      >
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              ref={sidebarToggle}
              className="size-11 shrink-0 md:hidden focus-visible:ring-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open job listings"
            >
              <IconLayoutSidebar className="size-5" />
            </Button>
            <h1
              ref={workspaceTitle}
              tabIndex={-1}
              className="truncate text-sm font-semibold outline-offset-4"
            >
              {mode === "start" || mode === "create"
                ? "New job"
                : selectedJob?.title || "Job details"}
            </h1>
            {selectedJob && (
              <span
                className={cn(
                  "hidden shrink-0 rounded-md px-2 py-0.5 text-xs sm:inline",
                  active(selectedJob)
                    ? "bg-primary/15 text-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {active(selectedJob) ? "Live" : "Closed"}
              </span>
            )}
          </div>
          {mode === "view" && job && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode("edit");
                setCandidateId(null);
              }}
              disabled={actionPending}
            >
              <IconPencil className="size-4" />
              Edit job
            </Button>
          )}
          {isForm && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {mode === "edit" ? "Editing" : "Unpublished draft"}
            </span>
          )}
        </header>

        {leaveTarget && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted px-5 py-4 text-sm"
          >
            <p>
              {mode === "edit"
                ? "Leave without saving your changes?"
                : "Leave this draft? Your latest autosave stays on this device."}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLeaveTarget(null)}
              >
                Keep editing
              </Button>
              <Button size="sm" onClick={() => selectJob(leaveTarget.id)}>
                {mode === "edit" ? "Discard changes" : "Leave draft"}
              </Button>
            </div>
          </div>
        )}

        {mode === "view" && !(tab === "candidates" && selectedCandidate) && (
          <nav
            aria-label="Job views"
            className="flex shrink-0 gap-6 border-b border-border/70 px-5 sm:px-8"
          >
            {(["details", "candidates"] as Tab[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-current={tab === value ? "page" : undefined}
                onClick={() => switchTab(value)}
                className={cn(
                  "flex min-h-11 items-center gap-2 border-b-2 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                  tab === value
                    ? "border-primary font-semibold text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {value === "details" ? "Job details" : "Candidates"}
                {value === "candidates" && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs tabular-nums">
                    {currentData?.candidates.length ??
                      selectedJob?.totalApplicants ??
                      0}
                  </span>
                )}
              </button>
            ))}
          </nav>
        )}

        <div
          ref={panel}
          className={cn(
            "min-h-0 flex-1",
            selectedCandidate && mode === "view"
              ? "flex flex-col overflow-hidden"
              : "overflow-y-auto",
          )}
        >
          {mode === "start" && (
            <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
              <h2 className="text-2xl font-semibold tracking-tight">
                Create a job listing
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with a title, then add the details candidates need.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setRestoreDraft(false);
                  setMode("create");
                }}
                className="mt-6 rounded-xl border border-border bg-muted/25 p-5 sm:p-6"
              >
                <label
                  htmlFor="new-role"
                  className="mb-3 block text-sm font-medium"
                >
                  What’s the role?
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="new-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder="e.g. Frontend developer"
                    className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    type="submit"
                    className="h-11 shrink-0 rounded-lg px-5"
                  >
                    Continue
                    <IconArrowRight className="size-4" />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Your listing stays private until you publish it.
                </p>
              </form>
              {savedDraftTitle && (
                <button
                  type="button"
                  onClick={() => {
                    setRole("");
                    setRestoreDraft(true);
                    setMode("create");
                  }}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl border border-border px-5 py-4 text-left text-sm outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <IconPencil className="size-4" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {savedDraftTitle}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Saved draft · Continue editing
                    </span>
                  </span>
                  <IconArrowRight className="size-4" />
                </button>
              )}
              <section
                className="mt-8 border-t border-border/70 pt-6"
                aria-label="Recent jobs"
              >
                <h3 className="text-sm font-semibold">
                  Pick up where you left off
                </h3>
                {sortedJobs.length > 0 ? (
                  <div className="mt-3 divide-y divide-border/60">
                    {sortedJobs.slice(0, 4).map((recent) => (
                      <button
                        key={recent.id}
                        type="button"
                        onClick={() => navigate(recent.id)}
                        className="flex w-full items-center gap-4 rounded-lg px-2 py-4 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {recent.title}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {active(recent) ? "Live" : "Closed"} ·{" "}
                            {recent.companyName}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {recent.totalApplicants || 0} applicants
                        </span>
                        <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Your published jobs and their applications will appear here.
                  </p>
                )}
              </section>
            </div>
          )}

          {isForm && (mode === "create" || job) && (
            <>
              {tasks?.error && (
                <div
                  role="alert"
                  className="mx-5 mt-5 rounded-lg border border-border bg-muted p-3 text-sm"
                >
                  {tasks.error}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTaskAttempt((value) => value + 1)}
                  >
                    Retry assessments
                  </Button>
                </div>
              )}
              <JobPostForm
                key={mode === "edit" ? job!.id : "new"}
                embedded
                restoreDraft={restoreDraft}
                initialJob={mode === "edit" ? job! : undefined}
                initialTitle={role.trim() || undefined}
                designTasks={tasks?.designTasks || []}
                programmingTasks={tasks?.programmingTasks || []}
                sqlTasks={tasks?.sqlTasks || []}
                tasksUnavailable={!tasks || Boolean(tasks.error)}
                onSaved={onSaved}
                onCancel={() =>
                  setLeaveTarget({ id: mode === "edit" ? selectedId : null })
                }
                onPendingChange={setFormPending}
              />
            </>
          )}

          {mode === "view" && !currentData && (
            <div
              aria-label="Loading job"
              role="status"
              className="mx-auto max-w-3xl space-y-6 p-8"
            >
              <span className="sr-only">
                Loading job details and candidates
              </span>
              {["w-2/3 h-8", "w-1/2 h-4", "w-full h-28", "w-full h-28"].map(
                (size, index) => (
                  <div
                    key={index}
                    className={cn(
                      "rounded-lg bg-muted motion-safe:animate-pulse",
                      size,
                    )}
                  />
                ),
              )}
            </div>
          )}

          {mode === "view" &&
            currentData &&
            tab === "details" &&
            (currentData.jobError ? (
              <LoadError message={currentData.jobError} retry={retryData} />
            ) : (
              job && (
                <article className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
                  <p className="text-sm text-muted-foreground">
                    {job.companyName}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {job.title}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {job.location || readable(job.workplaceType)} ·{" "}
                    {readable(job.jobType)}
                  </p>
                  <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border/70 py-6 text-sm">
                    {[
                      ["Workplace", readable(job.workplaceType)],
                      ["Experience", readable(job.experienceLevel)],
                      [
                        "Compensation",
                        job.salaryMin != null || job.salaryMax != null
                          ? `${job.salaryCurrency || "USD"} ${job.salaryMin?.toLocaleString() || "Not specified"} - ${job.salaryMax?.toLocaleString() || "Not specified"}`
                          : "Not specified",
                      ],
                      [
                        "Apply by",
                        job.deadline ? dateLabel(job.deadline) : "No deadline",
                      ],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="mt-1.5 font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <section className="mt-8">
                    <h3 className="text-base font-semibold">About the role</h3>
                    <div className="mt-3">
                      <JobMarkdown>{job.description}</JobMarkdown>
                    </div>
                  </section>
                  {job.requirements && (
                    <section className="mt-8">
                      <h3 className="text-base font-semibold">
                        What we’re looking for
                      </h3>
                      <div className="mt-3">
                        <JobMarkdown>{job.requirements}</JobMarkdown>
                      </div>
                    </section>
                  )}
                  <section className="mt-8">
                    <h3 className="text-base font-semibold">Assessments</h3>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {[
                        ["Design", job.hasDesignTask],
                        ["Programming", job.hasProgrammingTask],
                        ["SQL", job.hasSqlTask],
                      ]
                        .filter(([, included]) => included)
                        .map(([label]) => (
                          <span
                            key={String(label)}
                            className="inline-flex items-center gap-1.5"
                          >
                            <IconCheck className="size-4" />
                            {label}
                          </span>
                        ))}
                      {!job.hasDesignTask &&
                        !job.hasProgrammingTask &&
                        !job.hasSqlTask && <p>No assessments attached.</p>}
                    </div>
                    {job.tabLock && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Tab switching is monitored. Warning limit:{" "}
                        {job.tabLockWarningLimit}.
                      </p>
                    )}
                  </section>
                  <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
                    <p className="text-xs text-muted-foreground">
                      Published {dateLabel(job.createdAt)}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => switchTab("candidates")}
                    >
                      Review candidates
                      <IconArrowRight className="size-4" />
                    </Button>
                  </div>
                  <details className="mt-8 border-t border-border/70 pt-5">
                    <summary className="cursor-pointer text-sm text-muted-foreground">
                      Listing settings
                    </summary>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        disabled={actionPending}
                        onClick={toggleListing}
                      >
                        {active(job) ? "Close listing" : "Reopen listing"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-destructive"
                        disabled={actionPending}
                        onClick={() => setDeleteConfirm(true)}
                      >
                        Delete job
                      </Button>
                    </div>
                    {deleteConfirm && (
                      <div
                        role="alert"
                        className="mt-4 rounded-lg border border-destructive/30 p-4 text-sm"
                      >
                        <p>Delete “{job.title}”? This cannot be undone.</p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionPending}
                            onClick={() => setDeleteConfirm(false)}
                          >
                            Keep job
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={actionPending}
                            onClick={deleteListing}
                          >
                            {actionPending ? "Deleting…" : "Delete permanently"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </details>
                </article>
              )
            ))}

          {mode === "view" &&
            currentData &&
            tab === "candidates" &&
            (currentData.candidatesError ? (
              <LoadError
                message="Candidates could not be loaded."
                retry={retryData}
              />
            ) : selectedCandidate ? (
              <>
                <div className="flex shrink-0 items-center justify-between px-5 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeCandidate}
                    ref={reviewBackButton}
                  >
                    <IconArrowLeft className="size-4" />
                    All candidates
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Candidate review
                  </span>
                </div>
                <CandidateDetailDrawer
                  key={candidateId}
                  candidate={selectedCandidate}
                  jobId={selectedId!}
                  open
                  embedded
                  onOpenChange={(open) => {
                    if (!open) closeCandidate();
                  }}
                  onStatusChange={(nextStatus) => {
                    setData((previous) =>
                      previous
                        ? {
                            ...previous,
                            candidates: previous.candidates.map((candidate) =>
                              candidate.applicationId ===
                              selectedCandidate.applicationId
                                ? { ...candidate, status: nextStatus }
                                : candidate,
                            ),
                          }
                        : previous,
                    );
                  }}
                />
              </>
            ) : (
              <div className={`${listingStyles.listing} px-4 py-5 sm:px-7`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2
                      ref={resultsHeading}
                      tabIndex={-1}
                      className="w-fit text-lg font-semibold outline-offset-4"
                    >
                      Candidates
                    </h2>
                    <p
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                      className="mt-1 text-sm text-muted-foreground"
                    >
                      {candidates.length} of {currentData.candidates.length}{" "}
                      applications
                      {activeFilters.length > 0
                        ? " match your filters"
                        : " for this job"}
                    </p>
                  </div>
                  <div
                    role="group"
                    aria-label="Candidate view"
                    className="flex gap-1 rounded-md bg-muted/40 p-1"
                  >
                    {(["list", "kanban"] as const).map((view) => {
                      const Icon =
                        view === "list" ? IconList : IconLayoutKanban;
                      return (
                        <button
                          key={view}
                          type="button"
                          aria-pressed={candidateView === view}
                          aria-controls="workspace-candidate-results"
                          onClick={() => {
                            setCandidateView(view);
                            if (view === "kanban")
                              updateCandidateFilter(setStatus, "ALL");
                          }}
                          className={cn(
                            "flex min-h-11 items-center gap-2 rounded-sm px-3 text-sm font-medium sm:min-h-9",
                            candidateView === view
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          <Icon aria-hidden="true" className="size-4" />
                          {view === "list" ? "List" : "Kanban"}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <div className="relative basis-full sm:min-w-56 sm:flex-1 sm:basis-auto">
                    <IconSearch
                      aria-hidden="true"
                      className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
                    />
                    <Input
                      ref={candidateSearchInput}
                      aria-label="Search candidates by name, email, title or skill"
                      aria-controls="workspace-candidate-results"
                      placeholder="Search name, email, title or skill"
                      className="h-11 rounded-md bg-background pl-9 pr-11 shadow-none"
                      value={candidateSearch}
                      onChange={(e) =>
                        updateCandidateFilter(
                          setCandidateSearch,
                          e.target.value,
                        )
                      }
                    />
                    {candidateSearch && (
                      <button
                        type="button"
                        aria-label="Clear candidate search"
                        onClick={() => {
                          updateCandidateFilter(setCandidateSearch, "");
                          candidateSearchInput.current?.focus();
                        }}
                        className="absolute top-0 right-0 flex size-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                      >
                        <IconX aria-hidden="true" className="size-4" />
                      </button>
                    )}
                  </div>
                  {candidateView === "list" && (
                    <select
                      aria-label="Filter candidate status"
                      aria-controls="workspace-candidate-results"
                      className={cn(
                        control,
                        "h-11 min-w-0 flex-1 rounded-md sm:flex-none",
                      )}
                      value={status}
                      onChange={(e) =>
                        updateCandidateFilter(setStatus, e.target.value)
                      }
                    >
                      <option value="ALL">All stages</option>
                      {candidateStages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    aria-label="Sort candidates"
                    className={cn(
                      control,
                      "h-11 min-w-0 flex-1 rounded-md sm:flex-none",
                    )}
                    value={sort}
                    onChange={(e) =>
                      updateCandidateFilter(setSort, e.target.value)
                    }
                  >
                    <option value="match">Best match first</option>
                    <option value="newest">Newest first</option>
                    <option value="name">Name A-Z</option>
                  </select>
                  <button
                    type="button"
                    aria-expanded={filtersOpen}
                    aria-controls="workspace-candidate-filters"
                    onClick={() => setFiltersOpen((open) => !open)}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-md border border-input px-3 text-sm font-medium",
                      advancedFilterCount
                        ? "bg-primary/15 text-foreground"
                        : "hover:bg-muted/40",
                    )}
                  >
                    <IconAdjustmentsHorizontal
                      aria-hidden="true"
                      className="size-4"
                    />
                    Filters
                    {advancedFilterCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-sm bg-primary text-xs text-primary-foreground">
                        {advancedFilterCount}
                      </span>
                    )}
                    <IconChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-3.5 transition-transform",
                        filtersOpen && "rotate-180",
                      )}
                    />
                  </button>
                </div>
                <div id="workspace-candidate-filters" hidden={!filtersOpen}>
                  <div className="mt-4 grid gap-4 border-y border-border py-4 sm:grid-cols-3">
                    <label className="space-y-2 text-xs font-medium text-muted-foreground">
                      <span className="block">Minimum job match</span>
                      <select
                        className={cn(control, "h-11 w-full text-foreground")}
                        value={minMatch}
                        onChange={(e) =>
                          updateCandidateFilter(setMinMatch, e.target.value)
                        }
                      >
                        <option value="">Any match</option>
                        <option value="50">50% or higher</option>
                        <option value="75">75% or higher</option>
                        <option value="90">90% or higher</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-xs font-medium text-muted-foreground">
                      <span className="block">Applied from</span>
                      <input
                        className={cn(
                          control,
                          "h-11 w-full min-w-0 text-foreground",
                        )}
                        type="date"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(e) =>
                          updateCandidateFilter(setFromDate, e.target.value)
                        }
                      />
                    </label>
                    <label className="space-y-2 text-xs font-medium text-muted-foreground">
                      <span className="block">Applied through</span>
                      <input
                        className={cn(
                          control,
                          "h-11 w-full min-w-0 text-foreground",
                        )}
                        type="date"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(e) =>
                          updateCandidateFilter(setToDate, e.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>
                {activeFilters.length > 0 && (
                  <div
                    role="group"
                    aria-label="Active candidate filters"
                    className="mt-3 flex flex-wrap items-center gap-2"
                  >
                    {activeFilters.map((filter) => (
                      <button
                        key={filter.label}
                        type="button"
                        aria-label={`Remove filter: ${filter.label}`}
                        onClick={(event) => {
                          filter.clear();
                          // The chip disappears; keep keyboard focus near the updated results.
                          if (event.detail === 0)
                            resultsHeading.current?.focus({
                              preventScroll: true,
                            });
                        }}
                        className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-md bg-muted px-3 py-1 text-xs sm:min-h-8"
                      >
                        <span className="break-words [overflow-wrap:anywhere]">
                          {filter.label}
                        </span>
                        <IconX
                          aria-hidden="true"
                          className="size-3.5 shrink-0"
                        />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        clearCandidateFilters();
                        resultsHeading.current?.focus({ preventScroll: true });
                      }}
                      className="min-h-11 px-2 text-xs font-medium underline underline-offset-4 sm:min-h-8"
                    >
                      Clear all
                    </button>
                  </div>
                )}
                <div id="workspace-candidate-results">
                  {candidateView === "kanban" && candidates.length > 0 ? (
                    <div className="mt-5">
                      <KanbanView
                        candidates={candidates}
                        search={candidateSearch}
                        showJobTitle={false}
                        stagePages={candidateStagePages}
                        onStagePageChange={(stage, page) =>
                          setCandidateStagePages((current) => ({
                            ...current,
                            [stage]: page,
                          }))
                        }
                        onCandidateSelect={openCandidate}
                        onStatusChange={(applicationId, nextStatus) => {
                          setData((previous) =>
                            previous?.id === selectedId
                              ? {
                                  ...previous,
                                  candidates: previous.candidates.map(
                                    (candidate) =>
                                      candidate.applicationId === applicationId
                                        ? { ...candidate, status: nextStatus }
                                        : candidate,
                                  ),
                                }
                              : previous,
                          );
                        }}
                      />
                    </div>
                  ) : (
                    candidates.length > 0 && (
                      <CandidateList
                        candidates={candidates}
                        search={candidateSearch}
                        page={candidatePage}
                        pageSize={candidatePageSize}
                        onPageChange={(page) => {
                          setCandidatePage(page);
                          resultsHeading.current?.focus();
                          panel.current?.scrollTo({ top: 0 });
                        }}
                        onPageSizeChange={(size) => {
                          setCandidatePageSize(size);
                          setCandidatePage(1);
                        }}
                        onSelect={openCandidate}
                      />
                    )
                  )}
                  {candidates.length === 0 && (
                    <div className="py-16 text-center">
                      <IconUsers className="mx-auto mb-4 size-7 text-muted-foreground" />
                      <h3 className="font-semibold">
                        {currentData.candidates.length
                          ? "No candidates match these filters"
                          : "Your next hire starts here"}
                      </h3>
                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                        {currentData.candidates.length
                          ? "Try a different search or clear your filters."
                          : "Applications for this job will appear here, ready to review."}
                      </p>
                      {currentData.candidates.length > 0 && (
                        <Button
                          className="mt-4"
                          variant="outline"
                          onClick={() => {
                            clearCandidateFilters();
                            resultsHeading.current?.focus({
                              preventScroll: true,
                            });
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

function LoadError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className="p-8 text-sm">
      <p className="text-muted-foreground">{message}</p>
      <Button variant="outline" className="mt-4" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
