"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { applyJobAction } from "@/lib/actions/jobs";
import { loadJobAssessmentSubmission, saveJobApplicationDraft } from "@/lib/job-assessment-submissions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, CircleAlert, Code2, Database, ExternalLink, ImageIcon, Loader2 } from "lucide-react";
import type { DesignTaskDto, ProgrammingTaskDto, SQLTaskDto, TaskSubmissionResponse, TaskType } from "@/types/api/tasks";
import { toast } from "sonner";

interface JobApplicationModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  hasApplied: boolean;
  tabLock: boolean;
  tabLockWarningLimit: number;
  tasks: {
    design?: DesignTaskDto;
    programming?: ProgrammingTaskDto;
    sql?: SQLTaskDto;
  };
}

function TaskStatus({ submission }: { submission?: TaskSubmissionResponse }) {
  if (!submission) return <span className="text-xs text-muted-foreground">Not submitted</span>;

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="size-3.5" />
      Submitted · {submission.passed ? "Passed" : "Recorded"}
    </span>
  );
}

export function JobApplicationModal({
  jobId,
  jobTitle,
  companyName,
  hasApplied,
  tabLock,
  tabLockWarningLimit,
  tasks,
}: JobApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissions, setSubmissions] = useState<Partial<Record<TaskType, TaskSubmissionResponse>>>({});
  const [isPending, startTransition] = useTransition();

  const requiredTaskTypes = useMemo(
    () => [
      tasks.design && "DESIGN",
      tasks.programming && "PROGRAMMING",
      tasks.sql && "SQL",
    ].filter((taskType): taskType is TaskType => Boolean(taskType)),
    [tasks.design, tasks.programming, tasks.sql]
  );
  const hasTasks = requiredTaskTypes.length > 0;
  const hasCompletedRequiredTasks = requiredTaskTypes.every((taskType) => Boolean(submissions[taskType]?.id));

  useEffect(() => {
    if (!isOpen) return;

    const loadSubmissions = () => {
      setSubmissions({
        DESIGN: loadJobAssessmentSubmission(jobId, "DESIGN", tasks.design?.id),
        PROGRAMMING: loadJobAssessmentSubmission(jobId, "PROGRAMMING", tasks.programming?.id),
        SQL: loadJobAssessmentSubmission(jobId, "SQL", tasks.sql?.id),
      });
    };

    loadSubmissions();
    window.addEventListener("storage", loadSubmissions);
    return () => window.removeEventListener("storage", loadSubmissions);
  }, [isOpen, jobId, tasks.design?.id, tasks.programming?.id, tasks.sql?.id]);

  if (hasApplied) {
    return <Button disabled size="lg" className="w-full bg-emerald-600 text-white opacity-100"><CheckCircle2 />Application submitted</Button>;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!hasCompletedRequiredTasks) {
      toast.error("Submit every required assessment before applying.");
      return;
    }

    startTransition(async () => {
      const result = await applyJobAction(jobId, {
        coverNote,
        designSubmissionId: submissions.DESIGN?.id,
        programmingSubmissionId: submissions.PROGRAMMING?.id,
        sqlSubmissionId: submissions.SQL?.id,
      });

      if (result.success) {
        setIsSuccess(true);
        toast.success(`Application submitted to ${companyName}.`);
      } else {
        toast.error(result.error || "Unable to submit your application.");
      }
    });
  };

  const assessmentCards = [
    tasks.design && { type: "DESIGN" as const, title: tasks.design.title, href: `/task/css?jobId=${jobId}&taskId=${tasks.design.id}`, icon: ImageIcon },
    tasks.programming && { type: "PROGRAMMING" as const, title: tasks.programming.title, href: `/task/program?jobId=${jobId}&taskId=${tasks.programming.id}`, icon: Code2 },
    tasks.sql && { type: "SQL" as const, title: tasks.sql.title, href: `/task/sql?jobId=${jobId}&taskId=${tasks.sql.id}`, icon: Database },
  ].filter(Boolean) as { type: TaskType; title: string; href: string; icon: typeof Code2 }[];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">{hasTasks ? "Complete assessments to apply" : "Apply now"}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {isSuccess ? (
          <div className="space-y-4 py-10 text-center">
            <CheckCircle2 className="mx-auto size-16 text-emerald-600" />
            <h2 className="text-2xl font-semibold">Application sent</h2>
            <p className="text-sm text-muted-foreground">Your application for {jobTitle} has been submitted successfully.</p>
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apply for {jobTitle}</DialogTitle>
              <DialogDescription>at {companyName}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-3">
              {hasTasks && (
                <section className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  <div>
                    <h3 className="font-semibold">Required assessments</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Open each assigned editor and submit a solution. A pass is not required; recruiters review every recorded result.</p>
                  </div>
                  {tabLock && <div className="flex gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-950 dark:text-amber-200"><CircleAlert className="size-4 shrink-0" />Tab activity is recorded in each assessment editor. The employer warning limit is {tabLockWarningLimit}.</div>}
                  <div className="space-y-3">
                    {assessmentCards.map((assessment) => {
                      const Icon = assessment.icon;
                      return <div key={assessment.type} className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"><div className="min-w-0"><div className="flex items-center gap-2"><Icon className="size-4 text-primary" /><p className="truncate text-sm font-medium">{assessment.title}</p></div><div className="mt-1"><TaskStatus submission={submissions[assessment.type]} /></div></div><Button asChild type="button" size="sm" variant="outline"><Link href={assessment.href} onClick={() => saveJobApplicationDraft(jobId, coverNote)}>Open editor <ExternalLink /></Link></Button></div>;
                    })}
                  </div>
                </section>
              )}
              <div className="space-y-2"><Label htmlFor="coverNote">Cover note (optional)</Label><Textarea id="coverNote" value={coverNote} onChange={(event) => setCoverNote(event.target.value)} placeholder="Briefly explain why you are a good fit..." className="min-h-32" /></div>
              <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" disabled={isPending || !hasCompletedRequiredTasks}>{isPending && <Loader2 className="animate-spin" />}{hasTasks && !hasCompletedRequiredTasks ? "Complete assessments to apply" : "Submit application"}</Button></div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
