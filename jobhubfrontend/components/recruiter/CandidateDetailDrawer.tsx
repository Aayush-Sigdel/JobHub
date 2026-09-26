"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconExternalLink,
  IconSparkles,
  IconMail,
  IconMapPin,
  IconUser,
  IconClipboardCheck,
  IconBriefcase,
  IconCalendar,
  IconArrowRight,
} from "@tabler/icons-react";
import { updateApplicationStatusAction } from "@/lib/actions/recruiter";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import type { ApplicationStatus } from "@/types/api/jobs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CandidateMatchTimeline from "./CandidateMatchTimeline";
import CandidateOverview from "./CandidateOverview";
import CandidateAssessments from "./CandidateAssessments";
import {
  candidateStages,
  candidateMatchLabel,
  candidateSubmissions,
  reviewDate,
} from "./candidate-review-utils";

import styles from "./candidate-review.module.css";

interface Props {
  candidate: CandidateDashboardResponse;
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
  onStatusChange?: (status: ApplicationStatus) => void;
}

export default function CandidateDetailDrawer(props: Props) {
  const key = `${props.jobId}:${props.candidate.applicationId || props.candidate.candidateId}`;
  if (props.embedded) return <CandidateReview key={key} {...props} />;
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent
        className={`${styles.review} flex h-full w-full flex-col gap-0 overflow-hidden border-l border-border p-0 sm:max-w-2xl lg:max-w-4xl`}
      >
        {props.open && <CandidateReview key={key} {...props} />}
      </SheetContent>
    </Sheet>
  );
}

