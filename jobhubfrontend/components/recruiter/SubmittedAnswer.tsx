"use client";

import { useState } from "react";
import { IconCode } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { TaskSubmissionResponse } from "@/types/api/tasks";
import { getTaskSubmissionCodeAction } from "@/lib/actions/tasks";
import { CodeEditor } from "@/components/task/CodeEditor";
import { submittedCodePresentation } from "@/lib/submitted-code";
import { DesignCanvasFrame } from "@/components/task/DesignCanvasFrame";

export default function SubmittedAnswer({
  submission,
}: {
  submission: TaskSubmissionResponse;
}) {
  const { data: session } = useSession();
  const [languageOverride, setLanguageOverride] = useState<"JAVA" | "PYTHON" | null>(null);
  const query = useQuery({
    queryKey: ["task-submission-code", session?.user?.id, submission.id],
    queryFn: () => getTaskSubmissionCodeAction(submission.id),
    enabled: Boolean(session?.user?.id),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const presentation = query.data?.code
    ? submittedCodePresentation(submission.taskType, query.data.code)
    : null;
  const language = submission.taskType === "PROGRAMMING"
    ? languageOverride ?? presentation?.language
    : presentation?.language;
  const fileName = language === "JAVA" ? "Solution.java"
    : language === "PYTHON" ? "Solution.py"
    : presentation?.fileName;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h5 className="flex items-center gap-2 text-sm font-medium">
          <IconCode className="size-4" />
          Submitted answer
        </h5>
        {presentation && submission.taskType === "PROGRAMMING" && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Highlight as
            <select
              aria-label="Programming language highlighting"
              value={language}
              onChange={(event) => setLanguageOverride(event.target.value as "JAVA" | "PYTHON")}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            >
              <option value="JAVA">Java</option>
              <option value="PYTHON">Python</option>
            </select>
          </label>
        )}
      </div>
      {query.isPending ? (
        <p role="status" className="mt-3 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
          Loading submitted code…
        </p>
      ) : query.isError ? (
        <div role="alert" className="mt-3 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
          <p>Submitted code could not be loaded.</p>
          <button type="button" className="mt-2 font-medium text-foreground underline" onClick={() => query.refetch()}>
            Try again
          </button>
        </div>
      ) : !presentation ? (
        <p className="mt-3 rounded-lg bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
          No code was stored for this submission.
        </p>
      ) : (
        <div className={submission.taskType === "DESIGN"
          ? "mt-3 grid min-w-0 gap-4 @3xl/review:grid-cols-[minmax(0,1fr)_minmax(0,400px)]"
          : "mt-3 min-w-0"}>
          <div className="h-[min(32rem,60dvh)] min-h-64 min-w-0 overflow-hidden rounded-lg border border-border">
            <CodeEditor
              value={presentation.code}
              fileName={fileName}
              language={language}
              readOnly
            />
          </div>
          {submission.taskType === "DESIGN" && (
            <section aria-label="Submitted design preview" className="min-w-0 rounded-lg border border-border bg-card">
              <h6 className="border-b border-border bg-muted/20 px-4 py-3 text-xs font-medium">
                Visual preview · 400 × 300
              </h6>
              <div className="p-4">
                <DesignCanvasFrame>
                  <iframe
                    title="Submitted HTML and CSS output"
                    sandbox=""
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    srcDoc={presentation.code}
                    className="pointer-events-none h-[300px] w-[400px] border-0 bg-white"
                  />
                </DesignCanvasFrame>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
