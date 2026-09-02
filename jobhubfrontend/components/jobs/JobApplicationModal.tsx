'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { applyJobAction } from '@/lib/actions/jobs';
import { submitTaskAction } from '@/lib/actions/tasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, CircleAlert, Code2, Database, ImageIcon, Loader2 } from 'lucide-react';
import { useTabLock } from '@/lib/hooks/use-tab-lock';
import type { DesignTaskDto, ProgrammingTaskDto, SQLTaskDto, TaskSubmissionResponse, TaskType } from '@/types/api/tasks';
import { toast } from 'sonner';

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

function imageDataUrl(imageBytes: number[], contentType: string) {
  const binary = new Uint8Array(imageBytes).reduce((value, byte) => value + String.fromCharCode(byte), '');
  return `data:${contentType};base64,${btoa(binary)}`;
}

function TaskStatus({ submission }: { submission?: TaskSubmissionResponse }) {
  if (!submission) return <span className="text-xs text-muted-foreground">Not submitted</span>;

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
      <CheckCircle2 className="size-3.5 text-emerald-600" />
      Submitted · {submission.passed ? 'Passed' : 'Result shared with recruiter'}
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
  const [coverNote, setCoverNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [programmingCode, setProgrammingCode] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState<'JAVA' | 'PYTHON'>('JAVA');
  const [sqlCode, setSqlCode] = useState('');
  const [designCode, setDesignCode] = useState('');
  const [submissions, setSubmissions] = useState<Partial<Record<TaskType, TaskSubmissionResponse>>>({});
  const [isPending, startTransition] = useTransition();
  const [isTaskPending, startTaskTransition] = useTransition();
  const { tabSwitchCount, events } = useTabLock({
    jobId,
    enabled: isOpen && tabLock,
    warningLimit: tabLockWarningLimit,
  });

  const requiredTaskTypes = useMemo(() => [
    tasks.design && 'DESIGN',
    tasks.programming && 'PROGRAMMING',
    tasks.sql && 'SQL',
  ].filter((taskType): taskType is TaskType => Boolean(taskType)), [tasks.design, tasks.programming, tasks.sql]);
  const hasTasks = requiredTaskTypes.length > 0;
  const hasCompletedRequiredTasks = requiredTaskTypes.every((taskType) => Boolean(submissions[taskType]?.id));

  if (hasApplied) {
    return <Button disabled size="lg" className="w-full bg-green-600 text-white opacity-100">Applied</Button>;
  }

  const submitTask = (taskType: TaskType, taskId: string) => {
    const code = taskType === 'PROGRAMMING'
      ? programmingCode
      : taskType === 'SQL'
        ? sqlCode
        : designCode;

    if (!code.trim()) {
      toast.error('Add your solution before submitting this assessment.');
      return;
    }

    startTaskTransition(async () => {
      try {
        const submission = await submitTaskAction({
          taskId,
          taskType,
          ...(taskType === 'SQL' ? { codes: [code] } : { code }),
          ...(taskType === 'PROGRAMMING' ? { language: programmingLanguage } : {}),
        });

        if (!submission.id) {
          throw new Error('The assessment response did not include a submission ID.');
        }

        setSubmissions((current) => ({ ...current, [taskType]: submission }));
        toast.success(`${taskType === 'SQL' ? 'SQL' : taskType[0] + taskType.slice(1).toLowerCase()} assessment submitted.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to submit the assessment.');
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasCompletedRequiredTasks) {
      toast.error('Submit every required assessment before applying.');
      return;
    }

    startTransition(async () => {
      const result = await applyJobAction(jobId, {
        coverNote,
        designSubmissionId: submissions.DESIGN?.id,
        programmingSubmissionId: submissions.PROGRAMMING?.id,
        sqlSubmissionId: submissions.SQL?.id,
        tabSwitchCount,
        tabSwitchEvents: events,
      });
      if (result.success) {
        setIsSuccess(true);
        toast.success(`Application submitted to ${companyName}!`);
      } else {
        toast.error(result.error || 'Something went wrong while applying.');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full text-lg h-14">
          {hasTasks ? 'Start Application & Assessments' : 'Apply Now'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Application Sent!</h2>
            <p className="text-muted-foreground">Your application for {jobTitle} has been submitted successfully.</p>
            <Button onClick={() => setIsOpen(false)} className="mt-4">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apply for {jobTitle}</DialogTitle>
              <DialogDescription>at {companyName}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              {hasTasks && (
                <section className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  <div>
                    <h3 className="font-semibold">Required assessments</h3>
                    <p className="mt-1 text-sm text-muted-foreground">A submission is required for each task. Passing is not required; recruiters review every submitted result.</p>
                  </div>
                  {tabLock && (
                    <div className="flex gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-950 dark:text-amber-200">
                      <CircleAlert className="size-4 shrink-0" />
                      Tab activity is recorded for this assessment. Current events: {tabSwitchCount}.
                    </div>
                  )}
                  <Tabs defaultValue={requiredTaskTypes[0]}>
                    <TabsList className="w-full justify-start overflow-x-auto">
                      {tasks.design && <TabsTrigger value="DESIGN"><ImageIcon />Design <TaskStatus submission={submissions.DESIGN} /></TabsTrigger>}
                      {tasks.programming && <TabsTrigger value="PROGRAMMING"><Code2 />Programming <TaskStatus submission={submissions.PROGRAMMING} /></TabsTrigger>}
                      {tasks.sql && <TabsTrigger value="SQL"><Database />SQL <TaskStatus submission={submissions.SQL} /></TabsTrigger>}
                    </TabsList>

                    {tasks.design && (
                      <TabsContent value="DESIGN" className="space-y-3 pt-3">
                        <p className="font-medium">{tasks.design.title}</p>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{tasks.design.instructions}</p>
                        {tasks.design.imageBytes.length > 0 && <img src={imageDataUrl(tasks.design.imageBytes, tasks.design.imageContentType)} alt="Design task target" className="max-h-60 rounded border object-contain" />}
                        <Label htmlFor="designCode">HTML/CSS solution</Label>
                        <Textarea id="designCode" value={designCode} onChange={(event) => setDesignCode(event.target.value)} className="min-h-44 font-mono text-xs" placeholder="Write the HTML and CSS that recreates the target..." />
                        <Button type="button" variant="secondary" disabled={isTaskPending} onClick={() => submitTask('DESIGN', tasks.design!.id)}>{isTaskPending && <Loader2 className="mr-2 size-4 animate-spin" />}Submit design assessment</Button>
                      </TabsContent>
                    )}

                    {tasks.programming && (
                      <TabsContent value="PROGRAMMING" className="space-y-3 pt-3">
                        <p className="font-medium">{tasks.programming.title}</p>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{tasks.programming.instructions}</p>
                        <div className="w-40"><Label>Language</Label><Select value={programmingLanguage} onValueChange={(value: 'JAVA' | 'PYTHON') => setProgrammingLanguage(value)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="JAVA">Java</SelectItem><SelectItem value="PYTHON">Python</SelectItem></SelectContent></Select></div>
                        <Label htmlFor="programmingCode">Solution</Label>
                        <Textarea id="programmingCode" value={programmingCode} onChange={(event) => setProgrammingCode(event.target.value)} className="min-h-44 font-mono text-xs" placeholder={`Implement ${tasks.programming.methodName}...`} />
                        <Button type="button" variant="secondary" disabled={isTaskPending} onClick={() => submitTask('PROGRAMMING', tasks.programming!.id)}>{isTaskPending && <Loader2 className="mr-2 size-4 animate-spin" />}Submit programming assessment</Button>
                      </TabsContent>
                    )}

                    {tasks.sql && (
                      <TabsContent value="SQL" className="space-y-3 pt-3">
                        <p className="font-medium">{tasks.sql.title}</p>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{tasks.sql.instructions}</p>
                        <Label htmlFor="sqlCode">SQL solution</Label>
                        <Textarea id="sqlCode" value={sqlCode} onChange={(event) => setSqlCode(event.target.value)} className="min-h-44 font-mono text-xs" placeholder="Write your SQL query..." />
                        <Button type="button" variant="secondary" disabled={isTaskPending} onClick={() => submitTask('SQL', tasks.sql!.id)}>{isTaskPending && <Loader2 className="mr-2 size-4 animate-spin" />}Submit SQL assessment</Button>
                      </TabsContent>
                    )}
                  </Tabs>
                </section>
              )}
                <div className="space-y-2">
                  <Label htmlFor="coverNote">Cover Note (Optional)</Label>
                  <Textarea id="coverNote" placeholder="Briefly explain why you're a good fit..." value={coverNote} onChange={(e) => setCoverNote(e.target.value)} className="min-h-[150px]" />
                  <p className="text-xs text-muted-foreground">Stand out by sharing your motivation for this role.</p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isPending || !hasCompletedRequiredTasks}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {hasTasks && !hasCompletedRequiredTasks ? 'Complete assessments to apply' : 'Submit Application'}
                  </Button>
                </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
