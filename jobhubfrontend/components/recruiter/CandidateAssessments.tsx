"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getCandidateAssessmentQuestionsAction } from "@/lib/actions/recruiter";
import { assessmentQuestion } from "@/lib/assessment-question";
import CandidateAssessmentQuestion from "./CandidateAssessmentQuestion";
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
  jobId,
}: {
  candidate: CandidateDashboardResponse;
  jobId?: string;
}) {
  const submissions = candidateSubmissions(candidate);
  const passed = submissions.filter(({ data }) => data.passed).length;
  const events = candidate.tabSwitchEvents ?? [];
  const { data: session, status: sessionStatus } = useSession();
  const questions = useQuery({
    queryKey: ["candidate-assessment-questions", session?.user?.id, jobId],
    queryFn: () => getCandidateAssessmentQuestionsAction(jobId!),
    enabled: Boolean(
      session?.user?.id && jobId && jobId !== "all" && submissions.length,
    ),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Assessments</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Read the question, compare the result, and inspect the submitted
            work.
          </p>
        </div>
        {submissions.length > 0 && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {passed} of {submissions.length}
            </span>{" "}
            submitted assessments passed
          </p>
        )}
      </header>

      {questions.isError && submissions.length > 0 && (
        <div role="alert" className="text-sm">
          <p>
            Assessment questions could not be loaded. Scores and submitted
            answers are still available.
          </p>
          <button
            type="button"
            onClick={() => questions.refetch()}
            className="mt-2 min-h-11 underline underline-offset-4"
          >
            Try loading questions again
          </button>
        </div>
      )}
      {submissions.length === 0 ? (
        <div className="py-8 text-center">
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
          const question = assessmentQuestion(questions.data, data);
          return (
            <article
              key={label}
              aria-label={`${label} assessment`}
              className="min-w-0 space-y-6 border-t border-border pt-7"
            >
              <header className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="flex items-center gap-2.5 text-lg font-semibold">
                  <Icon className="size-4 text-muted-foreground" />
                  {label} assessment
                </h4>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${data.passed ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"}`}
                >
                  {data.passed ? (
                    <IconCheck className="size-3.5" />
                  ) : (
                    <IconAlertCircle className="size-3.5" />
                  )}
                  {data.passed ? "Passed" : "Not passed"}
                </span>
              </header>
              <div>
                <dl className="flex flex-wrap gap-x-8 gap-y-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Achieved score
                    </dt>
                    <dd className="mt-1 text-lg font-semibold tabular-nums">
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
              <div className="grid min-w-0 items-start gap-8 @4xl/review:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <section aria-label={`${label} question`} className="min-w-0">
                  <header className="mb-5 space-y-1">
                    <h5 className="text-base font-semibold">Question</h5>
                    <p className="text-xs text-muted-foreground">
                      The task given to the candidate
                    </p>
                  </header>
                  {question ? (
                    <CandidateAssessmentQuestion
                      question={question}
                      showHeading={false}
                    />
                  ) : (
                    <p
                      role={
                        sessionStatus === "loading" || questions.isFetching
                          ? "status"
                          : undefined
                      }
                      className="text-sm leading-6 text-muted-foreground"
                    >
                      {sessionStatus === "loading" || questions.isFetching
                        ? "Loading assessment question…"
                        : questions.isError
                          ? "The question could not be loaded. Use the retry control above."
                          : "The question linked to this submission is not available."}
                    </p>
                  )}
                </section>
                <section
                  aria-label={`${label} candidate answer`}
                  className="min-w-0"
                >
                  <header className="mb-5 space-y-1">
                    <h5 className="text-base font-semibold">
                      Candidate answer
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Submitted work, shown read-only
                    </p>
                  </header>
                  <SubmittedAnswer submission={data} showHeading={false} />
                </section>
              </div>
            </article>
          );
        })
      )}

      <section
        aria-label="Assessment session activity"
        className="border-t border-border pt-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
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
          <p className="mt-4 flex items-start gap-2  text-sm leading-6 text-amber-800 dark:text-amber-400">
            <IconAlertCircle className="mt-1 size-4 shrink-0" />
            The configured tab-switch limit was reached. Review the recorded
            events alongside the assessment results.
          </p>
        )}
        {events.length > 0 ? (
          <details className="group mt-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-foreground [&::-webkit-details-marker]:hidden">
              <IconChevronDown className="size-4 transition-transform group-open:rotate-180" />
              View activity log
            </summary>
            <ol className="mt-4 space-y-4">
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
