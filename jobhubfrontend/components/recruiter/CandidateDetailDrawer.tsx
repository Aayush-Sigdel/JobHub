"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { CandidateDashboardResponse, CandidateSocialSnapshotDto } from "@/types/api/recruiter";
import { updateApplicationStatusAction } from "@/lib/actions/recruiter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  IconBriefcase,
  IconExternalLink,
  IconEye,
  IconSchool,
  IconShieldExclamation,
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
  IconSparkles,
} from "@tabler/icons-react";
import { calculateSupportedOverallSimilarity, getSimilaritySources } from "@/lib/semantic-match";

interface Props {
  candidate: CandidateDashboardResponse;
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
  onStatusChange?: (status: "SHORTLISTED" | "ACCEPTED" | "REJECTED") => void;
}

export default function CandidateDetailDrawer({
  candidate,
  jobId,
  open,
  onOpenChange,
  embedded = false,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<CandidateSocialSnapshotDto[]>([]);
  const [snapsLoading, setSnapshotsLoading] = useState(false);
  const [snapshotsError, setSnapshotsError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const evidenceSources = getSimilaritySources(candidate);
  const overallSimilarity = calculateSupportedOverallSimilarity(candidate);

  const displayName = candidate.name;

  const getExternalUrl = (url: string) => {
    const trimmed = url.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const effectiveJobId = candidate.jobId || (jobId !== "all" ? jobId : undefined);

  useEffect(() => {
    if (open && candidate.candidateId && effectiveJobId) {
      const fetchSnapshots = async () => {
        setSnapshotsLoading(true);
        setSnapshotsError(false);
        try {
          const res = await api.get(`/recruiter/jobs/${effectiveJobId}/candidates/${candidate.candidateId}/snapshots`);
          setSnapshots(res.data);
        } catch (error) {
          console.error("Failed to load snapshots", error);
          setSnapshotsError(true);
        } finally {
          setSnapshotsLoading(false);
        }
      };
      fetchSnapshots();
    }
  }, [open, effectiveJobId, candidate.candidateId]);

  const handleAction = (status: "SHORTLISTED" | "ACCEPTED" | "REJECTED") => {
    if (candidate.applicationId) {
      startTransition(async () => {
        try {
          await updateApplicationStatusAction(candidate.applicationId!, status);
          toast.success(`Application marked ${status.toLowerCase().replace("_", " ")}.`);
          if (onStatusChange) onStatusChange(status);
          else { onOpenChange(false); router.refresh(); }
        } catch (error) {
          console.error("Failed to update application status", error);
          toast.error(error instanceof Error ? error.message : "Unable to update this application.");
        }
      });
    }
  };

  const Header = embedded ? "div" : SheetHeader;
  const Title = embedded ? "h2" : SheetTitle;
  const Description = embedded ? "p" : SheetDescription;
  const content = (
    <>
        {/* Drawer Header */}
        <div className="p-6 sm:p-7 border-b border-border/70 flex-shrink-0">
          <Header className="text-left flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="flex gap-4 items-center min-w-0">
              <Avatar className="h-16 w-16 rounded-2xl border-2 border-border shadow-xs shrink-0">
                <AvatarImage src={candidate.imageUrl} className="object-cover" />
                <AvatarFallback className="bg-foreground text-background font-bold text-lg">
                  {candidate.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <Title className="text-xl sm:text-2xl font-semibold truncate text-foreground">
                  {displayName}
                </Title>
                <Description className="text-sm sm:text-base text-muted-foreground truncate mt-0.5">
                  {candidate.title || "Applicant"}
                </Description>

                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  {candidate.jobTitle && (
                    <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 gap-1.5 bg-secondary text-foreground border-border">
                      <IconBriefcase className="size-3.5 text-muted-foreground" />
                      <span>{candidate.jobTitle}</span>
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                    {candidate.status || "APPLIED"}
                  </Badge>
                  <Badge variant="outline" className="font-mono font-bold text-xs border-border text-foreground px-2.5 py-0.5">
                    Match {overallSimilarity?.toFixed(3) ?? "N/A"}
                  </Badge>

                  {candidate.candidateId && !embedded && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold rounded-lg px-3 gap-1.5 text-foreground hover:bg-muted"
                    >
                      <Link
                        href={`/preview/${candidate.candidateId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconEye className="size-3.5 text-muted-foreground" />
                        <span>Public Preview</span>
                        <IconExternalLink className="size-3 text-muted-foreground" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
              <Button
                size="default"
                onClick={() => handleAction("SHORTLISTED")}
                disabled={isPending || !candidate.applicationId}
                className="h-10 px-5 rounded-xl font-bold text-sm bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer w-full sm:w-auto"
              >
                Shortlist Candidate
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 cursor-pointer flex-1 sm:flex-none"
                  onClick={() => handleAction("ACCEPTED")}
                  disabled={isPending || !candidate.applicationId}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3.5 rounded-xl text-xs font-semibold text-red-700 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950 cursor-pointer flex-1 sm:flex-none"
                  onClick={() => handleAction("REJECTED")}
                  disabled={isPending || !candidate.applicationId}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Header>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="profile" className={embedded ? "flex flex-col" : "flex-1 flex flex-col overflow-hidden"}>
          <div className="overflow-x-auto px-6 sm:px-7 border-b border-border/70 flex-shrink-0">
            <TabsList className="w-max min-w-full justify-start h-auto p-0 bg-transparent gap-6">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-foreground rounded-none px-0 py-3.5 text-sm font-semibold"
              >
                Profile & Resume
              </TabsTrigger>
              <TabsTrigger
                value="ai-match"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-foreground rounded-none px-0 py-3.5 text-sm font-semibold"
              >
                Match Evidence
              </TabsTrigger>
              <TabsTrigger
                value="assessments"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-foreground rounded-none px-0 py-3.5 text-sm font-semibold"
              >
                Assessments
              </TabsTrigger>
              <TabsTrigger
                value="social"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-foreground rounded-none px-0 py-3.5 text-sm font-semibold"
              >
                Social Evidence
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 sm:p-7 space-y-6">
              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-0 space-y-6">
                {candidate.candidateId && !embedded && (
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/40">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-foreground">Candidate Public Profile</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        View complete resume timeline, verified credentials, and skill endorsements.
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-9 px-4 rounded-xl font-semibold text-xs border-border hover:bg-muted text-foreground gap-1.5 shrink-0 cursor-pointer">
                      <Link href={`/preview/${candidate.candidateId}`} target="_blank" rel="noopener noreferrer">
                        <IconEye className="size-3.5" />
                        <span>Open Preview</span>
                        <IconExternalLink className="size-3" />
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                    <p className="mt-1 font-semibold text-foreground break-all">
                      {candidate.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Location</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {candidate.location || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Applied Position</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {candidate.jobTitle || "Selected role"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Application Date</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {candidate.appliedAt
                        ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                            new Date(candidate.appliedAt)
                          )
                        : "Date unavailable"}
                    </p>
                  </div>
                </div>

                {candidate.coverNote && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-foreground">Cover Note</h3>
                    <div className="rounded-2xl border border-border bg-muted/40 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {candidate.coverNote}
                      </p>
                    </div>
                  </div>
                )}

                {candidate.bio && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-foreground">About</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{candidate.bio}</p>
                  </div>
                )}

                {/* Experience Timeline */}
                {candidate.experiences && candidate.experiences.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <IconBriefcase className="size-4 text-foreground" />
                      <span>Experience</span>
                    </h3>
                    <div className="space-y-4 pl-1">
                      {candidate.experiences.map((exp) => (
                        <div key={exp.id} className="relative pl-5 border-l-2 border-border pb-2 last:pb-0">
                          <div className="absolute w-2.5 h-2.5 bg-foreground rounded-full -left-[6px] top-1.5 ring-4 ring-background" />
                          <h4 className="font-bold text-sm sm:text-base text-foreground">{exp.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {exp.company} • {exp.startDate?.substring(0, 7)} -{" "}
                            {exp.isCurrentRole ?? exp.currentRole ? "Present" : exp.endDate?.substring(0, 7)}
                          </p>
                          {exp.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {candidate.educations && candidate.educations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <IconSchool className="size-4 text-foreground" />
                      <span>Education</span>
                    </h3>
                    <div className="space-y-3">
                      {candidate.educations.map((edu) => (
                        <div key={edu.id} className="rounded-xl border border-border bg-card p-4">
                          <h4 className="font-bold text-sm sm:text-base text-foreground">{edu.institution}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {edu.degree} in {edu.fieldOfStudy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="font-bold text-sm text-foreground">Skills & Endorsements</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="text-xs sm:text-sm font-medium px-3 py-1 rounded-lg">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {candidate.socialLinks && candidate.socialLinks.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="font-bold text-sm text-foreground">Verified External Profiles</h3>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {candidate.socialLinks.map((link) => (
                        <a
                          key={link.id}
                          href={getExternalUrl(link.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm font-medium transition-colors hover:bg-muted"
                        >
                          <span className="truncate">{link.platform.replaceAll("_", " ")}</span>
                          <IconExternalLink className="size-4 shrink-0 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Match Evidence Tab */}
              <TabsContent value="ai-match" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm">
                    <div className="flex items-start gap-3">
                      <IconInfoCircle className="mt-0.5 size-5 shrink-0 text-foreground" />
                      <div className="space-y-1">
                        <p className="font-bold text-foreground">Evidence Similarity Model</p>
                        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                          JobHub computes multi-vector cosine similarity across candidate work evidence, portfolio signals, and assessment results. Evidence coverage: {evidenceSources.length}/5 sources.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">Weighted Overall Similarity</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Standardized aggregate evidence calibration score.
                      </p>
                    </div>
                    <span className="font-mono text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
                      {overallSimilarity?.toFixed(3) ?? "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4 text-sm">
                    <span className="font-medium text-foreground">All Required Tasks Passed</span>
                    <span className="font-bold text-foreground font-mono">
                      {candidate.allTasksPassed ? "Yes (Verified)" : "Pending / Not Completed"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Source-Level Similarity Breakdown
                    </h4>
                    {evidenceSources.map((source) => (
                      <div
                        key={source.key}
                        className="flex items-center justify-between rounded-xl bg-muted/40 border border-border/70 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-foreground">{source.label}</span>
                        <span className="font-mono font-bold text-sm tabular-nums text-foreground">
                          {source.value.toFixed(3)}
                        </span>
                      </div>
                    ))}
                    {evidenceSources.length === 0 && (
                      <p className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl border">
                        No source-level evidence was returned for this candidate.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Assessments Tab */}
              <TabsContent value="assessments" className="mt-0 space-y-6">
                {candidate.tabSwitchLimitExceeded && (
                  <div className="bg-red-50 border border-red-300 dark:bg-red-950 dark:border-red-800 rounded-2xl p-5 flex items-start gap-3.5">
                    <IconShieldExclamation className="text-red-700 dark:text-red-400 mt-0.5 size-5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-900 dark:text-red-200 text-sm sm:text-base">Anti-Cheat Alert</h4>
                      <p className="text-red-800 dark:text-red-300 text-xs sm:text-sm mt-1 leading-relaxed">
                        Candidate exceeded the allowable tab switch limit ({candidate.tabSwitchCount} switches recorded during assessment).
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-4">
                  {[
                    { title: "Design Assessment", data: candidate.designSubmission },
                    { title: "Programming Assessment", data: candidate.programmingSubmission },
                    { title: "SQL Assessment", data: candidate.sqlSubmission },
                  ].map(
                    (task, i) =>
                      task.data && (
                        <div key={i} className="border border-border rounded-2xl p-5 bg-card space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-base text-foreground">{task.title}</h4>
                            {task.data.passed ? (
                              <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800 gap-1 font-semibold text-xs px-2.5 py-0.5">
                                <IconCircleCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" /> Passed
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1 font-semibold text-xs px-2.5 py-0.5">
                                <IconCircleX className="size-3.5" /> Failed
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Score</span>
                            <span className="font-mono font-bold text-foreground">
                              {task.data.achievedScore} / {task.data.requiredScore} required
                            </span>
                          </div>
                          {task.data.message && (
                            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground bg-muted/40 p-3 rounded-xl border">
                              {task.data.message}
                            </p>
                          )}
                        </div>
                      )
                  )}

                  {!candidate.designSubmission &&
                    !candidate.programmingSubmission &&
                    !candidate.sqlSubmission && (
                      <div className="text-center py-10 bg-muted/10 border border-dashed rounded-2xl text-sm text-muted-foreground">
                        No task submissions have been recorded for this application.
                      </div>
                    )}
                </div>
              </TabsContent>

              {/* Social Tab */}
              <TabsContent value="social" className="mt-0 space-y-6">
                {snapsLoading ? (
                  <div className="space-y-3 py-2">
                    <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                    <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                  </div>
                ) : snapshotsError ? (
                  <div className="rounded-2xl border border-destructive/30 p-5 text-sm text-destructive">
                    Social evidence could not be loaded. Try reopening this applicant.
                  </div>
                ) : snapshots.length === 0 ? (
                  <div className="text-center py-10 bg-muted/10 border border-dashed rounded-2xl text-sm text-muted-foreground">
                    No external social snapshots available for this candidate.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {snapshots.map((snap, i) => (
                      <div key={i} className="border border-border rounded-2xl p-5 bg-card space-y-2">
                        <h4 className="font-bold text-base text-foreground capitalize flex items-center gap-1.5">
                          <IconSparkles className="size-4 text-foreground" />
                          <span>{snap.platform}</span>
                        </h4>
                        <div className="space-y-1.5">
                          {snap.aiCoolFeedItems.map((item, j) => (
                            <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                              • {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
    </>
  );
  if (embedded) return <section aria-label={`Review ${candidate.name}`} className="min-h-0 flex-1 overflow-y-auto">{content}</section>;
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full p-0 flex flex-col h-full rounded-l-3xl border-l border-border">{content}</SheetContent></Sheet>;
}
