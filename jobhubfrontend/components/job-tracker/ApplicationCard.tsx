import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { semanticMatchPercentage } from '@/lib/semantic-match';

interface TaskSubmissionResponse {
  taskId: string;
  taskType: string;
  passed: boolean;
  achievedScore: number;
  requiredScore: number;
  message?: string;
}

type ApplicationStatus = 'APPLIED' | 'IN_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';

export interface JobApplicationResponse {
  id: string;
  jobPostId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: ApplicationStatus;
  similarityScore: number | null;
  tabSwitchCount: number;
  coverNote: string | null;
  designSubmission: TaskSubmissionResponse | null;
  programmingSubmission: TaskSubmissionResponse | null;
  sqlSubmission: TaskSubmissionResponse | null;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  APPLIED: { label: 'Applied', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  IN_REVIEW: { label: 'In Review', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
};

export const ApplicationCard: React.FC<{ application: JobApplicationResponse }> = ({ application }) => {
  const config = statusConfig[application.status];
  const appliedDate = format(new Date(application.createdAt), 'MMM dd, yyyy');
  const semanticMatch = semanticMatchPercentage(application.similarityScore);

  return (
    <Card className="w-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{application.jobTitle}</CardTitle>
            <CardDescription className="text-sm font-medium mt-1">{application.companyName}</CardDescription>
          </div>
          <Badge className={config.color} variant="secondary">{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Applied on: {appliedDate}</p>
          {semanticMatch !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Semantic match:</span>
              <Badge variant="outline" title="Relevance at the time you applied; not an acceptance probability.">{semanticMatch}%</Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {application.designSubmission && (<Badge variant={application.designSubmission.passed ? 'default' : 'destructive'} className="text-xs">Design: {application.designSubmission.passed ? 'Pass' : 'Fail'}</Badge>)}
            {application.programmingSubmission && (<Badge variant={application.programmingSubmission.passed ? 'default' : 'destructive'} className="text-xs">Code: {application.programmingSubmission.passed ? 'Pass' : 'Fail'}</Badge>)}
            {application.sqlSubmission && (<Badge variant={application.sqlSubmission.passed ? 'default' : 'destructive'} className="text-xs">SQL: {application.sqlSubmission.passed ? 'Pass' : 'Fail'}</Badge>)}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/find-job/${application.jobPostId}`} className="w-full" passHref>
          <Button variant="outline" className="w-full">View Job Posting</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
