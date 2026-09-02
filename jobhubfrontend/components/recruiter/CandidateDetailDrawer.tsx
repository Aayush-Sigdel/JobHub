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
import { Briefcase, GraduationCap, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

const GithubIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

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
                  <Badge variant="outline" className="font-semibold border-primary/50 text-primary">{candidate.matchPercentage}% Match</Badge>
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
              <TabsTrigger value="ai-match" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 py-3">AI Match</TabsTrigger>
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
                  <h3 className="font-semibold">Embedding Similarities</h3>
                  <div className="space-y-3">
                    <div><div className="flex justify-between text-sm mb-1"><span>Overall Skill Similarity</span><span className="font-medium">{(candidate.overallSimilarity * 100).toFixed(0)}%</span></div><Progress value={candidate.overallSimilarity * 100} className="h-2" /></div>
                    {candidate.platformSimilarity !== undefined && (<div><div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Platform Activity Match</span><span>{(candidate.platformSimilarity * 100).toFixed(0)}%</span></div><Progress value={candidate.platformSimilarity * 100} className="h-1.5" /></div>)}
                    {candidate.githubSimilarity !== undefined && (<div><div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground flex items-center gap-1"><GithubIcon className="w-3 h-3"/> GitHub Match</span><span>{(candidate.githubSimilarity * 100).toFixed(0)}%</span></div><Progress value={candidate.githubSimilarity * 100} className="h-1.5 bg-muted/50" /></div>)}
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
