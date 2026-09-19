"use client";
import { TaskHeader } from "@/components/task/TaskWorkspace";
import type { ProgrammingTaskDto } from "../page";

export default function ProgramArenaHeader({
  task,
  language,
  setLanguage,
  ...props
}: {
  task?: ProgrammingTaskDto;
  language: "JAVA" | "PYTHON";
  setLanguage: (language: "JAVA" | "PYTHON") => void;
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
      kind="Programming"
      disabled={!task}
      {...props}
    >
      <div
        role="group"
        aria-label="Programming language"
        className="flex rounded-lg border p-0.5"
      >
        {(["JAVA", "PYTHON"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={language === item}
            disabled={props.isSubmitting || props.isSubmitted}
            onClick={() => setLanguage(item)}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 ${language === item ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {item === "JAVA" ? "Java" : "Python"}
          </button>
        ))}
      </div>
    </TaskHeader>
  );
}
