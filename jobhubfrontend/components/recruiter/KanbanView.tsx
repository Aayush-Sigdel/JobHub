"use client";

import React, { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import type { ApplicationStatus } from "@/types/api/jobs";
import { updateApplicationStatusAction } from "@/lib/actions/recruiter";
import CandidateCard from "./CandidateCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface KanbanViewProps {
  candidates: CandidateDashboardResponse[];
  onCandidateSelect: (candidate: CandidateDashboardResponse) => void;
}

const COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: "APPLIED", title: "New", color: "border-blue-200 bg-blue-50/50" },
  { id: "IN_REVIEW", title: "Reviewing", color: "border-yellow-200 bg-yellow-50/50" },
  { id: "SHORTLISTED", title: "Shortlisted", color: "border-purple-200 bg-purple-50/50" },
  { id: "ACCEPTED", title: "Accepted", color: "border-green-200 bg-green-50/50" },
  { id: "REJECTED", title: "Rejected", color: "border-red-200 bg-red-50/50" },
];

export default function KanbanView({ candidates, onCandidateSelect }: KanbanViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localCandidates, setOptimisticStatus] = useOptimistic(
    candidates,
    (current, update: { candidateId: string; status: ApplicationStatus }) =>
      current.map((candidate) => candidate.candidateId === update.candidateId ? { ...candidate, status: update.status } : candidate),
  );

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData("candidateId", candidateId);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("candidateId");
    if (!candidateId) return;
    const candidate = localCandidates.find(c => c.candidateId === candidateId);
    if (!candidate || candidate.status === status || !candidate.applicationId) return;
    startTransition(async () => {
      setOptimisticStatus({ candidateId, status });
      try {
        await updateApplicationStatusAction(candidate.applicationId!, status);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to move this application.");
      }
    });
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <div key={col.id} className={cn("flex-shrink-0 w-[350px] rounded-xl border flex flex-col", col.color)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
          <div className="p-4 border-b font-semibold flex items-center justify-between bg-background/50 backdrop-blur-sm rounded-t-xl">
            {col.title}
            <span className="bg-background px-2 py-0.5 rounded-full text-xs text-muted-foreground border">
              {localCandidates.filter(c => (c.status || "APPLIED") === col.id).length}
            </span>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {localCandidates.filter(c => (c.status || "APPLIED") === col.id).map(candidate => (
                <div key={candidate.candidateId} draggable={!isPending} onDragStart={(e) => handleDragStart(e, candidate.candidateId)} className="cursor-grab active:cursor-grabbing">
                  <CandidateCard candidate={candidate} onSelect={onCandidateSelect} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
