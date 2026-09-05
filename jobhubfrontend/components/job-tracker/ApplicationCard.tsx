import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  Code,
  PenTool,
  Database,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

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

const statusConfig: Record<
  ApplicationStatus,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  APPLIED: {
    label: 'Applied',
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold',
    icon: Send,
  },
  IN_REVIEW: {
    label: 'In Review',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold',
    icon: Clock,
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    badgeClass: 'bg-primary text-black font-bold border border-primary shadow-xs',
    icon: Sparkles,
  },
  ACCEPTED: {
    label: 'Accepted',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Not Selected',
    badgeClass: 'bg-destructive/10 text-destructive border border-destructive/20 font-bold',
    icon: XCircle,
  },
};

export const ApplicationCard: React.FC<{ application: JobApplicationResponse }> = ({ application }) => {
  const config = statusConfig[application.status] || statusConfig.APPLIED;
  const StatusIcon = config.icon;
  const appliedDate = format(new Date(application.createdAt), 'MMM dd, yyyy');

  const matchPercent =
    application.similarityScore != null
      ? application.similarityScore <= 1
        ? Math.round(application.similarityScore * 100)
        : Math.round(application.similarityScore)
      : null;

  const STAGES: { key: ApplicationStatus; label: string }[] = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'IN_REVIEW', label: 'In Review' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'ACCEPTED', label: 'Offer' },
  ];

  const getStageIndex = (status: ApplicationStatus): number => {
    switch (status) {
      case 'APPLIED':
        return 0;
      case 'IN_REVIEW':
        return 1;
      case 'SHORTLISTED':
        return 2;
      case 'ACCEPTED':
        return 3;
      default:
        return -1;
    }
  };

  const currentStageIndex = getStageIndex(application.status);

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-foreground/20 hover:shadow-md flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header: Title, Company Name & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/find-job/${application.jobPostId}`}
              className="font-bold text-lg sm:text-[19px] leading-snug text-foreground hover:underline line-clamp-1 block"
            >
              {application.jobTitle}
            </Link>

            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
              <span className="truncate">{application.companyName}</span>
            </p>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg shrink-0 ${config.badgeClass}`}
          >
            <StatusIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{config.label}</span>
          </span>
        </div>

        {/* Mobbin-style Application Stage Stepper */}
        {application.status !== 'REJECTED' ? (
          <div className="pt-2 pb-1 px-1">
            <div className="relative flex items-center justify-between">
              {/* Background track */}
              <div className="absolute left-2 right-2 top-2.5 h-0.5 -translate-y-1/2 bg-muted/80" />
              {/* Active filled track */}
              <div
                className="absolute left-2 top-2.5 h-0.5 -translate-y-1/2 bg-primary transition-all duration-300"
                style={{
                  width: `calc(${(Math.max(0, currentStageIndex) / (STAGES.length - 1)) * 100}% - 16px)`,
                }}
              />
              {STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                        isCurrent
                          ? 'bg-primary text-black ring-4 ring-primary/20 shadow-xs'
                          : isCompleted
                          ? 'bg-primary text-black'
                          : 'bg-muted text-muted-foreground/80 border border-border/80'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-[11px] tracking-tight ${
                        isCurrent
                          ? 'text-foreground font-bold'
                          : isCompleted
                          ? 'text-muted-foreground font-semibold'
                          : 'text-muted-foreground/60 font-medium'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <XCircle className="h-4 w-4 shrink-0" />
            <span className="font-semibold">This application was not selected and is archived.</span>
          </div>
        )}

        {/* Highlight Row: Match Score if available */}
        {matchPercent != null && matchPercent >= 40 && (
          <div>
            <span
              className="inline-flex items-center gap-1.5 bg-primary text-black font-bold px-2.5 py-1 rounded-lg text-xs shadow-xs"
              title={`Raw match similarity: ${application.similarityScore?.toFixed(3)}`}
            >
              <Sparkles className="h-3.5 w-3.5 text-black shrink-0" />
              <span>{matchPercent}% Match</span>
            </span>
          </div>
        )}

        {/* Assessment Tasks Row if any were submitted */}
        {(application.programmingSubmission || application.designSubmission || application.sqlSubmission) && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Assessment Results
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {application.programmingSubmission && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    application.programmingSubmission.passed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  <Code className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Code: {application.programmingSubmission.passed ? 'Passed' : 'Failed'} (
                    {application.programmingSubmission.achievedScore}/{application.programmingSubmission.requiredScore})
                  </span>
                </span>
              )}
              {application.designSubmission && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    application.designSubmission.passed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  <PenTool className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Design: {application.designSubmission.passed ? 'Passed' : 'Failed'} (
                    {application.designSubmission.achievedScore}/{application.designSubmission.requiredScore})
                  </span>
                </span>
              )}
              {application.sqlSubmission && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    application.sqlSubmission.passed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  <Database className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    SQL: {application.sqlSubmission.passed ? 'Passed' : 'Failed'} (
                    {application.sqlSubmission.achievedScore}/{application.sqlSubmission.requiredScore})
                  </span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tab switch warning if recorded */}
        {application.tabSwitchCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg w-fit">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>
              {application.tabSwitchCount} tab {application.tabSwitchCount === 1 ? 'switch' : 'switches'} during assessment
            </span>
          </div>
        )}

        {/* Cover note preview if provided */}
        {application.coverNote && (
          <div className="bg-muted/40 border border-border/60 rounded-xl p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80 block mb-0.5">Note attached:</span>
            <p className="line-clamp-2 italic leading-relaxed">&ldquo;{application.coverNote}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Footer: Date & Primary Action */}
      <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
          <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
          <span>Applied {appliedDate}</span>
        </span>

        <Button
          asChild
          size="sm"
          className="h-9 px-4 rounded-xl font-bold text-sm gap-1.5 bg-primary text-black hover:bg-primary/90 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Link href={`/find-job/${application.jobPostId}`}>
            <span>View Role</span>
            <ArrowRight className="h-4 w-4 text-black" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
