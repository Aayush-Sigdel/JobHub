"use client";

import { useState } from "react";
import Link from "next/link";
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
  LoadingState,
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
  return (
    <article className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link
            href={`/collaborators/projects/${membership.projectId}${owner ? "?section=requests" : ""}`}
            className="rounded-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {membership.projectTitle || "View project"}
          </Link>
          <p className="text-xs text-muted-foreground">
            {membership.initiatedBy === "OWNER"
              ? owner
                ? "Invitation sent"
                : "Invitation received"
              : owner
                ? "Join request received"
                : "Join request sent"}
            {membership.roleTitle ? ` · ${membership.roleTitle}` : ""}
          </p>
        </div>
        <StatusBadge status={membership.status} />
      </div>
      {owner && <Person person={membership} />}
      {membership.message && (
        <blockquote className="whitespace-pre-wrap break-words border-l-2 border-border pl-3 text-sm text-muted-foreground">
          {membership.message}
        </blockquote>
      )}
      {owner && membership.status === "REQUESTED" && issue && (
        <p className="text-xs text-muted-foreground">{issue}</p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {membership.status === "ACTIVE" ? (
          <Button asChild variant="outline" size="sm">
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
        {membership.updatedAt && (
          <time
            dateTime={membership.updatedAt}
            className="text-xs text-muted-foreground"
          >
            {new Date(membership.updatedAt).toLocaleDateString()}
          </time>
        )}
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div aria-label="Request views" className="flex gap-1">
          {[
            ["received", "To review", incoming.length],
            ["sent", "Sent", sent.length],
            ["history", "History", 0],
          ].map(([value, title, count]) => (
            <Button
              key={value}
              aria-pressed={section === value}
              variant={section === value ? "secondary" : "ghost"}
              onClick={() => setSection(String(value))}
            >
              {title}
              {Number(count) > 0 && (
                <span className="ml-1 rounded bg-background px-1.5 text-xs tabular-nums">
                  {count}
                </span>
              )}
            </Button>
          ))}
        </div>
        {section === "history" && !!history.length && (
          <Button variant="ghost" size="sm" onClick={markSeen}>
            Mark as seen
          </Button>
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
      {pending && <LoadingState />}
      {visible.length ? (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
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
        <EmptyState title={empty[0]} description={empty[1]}>
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
