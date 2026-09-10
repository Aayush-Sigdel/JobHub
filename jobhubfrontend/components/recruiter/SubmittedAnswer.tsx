"use client";

import { IconCode, IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";
import type { TaskSubmissionResponse } from "@/types/api/tasks";

// Accept answer fields if supplied, while the existing API remains compatible.
type AnswerPayload = TaskSubmissionResponse & {
  code?: unknown;
  codes?: unknown;
};

export default function SubmittedAnswer({
  submission,
}: {
  submission: TaskSubmissionResponse;
}) {
  const answer = submission as AnswerPayload;
  const files =
    typeof answer.code === "string"
      ? [answer.code]
      : Array.isArray(answer.codes)
        ? answer.codes.filter(
            (code): code is string => typeof code === "string",
          )
        : [];
  return (
    <div>
      <h5 className="flex items-center gap-2 text-sm font-medium">
        <IconCode className="size-4" />
        Submitted answer
      </h5>
      {files.length === 0 ? (
        <p className="mt-3 rounded-lg bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
          Only the result and feedback are available. This submission’s code has
          not been included with the application.
        </p>
      ) : (
        files.map((code, index) => (
          <div
            key={index}
            className="mt-3 overflow-hidden rounded-lg border border-border"
          >
            <div className="flex items-center justify-between bg-muted/50 px-4 py-2">
              <span className="text-xs font-medium">
                {files.length > 1 ? `Answer ${index + 1}` : "Source code"}
              </span>
              <button
                type="button"
                className="inline-flex min-h-8 items-center gap-1.5 rounded px-2 text-xs hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(code);
                    toast.success("Answer copied.");
                  } catch {
                    toast.error(
                      "Unable to copy. You can select the code below.",
                    );
                  }
                }}
              >
                <IconCopy className="size-3.5" />
                Copy
              </button>
            </div>
            <pre
              tabIndex={0}
              className="max-h-[32rem] overflow-auto p-4 text-xs leading-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
            >
              <code>{code}</code>
            </pre>
          </div>
        ))
      )}
    </div>
  );
}
