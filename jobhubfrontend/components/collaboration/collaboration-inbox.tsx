"use client";

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
      {membership.status === "DECLINED" && (
        <p className="text-sm text-muted-foreground">
          This invitation or request was declined or withdrawn. It is now
          closed.
        </p>
      )}
      {membership.status === "ACTIVE" && (
        <p className="text-sm text-muted-foreground">
          You’re on the team. Open the project to find your teammates’ profiles
          and contact details.
        </p>
      )}
      {membership.message && (
        <blockquote className="whitespace-pre-wrap break-words rounded-xl bg-muted/60 p-3 text-sm">
          {membership.message}
        </blockquote>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MembershipButtons membership={membership} isOwner={owner} />
        {membership.updatedAt && <time
          dateTime={membership.updatedAt}
          className="text-xs text-muted-foreground"
        >
          Updated {new Date(membership.updatedAt).toLocaleDateString()}
        </time>}
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
  if (!projects.length) return null;
  return (
    <section className="space-y-4">
      <h2 className="font-semibold">
        Requests & invitations for your projects{" "}
        {result.data?.length ? `(${result.data.length})` : ""}
      </h2>
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
        <p className="text-sm text-muted-foreground">
          No pending requests or invitations for your projects.
        </p>
      )}
    </section>
  );
}

export function CollaborationInbox() {
  const memberships = useMyMemberships();
  const { userId, enabled } = useCollaborationIdentity();
  const projects = useQuery({
    queryKey: ["collaboration", userId, "projects", "mine"],
    queryFn: () => unwrap(getProjects("mine")),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    retry: false,
  });
  const { markSeen } = useInboxSeen();
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Your invitations & activity</h2>
          <Button variant="ghost" size="sm" onClick={markSeen}>
            Mark updates as seen
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Track invitations, requests, and team changes here, including declined
          requests.
        </p>
        {memberships.isPending ? (
          <LoadingState />
        ) : memberships.error ? (
          <ErrorState
            error={memberships.error}
            retry={() => memberships.refetch()}
          />
        ) : memberships.data?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...memberships.data]
              .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
              .map((member) => (
                <MembershipCard key={member.id} membership={member} />
              ))}
          </div>
        ) : (
          <EmptyState
            title="Your next team starts here"
            description="Invitations you receive and requests you send will appear here."
          />
        )}
      </section>
      {projects.error ? (
        <ErrorState error={projects.error} retry={() => projects.refetch()} />
      ) : projects.isPending ? (
        <LoadingState />
      ) : (
        <OwnerInbox projects={projects.data ?? []} />
      )}
    </div>
  );
}
