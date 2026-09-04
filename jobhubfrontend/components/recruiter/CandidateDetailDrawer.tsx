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
import { Briefcase, ExternalLink, GraduationCap, ShieldAlert, CheckCircle, XCircle, Info } from "lucide-react";
import { calculateSupportedOverallSimilarity, getSimilaritySources } from "@/lib/semantic-match";

interface Props {
  candidate: CandidateDashboardResponse;
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CandidateDetailDrawer({ candidate, jobId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<CandidateSocialSnapshotDto[]>([]);
  const [snapsLoading, setSnapshotsLoading] = useState(false);
  const [snapshotsError, setSnapshotsError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const evidenceSources = getSimilaritySources(candidate);
  const overallSimilarity = calculateSupportedOverallSimilarity(candidate);

  const getExternalUrl = (url: string) => {
    const trimmed = url.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  useEffect(() => {
    if (open && candidate.candidateId) {
      const fetchSnapshots = async () => {
        setSnapshotsLoading(true);
        setSnapshotsError(false);
        try {
          const res = await api.get(`/recruiter/jobs/${jobId}/candidates/${candidate.candidateId}/snapshots`);
          setSnapshots(res.data);
        } catch (error) { console.error("Failed to load snapshots", error); setSnapshotsError(true); }
        finally { setSnapshotsLoading(false); }
      };
      fetchSnapshots();
    }
  }, [open, jobId, candidate.candidateId]);

  const handleAction = (status: "SHORTLISTED" | "ACCEPTED" | "REJECTED") => {
    if (candidate.applicationId) {
      startTransition(async () => {
        try {
          await updateApplicationStatusAction(candidate.applicationId!, status);
          toast.success(`Application marked ${status.toLowerCase().replace("_", " ")}.`);
          onOpenChange(false);
          router.refresh();
        } catch (error) {
          console.error("Failed to update application status", error);
          toast.error(error instanceof Error ? error.message : "Unable to update this application.");
        }
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl md:max-w-2xl w-full p-0 flex flex-col h-full">
        <div className="p-6 border-b flex-shrink-0">
          <SheetHeader className="text-left flex flex-row items-start justify-between gap-4">
            <div className="flex gap-4 items-center">
              <Avatar className="h-16 w-16 border-2"><AvatarImage src={candidate.imageUrl} /><AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <div>
                <SheetTitle className="text-2xl">{candidate.name}</SheetTitle>
                <SheetDescription className="text-base">{candidate.title || "Applicant"}</SheetDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{candidate.status || "APPLIED"}</Badge>
                  <Badge variant="outline" className="font-mono font-semibold border-primary/50 text-primary">Overall {overallSimilarity?.toFixed(3) ?? "N/A"}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={() => handleAction("SHORTLISTED")} disabled={isPending}>Shortlist</Button>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleAction("ACCEPTED")} disabled={isPending}>Accept</Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleAction("REJECTED")} disabled={isPending}>Reject</Button>
              </div>
            </div>
          </SheetHeader>
        </div>
        <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 border-b flex-shrink-0">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
              <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 py-3">Profile</TabsTrigger>
              <TabsTrigger value="ai-match" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 py-3">Match Evidence</TabsTrigger>
              <TabsTrigger value="assessments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 py-3">Assessments</TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 py-3">Social Data</TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="profile" className="mt-0 space-y-6">
                <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-2">
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="mt-1 break-all font-medium">{candidate.email}</p></div>
                  <div><p className="text-xs text-muted-foreground">Location</p><p className="mt-1 font-medium">{candidate.location || "Not provided"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Applied for</p><p className="mt-1 font-medium">{candidate.jobTitle || "Selected role"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Applied</p><p className="mt-1 font-medium">{candidate.appliedAt ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(candidate.appliedAt)) : "Date unavailable"}</p></div>
                </div>
                {candidate.coverNote && (<div><h3 className="font-semibold text-sm text-muted-foreground mb-2">Cover note</h3><p className="whitespace-pre-wrap text-sm leading-relaxed">{candidate.coverNote}</p></div>)}
                {candidate.bio && (<div><h3 className="font-semibold text-sm text-muted-foreground mb-2">About</h3><p className="text-sm">{candidate.bio}</p></div>)}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Experience</h3>
                  <div className="space-y-4">
                    {candidate.experiences.map(exp => (
                      <div key={exp.id} className="relative pl-4 border-l-2 border-muted pb-1 last:pb-0">
                        <div className="absolute w-2 h-2 bg-muted-foreground rounded-full -left-[5px] top-1.5 ring-4 ring-background" />
                        <h4 className="font-medium text-sm">{exp.title}</h4>
                        <p className="text-xs text-muted-foreground">{exp.company}, {exp.startDate.substring(0,7)} - {(exp.isCurrentRole ?? exp.currentRole) ? 'Present' : exp.endDate?.substring(0,7)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education</h3>
                  <div className="space-y-3">{candidate.educations.map(edu => (<div key={edu.id}><h4 className="font-medium text-sm">{edu.institution}</h4><p className="text-xs text-muted-foreground">{edu.degree} in {edu.fieldOfStudy}</p></div>))}</div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">{candidate.skills.map(skill => (<Badge key={skill.id} variant="secondary">{skill.name}</Badge>))}</div>
                </div>
                {candidate.socialLinks.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Profile links</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {candidate.socialLinks.map((link) => (
                        <a
                          key={link.id}
                          href={getExternalUrl(link.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="truncate">{link.platform.replaceAll("_", " ")}</span>
                          <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="ai-match" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Evidence similarity, not hiring probability</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          These are raw cosine-similarity values from 0.000 to 1.000. They show which evidence aligned with the role. Evidence coverage: {evidenceSources.length}/5 sources.
                        </p>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold">Similarity evidence</h3>
                  <div className="space-y-3">
                    <div className="flex items-end justify-between rounded-lg border p-4">
                      <div><p className="text-sm font-medium">Weighted overall similarity</p><p className="mt-1 text-xs text-muted-foreground">Calculated when this application is reviewed.</p></div>
                      <span className="font-mono text-3xl font-bold tabular-nums">{overallSimilarity?.toFixed(3) ?? "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2.5 text-sm">
                      <span className="text-muted-foreground">All required tasks passed</span>
                      <span className="font-medium">{candidate.allTasksPassed ? "Yes" : "No"}</span>
                    </div>
                    {evidenceSources.map((source) => {
                      return (
                        <div key={source.key} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{source.label}</span>
                          </div>
                          <span className="font-mono font-medium tabular-nums">{source.value.toFixed(3)}</span>
                        </div>
                      );
                    })}
                    {evidenceSources.length === 0 && (
                      <p className="text-sm text-muted-foreground">No source-level evidence was returned for this candidate.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="assessments" className="mt-0 space-y-6">
                {candidate.tabSwitchLimitExceeded && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                    <ShieldAlert className="text-red-500 mt-0.5" />
                    <div><h4 className="font-semibold text-red-900 text-sm">Anti-Cheat Flag</h4><p className="text-red-700 text-xs mt-1">Candidate switched tabs {candidate.tabSwitchCount} times during assessment.</p></div>
                  </div>
                )}
                <div className="grid gap-4">
                  {[{ title: "Design Task", data: candidate.designSubmission }, { title: "Programming Task", data: candidate.programmingSubmission }, { title: "SQL Task", data: candidate.sqlSubmission }].map((task, i) => task.data && (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        {task.data.passed ? (<Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Passed</Badge>) : (<Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Score</span><span className="font-medium text-foreground">{task.data.achievedScore} / {task.data.requiredScore} required</span></div>
                      {task.data.message && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{task.data.message}</p>}
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="social" className="mt-0 space-y-6">
                {snapsLoading ? (<div className="space-y-3 py-2"><div className="h-20 animate-pulse rounded-lg bg-muted" /><div className="h-20 animate-pulse rounded-lg bg-muted" /></div>) : snapshotsError ? (<div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">Social evidence could not be loaded. Try reopening this applicant.</div>) : snapshots.length === 0 ? (<div className="text-center py-4 text-muted-foreground">No social snapshots found.</div>) : (
                  <div className="space-y-4">{snapshots.map((snap, i) => (<div key={i} className="border rounded-lg p-4"><h4 className="font-semibold text-sm mb-2">{snap.platform}</h4><div className="space-y-1">{snap.aiCoolFeedItems.map((item, j) => (<p key={j} className="text-sm">{item}</p>))}</div></div>))}</div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
