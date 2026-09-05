'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  Building2,
  MapPin,
  Trash2,
  DollarSign,
  Briefcase,
  ArrowRight,
  Sparkles,
  Send,
  Clock,
  Trophy,
  XCircle,
  FileText,
  Search,
  LayoutGrid,
  List,
  Code,
  PenTool,
  Database,
} from 'lucide-react';
import { useLocalSavedJobs, useLocalInProgressJobs } from '@/lib/hooks/use-local-jobs';
import { ApplicationCard, JobApplicationResponse } from '@/components/job-tracker/ApplicationCard';

interface JobTrackerTabsProps {
  applied: JobApplicationResponse[];
  inReview: JobApplicationResponse[];
  shortlisted: JobApplicationResponse[];
  accepted: JobApplicationResponse[];
  rejected: JobApplicationResponse[];
}

const formatWorkplace = (type?: string) => {
  switch (type) {
    case 'REMOTE':
      return 'Remote';
    case 'HYBRID':
      return 'Hybrid';
    case 'ON_SITE':
      return 'On-site';
    default:
      return type ? type.replace('_', ' ') : 'On-site';
  }
};

const formatJobType = (type?: string) => {
  switch (type) {
    case 'FULL_TIME':
      return 'Full-time';
    case 'PART_TIME':
      return 'Part-time';
    case 'CONTRACT':
      return 'Contract';
    case 'INTERNSHIP':
      return 'Internship';
    default:
      return type ? type.replace('_', ' ') : 'Full-time';
  }
};

