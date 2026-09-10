"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconBriefcase,
  IconFileDescription,
  IconClipboardCheck,
  IconShieldLock,
  IconEye,
  IconSparkles,
  IconArrowRight,
  IconCheck,
  IconCode,
  IconDatabase,
  IconPalette,
  IconMapPin,
  IconCurrencyDollar,
  IconAlertCircle,
  IconDeviceFloppy,
  IconTrash,
  IconListCheck,
  IconBuilding,
  IconChevronLeft,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { createJobAction, updateJobAction } from "@/lib/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import MarkdownEditor from "./MarkdownEditor";
import DeadlinePicker from "./DeadlinePicker";
import AssessmentPicker from "./AssessmentPicker";
import JobMarkdown from "@/components/jobs/JobMarkdown";
import { LocationPopover } from "@/app/(applier)/candidate-profile/_components/location-popover";
import type { TaskLibraryOption } from "@/types/api/tasks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  CreateJobPostRequest,
  JobPostResponse,
  JobType,
  UpdateJobPostRequest,
  WorkplaceType,
} from "@/types/api/jobs";

type TaskOption = TaskLibraryOption;

interface JobPostFormProps {
  designTasks: TaskOption[];
  programmingTasks: TaskOption[];
  sqlTasks: TaskOption[];
  initialJob?: JobPostResponse;
  embedded?: boolean;
  initialTitle?: string;
  onSaved?: (job: JobPostResponse) => void;
  onCancel?: () => void;
  onPendingChange?: (pending: boolean) => void;
  tasksUnavailable?: boolean;
  restoreDraft?: boolean;
}

const jobTypes: { value: JobType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

const workplaceTypes: { value: WorkplaceType; label: string }[] = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ON_SITE", label: "On-site" },
];

const experienceLevels: {
  value: CreateJobPostRequest["experienceLevel"];
  label: string;
  hint: string;
}[] = [
  { value: "BEGINNER", label: "Entry level", hint: "0-2 yrs experience" },
  { value: "INTERMEDIATE", label: "Intermediate", hint: "2-5 yrs experience" },
  { value: "EXPERT", label: "Senior / Expert", hint: "5+ yrs experience" },
];

const popularLocations = [
  "Kathmandu, Nepal",
  "Lalitpur, Nepal",
  "Pokhara, Nepal",
  "Remote, Nepal",
  "Remote, Worldwide",
];

const popularCurrencies = ["USD", "NPR", "EUR", "GBP", "INR", "AUD", "CAD"];

const DRAFT_STORAGE_KEY = "jobhub_job_post_draft_v1";

interface JobPostDraft {
  title?: string;
  companyName?: string;
  location?: string;
  jobType?: JobType;
  workplaceType?: WorkplaceType;
  experienceLevel?: CreateJobPostRequest["experienceLevel"];
  description?: string;
  requirements?: string;
  salaryMin?: string;
  salaryMax?: string;
  salaryCurrency?: string;
  deadline?: string;
  tabLock?: boolean;
  tabLockWarningLimit?: string;
  designTaskId?: string;
  programmingTaskId?: string;
  sqlTaskId?: string;
  savedAt?: string;
}

