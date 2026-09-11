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
