"use client";

import { useState, useEffect, useTransition, useCallback, useId } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Code2,
  Database,
  ExternalLink,
  Loader2,
  PenTool,
  ShieldCheck,
} from "lucide-react";
import { applyJobAction } from "@/lib/actions/jobs";
import { getJobApplicationAvailability } from "@/lib/job-application-availability";
import {
  loadJobAssessmentSubmission,
  saveJobApplicationDraft,
} from "@/lib/job-assessment-submissions";
import type { JobPostDetailResponse } from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";
import type { TaskSubmissionResponse } from "@/types/api/tasks";

interface LinkedInEasyApplyModalProps {
  detail: JobPostDetailResponse;
  profile: UserProfileResponse | null;
}

export function LinkedInEasyApplyModal({
  detail,
  profile,
}: LinkedInEasyApplyModalProps) {
  const { job } = detail;
  const noteId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submissions, setSubmissions] = useState<{
    design?: TaskSubmissionResponse;
    programming?: TaskSubmissionResponse;
    sql?: TaskSubmissionResponse;
  }>({});

  const loadSubmissions = useCallback(() => {
    setSubmissions({
      design: loadJobAssessmentSubmission(
        job.id,
        "DESIGN",
        detail.designTask?.id ?? job.designTaskId,
      ),
      programming: loadJobAssessmentSubmission(
        job.id,
        "PROGRAMMING",
        detail.programmingTask?.id ?? job.programmingTaskId,
      ),
      sql: loadJobAssessmentSubmission(
        job.id,
        "SQL",
        detail.sqlTask?.id ?? job.sqlTaskId,
      ),
    });
  }, [
    detail.designTask?.id,
    detail.programmingTask?.id,
    detail.sqlTask?.id,
    job.designTaskId,
    job.programmingTaskId,
    job.sqlTaskId,
    job.id,
  ]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(loadSubmissions, 0);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadSubmissions();
    };
    window.addEventListener("storage", loadSubmissions);
    window.addEventListener("job-assessment-submission", loadSubmissions);
    window.addEventListener("focus", loadSubmissions);
    window.addEventListener("pageshow", loadSubmissions);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("storage", loadSubmissions);
      window.removeEventListener("job-assessment-submission", loadSubmissions);
      window.removeEventListener("focus", loadSubmissions);
      window.removeEventListener("pageshow", loadSubmissions);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadSubmissions]);

  const assessmentUrl = (path: string, taskId?: string) =>
    `/task/${path}?jobId=${job.id}${taskId ? `&taskId=${taskId}` : ""}`;
  const assessments = [
    {
      type: "design",
      required: job.hasDesignTask,
      title: detail.designTask?.title || "Design assessment",
      icon: PenTool,
      submission: submissions.design,
      href: assessmentUrl("css", detail.designTask?.id ?? job.designTaskId),
    },
    {
      type: "programming",
      required: job.hasProgrammingTask,
      title: detail.programmingTask?.title || "Programming assessment",
      icon: Code2,
      submission: submissions.programming,
      href: assessmentUrl(
        "program",
        detail.programmingTask?.id ?? job.programmingTaskId,
      ),
    },
    {
      type: "sql",
      required: job.hasSqlTask,
      title: detail.sqlTask?.title || "SQL assessment",
      icon: Database,
      submission: submissions.sql,
      href: assessmentUrl("sql", detail.sqlTask?.id ?? job.sqlTaskId),
    },
  ].filter((assessment) => assessment.required);
  const remainingAssessments = assessments.filter(
    (assessment) => !assessment.submission?.id,
  );
  const allTasksCompleted = remainingAssessments.length === 0;
  const completedTasksCount = assessments.length - remainingAssessments.length;
  const hasApplied = detail.hasApplied || isSuccess;
  const availability = getJobApplicationAvailability(job);
  const userName = profile?.name || "Your profile";

  const handleSubmitApplication = () => {
    if (isPending || hasApplied) return;
    const currentAvailability = getJobApplicationAvailability(job);
    if (!currentAvailability.canApply) {
      setSubmitError(
        currentAvailability.reason || "Applications for this role are closed.",
      );
      return;
    }
    if (!allTasksCompleted) {
      setSubmitError("Complete the required assessments before submitting.");
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await applyJobAction(job.id, {
          coverNote: coverNote.trim() || undefined,
          designSubmissionId: submissions.design?.id,
          programmingSubmissionId: submissions.programming?.id,
          sqlSubmissionId: submissions.sql?.id,
        });
        if (result.success) {
          setIsSuccess(true);
        } else {
          setSubmitError(
            "Your application couldn't be sent. Please try again. Your note is still here.",
          );
        }
      } catch {
        setSubmitError(
          "Your application couldn't be sent. Please try again. Your note is still here.",
        );
      }
    });
  };

  if (hasApplied && !isOpen) {
    return (
      <Button
        disabled
        size="lg"
        className="h-11 w-full gap-2 rounded-lg bg-muted text-sm font-medium text-foreground disabled:opacity-100"
      >
        <CheckCircle2 className="size-4" />
        Application submitted
      </Button>
    );
  }

  if (!availability.canApply && !isOpen) {
    return (
      <div className="space-y-2">
        <Button
          disabled
          size="lg"
          className="h-11 w-full gap-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground disabled:opacity-100"
        >
          <CircleAlert className="size-4" />
          Applications closed
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {availability.reason}
        </p>
      </div>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isPending) return;
        if (open) {
          loadSubmissions();
          setSubmitError(null);
        }
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="h-11 w-full gap-2 rounded-lg text-sm font-medium"
        >
          {hasApplied
            ? "Application submitted"
            : completedTasksCount > 0
              ? "Continue application"
              : "Apply for this role"}
          {hasApplied ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[560px]"
        showCloseButton={!isPending}
      >
        {hasApplied ? (
          <div className="px-6 py-10 sm:px-8">
            <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-6" />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                You’re in the running.
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed">
                Your application for{" "}
                <span className="font-medium text-foreground">{job.title}</span>{" "}
                at {job.companyName} has been submitted.
              </DialogDescription>
            </DialogHeader>
            <p className="mt-4 text-sm text-muted-foreground">
              Follow its progress in your application tracker.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-lg">
                <Link href="/job-tracker">
                  Track application <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="flex min-h-0 flex-col"
            aria-busy={isPending}
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmitApplication();
            }}
          >
            <DialogHeader className="shrink-0 border-b px-6 pb-5 pt-6 text-left sm:px-8">
              <p className="mb-1 text-xs text-muted-foreground">
                Your application
              </p>
              <DialogTitle className="pr-6 text-2xl font-semibold leading-snug tracking-tight">
                {job.title}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span>{job.companyName}</span>
                {job.location && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{job.location}</span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8">
              <section aria-label="Application profile" className="py-5">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 shrink-0 rounded-full border">
                    <AvatarImage
                      src={profile?.imageUrl}
                      alt=""
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-sm text-foreground">
                      {userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold break-words">
                      {userName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.title || "JobHub applicant"}
                    </p>
                  </div>
                  <Link
                    href="/candidate-profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md text-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                    aria-label="Edit profile (opens in a new tab)"
                  >
                    Edit profile <ExternalLink className="size-3" />
                  </Link>
                </div>
                <dl className="mt-5 space-y-2.5 text-sm">
                  <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="break-all">
                      {profile?.email || (
                        <span className="text-muted-foreground">Not added</span>
                      )}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>
                      {profile?.contactNumbers?.[0] || (
                        <span className="text-muted-foreground">Not added</span>
                      )}
                    </dd>
                  </div>
                  {profile?.location && (
                    <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="break-words">{profile.location}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <section className="border-t py-5" aria-labelledby={noteId}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <label
                    id={noteId}
                    htmlFor={`${noteId}-input`}
                    className="text-sm font-medium"
                  >
                    A note to the hiring team
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Optional
                  </span>
                </div>
                <Textarea
                  id={`${noteId}-input`}
                  value={coverNote}
                  onChange={(event) => setCoverNote(event.target.value)}
                  disabled={isPending}
                  placeholder="What interests you about this role? Share a little about what you'd bring."
                  className="min-h-28 resize-y rounded-lg bg-muted/20 px-3.5 py-3 text-sm leading-relaxed placeholder:text-muted-foreground"
                />
              </section>

              {assessments.length > 0 && (
                <section
                  aria-label="Required assessments"
                  className="border-t py-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium">
                      Required assessments
                    </h3>
                    <span
                      className="text-xs text-muted-foreground"
                      aria-live="polite"
                    >
                      {completedTasksCount}/{assessments.length} submitted
                    </span>
                  </div>
                  {!allTasksCompleted && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Add your note before starting. Submitting the final
                      required assessment also sends your application to{" "}
                      {job.companyName}.
                    </p>
                  )}
                  <div className="mt-2 divide-y">
                    {assessments.map((assessment) => (
                      <div
                        key={assessment.type}
                        className="flex items-center gap-3 py-3"
                      >
                        <assessment.icon className="size-4 shrink-0 text-muted-foreground" />
                        <p className="min-w-0 flex-1 text-sm break-words">
                          {assessment.title}
                        </p>
                        {assessment.submission?.id ? (
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs">
                            <Check className="size-3.5" /> Submitted
                          </span>
                        ) : (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 shrink-0 rounded-lg text-xs"
                            disabled={isPending}
                          >
                            <Link
                              href={assessment.href}
                              onClick={() =>
                                saveJobApplicationDraft(job.id, coverNote)
                              }
                            >
                              Start <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {job.tabLock && (
                    <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                      Tab switching is monitored during assessments. Warning
                      limit: {job.tabLockWarningLimit}.
                    </p>
                  )}
                </section>
              )}
            </div>

            <div className="shrink-0 space-y-4 border-t bg-muted/20 px-6 py-4 sm:px-8">
              {submitError && (
                <p
                  role="alert"
                  className="flex items-start gap-2 text-sm text-destructive"
                >
                  <CircleAlert className="mt-0.5 size-4 shrink-0" />{" "}
                  {submitError}
                </p>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">
                {allTasksCompleted
                  ? `Submitting shares your profile${assessments.length > 0 ? ", assessment results," : ""} and note with ${job.companyName}.`
                  : `Complete ${remainingAssessments.length === 1 ? "the remaining assessment" : `the ${remainingAssessments.length} remaining assessments`} to submit your application.`}
              </p>
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-lg text-sm"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 gap-2 rounded-lg px-5 text-sm font-medium"
                  disabled={
                    isPending || !allTasksCompleted || !availability.canApply
                  }
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      Submit application <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
