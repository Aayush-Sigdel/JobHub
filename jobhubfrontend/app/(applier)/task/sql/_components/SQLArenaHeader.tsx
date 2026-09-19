"use client";
import { TaskHeader } from "@/components/task/TaskWorkspace";
import type { SQLTaskDto } from "../page";
export default function SQLArenaHeader({
  task,
  ...props
}: {
  task?: SQLTaskDto;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
  pendingLabel?: string;
  actionLabel?: string;
  jobId?: string | null;
}) {
  return (
    <TaskHeader
      title={task?.title || "Choose an assessment"}
      kind="SQL"
      disabled={!task}
      {...props}
    />
  );
}
