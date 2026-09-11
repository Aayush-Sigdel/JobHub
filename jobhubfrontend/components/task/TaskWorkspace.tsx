"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function TaskWorkspace({
  header,
  sidebar,
  children,
}: {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[720px] max-w-[1600px] flex-col overflow-hidden rounded-xl border bg-background text-foreground lg:h-[calc(100dvh-112px)] lg:min-h-[600px]">
      {header}
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(320px,38%)_minmax(0,1fr)]">
        <aside className="min-w-0 overflow-y-auto border-b lg:border-r lg:border-b-0">
          {sidebar}
        </aside>
        <div className="flex min-h-[520px] min-w-0 flex-col overflow-hidden lg:min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export function TaskHeader({
  title,
  kind,
  jobId,
  onSubmit,
  isSubmitting,
  isSubmitted,
  disabled,
  tabLockEnabled,
  tabSwitchCount = 0,
  tabLockWarningLimit = 0,
  children,
}: {
  title: string;
  kind: string;
  jobId?: string | null;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
  disabled?: boolean;
  tabLockEnabled?: boolean;
  tabSwitchCount?: number;
  tabLockWarningLimit?: number;
  children?: ReactNode;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-1 basis-full items-center gap-3 sm:basis-64">
        <Button
          asChild
          size="icon-sm"
          variant="outline"
          className="shrink-0 rounded-lg"
        >
          <Link
            href={jobId ? `/find-job/${jobId}` : "/find-job"}
            aria-label={jobId ? "Return to job" : "Find jobs"}
          >
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="mb-0.5 text-xs text-muted-foreground">
            {kind} assessment
          </p>
          <h1
            className="truncate text-sm font-semibold sm:text-base"
            title={title}
          >
            {title}
          </h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {tabLockEnabled && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs ${tabSwitchCount >= tabLockWarningLimit ? "text-destructive" : "text-muted-foreground"}`}
            title="Tab switches during this assessment"
          >
            <ShieldCheck className="size-3.5" /> Monitored · {tabSwitchCount}/
            {tabLockWarningLimit}
          </span>
        )}
        {children}
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={disabled || isSubmitting || isSubmitted}
          className="h-9 rounded-lg text-xs"
        >
          {isSubmitting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : isSubmitted ? (
            <Check className="size-3.5" />
          ) : (
            <ArrowRight className="size-3.5" />
          )}
          {isSubmitting
            ? "Evaluating…"
            : isSubmitted
              ? "Submitted"
              : "Submit solution"}
        </Button>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Submit this solution?</DialogTitle>
            <DialogDescription>
              Your current code will be evaluated and the result recorded.
              {jobId
                ? " It will be attached to your application, even if it doesn't pass."
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Keep editing
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                onSubmit();
              }}
            >
              Submit solution <ArrowRight className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
