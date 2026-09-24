"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getMemberships, getProjects } from "@/lib/actions/collaboration";
import {
  unwrap,
  useCollaborationIdentity,
  useMyMemberships,
} from "@/lib/hooks/use-collaboration";
import type { Membership, Project } from "@/types/api/collaboration";
import { useInboxSeen } from "./inbox-indicator";
import {
  EmptyState,
  ErrorState,
  label,
  LoadingState,
  MembershipButtons,
  panelClass,
  Person,
  StatusBadge,
} from "./shared";

function MembershipCard({
  membership,
  owner = false,
}: {
  membership: Membership;
  owner?: boolean;
}) {
  return (
    <article className={`${panelClass} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/collaborators/projects/${membership.projectId}`}
            className="font-semibold hover:underline"
          >
            {membership.projectTitle || "View project"}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {membership.roleTitle || "Project teammate"} ·{" "}
            {label(
              membership.initiatedBy === "OWNER"
                ? "INVITATION"
                : "JOIN_REQUEST",
            )}
          </p>
        </div>
        <StatusBadge status={membership.status} />
      </div>
      {owner && <Person person={membership} />}
      {membership.message && (
        <blockquote className="whitespace-pre-wrap break-words rounded-xl bg-muted/60 p-3 text-sm">
          {membership.message}
        </blockquote>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {membership.status === "ACTIVE" ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/collaborators/projects/${membership.projectId}`}>
              Open project
            </Link>
          </Button>
        ) : (
          <MembershipButtons membership={membership} isOwner={owner} />
        )}
        {membership.updatedAt && (
          <time
            dateTime={membership.updatedAt}
            className="text-xs text-muted-foreground"
          >
            Updated {new Date(membership.updatedAt).toLocaleDateString()}
          </time>
        )}
      </div>
    </article>
  );
}

function OwnerInbox({ projects }: { projects: Project[] }) {
  const { userId, enabled } = useCollaborationIdentity();
  const result = useQuery({
    queryKey: [
      "collaboration",
      userId,
      "owner-inbox",
      projects.map((project) => project.id),
    ],
    enabled: enabled && projects.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        projects.map(async (project) =>
          (await unwrap(getMemberships(project.id))).map((member) => ({
            ...member,
            projectId: project.id,
            projectTitle: project.title,
          })),
        ),
      );
      return results
        .flat()
        .filter(
          (member) =>
            member.status === "REQUESTED" || member.status === "INVITED",
        );
    },
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  if (!projects.length)
    return (
      <EmptyState
        title="No project requests"
        description="Create a project to receive join requests."
      >
        <Button asChild>
          <Link href="/collaborators/projects/new">Create project</Link>
        </Button>
      </EmptyState>
    );
  return (
    <section className="space-y-4">
      {result.isPending ? (
        <LoadingState />
      ) : result.error ? (
        <ErrorState error={result.error} retry={() => result.refetch()} />
      ) : result.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {result.data.map((member) => (
            <MembershipCard key={member.id} membership={member} owner />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No pending requests"
          description="Join requests and sent invitations will appear here."
        />
      )}
    </section>
  );
}

export function CollaborationInbox() {
  const [section, setSection] = useState("received");
  const memberships = useMyMemberships();
  const { userId, enabled } = useCollaborationIdentity();
  const projects = useQuery({
    queryKey: ["collaboration", userId, "projects", "mine"],
    queryFn: () => unwrap(getProjects("mine")),
    enabled: enabled && section === "projects",
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    retry: false,
  });
  const { markSeen } = useInboxSeen();
  const visible = (memberships.data ?? []).filter((member) =>
    section === "received"
      ? member.status === "INVITED"
      : section === "sent"
        ? member.status === "REQUESTED"
        : ["ACTIVE", "DECLINED", "LEFT"].includes(member.status),
  );
  const empty =
    section === "received"
      ? ["No invitations", "Invitations from project owners will appear here."]
      : section === "sent"
        ? ["No requests sent", "Find a project and request to join."]
        : [
            "No past activity",
            "Accepted and closed requests will appear here.",
          ];
  return (
    <div className="space-y-5">
      <div
        aria-label="Request views"
        className="flex gap-1 overflow-x-auto border-b border-border pb-3"
      >
        {[
          ["received", "Invitations"],
          ["sent", "Sent requests"],
          ["projects", "For my projects"],
          ["history", "History"],
        ].map(([value, title]) => (
          <Button
            key={value}
            className="shrink-0"
            aria-pressed={section === value}
            variant={section === value ? "secondary" : "ghost"}
            onClick={() => setSection(value)}
          >
            {title}
          </Button>
        ))}
      </div>
      {section === "projects" ? (
        projects.error ? (
          <ErrorState error={projects.error} retry={() => projects.refetch()} />
        ) : projects.isPending ? (
          <LoadingState />
        ) : (
          <OwnerInbox projects={projects.data ?? []} />
        )
      ) : (
        <>
          {section === "history" && !!visible.length && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={markSeen}>
                Mark as seen
              </Button>
            </div>
          )}
          {memberships.isPending ? (
            <LoadingState />
          ) : memberships.error ? (
            <ErrorState
              error={memberships.error}
              retry={() => memberships.refetch()}
            />
          ) : visible.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...visible]
                .sort(
                  (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
                )
                .map((member) => (
                  <MembershipCard key={member.id} membership={member} />
                ))}
            </div>
          ) : (
            <EmptyState title={empty[0]} description={empty[1]}>
              {section !== "history" && (
                <Button asChild variant="outline">
                  <Link href="/collaborators/explore">Explore projects</Link>
                </Button>
              )}
            </EmptyState>
          )}
        </>
      )}
    </div>
  );
}
