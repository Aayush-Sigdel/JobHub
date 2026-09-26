"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Pencil,
  RefreshCw,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  changeProjectStatus,
  deleteProject,
  getMemberships,
  getProject,
  getSuggestions,
  inviteMember,
  requestMembership,
} from "@/lib/actions/collaboration";
import {
  CollaborationError,
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
import type {
  Membership,
  Project,
  ProjectStatus,
  TeamMember,
  SuggestionFilters,
} from "@/types/api/collaboration";
import {
  EmptyState,
  ErrorState,
  Explanation,
  label,
  LoadingState,
  MembershipButtons,
  MessageDialog,
  panelClass,
  Person,
  selectClass,
  StatusBadge,
} from "./shared";
import { ProjectForm } from "./project-form";
import { FieldHint } from "@/components/ui/tooltip";
import { toast } from "sonner";

function SquadBuilder({
  project,
  memberships,
}: {
  project: Project;
  memberships: Membership[];
}) {
  const { userId, enabled } = useCollaborationIdentity();
  const [draft, setDraft] = useState<SuggestionFilters>({
    poolSize: 200,
    shortlistSize: 10,
    location: "",
  });
  const [filters, setFilters] = useState(draft);
  const [invite, setInvite] = useState<{
    person: TeamMember;
    roleId: string | null;
    roleTitle: string;
  } | null>(null);
  const refresh = useRefreshCollaboration();
  const suggestions = useQuery({
    queryKey: ["collaboration", userId, "suggestions", project.id, filters],
    queryFn: () => unwrap(getSuggestions(project.id, filters)),
    enabled,
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  return (
    <section className="space-y-5">
      <div className={`${panelClass} space-y-4`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="size-5" />
              Find teammates
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Suggested for your open roles.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={suggestions.isFetching}
            onClick={() => suggestions.refetch()}
          >
            <RefreshCw
              className={`size-4 ${suggestions.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({ ...draft });
          }}
        >
          <label className="space-y-2 text-sm">
            <span>Candidate location</span>
            <Input
              placeholder="Anywhere"
              value={draft.location ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, location: event.target.value })
              }
            />
          </label>
          <Button
            type="submit"
            variant="outline"
            disabled={suggestions.isFetching}
          >
            Apply location
          </Button>
        </form>
      </div>
      {suggestions.isPending ? (
        <LoadingState />
      ) : suggestions.error instanceof CollaborationError &&
        suggestions.error.status === 409 ? (
        <div className={`${panelClass} space-y-3`}>
          <p className="text-sm text-muted-foreground">
            Save this project again to prepare its candidate matches.
          </p>
          <Button asChild variant="outline">
            <Link href={`/collaborators/projects/${project.id}/edit`}>
              Edit project
            </Link>
          </Button>
        </div>
      ) : suggestions.error ? (
        <ErrorState
          error={suggestions.error}
          retry={() => suggestions.refetch()}
        />
      ) : (
        suggestions.data && (
          <>
            {suggestions.data.suggestions.length === 0 && (
              <EmptyState
                title="No teammate matches yet"
                description="Try another location or update the role skills."
              >
                <Button asChild variant="outline">
                  <Link href={`/collaborators/projects/${project.id}/edit`}>
                    Edit roles
                  </Link>
                </Button>
              </EmptyState>
            )}
            {suggestions.data.suggestions.map((role, index) => (
              <section
                key={role.roleId ?? role.roleTitle}
                className="grid gap-4 lg:grid-cols-[220px_1fr]"
              >
                <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
                  <span className="text-xs text-muted-foreground">
                    Open role {index + 1}
                  </span>
                  <h3 className="font-semibold">{role.roleTitle}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {role.requiredSkills.map((skill) => (
                      <span
                        key={skill.name}
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      >
                        {skill.name} · {label(skill.minLevel)}
                      </span>
                    ))}
                  </div>
                  {index > 0 && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      This shortlist assumes the earlier role’s top pick joins
                      your team.
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  {role.candidates.length ? (
                    role.candidates.map((person, rank) => {
                      const membership = memberships.find(
                        (member) => member.userId === person.userId,
                      );
                      return (
                        <article
                          key={person.userId}
                          className={`${panelClass} space-y-4`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <Person person={person} />
                            <div className="shrink-0 text-right">
                              <p className="text-lg font-bold tabular-nums">
                                {person.matchPercentage}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Rank {rank + 1}
                              </p>
                            </div>
                          </div>
                          {person.location && (
                            <p className="text-xs text-muted-foreground">
                              {person.location}
                            </p>
                          )}
                          {person.bio && (
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                              {person.bio}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {person.skills.slice(0, 5).map((skill) => (
                              <span
                                key={skill.name}
                                className="rounded-md border border-border px-2 py-1 text-xs"
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                          <Explanation explanation={person.explanation} />
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/preview/${person.userId}`}>
                                View profile
                              </Link>
                            </Button>
                            {membership ? (
                              <StatusBadge status={membership.status} />
                            ) : (
                              <Button
                                disabled={
                                  project.status !== "RECRUITING" ||
                                  project.activeMemberCount >=
                                    project.teamSize ||
                                  suggestions.isFetching
                                }
                                onClick={() =>
                                  setInvite({
                                    person,
                                    roleId: role.roleId,
                                    roleTitle: role.roleTitle,
                                  })
                                }
                              >
                                Invite to team
                              </Button>
                            )}
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <EmptyState
                      title="No candidates for this role"
                      description="Try another location or update the role skills."
                    />
                  )}
                </div>
              </section>
            ))}
          </>
        )
      )}
      {invite && (
        <MessageDialog
          open
          title={`Invite ${invite.person.name}`}
          description={`Role: ${invite.roleTitle}`}
          onClose={() => setInvite(null)}
          onSubmit={async (message) => {
            try {
              await unwrap(
                inviteMember(
                  project.id,
                  invite.person.userId,
                  invite.roleId ?? undefined,
                  message,
                ),
              );
              toast.success("Invitation sent.");
            } finally {
              await refresh();
            }
          }}
        />
      )}
    </section>
  );
}

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
    enabled,
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  const pending =
    members.data?.filter(
      (member) => member.status === "REQUESTED" || member.status === "INVITED",
    ) ?? [];
  return (
    <div className="space-y-5">
      {members.error && (
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
        members.isPending ? (
          <LoadingState />
        ) : (
          !members.error && (
            <SquadBuilder project={project} memberships={members.data ?? []} />
          )
        )
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
                Find teammates
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
          { key: "suggestions", title: "Find teammates" },
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
    <section className="space-y-4">
      <h2 className="font-semibold">Roles</h2>
      {project.roles.length ? (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {project.roles.map((role) => {
            const filled = isRoleFilled(role, project);
            const holder = project.members?.find(
              (member) => member.roleId === role.id,
            );
            return (
              <div key={role.id} className="space-y-3 p-5">
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
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
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
              </div>
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
            <Button asChild variant="outline" className="h-10 rounded-lg">
              <Link href={`/collaborators/projects/${project.id}/edit`}>
                <Pencil className="size-4" />
                Edit project
              </Link>
            </Button>
          ) : canJoin ? (
            <Button className="h-10 rounded-lg" onClick={() => setJoin(true)}>
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
        className="flex gap-5 overflow-x-auto border-b border-border"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={sectionHref(tab.key)}
            scroll={false}
            aria-current={section === tab.key ? "page" : undefined}
            className={`shrink-0 border-b-2 px-1 pb-3 pt-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring ${section === tab.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab.title}
          </Link>
        ))}
      </nav>
      {section === "overview" && (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-7">
            <section className="space-y-3">
              <h2 className="font-semibold">About</h2>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
                {project.description}
              </p>
            </section>
            {project.goals && (
              <section className="space-y-3">
                <h2 className="font-semibold">Goals</h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
                  {project.goals}
                </p>
              </section>
            )}
            {roles}
          </div>
          <div className="space-y-5">
            <TeamRoster project={project} />
            {project.isOwner && (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href={sectionHref("requests")}>Review requests</Link>
                </Button>
                {project.status === "RECRUITING" &&
                  project.activeMemberCount < project.teamSize && (
                    <Button asChild>
                      <Link href={sectionHref("suggestions")}>
                        Find teammates
                      </Link>
                    </Button>
                  )}
              </div>
            )}
            {!project.isOwner && project.myMembership && (
              <section className="space-y-3 rounded-xl border border-border bg-card p-5">
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
                {project.myMembership.status === "INVITED" &&
                  acceptanceIssue && (
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
                  <Link href={sectionHref("suggestions")}>Find teammates</Link>
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
