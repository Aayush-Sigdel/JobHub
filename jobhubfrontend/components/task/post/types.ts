import type { TaskLibraryOption } from "@/types/api/tasks";

export interface TaskBuilderProps {
  onCreated?: (task: TaskLibraryOption) => void;
  onCancel?: () => void;
  onPendingChange?: (pending: boolean) => void;
}
