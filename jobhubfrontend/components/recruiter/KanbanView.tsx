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

const COLUMNS: { id: ApplicationStatus; title: string; dotColor: string }[] = [
  { id: "APPLIED", title: "New Applied", dotColor: "bg-blue-600 dark:bg-blue-400" },
  { id: "IN_REVIEW", title: "In Screening", dotColor: "bg-amber-600 dark:bg-amber-400" },
  { id: "SHORTLISTED", title: "Shortlisted", dotColor: "bg-indigo-600 dark:bg-indigo-400" },
  { id: "ACCEPTED", title: "Accepted / Offer", dotColor: "bg-emerald-600 dark:bg-emerald-400" },
  { id: "REJECTED", title: "Archived", dotColor: "bg-zinc-500" },
];

export default function KanbanView({
  candidates,
  onCandidateSelect,
}: KanbanViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localCandidates, setOptimisticStatus] = useOptimistic(
    candidates,
    (current, update: { candidateId: string; status: ApplicationStatus }) =>
      current.map((candidate) =>
        candidate.candidateId === update.candidateId
          ? { ...candidate, status: update.status }
          : candidate
      )
  );

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData("candidateId", candidateId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("candidateId");
    if (!candidateId) return;
    const candidate = localCandidates.find((c) => c.candidateId === candidateId);
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
    <div className="flex h-full gap-5 overflow-x-auto pb-6">
      {COLUMNS.map((col) => {
        const columnCandidates = localCandidates.filter(
          (c) => (c.status || "APPLIED") === col.id
        );

        return (
          <div
            key={col.id}
            className={cn(
              "flex-shrink-0 w-[320px] sm:w-[350px] rounded-2xl border border-border bg-card flex flex-col shadow-xs"
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-border font-bold text-base flex items-center justify-between bg-muted rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${col.dotColor}`} />
                <span>{col.title}</span>
              </div>
              <span className="bg-background px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-foreground border border-border">
                {columnCandidates.length}
              </span>
            </div>

            {/* Column Body with ScrollArea */}
            <ScrollArea className="flex-1 p-3.5">
              <div className="space-y-3.5 min-h-[150px]">
                {columnCandidates.map((candidate) => (
                  <div
                    key={candidate.candidateId}
                    draggable={!isPending}
                    onDragStart={(e) => handleDragStart(e, candidate.candidateId)}
                    className="cursor-grab active:cursor-grabbing transition-transform active:scale-[0.99]"
                  >
                    <CandidateCard
                      candidate={candidate}
                      onSelect={onCandidateSelect}
                    />
                  </div>
                ))}
                {columnCandidates.length === 0 && (
                  <div className="h-28 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-xs text-muted-foreground">
                    Drop candidates here
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
