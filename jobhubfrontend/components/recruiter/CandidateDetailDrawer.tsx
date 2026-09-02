"use client";

import React, { useState, useEffect, useTransition } from "react";
import { api } from "@/lib/api";
import { CandidateDashboardResponse, CandidateSocialSnapshotDto } from "@/lib/types/recruiter";
import { updateApplicationStatusAction } from "@/lib/actions/recruiter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Briefcase, GraduationCap, ShieldAlert, CheckCircle, XCircle, Info } from "lucide-react";
import { getSimilaritySources, semanticMatchPercentage } from "@/lib/semantic-match";

interface Props {
  candidate: CandidateDashboardResponse;
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CandidateDetailDrawer({ candidate, jobId, open, onOpenChange }: Props) {
  const [snapshots, setSnapshots] = useState<CandidateSocialSnapshotDto[]>([]);
  const [snapsLoading, setSnapshotsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const matchPercentage = semanticMatchPercentage(candidate.overallSimilarity) ?? 0;
  const evidenceSources = getSimilaritySources(candidate);

  useEffect(() => {
    if (open && candidate.candidateId) {
      const fetchSnapshots = async () => {
        setSnapshotsLoading(true);
        try {
          const res = await api.get(`/recruiter/jobs/${jobId}/candidates/${candidate.candidateId}/snapshots`);
          setSnapshots(res.data);
        } catch (error) { console.error("Failed to load snapshots", error); }
        finally { setSnapshotsLoading(false); }
      };
      fetchSnapshots();
    }
  }, [open, jobId, candidate.candidateId]);

  const handleAction = (status: "SHORTLISTED" | "ACCEPTED" | "REJECTED") => {
    if (candidate.applicationId) {
      startTransition(() => { updateApplicationStatusAction(candidate.applicationId!, status); onOpenChange(false); });
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
                  <Badge variant="outline" className="font-semibold border-primary/50 text-primary">{matchPercentage}% Semantic fit</Badge>
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
              <TabsTrigger value="ai-match" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 py-3">Semantic Fit</TabsTrigger>
              <TabsTrigger value="assessments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 py-3">Assessments</TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 py-3">Social Data</TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="profile" className="mt-0 space-y-6">
                {candidate.bio && (<div><h3 className="font-semibold text-sm text-muted-foreground mb-2">About</h3><p className="text-sm">{candidate.bio}</p></div>)}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Experience</h3>
                  <div className="space-y-4">
                    {candidate.experiences.map(exp => (
                      <div key={exp.id} className="relative pl-4 border-l-2 border-muted pb-1 last:pb-0">
                        <div className="absolute w-2 h-2 bg-muted-foreground rounded-full -left-[5px] top-1.5 ring-4 ring-background" />
                        <h4 className="font-medium text-sm">{exp.title}</h4>
                        <p className="text-xs text-muted-foreground">{exp.company} • {exp.startDate.substring(0,7)} - {exp.isCurrentRole ? 'Present' : exp.endDate?.substring(0,7)}</p>
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
              </TabsContent>
              <TabsContent value="ai-match" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Semantic relevance, not hiring probability</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          The score compares the job vector with available candidate vectors. Evidence coverage: {evidenceSources.length}/6 sources.
                        </p>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold">Similarity evidence</h3>
                  <div className="space-y-3">
                    <div><div className="flex justify-between text-sm mb-1"><span>Overall semantic fit</span><span className="font-medium">{matchPercentage}%</span></div><Progress value={matchPercentage} className="h-2" /></div>
                    {evidenceSources.map((source) => {
                      const percentage = semanticMatchPercentage(source.value) ?? 0;
                      return (
                        <div key={source.key}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="text-muted-foreground">{source.label}</span>
                            <span>{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-1.5 bg-muted/50" />
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
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="social" className="mt-0 space-y-6">
                {snapsLoading ? (<div className="text-center py-4 text-muted-foreground">Loading snapshots...</div>) : snapshots.length === 0 ? (<div className="text-center py-4 text-muted-foreground">No social snapshots found.</div>) : (
                  <div className="space-y-4">{snapshots.map((snap, i) => (<div key={i} className="border rounded-lg p-4"><h4 className="font-semibold text-sm mb-2">{snap.platform}</h4><div className="space-y-1">{snap.aiCoolFeedItems.map((item, j) => (<p key={j} className="text-sm">• {item}</p>))}</div></div>))}</div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
