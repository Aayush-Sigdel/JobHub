"use client";

import { useState, useTransition } from "react";
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
  const submissions = candidateSubmissions(candidate);

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
      className="@container/review min-h-0 flex-1 overflow-y-auto bg-background"
    >
      <div className="border-b border-border/70 bg-muted/15 px-5 py-6 sm:px-8">
        <Header
          className={`flex flex-col justify-between gap-5 text-left @4xl/review:flex-row @4xl/review:items-start ${embedded ? "" : "pr-6"}`}
        >
          <div className="flex min-w-0 items-start gap-3">
            <Avatar className="size-14 shrink-0 rounded-xl border border-border">
              <AvatarImage src={candidate.imageUrl} alt="" />
              <AvatarFallback className="rounded-xl text-sm">
                {candidate.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Title className="break-words text-2xl font-semibold tracking-tight text-foreground">
                {candidate.name}
              </Title>
              <Description className="mt-1 text-sm text-muted-foreground">
                {candidate.title || "Applicant"}
              </Description>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {candidate.email && (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <IconMail className="size-3.5 shrink-0" />
                    <span className="break-all">{candidate.email}</span>
                  </span>
                )}
                {candidate.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <IconMapPin className="size-3.5 shrink-0" />
                    {candidate.location}
                  </span>
                )}
              </div>
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
          <div className="flex shrink-0 flex-wrap items-center gap-2">
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
        <div className="sticky top-0 z-10 overflow-x-auto border-b border-border/70 bg-background px-5 sm:px-8">
          <TabsList className="h-auto w-max justify-start gap-6 rounded-none bg-transparent p-0">
            <TabsTrigger value="basic" className={tabClass}>
              <IconUser className="size-4" />
              Basic info
            </TabsTrigger>
            <TabsTrigger value="assessments" className={tabClass}>
              <IconClipboardCheck className="size-4" />
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
        <div className="w-full px-5 py-7 sm:px-8">
          <TabsContent value="basic" className="mt-0">
            <CandidateOverview candidate={candidate} onTabChange={setTab} />
          </TabsContent>
          <TabsContent value="assessments" className="mt-0">
            <CandidateAssessments candidate={candidate} />
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
