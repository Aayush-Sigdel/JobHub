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
import { isRoleFilled } from "@/lib/collaboration";
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
import { toast } from "sonner";

function SquadBuilder({
  project,
  memberships,
}: {
  project: Project;
  memberships: Membership[];
}) {
  const { userId, enabled } = useCollaborationIdentity();
  const [draft, setDraft] = useState<SuggestionFilters>({ poolSize: 200, shortlistSize: 10, location: "" });
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
              Squad builder
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Find people who cover your team’s missing skills. Suggestions
              update when someone joins or leaves.
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
        <form className="grid gap-3 sm:grid-cols-3" onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...draft });
        }}>
          <label className="space-y-2 text-sm">
            <span>Candidate location</span>
            <Input placeholder="Anywhere" value={draft.location ?? ""} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
          </label>
          <label className="space-y-2 text-sm">
            <span>Candidates to consider</span>
            <Input type="number" required min={10} max={500} step={1} value={draft.poolSize ?? ""} onChange={(event) => setDraft({ ...draft, poolSize: event.target.value ? Number(event.target.value) : undefined })} />
          </label>
          <label className="space-y-2 text-sm">
            <span>Results per role</span>
            <Input type="number" required min={1} max={25} step={1} value={draft.shortlistSize ?? ""} onChange={(event) => setDraft({ ...draft, shortlistSize: event.target.value ? Number(event.target.value) : undefined })} />
          </label>
          <Button type="submit" variant="outline" disabled={suggestions.isFetching}>Find people</Button>
        </form>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {suggestions.isFetching
            ? "Updating ranked candidates…"
            : suggestions.data
              ? `${suggestions.data.poolSize} candidates considered · ${suggestions.data.openSeats} open seats · Updated ${new Date(suggestions.dataUpdatedAt).toLocaleTimeString()}`
              : ""}
        </p>
      </div>
      {suggestions.isPending ? (
        <LoadingState />
      ) : suggestions.error instanceof CollaborationError && suggestions.error.status === 409 ? (
        <div className={`${panelClass} space-y-3`}>
          <p className="text-sm text-muted-foreground">Save this project again to prepare its candidate matches.</p>
          <Button asChild variant="outline"><Link href={`/collaborators/projects/${project.id}/edit`}>Edit project</Link></Button>
        </div>
      ) : suggestions.error ? (
        <ErrorState
          error={suggestions.error}
          retry={() => suggestions.refetch()}
        />
      ) : (
        suggestions.data && (
          <>
            {suggestions.data.note && (
              <p
                role="status"
                className={`${panelClass} text-sm text-muted-foreground`}
              >
                {suggestions.data.note}
              </p>
            )}
            {!suggestions.data.note &&
              suggestions.data.suggestions.length === 0 && (
                <EmptyState
                  title="No suggestions yet"
                  description="Candidates need profile visibility enabled and refreshed matching data to appear here."
                />
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
                          {person.location && <p className="text-xs text-muted-foreground">{person.location}</p>}
                          {person.bio && <p className="line-clamp-3 text-sm text-muted-foreground">{person.bio}</p>}
                          <div className="flex flex-wrap gap-1.5">
                            {person.skills.map(skill => <span key={skill.name} className="rounded-md border border-border px-2 py-1 text-xs">{skill.name}</span>)}
                          </div>
                          <Explanation explanation={person.explanation} />
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/preview/${person.userId}`}>
                                View profile & contact
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
                      description="Try a different location, consider more candidates, or revisit the required skills."
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
          description={`Invite them to join as ${invite.roleTitle}. They will need to accept before joining your team.`}
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

export function ProjectTeamTools({ project }: { project: Project }) {
  const { userId, enabled } = useCollaborationIdentity();
  const [section, setSection] = useState<"suggestions" | "requests">(
    "suggestions",
  );
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
      <div className="flex flex-wrap gap-2">
        <Button
          variant={section === "suggestions" ? "secondary" : "ghost"}
          onClick={() => setSection("suggestions")}
        >
          Squad builder
        </Button>
        <Button
          variant={section === "requests" ? "secondary" : "ghost"}
          onClick={() => setSection("requests")}
        >
          Requests & invitations{" "}
          <span className="rounded-md bg-muted px-1.5 text-xs">
            {members.data ? pending.length : (project.pendingCount ?? 0)}
          </span>
        </Button>
      </div>
      {members.error && (
        <ErrorState error={members.error} retry={() => members.refetch()} />
      )}
      {section === "suggestions" ? (
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
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((member) => (
              <article key={member.id} className={`${panelClass} space-y-4`}>
                <div className="flex justify-between gap-3">
                  <Person person={member} />
                  <StatusBadge status={member.status} />
                </div>
                {member.message && (
                  <blockquote className="whitespace-pre-wrap break-words rounded-xl bg-muted/60 p-3 text-sm">
                    {member.message}
                  </blockquote>
                )}
                <MembershipButtons membership={member} isOwner />
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="You’re all caught up"
            description="New join requests and outstanding invitations will appear here."
          />
        ))
      )}
    </div>
  );
}

function ProjectContent({ project }: { project: Project }) {
  const router = useRouter();
  const params = useSearchParams();
  const refresh = useRefreshCollaboration();
  const [join, setJoin] = useState(false);
  const [roleId, setRoleId] = useState(
    params.get("role") || project.bestRoleId || "",
  );
  const [busy, setBusy] = useState(false);
  const [nextStatus, setNextStatus] = useState<ProjectStatus>(project.status);
  const openRoles = project.roles.filter(
    (role) => !isRoleFilled(role, project),
  );
  const canJoin =
    !project.isOwner &&
    !project.myMembership &&
    project.status === "RECRUITING" &&
    project.activeMemberCount < project.teamSize;
  const owner = project.owner || {
    userId: project.ownerId,
    name: project.ownerName || "Project owner",
    imageUrl: project.ownerImageUrl ?? undefined,
    roleTitle: "Project owner",
  };
  return (
    <div className="space-y-6">
      <Link
        href="/collaborators/explore"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row">
        <div className="space-y-3">
          <StatusBadge status={project.status} />
          <h1 className="break-words text-2xl font-bold tracking-tight md:text-3xl">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-4" />
              {project.activeMemberCount}/{project.teamSize} people, including
              owner
            </span>
            <span>
              {label(project.workplaceType)}
              {project.location ? ` · ${project.location}` : ""}
            </span>
            {project.durationWeeks != null && <span>{project.durationWeeks} weeks</span>}
            {project.commitmentHoursPerWeek != null && (
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {project.commitmentHoursPerWeek} hours / week
              </span>
            )}
          </div>
        </div>
        {project.isOwner && (
          <Button asChild variant="outline">
            <Link href={`/collaborators/projects/${project.id}/edit`}>
              <Pencil className="size-4" />
              Edit project
            </Link>
          </Button>
        )}
      </header>
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <section className={`${panelClass} space-y-3`}>
            <h2 className="font-semibold">About the project</h2>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </section>
          {project.goals && <section className={`${panelClass} space-y-3`}>
            <h2 className="font-semibold">Project goals</h2>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{project.goals}</p>
          </section>}
          <section className={`${panelClass} space-y-4`}>
            <h2 className="font-semibold">Team roles</h2>
            {project.roles.map((role) => (
              <div
                key={role.id}
                className="space-y-2 rounded-xl bg-muted/40 p-4"
              >
                <div className="flex justify-between gap-3">
                  <h3 className="text-sm font-semibold">{role.title}</h3>
                  <StatusBadge
                    status={isRoleFilled(role, project) ? "FILLED" : "OPEN"}
                  />
                </div>
                {role.description && (
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                )}
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
              </div>
            ))}
          </section>
        </div>
        <aside className="space-y-5">
          <section className={`${panelClass} space-y-4`}>
            <h2 className="font-semibold">Meet the team</h2>
            <Person person={{ ...owner, roleTitle: "Project owner" }} />
            {project.members
              ?.filter((member) => member.userId !== owner.userId)
              .map((member) => (
                <Person key={member.userId} person={member} />
              ))}
            <p className="text-xs leading-relaxed text-muted-foreground">
              Open a teammate’s profile for contact details and social links.
            </p>
          </section>
          {!project.isOwner && (
            <section className={`${panelClass} space-y-4`}>
              {project.myMembership ? (
                <>
                  <h2 className="font-semibold">Your membership</h2>
                  <StatusBadge status={project.myMembership.status} />
                  {project.myMembership.message && (
                    <blockquote className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      {project.myMembership.message}
                    </blockquote>
                  )}
                  <MembershipButtons membership={project.myMembership} />
                  {["DECLINED", "LEFT"].includes(
                    project.myMembership.status,
                  ) && (
                    <p className="text-xs text-muted-foreground">
                      This membership is closed. You cannot request to join this
                      project again.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="font-semibold">Bring your skills</h2>
                  <p className="text-sm text-muted-foreground">
                    {canJoin
                      ? "Tell the owner how you can help. They’ll review your request."
                      : project.status !== "RECRUITING"
                        ? "This project is not recruiting right now."
                        : "This team is currently full."}
                  </p>
                  <Button
                    className="w-full"
                    disabled={!canJoin}
                    onClick={() => setJoin(true)}
                  >
                    Ask to join
                  </Button>
                </>
              )}
            </section>
          )}
          {project.isOwner && (
            <section className={`${panelClass} space-y-4`}>
              <h2 className="font-semibold">Manage project</h2>
              <label className="block space-y-2 text-sm">
                <span>Project status</span>
                <select
                  className={selectClass}
                  value={nextStatus}
                  onChange={(e) =>
                    setNextStatus(e.target.value as ProjectStatus)
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
                  } catch (e) {
                    toast.error((e as Error).message);
                  } finally {
                    await refresh();
                    setBusy(false);
                  }
                }}
              >
                Update status
              </Button>
              <div className="border-t border-border pt-3">
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
                    } catch (e) {
                      toast.error((e as Error).message);
                      setBusy(false);
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete project
                </Button>
              </div>
            </section>
          )}
        </aside>
      </div>
      {project.isOwner && <ProjectTeamTools project={project} />}
      {join && (
        <MessageDialog
          open
          title="Request to join"
          description={`Ask to join ${project.title}. The owner will review your request.`}
          onClose={() => setJoin(false)}
          onSubmit={async (message) => {
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
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="">Let the owner choose</option>
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
    <div className="mx-auto max-w-6xl py-4">
      <ProjectContent key={project.data.id} project={project.data} />
    </div>
  );
}
