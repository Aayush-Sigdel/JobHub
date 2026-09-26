"use client";

import {
  useId,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import type { ApplicationStatus } from "@/types/api/jobs";
import { updateApplicationStatusAction } from "@/lib/actions/recruiter";
import { paginateCandidates } from "@/lib/candidate-pagination";
import { cn } from "@/lib/utils";
import CandidateCard from "./CandidateCard";
import CandidatePagination from "./CandidatePagination";
import { candidateStages } from "./candidate-review-utils";
import styles from "./candidate-listing.module.css";

const KANBAN_PAGE_SIZE = 6;
export type StagePages = Partial<Record<ApplicationStatus, number>>;
interface KanbanViewProps {
  candidates: CandidateDashboardResponse[];
  onCandidateSelect: (candidate: CandidateDashboardResponse) => void;
  onStatusChange?: (applicationId: string, status: ApplicationStatus) => void;
  stagePages?: StagePages;
  onStagePageChange?: (stage: ApplicationStatus, page: number) => void;
  showJobTitle?: boolean;
  search?: string;
}
export default function KanbanView({
  candidates,
  onCandidateSelect,
  onStatusChange,
  stagePages: savedPages,
  onStagePageChange,
  showJobTitle = true,
  search = "",
}: KanbanViewProps) {
  const router = useRouter();
  const helpId = useId();
  const board = useRef<HTMLDivElement>(null);
  const moving = useRef(false);
  const focusAfterMove = useRef<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<ApplicationStatus | null>(null);
  const [localPages, setLocalPages] = useState<StagePages>({});
  const stagePages = savedPages ?? localPages;
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const [localCandidates, updateOptimistic] = useOptimistic(
    candidates,
    (current, update: { applicationId: string; status: ApplicationStatus }) =>
      current.map((candidate) =>
        candidate.applicationId === update.applicationId
          ? { ...candidate, status: update.status }
          : candidate,
      ),
  );

  function setStagePage(stage: ApplicationStatus, page: number) {
    if (onStagePageChange) onStagePageChange(stage, page);
    else setLocalPages((current) => ({ ...current, [stage]: page }));
  }

  useLayoutEffect(() => {
    if (isPending || !focusAfterMove.current) return;
    const target = Array.from(
      board.current?.querySelectorAll<HTMLElement>("[data-stage-action]") || [],
    ).find((element) => element.dataset.stageAction === focusAfterMove.current);
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
      focusAfterMove.current = null;
    }
  }, [isPending, localCandidates, stagePages]);

  function changeStage(
    candidate: CandidateDashboardResponse,
    status: ApplicationStatus,
  ) {
    const applicationId = candidate.applicationId;
    if (
      moving.current ||
      !applicationId ||
      (candidate.status || "APPLIED") === status
    )
      return;
    moving.current = true;
    focusAfterMove.current = applicationId;
    setFeedback({ text: `Moving ${candidate.name}…`, error: false });
    // Preserve ranking in the destination lane and show the page containing the moved card.
    const destination = localCandidates.filter(
      (item) =>
        item.applicationId === applicationId ||
        (item.status || "APPLIED") === status,
    );
    setStagePage(
      status,
      Math.floor(
        destination.findIndex((item) => item.applicationId === applicationId) /
          KANBAN_PAGE_SIZE,
      ) + 1,
    );
    startTransition(async () => {
      updateOptimistic({ applicationId, status });
      try {
        await updateApplicationStatusAction(applicationId, status);
        if (onStatusChange) onStatusChange(applicationId, status);
        else router.refresh();
        const message = `${candidate.name} moved to ${candidateStages.find((stage) => stage.id === status)?.label.toLowerCase()}.`;
        setFeedback({ text: message, error: false });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to move this application.";
        setFeedback({
          text: `${message} The original stage has been restored.`,
          error: true,
        });
        toast.error(message);
      } finally {
        moving.current = false;
      }
    });
  }

  function drop(event: DragEvent, status: ApplicationStatus) {
    event.preventDefault();
    const id = event.dataTransfer.getData("application/x-jobhub-application");
    if (!draggedId || draggedId !== id) return;
    setDraggedId(null);
    setDropStage(null);
    const candidate = localCandidates.find((item) => item.applicationId === id);
    if (candidate) changeStage(candidate, status);
  }

  return (
    <div className={`${styles.listing} min-w-0`}>
      <p id={helpId} className="sr-only">
        Focus a card and press Alt with the left or right arrow to move it to
        the previous or next stage. You can also use its Move to menu.
      </p>
      <div
        role={feedback?.error ? "alert" : "status"}
        aria-atomic="true"
        className={
          feedback?.error ? "mb-3 text-sm text-destructive" : "sr-only"
        }
      >
        {feedback?.text}
      </div>
      <div
        ref={board}
        data-candidate-board
        role="region"
        tabIndex={0}
        aria-label="Candidate pipeline, scroll horizontally to view stages"
        aria-busy={isPending}
        className="flex items-stretch gap-4 overflow-x-auto pb-4"
      >
        {candidateStages.map((stage) => {
          const items = localCandidates.filter(
            (candidate) => (candidate.status || "APPLIED") === stage.id,
          );
          const pagination = paginateCandidates(
            items,
            stagePages[stage.id] ?? 1,
            KANBAN_PAGE_SIZE,
          );
          const isDropTarget = Boolean(draggedId) && dropStage === stage.id;
          return (
            <section
              key={stage.id}
              data-candidate-stage={stage.id}
              aria-label={`${stage.label}, ${items.length} applications`}
              onDragOver={(event) => {
                if (draggedId && !isPending) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropStage(stage.id);
                }
              }}
              onDragLeave={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                )
                  setDropStage(null);
              }}
              onDrop={(event) => drop(event, stage.id)}
              className={cn(
                "flex w-[min(19rem,100%)] shrink-0 flex-col bg-muted/25 sm:w-72",
                isDropTarget && "bg-primary/10 ring-2 ring-inset ring-primary",
              )}
            >
              <div className="border-b border-border px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    tabIndex={-1}
                    data-stage-heading={stage.id}
                    className="text-sm font-semibold"
                  >
                    {stage.label}
                  </h3>
                  <span className="min-w-6 rounded-sm bg-primary/20 px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums">
                    {items.length}
                  </span>
                </div>
                {isDropTarget && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Release to move here
                  </p>
                )}
              </div>
              <div className="min-h-40 flex-1 space-y-3 p-2">
                {pagination.items.map((candidate) => (
                  <div
                    key={
                      candidate.applicationId ||
                      `${candidate.jobId}:${candidate.candidateId}`
                    }
                    draggable={Boolean(candidate.applicationId) && !isPending}
                    tabIndex={0}
                    role="group"
                    aria-label={`${candidate.name}, ${stage.label}`}
                    aria-describedby={helpId}
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
                      const target =
                        candidateStages[
                          index + (event.key === "ArrowRight" ? 1 : -1)
                        ];
                      if (target) changeStage(candidate, target.id);
                    }}
                    onDragStart={(event) => {
                      if (
                        !candidate.applicationId ||
                        isPending ||
                        (event.target instanceof HTMLElement &&
                          event.target.closest("select, a"))
                      ) {
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
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDropStage(null);
                    }}
                    className={cn(
                      "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                      draggedId === candidate.applicationId && "opacity-50",
                    )}
                  >
                    <CandidateCard
                      candidate={candidate}
                      onSelect={onCandidateSelect}
                      onStageChange={(status) => changeStage(candidate, status)}
                      isPending={isPending}
                      showJobTitle={showJobTitle}
                      search={search}
                    />
                  </div>
                ))}
                {!items.length && (
                  <p className="flex min-h-32 items-center justify-center px-4 text-center text-xs leading-5 text-muted-foreground">
                    {draggedId
                      ? `Drop here to move to ${stage.label.toLowerCase()}`
                      : `No ${stage.label.toLowerCase()} applications`}
                  </p>
                )}
              </div>
              {items.length > KANBAN_PAGE_SIZE && (
                <CandidatePagination
                  compact
                  page={pagination.page}
                  pageCount={pagination.pageCount}
                  pageSize={KANBAN_PAGE_SIZE}
                  total={items.length}
                  start={pagination.start}
                  end={pagination.end}
                  onPageChange={(page) => {
                    setStagePage(stage.id, page);
                    board.current
                      ?.querySelector<HTMLElement>(
                        `[data-stage-heading="${stage.id}"]`,
                      )
                      ?.focus();
                  }}
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
