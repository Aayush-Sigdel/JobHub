"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  changeProjectStatus,
  deleteProject,
  getMemberships,
  getProject,
  requestMembership,
} from "@/lib/actions/collaboration";
import {
  unwrap,
  useCollaborationIdentity,
  useRefreshCollaboration,
} from "@/lib/hooks/use-collaboration";
import {
  isRoleFilled,
  projectTeam,
  membershipAcceptanceIssue,
} from "@/lib/collaboration";
import { TeamRoster } from "./team-roster";
import { ProjectMarkdown } from "./project-markdown";
import { RecommendedCandidates } from "./recommended-candidates";
import type { Project, ProjectStatus } from "@/types/api/collaboration";
import {
  EmptyState,
  ErrorState,
  label,
  LoadingState,
  MembershipButtons,
  MessageDialog,
  Person,
  selectClass,
  StatusBadge,
} from "./shared";
import { ProjectForm } from "./project-form";
import { FieldHint } from "@/components/ui/tooltip";
import { toast } from "sonner";

export function ProjectTeamTools({
  project,
  section = "suggestions",
}: {
  project: Project;
  section?: "suggestions" | "requests";
}) {
  const { userId, enabled } = useCollaborationIdentity();
  const members = useQuery({
    queryKey: ["collaboration", userId, "project-memberships", project.id],
    queryFn: () => unwrap(getMemberships(project.id)),
    enabled: enabled && !!project.isOwner,
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  if (!project.isOwner) return null;
  const pending =
    members.data?.filter(
      (member) => member.status === "REQUESTED" || member.status === "INVITED",
    ) ?? [];
  return (
    <div className="space-y-5">
      {section === "requests" && members.error && (
        <ErrorState error={members.error} retry={() => members.refetch()} />
      )}
      {section === "suggestions" &&
      (project.status !== "RECRUITING" ||
        project.activeMemberCount >= project.teamSize) ? (
        <EmptyState
          title={
            project.status !== "RECRUITING"
              ? "Recruitment is closed"
              : "Your team is full"
          }
          description={
            project.status !== "RECRUITING"
              ? "Set the project to recruiting in Settings to invite teammates."
              : "All team seats are filled."
          }
        />
      ) : section === "suggestions" ? (
        <RecommendedCandidates
          project={project}
          memberships={members.data ?? []}
        />
      ) : members.isPending ? (
        <LoadingState />
      ) : (
        !members.error &&
        (pending.length ? (
          <div className="space-y-7">
            {(
              [
                ["REQUESTED", "Join requests"],
                ["INVITED", "Invitations sent"],
              ] as const
            ).map(([status, title]) => {
              const items = pending.filter(
                (member) => member.status === status,
              );
              if (!items.length) return null;
              return (
                <section key={status} className="space-y-3">
                  <h2 className="font-semibold">
                    {title}{" "}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {items.length}
                    </span>
                  </h2>
                  <div className="divide-y divide-border rounded-xl border border-border bg-card">
                    {items.map((member) => {
                      const issue = membershipAcceptanceIssue(project, member);
                      return (
                        <article key={member.id} className="space-y-3 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <Person person={member} />
                            <MembershipButtons
                              membership={member}
                              isOwner
                              canAccept={!issue}
                            />
                          </div>
                          {member.message && (
                            <blockquote className="whitespace-pre-wrap break-words border-l-2 border-border pl-3 text-sm text-muted-foreground">
                              {member.message}
                            </blockquote>
                          )}
                          {status === "REQUESTED" && issue && (
                            <p className="text-xs text-muted-foreground">
                              {issue}
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="You’re all caught up"
            description="Join requests and sent invitations will appear here."
          >
            <Button asChild variant="outline">
              <Link
                href={`/collaborators/projects/${project.id}?section=suggestions`}
              >
                Recommended candidates
              </Link>
            </Button>
          </EmptyState>
        ))
      )}
    </div>
  );
}

function ProjectSettings({ project }: { project: Project }) {
  const router = useRouter();
  const refresh = useRefreshCollaboration();
  const [busy, setBusy] = useState(false);
  const [nextStatus, setNextStatus] = useState<ProjectStatus>(project.status);
  return (
    <div className="max-w-2xl space-y-6">
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-1">
          <h2 className="font-semibold">Recruitment status</h2>
          <FieldHint
            label="About recruitment status"
            content="Only recruiting projects can receive new join requests or accept teammates."
          />
        </div>
        <label className="block space-y-2 text-sm">
          <span>Status</span>
          <select
            className={selectClass}
            value={nextStatus}
            disabled={busy}
            onChange={(event) =>
              setNextStatus(event.target.value as ProjectStatus)
            }
          >
            {["RECRUITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(
              (status) => (
                <option key={status} value={status}>
                  {label(status)}
                </option>
              ),
            )}
          </select>
        </label>
        <Button
          disabled={busy || nextStatus === project.status}
          onClick={async () => {
            setBusy(true);
            try {
              await unwrap(changeProjectStatus(project.id, nextStatus));
              toast.success("Project status updated.");
            } catch (error) {
              toast.error((error as Error).message);
            } finally {
              await refresh();
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save status"}
        </Button>
      </section>
      <section className="space-y-3 rounded-xl border border-destructive/25 p-5">
        <h2 className="font-semibold">Delete project</h2>
        <p className="text-sm text-muted-foreground">
          Permanently removes the project and its memberships.
        </p>
        <Button
          variant="destructive"
          disabled={busy}
          onClick={async () => {
            if (
              !window.confirm(
                `Delete “${project.title}” and its memberships? This cannot be undone.`,
              )
            )
              return;
            setBusy(true);
            try {
              await unwrap(deleteProject(project.id));
              await refresh();
              router.push("/collaborators/my-projects");
            } catch (error) {
              toast.error((error as Error).message);
              setBusy(false);
            }
          }}
        >
          <Trash2 className="size-4" />
          Delete project
        </Button>
      </section>
    </div>
  );
}

function ProjectContent({ project }: { project: Project }) {
  const params = useSearchParams();
  const viewer = useCollaborationIdentity();
  const refresh = useRefreshCollaboration();
  const [join, setJoin] = useState(false);
  const openRoles = project.roles.filter(
    (role) => !isRoleFilled(role, project),
  );
  const suggestedRole = params.get("role") || project.bestRoleId || "";
  const [roleId, setRoleId] = useState(
    openRoles.some((role) => role.id === suggestedRole) ? suggestedRole : "",
  );
  const canJoin =
    !project.isOwner &&
    !project.myMembership &&
    project.status === "RECRUITING" &&
    project.activeMemberCount < project.teamSize;
  const owner = projectTeam(project, viewer)[0];
  const tabs = [
    { key: "overview", title: "Overview" },
    { key: "team", title: "Team" },
    ...(project.isOwner
      ? [
          {
            key: "requests",
            title: `Requests${project.pendingCount ? ` (${project.pendingCount})` : ""}`,
          },
          { key: "suggestions", title: "Recommended candidates" },
          { key: "settings", title: "Settings" },
        ]
      : []),
  ];
  const requestedSection = params.get("section");
  const section = tabs.some((tab) => tab.key === requestedSection)
    ? requestedSection
    : "overview";
  function sectionHref(key: string) {
    const next = new URLSearchParams(params.toString());
    if (key === "overview") next.delete("section");
    else next.set("section", key);
    return `/collaborators/projects/${project.id}${next.size ? `?${next}` : ""}`;
  }
  const acceptanceIssue = project.myMembership
    ? membershipAcceptanceIssue(project, project.myMembership)
    : undefined;
  const roles = (
    <section className="space-y-4 border-t border-border pt-6">
      <h2 className="text-base font-semibold">Roles</h2>
      {project.roles.length ? (
        <div className="divide-y divide-border">
          {project.roles.map((role) => {
            const filled = isRoleFilled(role, project);
            const holder = project.members?.find(
              (member) => member.roleId === role.id,
            );
            return (
              <article key={role.id} className="space-y-3 py-5 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">{role.title}</h3>
                  <StatusBadge
                    status={
                      filled
                        ? "FILLED"
                        : project.status === "RECRUITING" &&
                            project.activeMemberCount < project.teamSize
                          ? "OPEN"
                          : "CLOSED"
                    }
                  />
                </div>
                {role.description && (
                  <ProjectMarkdown>{role.description}</ProjectMarkdown>
                )}
                {!!role.requiredSkills.length && (
                  <div className="flex flex-wrap gap-1.5">
                    {role.requiredSkills.map((skill) => (
                      <span
                        key={skill.name}
                        className="rounded-md bg-muted px-2 py-1 text-xs"
                      >
                        {skill.name} · {label(skill.minLevel)}
                      </span>
                    ))}
                  </div>
                )}
                {filled && (role.filledByName || holder?.name) && (
                  <p className="text-xs text-muted-foreground">
                    Filled by {role.filledByName || holder?.name}
                  </p>
                )}
                {canJoin && !filled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRoleId(role.id);
                      setJoin(true);
                    }}
                  >
                    Request this role
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No specific roles listed.
        </p>
      )}
    </section>
  );
  return (
    <div className="space-y-6">
      <Link
        href={
          project.isOwner || project.myMembership?.status === "ACTIVE"
            ? "/collaborators/my-projects"
            : "/collaborators/explore"
        }
        className="inline-flex items-center gap-2 rounded-md text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-3.5" />
        {project.isOwner || project.myMembership?.status === "ACTIVE"
          ? "My projects"
          : "Explore projects"}
      </Link>
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={project.status} />
              {project.isOwner && (
                <span className="text-xs font-medium text-muted-foreground">
                  Your project
                </span>
              )}
            </div>
            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
              {project.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Owned by{" "}
              <Link
                className="rounded-sm font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                href={
                  project.isOwner
                    ? "/candidate-profile"
                    : `/preview/${owner.userId}`
                }
              >
                {owner.name}
              </Link>
              {project.isOwner && " · You"}
            </p>
          </div>
          {project.isOwner ? (
            <Button asChild variant="outline" className="min-h-11 rounded-md">
              <Link href={`/collaborators/projects/${project.id}/edit`}>
                <Pencil className="size-4" />
                Edit project
              </Link>
            </Button>
          ) : canJoin ? (
            <Button
              className="min-h-11 rounded-md"
              onClick={() => setJoin(true)}
            >
              Request to join
            </Button>
          ) : project.myMembership ? (
            <StatusBadge status={project.myMembership.status} />
          ) : (
            <span className="text-sm text-muted-foreground">
              {project.status !== "RECRUITING"
                ? "Recruitment closed"
                : "Team full"}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {project.activeMemberCount} / {project.teamSize} members
          </span>
          <span>
            {label(project.workplaceType)}
            {project.location ? ` · ${project.location}` : ""}
          </span>
          {project.commitmentHoursPerWeek != null && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {project.commitmentHoursPerWeek} hrs/week
            </span>
          )}
          {project.durationWeeks != null && (
            <span>{project.durationWeeks} weeks</span>
          )}
        </div>
      </header>
      <nav
        aria-label="Project sections"
        className="flex flex-wrap gap-1 border-b border-border pb-2"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={sectionHref(tab.key)}
            scroll={false}
            aria-current={section === tab.key ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-sm px-3 text-sm font-medium sm:min-h-9 ${section === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            {tab.title}
          </Link>
        ))}
      </nav>
      {section === "overview" && (
        <div
          className={
            !project.isOwner && project.myMembership
              ? "grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]"
              : "max-w-4xl"
          }
        >
          <div className="min-w-0 space-y-7">
            <section className="space-y-3">
              <h2 className="font-semibold">About</h2>
              <ProjectMarkdown>{project.description}</ProjectMarkdown>
            </section>
            {project.goals && (
              <section className="space-y-3 border-t border-border pt-6">
                <h2 className="font-semibold">Goals</h2>
                <ProjectMarkdown>{project.goals}</ProjectMarkdown>
              </section>
            )}
            {roles}
          </div>
          {!project.isOwner && project.myMembership && (
            <section className="space-y-3 border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
              <h2 className="font-semibold">Your membership</h2>
              {project.myMembership.roleTitle && (
                <p className="text-sm">{project.myMembership.roleTitle}</p>
              )}
              {project.myMembership.status === "REQUESTED" && (
                <p className="text-sm text-muted-foreground">
                  Waiting for the owner to review your request.
                </p>
              )}
              {project.myMembership.status === "INVITED" && (
                <p className="text-sm text-muted-foreground">
                  You’ve been invited to join this team.
                </p>
              )}
              {project.myMembership.message && (
                <blockquote className="whitespace-pre-wrap break-words border-l-2 border-border pl-3 text-sm text-muted-foreground">
                  {project.myMembership.message}
                </blockquote>
              )}
              {project.myMembership.status === "INVITED" && acceptanceIssue && (
                <p className="text-sm text-muted-foreground">
                  {acceptanceIssue}
                </p>
              )}
              <MembershipButtons
                membership={project.myMembership}
                canAccept={!acceptanceIssue}
              />
              {["DECLINED", "LEFT"].includes(project.myMembership.status) && (
                <p className="text-xs text-muted-foreground">
                  This membership is closed. You cannot rejoin.
                </p>
              )}
            </section>
          )}
        </div>
      )}
      {section === "team" && (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <TeamRoster project={project} />
          {project.isOwner &&
            project.status === "RECRUITING" &&
            project.activeMemberCount < project.teamSize && (
              <div className="space-y-3">
                <h2 className="font-semibold">Grow your team</h2>
                <p className="text-sm text-muted-foreground">
                  Invite teammates for your open roles.
                </p>
                <Button asChild>
                  <Link href={sectionHref("suggestions")}>
                    Recommended candidates
                  </Link>
                </Button>
              </div>
            )}
        </div>
      )}
      {project.isOwner &&
        (section === "suggestions" || section === "requests") && (
          <ProjectTeamTools project={project} section={section} />
        )}
      {project.isOwner && section === "settings" && (
        <ProjectSettings key={project.status} project={project} />
      )}
      {join && (
        <MessageDialog
          open
          title="Request to join"
          description={project.title}
          onClose={() => setJoin(false)}
          onSubmit={async (message) => {
            if (!canJoin)
              throw new Error("This project is no longer accepting requests.");
            if (roleId && !openRoles.some((role) => role.id === roleId))
              throw new Error(
                "This role is no longer open. Choose another role.",
              );
            try {
              await unwrap(
                requestMembership(project.id, roleId || undefined, message),
              );
              toast.success("Join request sent.");
            } finally {
              await refresh();
            }
          }}
        >
          <label className="block space-y-2 text-sm">
            <span>Your role</span>
            <select
              className={selectClass}
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
            >
              <option value="">No specific role</option>
              {openRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          </label>
        </MessageDialog>
      )}
    </div>
  );
}

export function ProjectDetail({
  id,
  edit = false,
}: {
  id: string;
  edit?: boolean;
}) {
  const { userId, enabled } = useCollaborationIdentity();
  const project = useQuery({
    queryKey: ["collaboration", userId, "project", id],
    queryFn: () => unwrap(getProject(id)),
    enabled,
    staleTime: 0,
    refetchInterval: edit ? false : 15000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  if (project.isPending) return <LoadingState />;
  if (project.error)
    return <ErrorState error={project.error} retry={() => project.refetch()} />;
  if (!project.data) return null;
  if (edit)
    return project.data.isOwner ? (
      <ProjectForm project={project.data} />
    ) : (
      <EmptyState
        title="Only the project owner can edit this project"
        description="Open the project to see its roles and team."
      />
    );
  return (
    <div>
      <ProjectContent key={project.data.id} project={project.data} />
    </div>
  );
}
