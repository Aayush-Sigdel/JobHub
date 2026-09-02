'use client';

import React, { useState, useTransition } from 'react';
import { applyJobAction } from '@/lib/actions/jobs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface JobApplicationModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  hasTasks: boolean;
  hasApplied: boolean;
}

export function JobApplicationModal({ jobId, jobTitle, companyName, hasTasks, hasApplied }: JobApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (hasApplied) {
    return <Button disabled size="lg" className="w-full bg-green-600 text-white opacity-100">Applied</Button>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await applyJobAction(jobId, { coverNote, tabSwitchCount: 0 });
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
      <DialogContent className="sm:max-w-[500px]">
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
            {hasTasks ? (
              <div className="py-6 text-center">
                <p className="mb-6 text-sm">This job requires technical assessments. By clicking continue, you will enter the assessment environment.</p>
                <Button className="w-full" onClick={() => toast.info('Entering Assessment Mode')}>Start Assessment</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="coverNote">Cover Note (Optional)</Label>
                  <Textarea id="coverNote" placeholder="Briefly explain why you're a good fit..." value={coverNote} onChange={(e) => setCoverNote(e.target.value)} className="min-h-[150px]" />
                  <p className="text-xs text-muted-foreground">Stand out by sharing your motivation for this role.</p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Application
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