function getStoredDraft(): JobPostDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function optionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function JobPostForm({
  designTasks,
  programmingTasks,
  sqlTasks,
  initialJob,
  embedded = false,
  initialTitle,
  onSaved,
  onCancel,
  onPendingChange,
  restoreDraft = true,
}: JobPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(initialJob);

  const [draft] = useState<JobPostDraft | null>(() => (isEditing || !restoreDraft ? null : getStoredDraft()));

  // Form State
  const [title, setTitle] = useState(initialJob?.title ?? initialTitle ?? draft?.title ?? "");
  const [companyName, setCompanyName] = useState(initialJob?.companyName ?? draft?.companyName ?? "");
  const [location, setLocation] = useState(initialJob?.location ?? draft?.location ?? "");
  const [jobType, setJobType] = useState<JobType>(initialJob?.jobType ?? draft?.jobType ?? "FULL_TIME");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>(
    initialJob?.workplaceType ?? draft?.workplaceType ?? "REMOTE"
  );
  const [experienceLevel, setExperienceLevel] = useState<
    CreateJobPostRequest["experienceLevel"]
  >(initialJob?.experienceLevel ?? draft?.experienceLevel ?? "BEGINNER");
  const [description, setDescription] = useState(initialJob?.description ?? draft?.description ?? "");
  const [requirements, setRequirements] = useState(initialJob?.requirements ?? draft?.requirements ?? "");
  const [salaryMin, setSalaryMin] = useState(initialJob?.salaryMin?.toString() ?? draft?.salaryMin ?? "");
  const [salaryMax, setSalaryMax] = useState(initialJob?.salaryMax?.toString() ?? draft?.salaryMax ?? "");
  const [salaryCurrency, setSalaryCurrency] = useState(
    initialJob?.salaryCurrency ?? draft?.salaryCurrency ?? "USD"
  );
  const [deadline, setDeadline] = useState(
    initialJob ? toDateTimeLocal(initialJob.deadline) : (draft?.deadline ?? "")
  );
  const [tabLock, setTabLock] = useState(initialJob?.tabLock ?? draft?.tabLock ?? false);
  const [tabLockWarningLimit, setTabLockWarningLimit] = useState(
    initialJob?.tabLockWarningLimit?.toString() ?? draft?.tabLockWarningLimit ?? "3"
  );
  const [designTaskId, setDesignTaskId] = useState(
    initialJob?.designTaskId ?? draft?.designTaskId ?? ""
  );
  const [programmingTaskId, setProgrammingTaskId] = useState(
    initialJob?.programmingTaskId ?? draft?.programmingTaskId ?? ""
  );
  const [sqlTaskId, setSqlTaskId] = useState(initialJob?.sqlTaskId ?? draft?.sqlTaskId ?? "");

  // Inline Validation & UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activePreviewTab, setActivePreviewTab] = useState<"card" | "detail">("card");
  const [sideTab, setSideTab] = useState<"preview" | "readiness">("preview");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() =>
    draft?.savedAt ? new Date(draft.savedAt) : null
  );
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  useEffect(() => { onPendingChange?.(isPending); }, [isPending, onPendingChange]);

  // Persist draft to local storage on changes
  useEffect(() => {
    if (isEditing) return;
    const hasData = title.trim() || companyName.trim() || description.trim();
    if (!hasData) return;

    const timeout = setTimeout(() => {
      try {
        const d = {
          title,
          companyName,
          location,
          jobType,
          workplaceType,
          experienceLevel,
          description,
          requirements,
          salaryMin,
          salaryMax,
          salaryCurrency,
          deadline,
          tabLock,
          tabLockWarningLimit,
          designTaskId,
          programmingTaskId,
          sqlTaskId,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(d));
        window.dispatchEvent(new Event("jobhub-draft-changed"));
        setLastSavedTime(new Date());
      } catch {
        // storage quota or private mode
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [
    title,
    companyName,
    location,
    jobType,
    workplaceType,
    experienceLevel,
    description,
    requirements,
    salaryMin,
    salaryMax,
    salaryCurrency,
    deadline,
    tabLock,
    tabLockWarningLimit,
    designTaskId,
    programmingTaskId,
    sqlTaskId,
    isEditing,
  ]);

  const clearDraft = () => {
    if (!window.confirm("Clear unsaved draft and reset all fields?")) return;
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setTitle("");
    setCompanyName("");
    setLocation("");
    setJobType("FULL_TIME");
    setWorkplaceType("REMOTE");
    setExperienceLevel("BEGINNER");
    setDescription("");
    setRequirements("");
    setSalaryMin("");
    setSalaryMax("");
    setSalaryCurrency("USD");
    setDeadline("");
    setTabLock(false);
    setTabLockWarningLimit("3");
    setDesignTaskId("");
    setProgrammingTaskId("");
    setSqlTaskId("");
    setLastSavedTime(null);
    setErrors({});
    toast.success("Draft cleared.");
  };

  // Readiness Calculation
  const readiness = useMemo(() => {
    const checks = [
      { id: "title", label: "Job title specified", complete: Boolean(title.trim().length >= 3), weight: 20 },
      { id: "company", label: "Company name provided", complete: Boolean(companyName.trim().length >= 2), weight: 15 },
      { id: "desc", label: "Role description (> 30 chars)", complete: Boolean(description.trim().length >= 30), weight: 25 },
      { id: "reqs", label: "Clear requirements added", complete: Boolean(requirements.trim().length >= 10), weight: 15 },
      { id: "salary", label: "Transparent compensation", complete: Boolean(salaryMin || salaryMax), weight: 10 },
      {
        id: "tasks",
        label: "Evaluation task attached",
        complete: Boolean(designTaskId || programmingTaskId || sqlTaskId),
        weight: 10,
      },
      { id: "deadline", label: "Application deadline set", complete: Boolean(deadline), weight: 5 },
    ];

    const score = checks.reduce((acc, c) => (c.complete ? acc + c.weight : acc), 0);
    return { score, checks };
  }, [
    title,
    companyName,
    description,
    requirements,
    salaryMin,
    salaryMax,
    designTaskId,
    programmingTaskId,
    sqlTaskId,
    deadline,
  ]);

  const setRelativeDeadline = (days: number) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
    setDeadline(localIso);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const minSalary = optionalNumber(salaryMin);
    const maxSalary = optionalNumber(salaryMax);
    const warningLimit = optionalNumber(tabLockWarningLimit);

    if (!title.trim()) {
      newErrors.title = "Job title is required.";
    }
    if (!companyName.trim()) {
      newErrors.companyName = "Company name is required.";
    }
    if (!description.trim()) {
      newErrors.description = "Role description is required.";
    } else if (description.trim().length < 20) {
      newErrors.description = "Please provide at least 20 characters describing the role.";
    }

    if (minSalary !== undefined && maxSalary !== undefined && minSalary > maxSalary) {
      newErrors.salaryMax = "Maximum salary cannot be lower than minimum salary.";
    }

    if (tabLock && (!warningLimit || warningLimit < 1)) {
      newErrors.tabLock = "Tab-switch limit must be at least 1.";
    }

    if (deadline && (Number.isNaN(Date.parse(deadline)) || (( !initialJob || deadline !== toDateTimeLocal(initialJob.deadline)) && new Date(deadline).getTime() <= Date.now()))) {
      newErrors.deadline = "Choose a closing date and time in the future.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const el = document.getElementById(firstErrorField);
      if (el) {
        const section = el.closest("details");
        if (section) section.open = true;
        el.focus();
      }
      toast.error("Please complete the required fields highlighted below.");
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!validate()) return;

    const minSalary = optionalNumber(salaryMin);
    const maxSalary = optionalNumber(salaryMax);
    const warningLimit = optionalNumber(tabLockWarningLimit);

    const payload: CreateJobPostRequest = {
      title: title.trim(),
      companyName: companyName.trim(),
      description: description.trim(),
      requirements: requirements.trim() || undefined,
      location: location.trim() || undefined,
      jobType,
      workplaceType,
      experienceLevel,
      salaryMin: minSalary,
      salaryMax: maxSalary,
      salaryCurrency: salaryCurrency.trim().toUpperCase() || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      tabLock,
      tabLockWarningLimit: tabLock ? warningLimit ?? 3 : 3,
      designTaskId: designTaskId || undefined,
      programmingTaskId: programmingTaskId || undefined,
      sqlTaskId: sqlTaskId || undefined,
    };

    startTransition(async () => {
      try {
        let savedJob: JobPostResponse;
        if (initialJob) {
          const updatePayload: UpdateJobPostRequest = {
            ...payload,
            removeRequirements: Boolean(initialJob.requirements && !requirements.trim()),
            removeLocation: Boolean(initialJob.location && !location.trim()),
            removeSalaryMin: initialJob.salaryMin !== undefined && minSalary === undefined,
            removeSalaryMax: initialJob.salaryMax !== undefined && maxSalary === undefined,
            removeDeadline: Boolean(initialJob.deadline && !deadline),
            removeDesignTask: Boolean(initialJob.designTaskId && !designTaskId),
            removeProgrammingTask: Boolean(
              initialJob.programmingTaskId && !programmingTaskId
            ),
            removeSqlTask: Boolean(initialJob.sqlTaskId && !sqlTaskId),
          };
          savedJob = await updateJobAction(initialJob.id, updatePayload);
          toast.success("Job changes saved successfully.");
        } else {
          savedJob = await createJobAction(payload);
          try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            window.dispatchEvent(new Event("jobhub-draft-changed"));
          } catch {
            // ignore
          }
          toast.success("Job listing published! It is now live for candidates.");
        }
        if (onSaved) {
          onSaved(savedJob);
        } else {
          router.push("/manage-jobs");
          router.refresh();
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Unable to ${isEditing ? "save" : "publish"} this job.`
        );
      }
    });
  };

  // Preview Candidate Card Component
  const renderCandidatePreview = () => {
    const selectedDesign = designTasks.find((t) => t.id === designTaskId);
    const selectedProg = programmingTasks.find((t) => t.id === programmingTaskId);
    const selectedSql = sqlTasks.find((t) => t.id === sqlTaskId);
    const hasAnyTask = selectedDesign || selectedProg || selectedSql;

    const displayTitle = title.trim() || "Untitled Role";
    const displayCompany = companyName.trim() || "Your Company";
    const displayLocation = location.trim() || "Location not specified";

    return (
      <div className="space-y-4.5">
        {/* Toggle between Feed Card and Detail View */}
        <div className="flex items-center justify-between bg-muted/70 p-1.5 rounded-xl border border-border/70">
          <button
            type="button"
            onClick={() => setActivePreviewTab("card")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activePreviewTab === "card"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Feed Card View
          </button>
          <button
            type="button"
            onClick={() => setActivePreviewTab("detail")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activePreviewTab === "detail"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Full Detail View
          </button>
        </div>

        {activePreviewTab === "card" ? (
          /* Live Candidate Feed Card */
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4.5 transition-all">
            <div className="flex items-start justify-between gap-3.5">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-xl bg-primary text-black font-bold flex items-center justify-center text-base shadow-2xs shrink-0">
                  {displayCompany.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-foreground truncate">
                    {displayTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {displayCompany} • {displayLocation}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                Live
              </Badge>
            </div>

            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-lg bg-muted text-foreground text-xs sm:text-sm font-medium border border-border/60">
                {jobTypes.find((j) => j.value === jobType)?.label || "Full-time"}
              </span>
              <span className="px-3 py-1 rounded-lg bg-muted text-foreground text-xs sm:text-sm font-medium border border-border/60">
                {workplaceTypes.find((w) => w.value === workplaceType)?.label || "Remote"}
              </span>
              <span className="px-3 py-1 rounded-lg bg-muted text-foreground text-xs sm:text-sm font-medium border border-border/60">
                {experienceLevels.find((e) => e.value === experienceLevel)?.label || "Entry"}
              </span>
              {(salaryMin || salaryMax) && (
                <span className="px-3 py-1 rounded-lg bg-primary/15 text-foreground text-xs sm:text-sm font-mono font-semibold border border-primary/30">
                  {salaryMin ? `${Number(salaryMin).toLocaleString()}` : "0"}
                  {salaryMax ? ` - ${Number(salaryMax).toLocaleString()}` : "+"} {salaryCurrency}
                </span>
              )}
            </div>

            {/* Description Snippet */}
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {description.trim() ||
                "Role description will appear here. Candidates evaluate your team context, mission, and day-to-day responsibilities."}
            </p>

            {/* Attached Assessments Preview */}
            {hasAnyTask && (
              <div className="border-t border-border/60 pt-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Required Practical Assessments
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedProg && (
                    <Badge variant="secondary" className="rounded-lg text-xs font-medium gap-1.5 px-2.5 py-1">
                      <IconCode className="size-3.5 text-muted-foreground" />
                      <span>{selectedProg.title}</span>
                    </Badge>
                  )}
                  {selectedSql && (
                    <Badge variant="secondary" className="rounded-lg text-xs font-medium gap-1.5 px-2.5 py-1">
                      <IconDatabase className="size-3.5 text-muted-foreground" />
                      <span>{selectedSql.title}</span>
                    </Badge>
                  )}
                  {selectedDesign && (
                    <Badge variant="secondary" className="rounded-lg text-xs font-medium gap-1.5 px-2.5 py-1">
                      <IconPalette className="size-3.5 text-muted-foreground" />
                      <span>{selectedDesign.title}</span>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Candidate Simulated Action */}
            <div className="border-t border-border/60 pt-4 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {deadline ? `Deadline: ${new Date(deadline).toLocaleDateString()}` : "Open until filled"}
              </span>
              <button
                type="button"
                disabled
                className="h-10 px-4 rounded-xl bg-primary text-black font-bold text-sm opacity-90 cursor-default"
              >
                Apply with Profile
              </button>
            </div>
          </div>
        ) : (
          /* Full Detail View */
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 max-h-[520px] overflow-y-auto">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Candidate Job Detail Preview
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-1.5">{displayTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {displayCompany} • {displayLocation}
              </p>
            </div>

            <div className="space-y-2 border-t border-border/60 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                About the Role
              </h4>
              <JobMarkdown>{description.trim() || "No description provided yet."}</JobMarkdown>
            </div>

            {requirements.trim() && (
              <div className="space-y-2 border-t border-border/60 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Requirements & Qualifications
                </h4>
                <JobMarkdown>{requirements}</JobMarkdown>
              </div>
            )}

            {hasAnyTask && (
              <div className="space-y-2.5 border-t border-border/60 pt-4 bg-muted/40 p-4 rounded-xl border">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <IconClipboardCheck className="size-4.5 text-primary" />
                  <span>Evaluation Arena Requirements</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Candidates must complete these practical tasks. Submissions will be tested against verified test suites before final recruiter review.
                </p>
                {tabLock && (
                  <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 pt-1">
                    <IconShieldLock className="size-3.5 text-primary" />
                    <span>Anti-cheat tab monitor enabled (Limit: {tabLockWarningLimit} switches)</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (embedded) {
    const inputClass = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring";
    const field = (id: string, label: string, value: string, change: (value: string) => void, type = "text", placeholder?: string) => (
      <div className="space-y-2" key={id}>
        <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
        <Input id={id} type={type} className={inputClass} value={value} onChange={(event) => { change(event.target.value); if (errors[id]) setErrors((previous) => ({ ...previous, [id]: "" })); }} placeholder={placeholder}
          aria-invalid={Boolean(errors[id])} aria-describedby={errors[id] ? `${id}-error` : undefined} />
        {errors[id] && <p id={`${id}-error`} className="text-xs text-destructive">{errors[id]}</p>}
      </div>
    );
    const locationParts = location.split(",").map((part) => part.trim());
    const assessmentCount = [designTaskId, programmingTaskId, sqlTaskId].filter(Boolean).length;
    return (
      <form className="@container/job-form mx-auto w-full max-w-6xl px-5 py-7 sm:px-8" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <fieldset disabled={isPending} className="min-w-0">
          <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-2xl font-semibold tracking-tight">{isEditing ? "Edit your listing" : "Create a job listing"}</h2><p className="mt-2 text-sm text-muted-foreground">Define the role, set expectations, and choose how candidates apply.</p></div>
            {!isEditing && lastSavedTime && <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground"><IconCheck className="size-3.5" />Draft saved</span>}
          </header>
          <div className="grid items-start gap-6 @4xl/job-form:grid-cols-[minmax(0,1fr)_250px]">
            <div className="min-w-0 space-y-6">
              <section className="rounded-xl border border-border bg-background p-5 sm:p-6">
                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold"><IconBriefcase className="size-4 text-muted-foreground" />Role details</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  {field("title", "Job title *", title, setTitle, "text", "e.g. Frontend developer")}
                  {field("companyName", "Company name *", companyName, setCompanyName, "text", "Your company")}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><Label htmlFor="location" className="text-xs font-medium">Location</Label>{location && <button type="button" className="rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" onClick={() => setLocation("")}>Clear</button>}</div>
                    <LocationPopover
                      profileLocation={location ? { city: locationParts[0], state: locationParts.length > 2 ? locationParts.slice(1, -1).join(", ") : "", country: locationParts.length > 1 ? locationParts.at(-1)! : "" } : null}
                      setProfileLocation={(value) => setLocation([value.city, value.state, value.country].filter(Boolean).join(", "))}
                      description="Choose where this role is based, or enter the city and country."
                      trigger={<Button type="button" id="location" disabled={isPending} variant="outline" className="h-11 w-full justify-start rounded-lg px-3 font-normal"><IconMapPin className="size-4 shrink-0 text-muted-foreground" /><span className="truncate">{location || "Choose a location"}</span></Button>}
                    />
                  </div>
                  <div className="space-y-2"><Label htmlFor="workplaceType" className="text-xs font-medium">Workplace</Label><select id="workplaceType" className={inputClass} value={workplaceType} onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}>{workplaceTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                  <div className="space-y-2"><Label htmlFor="jobType" className="text-xs font-medium">Employment type</Label><select id="jobType" className={inputClass} value={jobType} onChange={(e) => setJobType(e.target.value as JobType)}>{jobTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                  <div className="space-y-2"><Label htmlFor="experienceLevel" className="text-xs font-medium">Experience level</Label><select id="experienceLevel" className={inputClass} value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value as CreateJobPostRequest["experienceLevel"])}>{experienceLevels.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                </div>
              </section>
              <section className="space-y-6 rounded-xl border border-border bg-background p-5 sm:p-6">
                <div><h3 className="flex items-center gap-2 text-sm font-semibold"><IconFileDescription className="size-4 text-muted-foreground" />Describe the opportunity</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Use headings and lists to make the role easy to understand.</p></div>
                <div className="space-y-2"><Label htmlFor="description" className="text-xs font-medium">Role description *</Label><MarkdownEditor id="description" value={description} onChange={(value) => { setDescription(value); if (errors.description) setErrors((previous) => ({ ...previous, description: "" })); }} placeholder="Describe the team, responsibilities, and what success looks like…" error={errors.description} disabled={isPending} />{errors.description && <p id="description-error" className="text-xs text-destructive">{errors.description}</p>}</div>
                <div className="space-y-2"><Label htmlFor="requirements" className="text-xs font-medium">Requirements</Label><MarkdownEditor id="requirements" value={requirements} onChange={setRequirements} placeholder="List the skills and experience candidates need…" disabled={isPending} /></div>
              </section>
              <section className="rounded-xl border border-border bg-background p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-sm font-semibold"><IconCurrencyDollar className="size-4 text-muted-foreground" />Compensation & deadline</h3><span className="text-xs text-muted-foreground">Optional</span></div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {field("salaryMin", "Minimum salary", salaryMin, setSalaryMin, "number", "e.g. 50000")}
                  {field("salaryMax", "Maximum salary", salaryMax, setSalaryMax, "number", "e.g. 80000")}
                  <div className="space-y-2"><Label htmlFor="salaryCurrency" className="text-xs font-medium">Currency</Label><select id="salaryCurrency" className={inputClass} value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)}>{Array.from(new Set([...popularCurrencies, salaryCurrency])).map((currency) => <option key={currency}>{currency}</option>)}</select></div>
                  <div className="space-y-2"><Label htmlFor="deadline" className="text-xs font-medium">Application deadline</Label><DeadlinePicker value={deadline} onChange={(value) => { setDeadline(value); setErrors((previous) => ({ ...previous, deadline: "" })); }} disabled={isPending} error={errors.deadline} />{errors.deadline && <p id="deadline-error" className="text-xs text-destructive">{errors.deadline}</p>}</div>
                </div>
              </section>
              <section className="rounded-xl border border-border bg-background p-5 sm:p-6">
                <AssessmentPicker value={{ designTaskId, programmingTaskId, sqlTaskId }} onChange={(value) => { setDesignTaskId(value.designTaskId); setProgrammingTaskId(value.programmingTaskId); setSqlTaskId(value.sqlTaskId); }} library={{ designTasks, programmingTasks, sqlTasks }} disabled={isPending} />
                <div className="mt-5 border-t border-border pt-5"><label className="flex cursor-pointer items-start gap-3 text-sm"><input className="mt-0.5 size-4 shrink-0 accent-foreground" type="checkbox" checked={tabLock} onChange={(e) => setTabLock(e.target.checked)} /><span><span className="block text-xs font-medium">Track tab switching</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Record when candidates leave the assessment tab.</span></span></label>{tabLock && <div className="mt-4 max-w-xs">{field("tabLock", "Tab-switch warning limit", tabLockWarningLimit, setTabLockWarningLimit, "number")}</div>}</div>
              </section>
            </div>
            <aside className="sticky top-6 hidden space-y-5 @4xl/job-form:block">
              <div className="rounded-xl border border-border bg-muted/20 p-5">
                <p className="text-xs font-medium text-muted-foreground">Your listing</p>
                <h3 className="mt-4 break-words text-lg font-semibold tracking-tight">{title.trim() || "Job title"}</h3>
                <p className="mt-1 break-words text-sm text-muted-foreground">{companyName.trim() || "Company name"}</p>
                <dl className="mt-5 space-y-4 border-t border-border pt-4 text-xs">
                  <div><dt className="text-muted-foreground">Workplace</dt><dd className="mt-1 font-medium">{workplaceTypes.find((item) => item.value === workplaceType)?.label}{location ? ` · ${location}` : ""}</dd></div>
                  <div><dt className="text-muted-foreground">Employment</dt><dd className="mt-1 font-medium">{jobTypes.find((item) => item.value === jobType)?.label}</dd></div>
                  <div><dt className="text-muted-foreground">Assessments</dt><dd className="mt-1 font-medium">{assessmentCount ? `${assessmentCount} attached` : "Profile application"}</dd></div>
                  <div><dt className="text-muted-foreground">Applications close</dt><dd className="mt-1 font-medium">{deadline && !Number.isNaN(Date.parse(deadline)) ? new Date(deadline).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Open until filled"}</dd></div>
                </dl>
              </div>
              <div className="px-1"><p className="text-xs font-medium">Ready to publish</p><ul className="mt-3 space-y-3">{[{ label: "Job title", complete: Boolean(title.trim()) }, { label: "Company name", complete: Boolean(companyName.trim()) }, { label: "Role description", complete: description.trim().length >= 20 }].map((item) => <li key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground"><span className={`flex size-4 items-center justify-center rounded-full border ${item.complete ? "border-foreground bg-foreground text-background" : "border-border"}`}>{item.complete && <IconCheck className="size-3" />}</span>{item.label}</li>)}</ul></div>
            </aside>
          </div>
          <footer className="sticky bottom-0 mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border bg-background py-4">
            <span className="text-xs text-muted-foreground">{isEditing ? "Changes apply after saving." : lastSavedTime ? "Draft saved on this device" : "* Required fields"}</span>
            <div className="flex gap-2"><Button type="button" variant="ghost" className="rounded-lg" onClick={onCancel}>Cancel</Button><Button type="submit" className="rounded-lg bg-primary text-primary-foreground">{isPending ? "Saving…" : isEditing ? "Save changes" : "Publish job"}<IconArrowRight className="size-4" /></Button></div>
          </footer>
        </fieldset>
      </form>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl py-6 md:py-10 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <header className="mb-8 border-b border-border/70 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/manage-jobs"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <IconChevronLeft className="size-4" />
                <span>Manage Jobs</span>
              </Link>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm font-bold text-primary">
                {isEditing ? "Edit Job" : "New Job Post"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {isEditing ? "Edit Job Listing" : "Create a Job Post"}
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              {isEditing
                ? "Update your listing details. Relevant changes automatically synchronize with the candidate match engine."
                : "Give candidates clear information, transparent compensation, and attach practical skill assessments to verify abilities upfront."}
            </p>
          </div>

          {/* Draft indicator & Actions */}
          {!isEditing && (
            <div className="flex items-center gap-3 shrink-0">
              {lastSavedTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border/80 px-3.5 py-2 rounded-xl shadow-2xs">
                  <IconDeviceFloppy className="size-4 text-emerald-500" />
                  <span>Draft saved locally</span>
                </div>
              )}
              {Boolean(title || description || companyName) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="default"
                  onClick={clearDraft}
                  className="text-sm font-semibold text-muted-foreground hover:text-destructive gap-1.5"
                >
                  <IconTrash className="size-4" />
                  <span>Clear draft</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main 2-Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Sections (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Job Basics */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3.5 border-b border-border/60 pb-5">
              <div className="size-11 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-foreground shrink-0">
                <IconBriefcase className="size-5.5 text-foreground" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Job Basics</h2>
                <p className="text-sm text-muted-foreground">
                  The primary role attributes candidates inspect first.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Job Title */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                    Job Title <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {title.length}/100
                  </span>
                </div>
                <Input
                  id="title"
                  value={title}
                  maxLength={100}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  placeholder="e.g. Senior Frontend Engineer"
                  className={`h-11 rounded-xl text-base sm:text-sm px-3.5 ${
                    errors.title ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                {errors.title && (
                  <p id="title-error" className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                    <IconAlertCircle className="size-4" />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-semibold text-foreground">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <IconBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="company"
                    value={companyName}
                    aria-invalid={Boolean(errors.companyName)}
                    aria-describedby={errors.companyName ? "company-error" : undefined}
                    onChange={(event) => {
                      setCompanyName(event.target.value);
                      if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: "" }));
                    }}
                    placeholder="e.g. TechCorp Labs"
                    className={`pl-10.5 h-11 rounded-xl text-base sm:text-sm px-3.5 ${
                      errors.companyName ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                  />
                </div>
                {errors.companyName && (
                  <p id="company-error" className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                    <IconAlertCircle className="size-4" />
                    <span>{errors.companyName}</span>
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold text-foreground">
                  Location
                </Label>
                <div className="relative">
                  <IconMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="e.g. Kathmandu, Nepal"
                    className="pl-10.5 h-11 rounded-xl text-base sm:text-sm px-3.5"
                  />
                </div>
                {/* Location Quick Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {popularLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                        location === loc
                          ? "bg-primary text-black border-primary font-bold"
                          : "bg-muted text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment Type */}
              <div className="space-y-2">
                <Label htmlFor="job-type" className="text-sm font-semibold text-foreground">
                  Employment Type
                </Label>
                <select
                  id="job-type"
                  value={jobType}
                  onChange={(event) => setJobType(event.target.value as JobType)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-base sm:text-sm focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                >
                  {jobTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workplace Setting */}
              <div className="space-y-2">
                <Label htmlFor="workplace-type" className="text-sm font-semibold text-foreground">
                  Workplace Setting
                </Label>
                <select
                  id="workplace-type"
                  value={workplaceType}
                  onChange={(event) => setWorkplaceType(event.target.value as WorkplaceType)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-base sm:text-sm focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                >
                  {workplaceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experience-level" className="text-sm font-semibold text-foreground">
                  Target Experience Level
                </Label>
                <select
                  id="experience-level"
                  value={experienceLevel}
                  onChange={(event) =>
                    setExperienceLevel(
                      event.target.value as CreateJobPostRequest["experienceLevel"]
                    )
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-base sm:text-sm focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                >
                  {experienceLevels.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label} ({lvl.hint})
                    </option>
                  ))}
                </select>
              </div>

              {/* Application Deadline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="deadline" className="text-sm font-semibold text-foreground">
                    Application Deadline
                  </Label>
                  {deadline && (
                    <button
                      type="button"
                      onClick={() => setDeadline("")}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="h-11 rounded-xl text-base sm:text-sm px-3.5"
                />
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Quick set:</span>
                  <button
                    type="button"
                    onClick={() => setRelativeDeadline(14)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border hover:bg-muted/80 cursor-pointer font-medium"
                  >
                    +2 Weeks
                  </button>
                  <button
                    type="button"
                    onClick={() => setRelativeDeadline(30)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border hover:bg-muted/80 cursor-pointer font-medium"
                  >
                    +30 Days
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Role Details & Compensation */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3.5 border-b border-border/60 pb-5">
              <div className="size-11 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-foreground shrink-0">
                <IconFileDescription className="size-5.5 text-foreground" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Role Details & Compensation</h2>
                <p className="text-sm text-muted-foreground">
                  Describe the day-to-day responsibilities, qualifications, and salary range.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                    Role Description <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {description.length} chars
                  </span>
                </div>
                <Textarea
                  id="description"
                  value={description}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={errors.description ? "desc-error" : undefined}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  className={`min-h-48 rounded-xl text-base sm:text-sm leading-relaxed p-4 ${
                    errors.description ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  placeholder="Detail the work, responsibilities, team structure, tech stack, and what success looks like in the first 90 days."
                />
                {errors.description && (
                  <p id="desc-error" className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                    <IconAlertCircle className="size-4" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm font-semibold text-foreground">
                  Requirements & Qualifications
                </Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(event) => setRequirements(event.target.value)}
                  className="min-h-36 rounded-xl text-base sm:text-sm leading-relaxed p-4"
                  placeholder="e.g. 3+ years React/Next.js, TypeScript proficiency, experience designing resilient REST/gRPC APIs, collaborative mindset."
                />
              </div>

              {/* Salary Range */}
              <div className="space-y-3.5 pt-3">
                <div className="flex items-center gap-2.5">
                  <IconCurrencyDollar className="size-5 text-primary" />
                  <Label className="text-sm font-bold text-foreground">
                    Compensation & Salary Range (Annual or Monthly)
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Listings with transparent compensation receive significantly higher engagement from qualified applicants.
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="salary-min" className="text-xs text-muted-foreground font-medium">
                      Minimum Amount
                    </Label>
                    <Input
                      id="salary-min"
                      type="number"
                      min="0"
                      value={salaryMin}
                      onChange={(event) => setSalaryMin(event.target.value)}
                      placeholder="e.g. 50000"
                      className="h-11 rounded-xl text-base sm:text-sm font-mono px-3.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary-max" className="text-xs text-muted-foreground font-medium">
                      Maximum Amount
                    </Label>
                    <Input
                      id="salary-max"
                      type="number"
                      min="0"
                      value={salaryMax}
                      aria-invalid={Boolean(errors.salaryMax)}
                      aria-describedby={errors.salaryMax ? "salary-error" : undefined}
                      onChange={(event) => {
                        setSalaryMax(event.target.value);
                        if (errors.salaryMax) setErrors((prev) => ({ ...prev, salaryMax: "" }));
                      }}
                      placeholder="e.g. 80000"
                      className={`h-11 rounded-xl text-base sm:text-sm font-mono px-3.5 ${
                        errors.salaryMax ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-xs text-muted-foreground font-medium">
                      Currency
                    </Label>
                    <select
                      id="currency"
                      value={salaryCurrency}
                      onChange={(event) => setSalaryCurrency(event.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-base sm:text-sm font-mono focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                    >
                      {popularCurrencies.map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {errors.salaryMax && (
                  <p id="salary-error" className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                    <IconAlertCircle className="size-4" />
                    <span>{errors.salaryMax}</span>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Evaluation Setup & Skill Assessments */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3.5 border-b border-border/60 pb-5">
              <div className="size-11 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-foreground shrink-0">
                <IconClipboardCheck className="size-5.5 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Evidence-Based Evaluation Setup
                  </h2>
                  <Badge variant="secondary" className="text-xs font-bold bg-primary text-black">
                    Verified Tests
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Attach practical tests to evaluate real candidate skills directly within JobHub workspaces.
                </p>
              </div>
            </div>

            <AssessmentPicker
              value={{ designTaskId, programmingTaskId, sqlTaskId }}
              onChange={(value) => {
                setDesignTaskId(value.designTaskId);
                setProgrammingTaskId(value.programmingTaskId);
                setSqlTaskId(value.sqlTaskId);
              }}
              library={{ designTasks, programmingTasks, sqlTasks }}
              disabled={isPending}
            />

            {/* Tab Lock Monitoring */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-5 space-y-4">
              <label className="flex cursor-pointer items-start gap-3.5">
                <input
                  type="checkbox"
                  checked={tabLock}
                  onChange={(event) => setTabLock(event.target.checked)}
                  className="mt-1 size-4.5 accent-primary rounded cursor-pointer"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <IconShieldLock className="size-4.5 text-foreground" />
                    <span className="text-base font-semibold text-foreground">
                      Track Assessment Tab Switches
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Monitors when candidates navigate away from test workspaces. Candidates are clearly informed upfront of this verification policy.
                  </p>
                </div>
              </label>

              {tabLock && (
                <div className="pl-8 max-w-xs space-y-2 animate-in fade-in duration-200">
                  <Label htmlFor="tab-limit" className="text-sm font-semibold text-foreground">
                    Warning Limit
                  </Label>
                  <Input
                    id="tab-limit"
                    type="number"
                    min="1"
                    value={tabLockWarningLimit}
                    onChange={(event) => setTabLockWarningLimit(event.target.value)}
                    className="h-10 rounded-xl text-sm font-mono w-36 px-3.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of allowable tab switches before flag is marked.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Publishing & Save Action Card */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <IconSparkles className="size-5.5 text-foreground" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {isEditing ? "Save Listing Changes" : "Ready to Publish?"}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isEditing
                    ? "Listing updates will be visible to prospective candidates immediately."
                    : "Your job posting will be distributed across candidate discovery and search feeds."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 shrink-0">
              <Button variant="outline" asChild className="rounded-xl text-sm font-semibold h-11 px-5">
                <Link href="/manage-jobs">Cancel</Link>
              </Button>

              <Button
                size="default"
                disabled={isPending}
                onClick={submit}
                className="rounded-xl text-sm font-bold h-11 px-6 bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-2"
              >
                <span>{isPending ? (isEditing ? "Saving..." : "Publishing...") : (isEditing ? "Save Changes" : "Publish Job")}</span>
                <IconArrowRight className="size-4.5 text-black stroke-[3]" />
              </Button>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Live Preview & Readiness Rail (lg:col-span-5) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-20 space-y-4.5">
          {/* Header with Tab switcher */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSideTab("preview")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    sideTab === "preview"
                      ? "bg-foreground text-background shadow-2xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <IconEye className="size-4" />
                  <span>Candidate Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSideTab("readiness")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    sideTab === "readiness"
                      ? "bg-foreground text-background shadow-2xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <IconListCheck className="size-4" />
                  <span>Readiness ({readiness.score}%)</span>
                </button>
              </div>
            </div>

            {sideTab === "preview" ? (
              renderCandidatePreview()
            ) : (
              /* Readiness Checklist Tab */
              <div className="space-y-4.5">
                <div>
                  <div className="flex items-center justify-between text-sm font-bold mb-2">
                    <span className="text-foreground">Posting Quality Score</span>
                    <span className="font-mono text-foreground text-base">{readiness.score}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${readiness.score}%` }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    Higher quality postings attract better-calibrated candidate matches and faster response times.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-4">
                  {readiness.checks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center justify-between text-sm py-1.5"
                    >
                      <div className="flex items-center gap-2.5">
                        {check.complete ? (
                          <div className="size-4.5 rounded-full bg-primary text-black flex items-center justify-center text-xs font-bold">
                            <IconCheck className="size-3 text-black stroke-[3]" />
                          </div>
                        ) : (
                          <div className="size-4.5 rounded-full border border-border text-muted-foreground flex items-center justify-center text-xs">
                            •
                          </div>
                        )}
                        <span
                          className={
                            check.complete
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {check.label}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        +{check.weight}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/30 border border-border/70 rounded-xl p-4 text-sm text-muted-foreground space-y-1.5">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <IconSparkles className="size-4 text-primary" />
                    <span>Hiring Tip</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Attaching at least one practical task automatically unlocks skill-based screening and prevents spam applications.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Button for Mobile Preview */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Sheet open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
          <SheetTrigger asChild>
            <Button
              className="rounded-full shadow-lg bg-foreground text-background font-bold text-sm h-11 px-5 gap-2.5 border border-border cursor-pointer"
            >
              <IconEye className="size-4.5 text-primary" />
              <span>Preview ({readiness.score}%)</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl p-6 sm:p-8">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-lg font-bold flex items-center justify-between">
                <span>Candidate View Preview</span>
                <span className="text-sm font-mono text-muted-foreground">
                  {readiness.score}% Ready
                </span>
              </SheetTitle>
            </SheetHeader>
            {renderCandidatePreview()}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