export function JobTrackerTabs({ applied, inReview, shortlisted, accepted, rejected }: JobTrackerTabsProps) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(requestedTab || 'applied');
  const [prevRequestedTab, setPrevRequestedTab] = useState(requestedTab);

  if (requestedTab !== prevRequestedTab) {
    setPrevRequestedTab(requestedTab);
    setActiveTab(requestedTab || 'applied');
  }

  const { savedJobs, toggleSaveJob } = useLocalSavedJobs();
  const { inProgressJobs, removeInProgressJob } = useLocalInProgressJobs();

  // Search & Filter & View state (Mobbin pattern)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'match'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Helper to filter and sort application lists
  const filterAndSortApps = (apps: JobApplicationResponse[]) => {
    let result = apps;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.jobTitle.toLowerCase().includes(q) || a.companyName.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'match') {
        return (b.similarityScore || 0) - (a.similarityScore || 0);
      }
      return 0;
    });
  };

  // Helper to filter and sort saved jobs
  const filteredSavedJobs = useMemo(() => {
    let result = savedJobs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.jobTitle.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          (j.location && j.location.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
      }
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
  }, [savedJobs, searchQuery, sortBy]);

  // Helper to filter drafts
  const filteredDrafts = useMemo(() => {
    let result = inProgressJobs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) => j.jobTitle.toLowerCase().includes(q) || j.companyName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [inProgressJobs, searchQuery]);

  const renderApplicationGrid = (
    apps: JobApplicationResponse[],
    title: string,
    emptyMessage: string,
    Icon: React.ComponentType<{ className?: string }>
  ) => {
    const processed = filterAndSortApps(apps);

    if (processed.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[260px] border border-dashed border-border rounded-2xl p-8 text-center bg-card">
          <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mb-3">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-base text-foreground">
            {searchQuery.trim() ? 'No matching applications found' : title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-md leading-relaxed">
            {searchQuery.trim() ? `No applications match "${searchQuery}". Clear your search query.` : emptyMessage}
          </p>
          {searchQuery.trim() ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="mt-4 rounded-xl text-xs"
            >
              Clear Search
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="mt-5 bg-primary text-black font-bold text-xs rounded-xl hover:bg-primary/90 shadow-xs h-9 px-4 cursor-pointer"
            >
              <Link href="/find-job">Explore Open Jobs</Link>
            </Button>
          )}
        </div>
      );
    }

    if (viewMode === 'table') {
      return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Role & Company</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Match</th>
                  <th className="px-5 py-3.5">Assessments</th>
                  <th className="px-5 py-3.5">Applied Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {processed.map((app) => {
                  const matchPercent =
                    app.similarityScore != null
                      ? app.similarityScore <= 1
                        ? Math.round(app.similarityScore * 100)
                        : Math.round(app.similarityScore)
                      : null;

                  return (
                    <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <Link
                          href={`/find-job/${app.jobPostId}`}
                          className="font-bold text-foreground hover:underline line-clamp-1 block text-sm"
                        >
                          {app.jobTitle}
                        </Link>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                          <Building2 className="h-3 w-3 text-muted-foreground/70" />
                          <span>{app.companyName}</span>
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 border bg-muted/60 text-foreground border-border/80">
                          {app.status === 'SHORTLISTED' ? (
                            <span className="bg-primary text-black font-bold px-2 py-0.5 rounded-md text-[11px]">
                              Shortlisted
                            </span>
                          ) : (
                            app.status.replace('_', ' ')
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {matchPercent != null && matchPercent >= 40 ? (
                          <span className="inline-flex items-center gap-1 bg-primary text-black font-bold px-2 py-0.5 rounded-md text-xs shadow-xs">
                            <Sparkles className="h-3 w-3 text-black" />
                            <span>{matchPercent}%</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {app.programmingSubmission && (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                app.programmingSubmission.passed
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                              }`}
                            >
                              <Code className="h-3 w-3" />
                              <span>Code</span>
                            </span>
                          )}
                          {app.designSubmission && (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                app.designSubmission.passed
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                              }`}
                            >
                              <PenTool className="h-3 w-3" />
                              <span>Design</span>
                            </span>
                          )}
                          {app.sqlSubmission && (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                app.sqlSubmission.passed
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                              }`}
                            >
                              <Database className="h-3 w-3" />
                              <span>SQL</span>
                            </span>
                          )}
                          {!app.programmingSubmission && !app.designSubmission && !app.sqlSubmission && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {format(new Date(app.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          asChild
                          size="sm"
                          className="h-8 px-3 rounded-xl font-bold text-xs gap-1.5 bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer"
                        >
                          <Link href={`/find-job/${app.jobPostId}`}>
                            <span>View Role</span>
                            <ArrowRight className="h-3.5 w-3.5 text-black" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {processed.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mobbin-style Pill Tabs Bar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Pill navigation triggers */}
          <div className="overflow-x-auto pb-1">
            <TabsList className="flex h-auto gap-2 p-0 bg-transparent border-0 w-max min-w-full sm:min-w-0">
              <TabsTrigger
                value="saved"
                className="rounded-full px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-border/80 data-[state=active]:border-primary"
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>Saved</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'saved' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {savedJobs.length}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="in-progress"
                className="rounded-full px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-border/80 data-[state=active]:border-primary"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Drafts</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'in-progress' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {inProgressJobs.length}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="applied"
                className="rounded-full px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-border/80 data-[state=active]:border-primary"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Applied</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'applied' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {applied.length}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="in-review"
                className="rounded-full px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-border/80 data-[state=active]:border-primary"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>In Review</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'in-review' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {inReview.length}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="shortlisted"
                className="rounded-full px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-border/80 data-[state=active]:border-primary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Shortlisted</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'shortlisted' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {shortlisted.length}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="accepted"
                className="rounded-full px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-border/80 data-[state=active]:border-primary"
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Accepted</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'accepted' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {accepted.length}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="rejected"
                className="rounded-full px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-border/80 data-[state=active]:border-primary"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Rejected</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'rejected' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {rejected.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Search, Sort & View Mode Toolbar (Mobbin pattern) */}
          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter roles..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'match')}
              aria-label="Sort applications"
              className="h-9 px-3 rounded-xl border border-border bg-card text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="match">Match Score</option>
            </select>

            {/* View Toggle (Grid / Table) */}
            <div className="flex items-center p-1 rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-primary text-black font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-primary text-black font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Table view"
                aria-label="Table view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Saved Jobs Tab */}
        <TabsContent value="saved" className="mt-0">
          {filteredSavedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[260px] border border-dashed border-border rounded-2xl p-8 text-center bg-card">
              <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mb-3">
                <Bookmark className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-base text-foreground">
                {searchQuery.trim() ? 'No matching saved jobs' : 'No saved jobs'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                {searchQuery.trim()
                  ? `No saved jobs match "${searchQuery}". Clear your search.`
                  : 'Bookmark exciting roles while browsing to save them for later and apply when you are ready.'}
              </p>
              {searchQuery.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 rounded-xl text-xs"
                >
                  Clear Search
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="mt-5 bg-primary text-black font-bold text-xs rounded-xl hover:bg-primary/90 shadow-xs h-9 px-4 cursor-pointer"
                >
                  <Link href="/find-job">Explore Opportunities</Link>
                </Button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Role & Company</th>
                      <th className="px-5 py-3.5">Location</th>
                      <th className="px-5 py-3.5">Salary</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Saved Date</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredSavedJobs.map((job) => (
                      <tr key={job.jobId} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <Link
                            href={`/find-job/${job.jobId}`}
                            className="font-bold text-foreground hover:underline line-clamp-1 block text-sm"
                          >
                            {job.jobTitle}
                          </Link>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                            <Building2 className="h-3 w-3 text-muted-foreground/70" />
                            <span>{job.companyName}</span>
                          </p>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {job.location ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{job.location}</span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {job.salaryMin && job.salaryMin > 0 ? (
                            <span className="text-xs font-bold text-foreground">
                              {job.salaryCurrency || '$'}
                              {job.salaryMin.toLocaleString()}
                              {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted/60 text-foreground border border-border/60">
                            {formatJobType(job.jobType)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(job.savedAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSaveJob(job)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Remove from saved"
                              aria-label="Remove from saved"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <Button
                              asChild
                              size="sm"
                              className="h-8 px-3 rounded-xl font-bold text-xs gap-1 bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer"
                            >
                              <Link href={`/find-job/${job.jobId}`}>
                                <span>Apply</span>
                                <ArrowRight className="h-3.5 w-3.5 text-black" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredSavedJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="group relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-foreground/20 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/find-job/${job.jobId}`}
                          className="font-bold text-lg sm:text-[19px] leading-snug text-foreground hover:underline line-clamp-1 block"
                        >
                          {job.jobTitle}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{job.companyName}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSaveJob(job)}
                        className="h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all cursor-pointer border border-border/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        title="Remove from saved"
                        aria-label="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Attributes Row */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {job.salaryMin && job.salaryMin > 0 && (
                        <span className="inline-flex items-center gap-1 bg-muted/80 text-foreground font-bold px-2.5 py-1 rounded-lg border border-border text-xs">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>
                            {job.salaryCurrency || '$'}
                            {job.salaryMin.toLocaleString()}
                            {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}
                          </span>
                        </span>
                      )}

                      {job.location && (
                        <span className="inline-flex items-center gap-1 bg-muted/50 px-2.5 py-1 rounded-lg text-foreground border border-border/50 text-xs font-medium">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[140px]">{job.location}</span>
                        </span>
                      )}

                      {job.jobType && (
                        <span className="inline-flex items-center gap-1 bg-muted/50 px-2.5 py-1 rounded-lg text-foreground border border-border/50 text-xs font-medium">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{formatJobType(job.jobType)}</span>
                        </span>
                      )}

                      {job.workplaceType && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-muted/50 text-foreground border border-border/50 text-xs font-medium">
                          {formatWorkplace(job.workplaceType)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      Saved {format(new Date(job.savedAt), 'MMM dd, yyyy')}
                    </span>
                    <Button
                      asChild
                      size="sm"
                      className="h-9 px-4 rounded-xl font-bold text-sm gap-1.5 bg-primary text-black hover:bg-primary/90 shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Link href={`/find-job/${job.jobId}`}>
                        <span>View & Apply</span>
                        <ArrowRight className="h-4 w-4 text-black" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Drafts (In-Progress) Tab */}
        <TabsContent value="in-progress" className="mt-0">
          {filteredDrafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[260px] border border-dashed border-border rounded-2xl p-8 text-center bg-card">
              <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-base text-foreground">
                {searchQuery.trim() ? 'No matching drafts' : 'No drafts in progress'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                {searchQuery.trim()
                  ? `No drafts match "${searchQuery}". Clear your search.`
                  : 'When you start an application and save your answers before submitting, they will appear here.'}
              </p>
              {searchQuery.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 rounded-xl text-xs"
                >
                  Clear Search
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="mt-5 bg-primary text-black font-bold text-xs rounded-xl hover:bg-primary/90 shadow-xs h-9 px-4 cursor-pointer"
                >
                  <Link href="/find-job">Browse Jobs</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredDrafts.map((job) => (
                <div
                  key={job.jobId}
                  className="group relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-foreground/20 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/find-job/${job.jobId}`}
                          className="font-bold text-lg sm:text-[19px] leading-snug text-foreground hover:underline line-clamp-1 block"
                        >
                          {job.jobTitle}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{job.companyName}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInProgressJob(job.jobId)}
                        className="h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all cursor-pointer border border-border/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        title="Discard draft"
                        aria-label="Discard draft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Draft in progress</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      Updated {format(new Date(job.updatedAt), 'MMM dd, yyyy')}
                    </span>
                    <Button
                      asChild
                      size="sm"
                      className="h-9 px-4 rounded-xl font-bold text-sm gap-1.5 bg-primary text-black hover:bg-primary/90 shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Link href={`/find-job/${job.jobId}`}>
                        <span>Resume Application</span>
                        <ArrowRight className="h-4 w-4 text-black" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Status Views */}
        <TabsContent value="applied" className="mt-0">
          {renderApplicationGrid(
            applied,
            'No applications submitted yet',
            'When you submit an application for a role, it will appear here under Applied status.',
            Send
          )}
        </TabsContent>

        <TabsContent value="in-review" className="mt-0">
          {renderApplicationGrid(
            inReview,
            'No applications currently in review',
            'Applications currently being actively evaluated by employers or hiring managers appear here.',
            Clock
          )}
        </TabsContent>

        <TabsContent value="shortlisted" className="mt-0">
          {renderApplicationGrid(
            shortlisted,
            'No shortlisted applications yet',
            'Congratulations will appear here when an employer selects your profile for the shortlist or next interview round.',
            Sparkles
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-0">
          {renderApplicationGrid(
            accepted,
            'No accepted offers yet',
            'Offers you have accepted or roles finalized will be listed here.',
            Trophy
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          {renderApplicationGrid(
            rejected,
            'No archived or rejected applications',
            'Applications that were not selected or closed by employers will be archived here.',
            XCircle
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


