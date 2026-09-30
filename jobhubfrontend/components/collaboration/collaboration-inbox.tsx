"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Inbox,
  Send,
} from "lucide-react";
import { workspaceTabClass, WorkspaceLoading } from "./workspace-ui";
import { Button } from "@/components/ui/button";
import {
  useMyMemberships,
  useOwnerMemberships,
} from "@/lib/hooks/use-collaboration";
import { membershipAcceptanceIssue } from "@/lib/collaboration";
import type { Membership, Project } from "@/types/api/collaboration";
import { useInboxSeen } from "./inbox-indicator";
import {
  EmptyState,
  ErrorState,
  MembershipButtons,
  Person,
  StatusBadge,
} from "./shared";

type RequestEntry = {
  membership: Membership;
  owner: boolean;
  project?: Project;
};

function MembershipCard({ membership, owner, project }: RequestEntry) {
  const issue = project
    ? membershipAcceptanceIssue(project, membership)
    : undefined;
  const incoming = owner
    ? membership.initiatedBy === "CANDIDATE"
    : membership.initiatedBy === "OWNER";
  const updated = new Date(membership.updatedAt);
  return (
    <article className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {incoming ? (
            <ArrowDownLeft className="size-3.5" aria-hidden="true" />
          ) : (
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          )}
          {membership.initiatedBy === "OWNER"
            ? owner
              ? "Invitation sent"
              : "Invitation received"
            : owner
              ? "Join request received"
              : "Join request sent"}
        </p>
        <StatusBadge status={membership.status} />
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <h2 className="break-words text-lg font-semibold tracking-tight">
            <Link
              href={`/collaborators/projects/${membership.projectId}${owner ? "?section=requests" : ""}`}
              className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {membership.projectTitle || "View project"}
            </Link>
          </h2>
          {membership.roleTitle && (
            <p className="break-words text-sm text-muted-foreground">
              {membership.roleTitle}
            </p>
          )}
        </div>
        {owner && <Person person={membership} prominent />}
      </div>
      {membership.message && (
        <blockquote className="mt-5 whitespace-pre-wrap break-words rounded-lg border-l-2 border-primary/60 bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {membership.message}
        </blockquote>
      )}
      {owner && membership.status === "REQUESTED" && issue && (
        <p className="mt-4 text-xs text-muted-foreground">{issue}</p>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          {membership.status === "ACTIVE" ? (
            <Button asChild variant="outline" className="h-11 rounded-lg">
              <Link
                href={`/collaborators/projects/${membership.projectId}?section=team`}
              >
                View team
              </Link>
            </Button>
          ) : (
            <MembershipButtons
              membership={membership}
              isOwner={owner}
              canAccept={!issue}
            />
          )}
          {!Number.isNaN(updated.getTime()) && (
            <time
              dateTime={membership.updatedAt}
              className="text-xs text-muted-foreground"
            >
              {updated.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
          )}
        </div>
        <Link
          href={`/collaborators/projects/${membership.projectId}${owner ? "?section=requests" : ""}`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          View project
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function CollaborationInbox() {
  const [section, setSection] = useState("received");
  const personal = useMyMemberships();
  const { projects, requests } = useOwnerMemberships();
  const { markSeen } = useInboxSeen();
  const entries: RequestEntry[] = [
    ...(personal.data ?? []).map((membership) => ({
      membership,
      owner: false,
    })),
    ...(requests.data?.memberships ?? []).map((membership) => ({
      membership,
      owner: true,
      project: membership.project,
    })),
  ];
  const incoming = entries.filter(({ membership, owner }) =>
    owner ? membership.status === "REQUESTED" : membership.status === "INVITED",
  );
  const sent = entries.filter(({ membership, owner }) =>
    owner ? membership.status === "INVITED" : membership.status === "REQUESTED",
  );
  const history = entries.filter(({ membership }) =>
    ["ACTIVE", "DECLINED", "LEFT"].includes(membership.status),
  );
  const visible =
    section === "received" ? incoming : section === "sent" ? sent : history;
  const pending =
    personal.isPending ||
    projects.isPending ||
    (!projects.error && requests.isPending);
  const failedProjects = requests.data?.failedProjects ?? [];
  const hasErrors =
    !!personal.error ||
    !!projects.error ||
    !!requests.error ||
    failedProjects.length > 0;
  const empty =
    section === "received"
      ? [
          "No requests to review",
          "New invitations and join requests will appear here.",
        ]
      : section === "sent"
        ? [
            "Nothing sent yet",
            "Your invitations and join requests will appear here.",
          ]
        : [
            "No past activity",
            "Accepted and closed memberships will appear here.",
          ];
  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Request views"
          className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-border bg-card p-1"
        >
          {[
            ["received", "To review", incoming.length],
            ["sent", "Sent", sent.length],
            ["history", "History", history.length],
          ].map(([value, title, count]) => (
            <Button
              key={value}
              className={`${workspaceTabClass} px-3 text-xs sm:px-4 sm:text-sm`}
              aria-pressed={section === value}
              variant={section === value ? "secondary" : "ghost"}
              onClick={() => setSection(String(value))}
            >
              {value === "received" ? (
                <Inbox className="hidden size-4 sm:block" aria-hidden="true" />
              ) : value === "sent" ? (
                <Send className="hidden size-4 sm:block" aria-hidden="true" />
              ) : (
                <History
                  className="hidden size-4 sm:block"
                  aria-hidden="true"
                />
              )}
              {title}
              {Number(count) > 0 && (
                <span className="rounded-md bg-background px-1.5 py-0.5 text-[11px] tabular-nums">
                  {count}
                </span>
              )}
            </Button>
          ))}
        </div>
        {section === "history" && !!history.length && (
          <Button
            variant="ghost"
            className="h-11 rounded-lg text-xs"
            onClick={markSeen}
          >
            Mark as seen
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          {section === "received"
            ? "Invitations and applications waiting for your response."
            : section === "sent"
              ? "Keep track of the invitations and requests you’ve sent."
              : "A record of your accepted and closed memberships."}
        </p>
        {!!visible.length && (
          <span className="shrink-0">Most recent first</span>
        )}
      </div>
      {personal.error && (
        <ErrorState error={personal.error} retry={() => personal.refetch()} />
      )}
      {projects.error && (
        <ErrorState error={projects.error} retry={() => projects.refetch()} />
      )}
      {requests.error && (
        <ErrorState error={requests.error} retry={() => requests.refetch()} />
      )}
      {!!failedProjects.length && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
        >
          <p className="text-sm text-muted-foreground">
            Requests couldn’t be loaded for{" "}
            {failedProjects.map((project) => project.title).join(", ")}.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => requests.refetch()}
          >
            Retry
          </Button>
        </div>
      )}
      {pending && <WorkspaceLoading />}
      {visible.length ? (
        <div className="space-y-4">
          {[...visible]
            .sort(
              (a, b) =>
                Date.parse(b.membership.updatedAt) -
                Date.parse(a.membership.updatedAt),
            )
            .map((entry) => (
              <MembershipCard
                key={`${entry.owner ? "owner" : "member"}-${entry.membership.id}`}
                {...entry}
              />
            ))}
        </div>
      ) : !pending && !hasErrors ? (
        <EmptyState
          title={empty[0]}
          description={empty[1]}
          icon={
            <Inbox
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
          }
        >
          {section !== "history" && (
            <Button asChild variant="outline">
              <Link href="/collaborators/explore">Explore projects</Link>
            </Button>
          )}
        </EmptyState>
      ) : null}
    </div>
  );
}
