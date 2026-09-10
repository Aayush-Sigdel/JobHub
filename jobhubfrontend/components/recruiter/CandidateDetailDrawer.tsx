"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconExternalLink,
  IconSparkles,
  IconCheck,
  IconAlertCircle,
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
import SubmittedAnswer from "./SubmittedAnswer";
import {
  candidateStages,
  candidateMatchLabel,
  reviewDate,
} from "./candidate-review-utils";

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
      <SheetContent className="flex h-full w-full flex-col gap-0 overflow-hidden border-l border-border p-0 sm:max-w-2xl lg:max-w-3xl">
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
  const effectiveJobId =
    candidate.jobId || (jobId !== "all" ? jobId : undefined);
  const submissions = [
    { label: "Design", data: candidate.designSubmission },
    { label: "Programming", data: candidate.programmingSubmission },
    { label: "SQL", data: candidate.sqlSubmission },
  ].flatMap((item) =>
    item.data ? [{ label: item.label, data: item.data }] : [],
  );

  function changeStage(nextStatus: ApplicationStatus) {
    if (!candidate.applicationId || isPending || nextStatus === status) return;
    startTransition(async () => {
      try {
        await updateApplicationStatusAction(
          candidate.applicationId!,
          nextStatus,
        );
        setStatus(nextStatus);
        onStatusChange?.(nextStatus);
        if (!onStatusChange) router.refresh();
        toast.success(
          `Moved to ${candidateStages.find((stage) => stage.id === nextStatus)?.label.toLowerCase()}.`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update this application.",
        );
      }
    });
  }

  const Header = embedded ? "div" : SheetHeader;
  const Title = embedded ? "h2" : SheetTitle;
  const Description = embedded ? "p" : SheetDescription;
  const tabClass =
    "flex-none rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none";
  return (
    <section
      aria-label={`Review ${candidate.name}`}
      className="min-h-0 flex-1 overflow-y-auto"
    >
      <div className="border-b border-border/70 px-5 py-6 sm:px-8">
        <Header className="flex flex-col justify-between gap-5 text-left xl:flex-row xl:items-start">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar className="size-12 shrink-0 rounded-xl border border-border">
              <AvatarImage src={candidate.imageUrl} alt="" />
              <AvatarFallback className="rounded-xl text-sm">
                {candidate.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Title className="truncate text-xl font-semibold text-foreground">
                {candidate.name}
              </Title>
              <Description className="mt-1 text-sm text-muted-foreground">
                {candidate.title || "Applicant"}
              </Description>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                <span className="rounded-md bg-muted px-2 py-1">
                  {candidateStages.find((stage) => stage.id === status)?.label}
                </span>
                <button
                  type="button"
                  onClick={() => setTab("match")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground"
                >
                  <IconSparkles className="size-3.5" />
                  {candidateMatchLabel(candidate)} match
                </button>
                <Link
                  href={`/preview/${encodeURIComponent(candidate.candidateId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-8 items-center gap-1.5 rounded font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-foreground"
                >
                  Profile preview
                  <IconExternalLink className="size-3.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:pr-5">
            {status !== "SHORTLISTED" &&
              status !== "ACCEPTED" &&
              status !== "REJECTED" && (
                <Button
                  onClick={() => changeStage("SHORTLISTED")}
                  disabled={isPending || !candidate.applicationId}
                  className="h-9 rounded-lg px-4"
                >
                  Shortlist
                </Button>
              )}
            {status === "APPLIED" && (
              <Button
                variant="outline"
                className="h-9 rounded-lg"
                disabled={isPending || !candidate.applicationId}
                onClick={() => changeStage("IN_REVIEW")}
              >
                Start review
              </Button>
            )}
            {(status === "IN_REVIEW" || status === "SHORTLISTED") && (
              <Button
                variant={status === "SHORTLISTED" ? "default" : "outline"}
                className="h-9 rounded-lg"
                disabled={isPending || !candidate.applicationId}
                onClick={() => changeStage("ACCEPTED")}
              >
                Accept
              </Button>
            )}
            {status !== "REJECTED" && status !== "ACCEPTED" && (
              <Button
                variant="ghost"
                className="h-9 rounded-lg text-destructive"
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
                className="h-9 rounded-lg"
                disabled={isPending || !candidate.applicationId}
                onClick={() => changeStage("IN_REVIEW")}
              >
                Return to review
              </Button>
            )}
            {isPending && (
              <span role="status" className="text-xs text-muted-foreground">
                Saving…
              </span>
            )}
          </div>
        </Header>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="gap-0">
        <div className="overflow-x-auto border-b border-border/70 px-5 sm:px-8">
          <TabsList className="h-auto w-max justify-start gap-6 rounded-none bg-transparent p-0">
            <TabsTrigger value="basic" className={tabClass}>
              Basic info
            </TabsTrigger>
            <TabsTrigger value="assessments" className={tabClass}>
              Assessments{" "}
              <span className="ml-1 text-xs text-muted-foreground">
                {submissions.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="match" className={tabClass}>
              <IconSparkles className="size-4" />
              Match
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="w-full px-5 py-6 sm:px-8">
          <TabsContent
            value="basic"
            className="mt-0 grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]"
          >
            <div className="rounded-xl border border-border p-5">
              <h3 className="mb-5 text-sm font-semibold">
                Application details
              </h3>
              <dl className="grid gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
                {[
                  ["Email", candidate.email || "Not specified"],
                  ["Location", candidate.location || "Not specified"],
                  ["Applied for", candidate.jobTitle || "Selected role"],
                  ["Applied on", reviewDate(candidate.appliedAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1.5 break-words font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              {candidate.skills?.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <h4 className="text-xs text-muted-foreground">Key skills</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {candidate.skills.slice(0, 8).map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-md bg-muted px-2 py-1 text-xs"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {candidate.skills.length > 8 && (
                      <span className="self-center text-xs text-muted-foreground">
                        +{candidate.skills.length - 8} in profile
                      </span>
                    )}
                  </div>
                </div>
              )}
              {candidate.coverNote && (
                <div className="mt-5 border-t border-border pt-5">
                  <h3 className="text-sm font-semibold">Application note</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {candidate.coverNote}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-5">
                <div>
                  <h3 className="text-sm font-semibold">
                    Assessment submissions
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {submissions.length
                      ? `${submissions.length} submitted · ${submissions.filter((item) => item.data.passed).length} passed`
                      : "No submissions recorded for this application."}
                  </p>
                </div>
                {submissions.length > 0 && (
                  <div className="mt-4 divide-y divide-border">
                    {submissions.map(({ label, data }) => (
                      <button
                        key={data.id || data.taskId}
                        type="button"
                        onClick={() => setTab("assessments")}
                        className="flex w-full items-center gap-3 rounded-lg py-3 text-left text-sm outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-foreground"
                      >
                        <span className="flex-1 font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">
                          {data.passed ? "Passed" : "Needs review"}
                        </span>
                        <span className="font-medium tabular-nums">
                          {data.achievedScore}
                        </span>
                        <IconArrowRight className="size-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setTab("match")}
                className="flex w-full items-center gap-4 rounded-xl border border-border bg-muted/20 p-5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-foreground"
              >
                <IconSparkles className="size-5 shrink-0" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">
                    Explore the match
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Source scores and an animated walkthrough of the snapshots.
                  </span>
                </span>
                <span className="text-lg font-semibold tabular-nums">
                  {candidateMatchLabel(candidate)}
                </span>
                <IconArrowRight className="size-4 shrink-0" />
              </button>
            </div>
          </TabsContent>
          <TabsContent value="assessments" className="mt-0 space-y-5">
            <div>
              <h3 className="text-base font-semibold">Assessment review</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Review the recorded results and evaluator feedback.
              </p>
            </div>
            {candidate.tabSwitchLimitExceeded && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
                <p className="text-sm leading-6">
                  {candidate.tabSwitchCount} tab switches were recorded,
                  exceeding the configured limit. Review this context alongside
                  the assessment results.
                </p>
              </div>
            )}
            {submissions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No assessment submissions are available for this application.
              </p>
            ) : (
              submissions.map(({ label, data }) => (
                <article
                  key={data.id || data.taskId}
                  className="rounded-xl border border-border p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold">
                      {label} assessment
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${data.passed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-800 dark:text-amber-400"}`}
                    >
                      {data.passed && <IconCheck className="size-3.5" />}
                      {data.passed ? "Passed" : "Below required score"}
                    </span>
                  </div>
                  <dl className="mt-5 flex flex-wrap gap-8 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Score achieved
                      </dt>
                      <dd className="mt-1 font-semibold tabular-nums">
                        {data.achievedScore}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Score required
                      </dt>
                      <dd className="mt-1 font-semibold tabular-nums">
                        {data.requiredScore}
                      </dd>
                    </div>
                  </dl>
                  {data.message && (
                    <div className="mt-5">
                      <h5 className="text-xs font-medium text-muted-foreground">
                        Evaluator feedback
                      </h5>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                        {data.message}
                      </p>
                    </div>
                  )}
                  <div className="mt-5 border-t border-border pt-4">
                    <SubmittedAnswer submission={data} />
                  </div>
                </article>
              ))
            )}
          </TabsContent>
          <TabsContent value="match" className="mt-0">
            <CandidateMatchTimeline
              candidate={candidate}
              jobId={effectiveJobId}
            />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