function CandidateReview({
  candidate,
  jobId,
  embedded = false,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState("basic");
  const [status, setStatus] = useState<ApplicationStatus>(
    candidate.status || "APPLIED",
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [saveError, setSaveError] = useState("");
  const stageRef = useRef<HTMLParagraphElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function openTab(value: string) {
    setTab(value);
    requestAnimationFrame(() => {
      tabRefs.current[value]?.focus({ preventScroll: true });
      tabRefs.current[value]?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    });
  }
  const effectiveJobId =
    candidate.jobId || (jobId !== "all" ? jobId : undefined);
  const submissions = candidateSubmissions(candidate);
  const passedCount = submissions.filter(({ data }) => data.passed).length;
  const stageLabel =
    candidateStages.find((stage) => stage.id === status)?.label || status;

  function changeStage(nextStatus: ApplicationStatus) {
    if (!candidate.applicationId || isPending || nextStatus === status) return;
    setSaveError("");
    setFeedback("");
    startTransition(async () => {
      try {
        await updateApplicationStatusAction(
          candidate.applicationId!,
          nextStatus,
        );
        setStatus(nextStatus);
        setFeedback(
          `Application moved to ${candidateStages.find((stage) => stage.id === nextStatus)?.label.toLowerCase()}.`,
        );
        requestAnimationFrame(() =>
          stageRef.current?.focus({ preventScroll: true }),
        );
        onStatusChange?.(nextStatus);
        if (!onStatusChange) router.refresh();
        toast.success(
          `Moved to ${candidateStages.find((stage) => stage.id === nextStatus)?.label.toLowerCase()}.`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update this application. Please try again.";
        setSaveError(message);
        toast.error(message);
      }
    });
  }

  const Header = embedded ? "div" : SheetHeader;
  const Title = embedded ? "h2" : SheetTitle;
  const Description = embedded ? "p" : SheetDescription;
  const tabClass =
    "h-9 min-h-9 flex-1 rounded-sm px-3 py-1.5 text-sm font-medium sm:flex-none sm:px-4";
  return (
    <section
      aria-label={`Review ${candidate.name}`}
      className={`${styles.review} flex min-h-0 min-w-0 flex-1 flex-col bg-background`}
    >
      <div className="@container/review min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="bg-background px-4 py-6 sm:px-7">
          <Header
            className={`flex flex-col justify-between gap-5 text-left @4xl/review:flex-row @4xl/review:items-start ${embedded ? "" : "pr-6"}`}
          >
            <div className="flex min-w-0 items-start gap-3">
              <Avatar className="size-14 shrink-0 rounded-xl border border-border">
                <AvatarImage src={candidate.imageUrl} alt="" />
                <AvatarFallback className="rounded-xl text-sm">
                  {candidate.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Title className="break-words text-2xl font-semibold tracking-tight text-foreground">
                  {candidate.name}
                </Title>
                <Description className="mt-1 text-sm text-muted-foreground">
                  {candidate.title || "Applicant"}
                </Description>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {candidate.email && (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="inline-flex min-h-9 min-w-0 items-center gap-1.5 rounded underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                    >
                      <IconMail
                        aria-hidden="true"
                        className="size-3.5 shrink-0"
                      />
                      <span className="break-all">{candidate.email}</span>
                    </a>
                  )}
                  {candidate.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <IconMapPin className="size-3.5 shrink-0" />
                      {candidate.location}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                  <span
                    className={`${styles.stage} inline-flex items-center gap-2 font-medium`}
                    data-stage={status}
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-current"
                    />
                    {stageLabel}
                  </span>
                  <Link
                    href={`/preview/${encodeURIComponent(candidate.candidateId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-foreground"
                  >
                    Profile preview
                    <IconExternalLink className="size-3.5" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Link>
                </div>
              </div>
            </div>
          </Header>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-2.5">
              <IconBriefcase
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Applied for</dt>
                <dd className="mt-1 break-words text-sm font-medium">
                  {candidate.jobTitle || "Selected role"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <IconCalendar
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
              <div>
                <dt className="text-xs text-muted-foreground">
                  Application date
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {reviewDate(candidate.appliedAt)}
                </dd>
              </div>
            </div>
          </dl>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => openTab("match")}
              className="group flex items-center gap-3 py-3 text-left"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <IconSparkles aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">
                  Job match
                </span>
                <span className="mt-1 block text-xl font-semibold tabular-nums">
                  {candidateMatchLabel(candidate)}
                </span>
                <span className="mt-1 block text-xs underline decoration-foreground/30 underline-offset-4">
                  View match evidence
                </span>
              </span>
              <IconArrowRight aria-hidden="true" className="size-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => openTab("assessments")}
              className="group flex items-center gap-3 py-3 text-left"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <IconClipboardCheck aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">
                  Assessments
                </span>
                <span className="mt-1 block text-xl font-semibold tabular-nums">
                  {submissions.length
                    ? `${passedCount} of ${submissions.length} passed`
                    : "No submissions"}
                </span>
                <span className="mt-1 block text-xs underline decoration-foreground/30 underline-offset-4">
                  Review submitted work
                </span>
              </span>
              <IconArrowRight aria-hidden="true" className="size-4 shrink-0" />
            </button>
          </div>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="gap-0">
          <div className="sticky top-0 z-10 border-y border-border bg-background px-4 py-2 sm:px-7">
            <TabsList
              aria-label="Candidate detail sections"
              className={`${styles.tabs} h-auto! w-full justify-start gap-1 rounded-none bg-transparent p-0`}
            >
              <TabsTrigger
                ref={(node) => {
                  tabRefs.current.basic = node;
                }}
                value="basic"
                className={tabClass}
              >
                <IconUser className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                ref={(node) => {
                  tabRefs.current.assessments = node;
                }}
                value="assessments"
                className={tabClass}
              >
                <IconClipboardCheck className="size-4" />
                Assessments{" "}
                <span className="ml-1 text-xs text-muted-foreground">
                  {submissions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                ref={(node) => {
                  tabRefs.current.match = node;
                }}
                value="match"
                className={tabClass}
              >
                <IconSparkles className="size-4" />
                Match
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="w-full min-w-0 px-4 py-7 sm:px-7">
            <TabsContent value="basic" className="mt-0">
              <CandidateOverview candidate={candidate} onTabChange={openTab} />
            </TabsContent>
            <TabsContent value="assessments" className="mt-0">
              <CandidateAssessments
                candidate={candidate}
                jobId={effectiveJobId}
              />
            </TabsContent>
            <TabsContent value="match" className="mt-0">
              <CandidateMatchTimeline
                candidate={candidate}
                jobId={effectiveJobId}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <footer className="shrink-0 border-t border-border bg-card px-4 py-4 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            ref={stageRef}
            tabIndex={-1}
            className="rounded text-sm font-medium outline-offset-4"
          >
            <span className="block text-xs font-normal text-muted-foreground">
              Application stage
            </span>
            <span className="mt-1 block">{stageLabel}</span>
          </p>
          <div
            role="group"
            aria-label="Update application stage"
            aria-busy={isPending}
            className="flex flex-wrap items-center gap-2"
          >
            {status !== "SHORTLISTED" &&
              status !== "ACCEPTED" &&
              status !== "REJECTED" && (
                <Button
                  onClick={() => changeStage("SHORTLISTED")}
                  disabled={isPending || !candidate.applicationId}
                  className="min-h-11 rounded-lg px-4"
                >
                  Shortlist
                </Button>
              )}
            {status === "APPLIED" && (
              <Button
                variant="outline"
                className="min-h-11 rounded-lg"
                disabled={isPending || !candidate.applicationId}
                onClick={() => changeStage("IN_REVIEW")}
              >
                Start review
              </Button>
            )}
            {(status === "IN_REVIEW" || status === "SHORTLISTED") && (
              <Button
                variant={status === "SHORTLISTED" ? "default" : "outline"}
                className="min-h-11 rounded-lg"
                disabled={isPending || !candidate.applicationId}
                onClick={() => changeStage("ACCEPTED")}
              >
                Accept
              </Button>
            )}
            {status !== "REJECTED" && status !== "ACCEPTED" && (
              <Button
                variant="ghost"
                className="min-h-11 rounded-lg text-destructive"
                disabled={isPending || !candidate.applicationId}
                onClick={() => changeStage("REJECTED")}
              >
                Reject
              </Button>
            )}
            {(status === "ACCEPTED" ||
              status === "REJECTED" ||
              status === "SHORTLISTED") && (
              <Button
                variant="outline"
                className="min-h-11 rounded-lg"
                disabled={isPending || !candidate.applicationId}
                onClick={() => changeStage("IN_REVIEW")}
              >
                Return to review
              </Button>
            )}
          </div>
        </div>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-2 text-xs text-muted-foreground"
        >
          {isPending
            ? "Saving application stage…"
            : feedback ||
              (!candidate.applicationId
                ? "Stage changes are unavailable for this application."
                : "")}
        </p>
        {saveError && (
          <p
            role="alert"
            className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {saveError}
          </p>
        )}
      </footer>
    </section>
  );
}
