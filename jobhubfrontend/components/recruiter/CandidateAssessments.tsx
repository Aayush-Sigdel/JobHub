"use client";

import { useState } from "react";
import {
  IconCheck,
  IconAlertCircle,
  IconCode,
  IconPalette,
  IconDatabase,
  IconChevronDown,
  IconBrowser,
  IconClipboardCheck,
} from "@tabler/icons-react";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import {
  candidateSubmissions,
  reviewDate,
  reviewScore,
} from "./candidate-review-utils";
import SubmittedAnswer from "./SubmittedAnswer";

const assessmentIcons = {
  Design: IconPalette,
  Programming: IconCode,
  SQL: IconDatabase,
};

export default function CandidateAssessments({
  candidate,
}: {
  candidate: CandidateDashboardResponse;
}) {
  const submissions = candidateSubmissions(candidate);
  const passed = submissions.filter(({ data }) => data.passed).length;
  const events = candidate.tabSwitchEvents ?? [];
  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Assessment results</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Scores and the submitted work.
          </p>
        </div>
        {submissions.length > 0 && (
          <p className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {passed} of {submissions.length}
            </span>{" "}
            submitted assessments passed
          </p>
        )}
      </header>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <IconClipboardCheck className="mx-auto size-7 text-muted-foreground" />
          <h4 className="mt-3 text-sm font-medium">
            No assessment submissions
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Results will appear here when an assessment is submitted.
          </p>
        </div>
      ) : (
        submissions.map(({ label, data }) => {
          const Icon = assessmentIcons[label as keyof typeof assessmentIcons];
          return (
            <article
              key={label}
              className="overflow-hidden rounded-xl border border-border"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/25 px-5 py-4">
                <h4 className="flex items-center gap-2.5 text-sm font-semibold">
                  <Icon className="size-4 text-muted-foreground" />
                  {label} assessment
                </h4>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${data.passed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-800 dark:text-amber-400"}`}
                >
                  {data.passed ? (
                    <IconCheck className="size-3.5" />
                  ) : (
                    <IconAlertCircle className="size-3.5" />
                  )}
                  {data.passed ? "Passed" : "Not passed"}
                </span>
              </header>
              <div className="p-5">
                <dl className="flex flex-wrap gap-x-8 gap-y-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Achieved score
                    </dt>
                    <dd className="mt-1.5 text-3xl font-semibold tracking-tight tabular-nums">
                      {reviewScore(data.achievedScore)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Required to pass
                    </dt>
                    <dd className="mt-1 text-base font-medium tabular-nums">
                      {reviewScore(data.requiredScore)}
                    </dd>
                  </div>
                </dl>
              </div>
              <details
                className="group border-t border-border/60"
                onToggle={(event) => {
                  const isOpen = event.currentTarget.open;
                  setOpenAnswers((previous) => ({
                    ...previous,
                    [data.id]: isOpen,
                  }));
                }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-3.5 text-xs font-medium outline-none hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  Submitted answer
                  <IconChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5">
                  {openAnswers[data.id] && <SubmittedAnswer submission={data} />}
                </div>
              </details>
            </article>
          );
        })
      )}

      <section className="rounded-xl border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <IconBrowser className="size-4 text-muted-foreground" />
            Session activity
          </h3>
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {candidate.tabSwitchCount ?? 0}
            </span>{" "}
            tab switches recorded
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Activity is context for your review, not a conclusion about the
          candidate’s work.
        </p>
        {candidate.tabSwitchLimitExceeded && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm leading-6 text-amber-800 dark:text-amber-400">
            <IconAlertCircle className="mt-1 size-4 shrink-0" />
            The configured tab-switch limit was reached. Review the recorded
            events alongside the assessment results.
          </p>
        )}
        {events.length > 0 ? (
          <details className="group mt-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <IconChevronDown className="size-4 transition-transform group-open:rotate-180" />
              View activity log
            </summary>
            <ol className="mt-4 space-y-4 border-l border-border pl-4">
              {events.map((event, index) => (
                <li key={`${event.timestamp}-${index}`} className="text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium capitalize">
                      {event.eventType?.toLowerCase().replaceAll("_", " ") ||
                        "Tab switch"}
                    </span>
                    <time
                      dateTime={event.timestamp}
                      className="text-xs text-muted-foreground"
                    >
                      {reviewDate(event.timestamp)}
                      {event.timestamp &&
                      !Number.isNaN(Date.parse(event.timestamp))
                        ? `, ${new Date(event.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                        : ""}
                    </time>
                  </div>
                  {typeof event.durationSeconds === "number" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Duration: {reviewScore(event.durationSeconds)} seconds
                    </p>
                  )}
                  {event.details && (
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                      {event.details}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </details>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {candidate.tabSwitchCount > 0
              ? "Individual event details were not included with this application."
              : "No tab-switch events were recorded."}
          </p>
        )}
      </section>
    </div>
  );
}
