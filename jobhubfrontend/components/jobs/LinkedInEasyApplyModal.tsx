"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  CircleAlert,
  Code2,
  Database,
  PenTool,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Send,
} from "lucide-react";
import { applyJobAction } from "@/lib/actions/jobs";
import { getJobApplicationAvailability } from "@/lib/job-application-availability";
import { loadJobAssessmentSubmission, saveJobApplicationDraft } from "@/lib/job-assessment-submissions";
import type {
  JobPostDetailResponse,
} from "@/types/api/jobs";
import type { UserProfileResponse } from "@/types/api/user";
import type { TaskSubmissionResponse } from "@/types/api/tasks";
import { toast } from "sonner";

interface LinkedInEasyApplyModalProps {
  detail: JobPostDetailResponse;
  profile: UserProfileResponse | null;
}

export function LinkedInEasyApplyModal({
  detail,
  profile,
}: LinkedInEasyApplyModalProps) {
  const { job } = detail;
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [coverNote, setCoverNote] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Track recorded task submissions from localStorage/state
  const [submissions, setSubmissions] = useState<{
    design?: TaskSubmissionResponse | null;
    programming?: TaskSubmissionResponse | null;
    sql?: TaskSubmissionResponse | null;
  }>({});

  const loadSubmissions = useCallback(() => {
    setSubmissions({
      design: loadJobAssessmentSubmission(job.id, "DESIGN", detail.designTask?.id),
      programming: loadJobAssessmentSubmission(job.id, "PROGRAMMING", detail.programmingTask?.id),
      sql: loadJobAssessmentSubmission(job.id, "SQL", detail.sqlTask?.id),
    });
  }, [detail.designTask?.id, detail.programmingTask?.id, detail.sqlTask?.id, job.id]);

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

  const hasTasks =
    job.hasDesignTask || job.hasProgrammingTask || job.hasSqlTask;

  // Check required completion status
  const isDesignCompleted = !job.hasDesignTask || Boolean(submissions.design?.id);
  const isProgrammingCompleted =
    !job.hasProgrammingTask || Boolean(submissions.programming?.id);
  const isSqlCompleted = !job.hasSqlTask || Boolean(submissions.sql?.id);

  const allTasksCompleted =
    isDesignCompleted && isProgrammingCompleted && isSqlCompleted;

  const totalRequiredTasksCount = [
    job.hasDesignTask,
    job.hasProgrammingTask,
    job.hasSqlTask,
  ].filter(Boolean).length;

  const completedTasksCount = [
    job.hasDesignTask && submissions.design?.id,
    job.hasProgrammingTask && submissions.programming?.id,
    job.hasSqlTask && submissions.sql?.id,
  ].filter(Boolean).length;

  // Task IDE links
  const cssTaskUrl = `/task/css?jobId=${job.id}${job.designTaskId ? `&taskId=${job.designTaskId}` : ""}`;
  const programTaskUrl = `/task/program?jobId=${job.id}${job.programmingTaskId ? `&taskId=${job.programmingTaskId}` : ""}`;
  const sqlTaskUrl = `/task/sql?jobId=${job.id}${job.sqlTaskId ? `&taskId=${job.sqlTaskId}` : ""}`;

  const userName = profile?.name || "Candidate";
  const userEmail = profile?.email || "";
  const userTitle = profile?.title || "Applicant";
  const userPhone = profile?.contactNumbers?.[0] || "";
  const userLocation = profile?.location || "";
  const userImage = profile?.imageUrl;

  const totalSteps = hasTasks ? 4 : 3;

  const handleNextStep = () => {
    const availability = getJobApplicationAvailability(job);
    if (!availability.canApply) {
      toast.error(availability.reason);
      setIsOpen(false);
      return;
    }

    if (currentStep === 2 && hasTasks && !allTasksCompleted) {
      toast.error("Please complete all required assessments before proceeding.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitApplication = () => {
    const availability = getJobApplicationAvailability(job);
    if (!availability.canApply) {
      toast.error(availability.reason);
      setIsOpen(false);
      return;
    }

    if (hasTasks && !allTasksCompleted) {
      toast.error("Please complete all required assessments in the IDE before applying.");
      return;
    }

    startTransition(async () => {
      const result = await applyJobAction(job.id, {
        coverNote,
        designSubmissionId: submissions.design?.id,
        programmingSubmissionId: submissions.programming?.id,
        sqlSubmissionId: submissions.sql?.id,
      });

      if (result.success) {
        setIsSuccess(true);
        toast.success(`Application submitted to ${job.companyName}!`);
      } else {
        toast.error(result.error || "Unable to submit application.");
      }
    });
  };

  if (detail.hasApplied) {
    return (
      <Button
        disabled
        size="lg"
        className="h-11 w-full gap-2 rounded-lg border-border bg-muted text-sm font-medium text-foreground disabled:opacity-100"
      >
        <CheckCircle2 className="size-4.5" />
        <span>Application Submitted</span>
      </Button>
    );
  }

  const availability = getJobApplicationAvailability(job);
  if (!availability.canApply) {
    return (
      <div className="space-y-2">
        <Button
          disabled
          size="lg"
          className="h-11 w-full gap-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground disabled:opacity-100"
        >
          <CircleAlert className="size-4.5" />
          <span>Applications Closed</span>
        </Button>
        <p className="text-center text-xs text-muted-foreground">{availability.reason}</p>
      </div>
    );
  }

  return (
    <>
      {/* Primary Easy Apply CTA button */}
      <Button
        size="lg"
        onClick={() => {
          loadSubmissions();
          setIsOpen(true);
        }}
        className="h-11 w-full gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <span>
          {hasTasks && completedTasksCount > 0 ? "Continue application" : "Apply for this role"}
        </span>
        <ArrowRight className="size-4" />
      </Button>

      {/* LinkedIn Style Easy Apply Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-lg border-border bg-background shadow-lg">
          {isSuccess ? (
            /* Success State */
            <div className="py-12 px-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Application Submitted!
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                Your profile, attached assessment scores, and application for{" "}
                <strong className="text-foreground">{job.title}</strong> have been sent to{" "}
                <strong className="text-foreground">{job.companyName}</strong>.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto rounded-xl font-bold text-xs h-10"
                >
                  <Link href="/job-tracker">View Application in Tracker</Link>
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto rounded-xl font-bold text-xs h-10"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Multi-Step Flow */
            <div className="flex flex-col max-h-[85vh]">
              {/* Header */}
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/70 text-left">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Easy Apply
                    </span>
                    <DialogTitle className="text-lg font-bold text-foreground">
                      {job.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      {job.companyName} • {job.location || "Remote"}
                    </DialogDescription>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">
                      Step {currentStep} of {totalSteps}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <Progress
                    value={(currentStep / totalSteps) * 100}
                    className="h-1.5 bg-muted rounded-full"
                  />
                </div>
              </DialogHeader>

              {/* Step Contents */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* STEP 1: Contact & Profile Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Contact Information
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Recruiters will use these details to contact you regarding your application.
                      </p>
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-border bg-muted/40">
                      <Avatar className="h-14 w-14 rounded-xl border border-border">
                        <AvatarImage src={userImage} alt={userName} className="object-cover" />
                        <AvatarFallback className="font-bold text-primary bg-primary/10 rounded-xl">
                          {userName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {userName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{userTitle}</p>
                        {userLocation && (
                          <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span>{userLocation}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="p-3 rounded-xl border border-border bg-card flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            Email Address
                          </p>
                          <p className="text-xs font-bold text-foreground truncate">
                            {userEmail || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-border bg-card flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            Phone Number
                          </p>
                          <p className="text-xs font-bold text-foreground truncate">
                            {userPhone || "Not provided (optional)"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-right">
                      <Link
                        href="/candidate-profile"
                        target="_blank"
                        className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <span>Update profile details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* STEP 2: Required Task Assessments (If applicable) */}
                {currentStep === 2 && hasTasks && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Practical Skill Assessments
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        This role requires practical coding/design assessments. Open each specialized
                        IDE to complete the challenge.
                      </p>
                    </div>

                    {job.tabLock && (
                      <div className="flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          Anti-cheat monitoring is active for this job. Warning limit:{" "}
                          <strong className="text-foreground">{job.tabLockWarningLimit}</strong> tab
                          switches.
                        </span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* CSS / Design Task */}
                      {job.hasDesignTask && (
                        <div
                          className={`p-4 rounded-2xl border transition-all ${
                            submissions.design?.id
                              ? "bg-emerald-500/5 border-emerald-500/30"
                              : "bg-card border-border hover:border-pink-500/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
                                <PenTool className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-xs text-foreground">
                                  {detail.designTask?.title || "CSS & HTML UI Challenge"}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Target Match: ≥ {detail.designTask?.minimumMatchingScore || 90}%
                                </p>
                              </div>
                            </div>

                            {submissions.design?.id ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Completed</span>
                              </Badge>
                            ) : (
                              <Button
                                asChild
                                size="sm"
                                className="h-8 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white gap-1"
                              >
                                <Link href={cssTaskUrl} onClick={() => saveJobApplicationDraft(job.id, coverNote)}>
                                  <span>Launch IDE</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Programming Task */}
                      {job.hasProgrammingTask && (
                        <div
                          className={`p-4 rounded-2xl border transition-all ${
                            submissions.programming?.id
                              ? "bg-emerald-500/5 border-emerald-500/30"
                              : "bg-card border-border hover:border-blue-500/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Code2 className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-xs text-foreground">
                                  {detail.programmingTask?.title || "Programming Assessment"}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Algorithm & Unit Tests
                                </p>
                              </div>
                            </div>

                            {submissions.programming?.id ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Completed</span>
                              </Badge>
                            ) : (
                              <Button
                                asChild
                                size="sm"
                                className="h-8 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1"
                              >
                                <Link href={programTaskUrl} onClick={() => saveJobApplicationDraft(job.id, coverNote)}>
                                  <span>Launch IDE</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SQL Task */}
                      {job.hasSqlTask && (
                        <div
                          className={`p-4 rounded-2xl border transition-all ${
                            submissions.sql?.id
                              ? "bg-emerald-500/5 border-emerald-500/30"
                              : "bg-card border-border hover:border-amber-500/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Database className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-xs text-foreground">
                                  {detail.sqlTask?.title || "SQL Database Challenge"}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Database Queries
                                </p>
                              </div>
                            </div>

                            {submissions.sql?.id ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Completed</span>
                              </Badge>
                            ) : (
                              <Button
                                asChild
                                size="sm"
                                className="h-8 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1"
                              >
                                <Link href={sqlTaskUrl} onClick={() => saveJobApplicationDraft(job.id, coverNote)}>
                                  <span>Launch IDE</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {!allTasksCompleted && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                        <CircleAlert className="h-4 w-4 shrink-0" />
                        <span>
                          Complete the {totalRequiredTasksCount - completedTasksCount} remaining
                          assessment(s) to unlock final submission.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Cover Pitch */}
                {((currentStep === 2 && !hasTasks) ||
                  (currentStep === 3 && hasTasks)) && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Cover Pitch to Hiring Team
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add an optional brief message highlighting your motivation and relevant experience.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        placeholder={`Hi ${job.companyName} team,\n\nI am excited to apply for the ${job.title} role. My experience in ${profile?.skills?.slice(0, 3).map((s) => s.name).join(", ") || "software engineering"} makes me a great fit...`}
                        className="min-h-[160px] rounded-2xl p-4 text-sm resize-none bg-muted/30 border-border"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Keep it brief and focused on what makes you a standout candidate.
                      </p>
                    </div>
                  </div>
                )}

                {/* FINAL STEP: Review & Submit */}
                {currentStep === totalSteps && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Review Application
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Please review your application summary before sending to {job.companyName}.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Candidate
                        </span>
                        <span className="text-xs font-bold text-foreground">{userName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Email
                        </span>
                        <span className="text-xs font-bold text-foreground">{userEmail}</span>
                      </div>
                      {hasTasks && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Assessments
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> All {totalRequiredTasksCount} Tasks Completed
                          </span>
                        </div>
                      )}
                      {coverNote && (
                        <div className="pt-2 border-t border-border/60">
                          <span className="text-xs font-semibold text-muted-foreground block mb-1">
                            Cover Pitch
                          </span>
                          <p className="text-xs text-foreground/90 whitespace-pre-wrap line-clamp-3 bg-card p-2.5 rounded-xl border border-border">
                            {coverNote}
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      By selecting &quot;Submit Application&quot;, you agree to share your JobHub verified
                      profile, skills, and assessment results with {job.companyName}.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-border/70 flex items-center justify-between gap-3 bg-muted/20">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrevStep}
                    disabled={isPending}
                    className="rounded-xl font-bold text-xs gap-1.5 h-10"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl font-bold text-xs h-10"
                  >
                    Cancel
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="rounded-xl font-bold text-xs gap-1.5 h-10 px-5"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={isPending || (hasTasks && !allTasksCompleted)}
                    className="rounded-xl font-bold text-xs gap-2 h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
