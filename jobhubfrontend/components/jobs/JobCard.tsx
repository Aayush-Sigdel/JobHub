import React from 'react';
import Link from 'next/link';
import { JobPostResponse } from '@/types/api/jobs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Briefcase, DollarSign, Calendar, Target, Code, PenTool, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: JobPostResponse;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors duration-200">
      <Link href={`/find-job/${job.id}`} className="block h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold line-clamp-1">{job.title}</CardTitle>
              <div className="text-muted-foreground mt-1 text-sm font-medium">{job.companyName}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-4">
          <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
            {job.location && (
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</div>
            )}
            <div className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.jobType.replace('_', ' ')}</div>
            {job.salaryMin && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salaryCurrency || '$'}{job.salaryMin.toLocaleString()}
                {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}
              </div>
            )}
          </div>
          <p className="text-sm line-clamp-2 text-foreground/80">{job.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline">{job.workplaceType.replace('_', ' ')}</Badge>
            <Badge variant="outline">{job.experienceLevel.replace('_', ' ')}</Badge>
          </div>
        </CardContent>
        <CardFooter className="pt-0 border-t mt-auto pt-4 flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'Recently'}
          </div>
          <div className="flex items-center gap-2">
            {(job.hasDesignTask || job.hasProgrammingTask || job.hasSqlTask) && (
              <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                <Target className="w-3 h-3" /><span>Assessments</span>
                {job.hasProgrammingTask && <Code className="w-3 h-3 ml-1" />}
                {job.hasDesignTask && <PenTool className="w-3 h-3 ml-1" />}
                {job.hasSqlTask && <Database className="w-3 h-3 ml-1" />}
              </div>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
