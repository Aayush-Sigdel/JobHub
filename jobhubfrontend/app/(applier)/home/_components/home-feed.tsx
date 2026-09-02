'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, DollarSign, ArrowRight, Sparkles, Clock } from 'lucide-react';

interface JobPostResponse {
  id: string;
  title: string;
  companyName: string;
  description: string;
  location?: string;
  jobType: string;
  workplaceType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  hasDesignTask: boolean;
  hasProgrammingTask: boolean;
  hasSqlTask: boolean;
  similarityScore?: number;
  createdAt?: string;
}

interface HomeFeedProps {
  recommendedJobs: JobPostResponse[];
  recentJobs: JobPostResponse[];
}

function JobFeedCard({ job }: { job: JobPostResponse }) {
  return (
    <Link href={`/find-job/${job.id}`}>
      <Card className="hover:border-primary/50 transition-colors duration-200 h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold line-clamp-1">{job.title}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">{job.companyName}</p>
            </div>
            {job.similarityScore !== undefined && (
              <Badge variant="secondary" className="font-semibold text-green-600 bg-green-50">
                {Math.round(job.similarityScore * 100)}% Match
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/80 line-clamp-2 mb-4">{job.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {job.location && (<span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>)}
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.jobType.replace('_', ' ')}</span>
            {job.salaryMin && (<span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salaryCurrency || '$'}{job.salaryMin.toLocaleString()}{job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}</span>)}
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="outline" className="text-xs">{job.workplaceType.replace('_', ' ')}</Badge>
            <Badge variant="outline" className="text-xs">{job.experienceLevel}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function HomeFeed({ recommendedJobs, recentJobs }: HomeFeedProps) {
  return (
    <div className="space-y-12">
      {/* AI Recommended Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Recommended for You</h2>
          </div>
          <Link href="/find-job?semanticSearch=true">
            <Button variant="ghost" className="gap-2">View All <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
        {recommendedJobs.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Complete your profile to get personalized job recommendations.</p>
            <Link href="/candidate-profile"><Button variant="link" className="mt-2">Complete Profile</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.slice(0, 6).map((job) => (<JobFeedCard key={job.id} job={job} />))}
          </div>
        )}
      </section>

      {/* Recent Jobs Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Recently Posted</h2>
          </div>
          <Link href="/find-job?sortBy=date">
            <Button variant="ghost" className="gap-2">View All <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No recent jobs available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.slice(0, 6).map((job) => (<JobFeedCard key={job.id} job={job} />))}
          </div>
        )}
      </section>
    </div>
  );
}
