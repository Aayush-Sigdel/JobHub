"use client";

import { useOptimistic, useState, useTransition, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import type { ApplicationStatus } from "@/types/api/jobs";
import { updateApplicationStatusAction } from "@/lib/actions/recruiter";
import CandidateCard from "./CandidateCard";
import { candidateStages } from "./candidate-review-utils";

interface KanbanViewProps {
  candidates: CandidateDashboardResponse[];
  onCandidateSelect: (candidate: CandidateDashboardResponse) => void;
  onStatusChange?: (applicationId: string, status: ApplicationStatus) => void;
}

export default function KanbanView({
  candidates,
  onCandidateSelect,
  onStatusChange,
}: KanbanViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [localCandidates, updateOptimistic] = useOptimistic(
    candidates,
    (current, update: { applicationId: string; status: ApplicationStatus }) =>
      current.map((candidate) =>
        candidate.applicationId === update.applicationId
          ? { ...candidate, status: update.status }
          : candidate,
      ),
  );

  function changeStage(
    candidate: CandidateDashboardResponse,
    status: ApplicationStatus,
  ) {
    const applicationId = candidate.applicationId;
    if (
      isPending ||
      !applicationId ||
      (candidate.status || "APPLIED") === status
    )
      return;
    startTransition(async () => {
      updateOptimistic({ applicationId, status });
      try {
        await updateApplicationStatusAction(applicationId, status);
        if (onStatusChange) onStatusChange(applicationId, status);
        else router.refresh();
        toast.success(
          `Moved to ${candidateStages.find((stage) => stage.id === status)?.label.toLowerCase()}.`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to move this application. The original stage has been restored.",
        );
      }
    });
  }

  function drop(event: DragEvent, status: ApplicationStatus) {
    event.preventDefault();
    const applicationId = event.dataTransfer.getData(
      "application/x-jobhub-application",
    );
    if (!draggedId || draggedId !== applicationId) return;
    setDraggedId(null);
    const candidate = localCandidates.find(
      (item) => item.applicationId === applicationId,
    );
    if (candidate) changeStage(candidate, status);
  }

  return (
    <div className="min-w-0">
      <p className="mb-4 text-xs text-muted-foreground">
        Drag cards between stages, or open a candidate to review their
        application.
      </p>
      <p id="kanban-keyboard-help" className="sr-only">
        Focus a card and press Alt with the left or right arrow to move it to
        the previous or next stage.
      </p>
      {isPending && (
        <p role="status" className="mb-3 text-xs text-muted-foreground">
          Saving stage…
        </p>
      )}
      <div
        className="flex items-stretch gap-4 overflow-x-auto pb-4"
        aria-label="Candidate pipeline"
      >
        {candidateStages.map((stage) => {
          const items = localCandidates.filter(
            (candidate) => (candidate.status || "APPLIED") === stage.id,
          );
          return (
            <section
              key={stage.id}
              aria-label={`${stage.label}, ${items.length} candidates`}
              onDragOver={(event) => {
                if (draggedId && !isPending) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }
              }}
              onDrop={(event) => drop(event, stage.id)}
              className="w-64 shrink-0 rounded-xl border border-border bg-muted/25 sm:w-72"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold">{stage.label}</h3>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="min-h-72 space-y-3 p-3">
                {items.map((candidate) => (
                  <div
                    key={
                      candidate.applicationId ||
                      `${candidate.jobId}:${candidate.candidateId}`
                    }
                    draggable={Boolean(candidate.applicationId) && !isPending}
                    tabIndex={0}
                    role="group"
                    aria-label={`${candidate.name}, ${stage.label}`}
                    aria-describedby="kanban-keyboard-help"
                    aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
                    onKeyDown={(event) => {
                      if (
                        event.target !== event.currentTarget ||
                        !event.altKey ||
                        !["ArrowLeft", "ArrowRight"].includes(event.key)
                      )
                        return;
                      event.preventDefault();
                      const index = candidateStages.findIndex(
                        (item) => item.id === stage.id,
                      );
                      const destination =
                        candidateStages[
                          index + (event.key === "ArrowRight" ? 1 : -1)
                        ];
                      if (destination) changeStage(candidate, destination.id);
                    }}
                    onDragStart={(event) => {
                      if (!candidate.applicationId || isPending) {
                        event.preventDefault();
                        return;
                      }
                      event.dataTransfer.setData(
                        "application/x-jobhub-application",
                        candidate.applicationId,
                      );
                      event.dataTransfer.effectAllowed = "move";
                      setDraggedId(candidate.applicationId);
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    className={`rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-foreground ${draggedId === candidate.applicationId ? "opacity-50" : ""}`}
                  >
                    <CandidateCard
                      candidate={candidate}
                      onSelect={onCandidateSelect}
                    />
                  </div>
                ))}
                {!items.length && (
                  <p className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border px-3 text-center text-xs text-muted-foreground">
                    {draggedId
                      ? "Drop application here"
                      : "No candidates in this stage"}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
