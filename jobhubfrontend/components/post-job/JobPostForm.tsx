"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ClipboardCheck, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { createJobAction, updateJobAction } from "@/lib/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateJobPostRequest, JobPostResponse, JobType, UpdateJobPostRequest, WorkplaceType } from "@/types/api/jobs";

interface TaskOption {
  id: string;
  title: string;
}

interface JobPostFormProps {
  designTasks: TaskOption[];
  programmingTasks: TaskOption[];
  sqlTasks: TaskOption[];
  initialJob?: JobPostResponse;
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

function TaskSelect({ label, tasks, value, onChange, createHref }: {
  label: string;
  tasks: TaskOption[];
  value: string;
  onChange: (value: string) => void;
  createHref: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`${label}-task`}>{label}</Label>
      <select
        id={`${label}-task`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">No {label.toLowerCase()}</option>
        {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
      </select>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{tasks.length === 0 ? "No tasks are available in your assessment library." : `${tasks.length} task${tasks.length === 1 ? "" : "s"} available.`}</span>
        <Link href={createHref} className="shrink-0 font-medium text-primary hover:underline">Create task</Link>
      </div>
    </div>
  );
}

export function JobPostForm({ designTasks, programmingTasks, sqlTasks, initialJob }: JobPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(initialJob);
  const [title, setTitle] = useState(initialJob?.title ?? "");
  const [companyName, setCompanyName] = useState(initialJob?.companyName ?? "");
  const [location, setLocation] = useState(initialJob?.location ?? "");
  const [jobType, setJobType] = useState<JobType>(initialJob?.jobType ?? "FULL_TIME");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>(initialJob?.workplaceType ?? "REMOTE");
  const [experienceLevel, setExperienceLevel] = useState<CreateJobPostRequest["experienceLevel"]>(initialJob?.experienceLevel ?? "BEGINNER");
  const [description, setDescription] = useState(initialJob?.description ?? "");
  const [requirements, setRequirements] = useState(initialJob?.requirements ?? "");
  const [salaryMin, setSalaryMin] = useState(initialJob?.salaryMin?.toString() ?? "");
  const [salaryMax, setSalaryMax] = useState(initialJob?.salaryMax?.toString() ?? "");
  const [salaryCurrency, setSalaryCurrency] = useState(initialJob?.salaryCurrency ?? "USD");
  const [deadline, setDeadline] = useState(toDateTimeLocal(initialJob?.deadline));
  const [tabLock, setTabLock] = useState(initialJob?.tabLock ?? false);
  const [tabLockWarningLimit, setTabLockWarningLimit] = useState(initialJob?.tabLockWarningLimit?.toString() ?? "3");
  const [designTaskId, setDesignTaskId] = useState(initialJob?.designTaskId ?? "");
  const [programmingTaskId, setProgrammingTaskId] = useState(initialJob?.programmingTaskId ?? "");
  const [sqlTaskId, setSqlTaskId] = useState(initialJob?.sqlTaskId ?? "");

  const submit = () => {
    const minSalary = optionalNumber(salaryMin);
    const maxSalary = optionalNumber(salaryMax);
    const warningLimit = optionalNumber(tabLockWarningLimit);

    if (!title.trim() || !companyName.trim() || !description.trim()) {
      toast.error("Title, company name, and role description are required.");
      return;
    }
    if (minSalary !== undefined && maxSalary !== undefined && minSalary > maxSalary) {
      toast.error("Maximum salary must be greater than minimum salary.");
      return;
    }
    if (tabLock && (!warningLimit || warningLimit < 1)) {
      toast.error("Set a tab-switch warning limit of at least one.");
      return;
    }

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
      tabLockWarningLimit: tabLock ? (warningLimit ?? 3) : 3,
      designTaskId: designTaskId || undefined,
      programmingTaskId: programmingTaskId || undefined,
      sqlTaskId: sqlTaskId || undefined,
    };

    startTransition(async () => {
      try {
        if (initialJob) {
          const updatePayload: UpdateJobPostRequest = {
            ...payload,
            removeRequirements: Boolean(initialJob.requirements && !requirements.trim()),
            removeLocation: Boolean(initialJob.location && !location.trim()),
            removeSalaryMin: initialJob.salaryMin !== undefined && minSalary === undefined,
            removeSalaryMax: initialJob.salaryMax !== undefined && maxSalary === undefined,
            removeDeadline: Boolean(initialJob.deadline && !deadline),
            removeDesignTask: Boolean(initialJob.designTaskId && !designTaskId),
            removeProgrammingTask: Boolean(initialJob.programmingTaskId && !programmingTaskId),
            removeSqlTask: Boolean(initialJob.sqlTaskId && !sqlTaskId),
          };
          await updateJobAction(initialJob.id, updatePayload);
          toast.success("Job changes saved.");
        } else {
          await createJobAction(payload);
          toast.success("Job published.");
        }
        router.push("/manage-jobs");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Unable to ${isEditing ? "save" : "publish"} this job.`);
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl py-6 md:py-10">
      <header className="mb-8 border-b pb-6">
        <p className="text-sm font-medium text-primary">Employer workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{isEditing ? "Edit job post" : "Create a job post"}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{isEditing ? "Update the listing details candidates use to evaluate this role." : "Give candidates the information they need, then add assessments only when they help evaluate the role."}</p>
      </header>

      <div className="space-y-8">
        <section className="rounded-lg border bg-card p-5 md:p-7">
          <div className="flex gap-3">
            <BriefcaseBusiness className="mt-0.5 size-5 text-primary" />
            <div>
              <h2 className="font-semibold">Job basics</h2>
              <p className="mt-1 text-sm text-muted-foreground">The essentials candidates see first.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label htmlFor="title">Job title</Label><Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Senior frontend engineer" /></div>
            <div className="space-y-2"><Label htmlFor="company">Company name</Label><Input id="company" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" /></div>
            <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Kathmandu, Nepal" /></div>
            <div className="space-y-2"><Label htmlFor="job-type">Employment type</Label><select id="job-type" value={jobType} onChange={(event) => setJobType(event.target.value as JobType)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{jobTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="workplace-type">Workplace</Label><select id="workplace-type" value={workplaceType} onChange={(event) => setWorkplaceType(event.target.value as WorkplaceType)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{workplaceTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="experience-level">Experience level</Label><select id="experience-level" value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value as CreateJobPostRequest["experienceLevel"])} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="BEGINNER">Entry level</option><option value="INTERMEDIATE">Intermediate</option><option value="EXPERT">Expert</option></select></div>
            <div className="space-y-2"><Label htmlFor="deadline">Application deadline</Label><Input id="deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5 md:p-7">
          <h2 className="font-semibold">Role details</h2>
          <div className="mt-6 space-y-5">
            <div className="space-y-2"><Label htmlFor="description">Role description</Label><Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-44" placeholder="Describe the work, responsibilities, and team context." /></div>
            <div className="space-y-2"><Label htmlFor="requirements">Requirements</Label><Textarea id="requirements" value={requirements} onChange={(event) => setRequirements(event.target.value)} className="min-h-32" placeholder="List the skills and experience needed for this role." /></div>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="salary-min">Minimum salary</Label><Input id="salary-min" type="number" min="0" value={salaryMin} onChange={(event) => setSalaryMin(event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="salary-max">Maximum salary</Label><Input id="salary-max" type="number" min="0" value={salaryMax} onChange={(event) => setSalaryMax(event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="currency">Currency</Label><Input id="currency" value={salaryCurrency} maxLength={10} onChange={(event) => setSalaryCurrency(event.target.value)} /></div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5 md:p-7">
          <div className="flex gap-3"><ClipboardCheck className="mt-0.5 size-5 text-primary" /><div><h2 className="font-semibold">Evaluation setup</h2><p className="mt-1 text-sm text-muted-foreground">Attach only relevant assessments. Each selected task appears to candidates with this job.</p></div></div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <TaskSelect label="Design task" tasks={designTasks} value={designTaskId} onChange={setDesignTaskId} createHref="/post-task/css" />
            <TaskSelect label="Programming task" tasks={programmingTasks} value={programmingTaskId} onChange={setProgrammingTaskId} createHref="/post-task/programming" />
            <TaskSelect label="SQL task" tasks={sqlTasks} value={sqlTaskId} onChange={setSqlTaskId} createHref="/post-task/sql" />
          </div>
          <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-lg border p-4">
            <input type="checkbox" checked={tabLock} onChange={(event) => setTabLock(event.target.checked)} className="mt-1 size-4" />
            <span><span className="block text-sm font-medium">Track assessment tab switches</span><span className="mt-1 block text-sm text-muted-foreground">Candidates are informed when an assessment uses tab-switch monitoring.</span></span>
          </label>
          {tabLock && <div className="mt-4 max-w-xs space-y-2"><Label htmlFor="tab-limit">Warning limit</Label><Input id="tab-limit" type="number" min="1" value={tabLockWarningLimit} onChange={(event) => setTabLockWarningLimit(event.target.value)} /></div>}
        </section>

        <section className="flex flex-col gap-4 rounded-lg border bg-card p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="flex gap-3"><CircleCheck className="mt-0.5 size-5 text-primary" /><div><h2 className="font-semibold">{isEditing ? "Save these changes?" : "Ready to publish?"}</h2><p className="mt-1 text-sm text-muted-foreground">{isEditing ? "Embedding-relevant changes automatically refresh this job's match vector." : "Publishing makes this role visible in candidate search immediately."}</p></div></div>
          <div className="flex items-center gap-3">
            {isEditing && <Button variant="outline" asChild><Link href="/manage-jobs">Cancel</Link></Button>}
            <Button size="lg" disabled={isPending} onClick={submit}>{isPending ? (isEditing ? "Saving..." : "Publishing...") : (isEditing ? "Save changes" : "Publish job")}<ArrowRight /></Button>
          </div>
        </section>
      </div>
    </div>
  );
}
