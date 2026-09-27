"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldHint } from "@/components/ui/tooltip";
import { getSuggestions, inviteMember } from "@/lib/actions/collaboration";
import {
  CollaborationError,
  unwrap,
  useCollaborationIdentity,
  useRefreshCollaboration,
} from "@/lib/hooks/use-collaboration";
import { isRoleFilled, membershipAcceptanceIssue } from "@/lib/collaboration";
import type {
  Membership,
  Project,
  TeamMember,
  SuggestionFilters,
  CandidateSuggestion,
} from "@/types/api/collaboration";
import {
  EmptyState,
  ErrorState,
  Explanation,
  label,
  LoadingState,
  MessageDialog,
  panelClass,
  Person,
  selectClass,
  StatusBadge,
} from "./shared";
import { toast } from "sonner";
import { CandidateDetails } from "./candidate-details";

export function RecommendedCandidates({
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
  const [selectedRole, setSelectedRole] = useState("all");
  const [details, setDetails] = useState<{
    person: CandidateSuggestion;
    roleId: string | null;
    roleTitle: string;
  } | null>(null);
  const [invite, setInvite] = useState<{
    person: TeamMember;
    roleId: string | null;
    roleTitle: string;
  } | null>(null);
  const refresh = useRefreshCollaboration();
  const suggestions = useQuery({
    queryKey: ["collaboration", userId, "suggestions", project.id, filters],
    queryFn: () => unwrap(getSuggestions(project.id, filters)),
    enabled:
      enabled &&
      !!project.isOwner &&
      project.roles.some((role) => !isRoleFilled(role, project)),
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  if (!project.isOwner) return null;
  if (!project.roles.some((role) => !isRoleFilled(role, project)))
    return (
      <EmptyState
        title="Add an open role to get recommendations"
        description="Candidates are matched to your role requirements."
      >
        <Button asChild variant="outline">
          <Link href={`/collaborators/projects/${project.id}/edit`}>
            Edit roles
          </Link>
        </Button>
      </EmptyState>
    );
  const shortlists = suggestions.data?.suggestions ?? [];
  // Keep the original index: later shortlists depend on earlier picks even when filtered.
  const visibleRoles = shortlists
    .map((role, index) => ({ role, index }))
    .filter(
      ({ role }) =>
        selectedRole === "all" ||
        !shortlists.some((item) => item.roleId === selectedRole) ||
        role.roleId === selectedRole,
    );
  const hasCandidates = visibleRoles.some(
    ({ role }) => role.candidates.length > 0,
  );
  function clearLocation() {
    setDraft({ ...draft, location: "" });
    setFilters({ ...filters, location: "" });
  }
  return (
    <section aria-label="Recommended candidates" className="space-y-5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="size-5" />
              Recommended candidates
              <FieldHint
                label="About candidate recommendations"
                content="Matches come from profiles open to collaboration, based on role skills and what your team needs. People with an existing request, invitation, or membership are excluded."
              />
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Discover people for your open roles, even before they apply.
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
            setFilters({ ...draft, location: draft.location?.trim() });
          }}
        >
          {shortlists.length > 1 && (
            <label className="space-y-2 text-sm">
              <span>Role</span>
              <select
                className={selectClass}
                value={
                  shortlists.some((role) => role.roleId === selectedRole)
                    ? selectedRole
                    : "all"
                }
                onChange={(event) => setSelectedRole(event.target.value)}
              >
                <option value="all">All open roles</option>
                {shortlists.map((role) => (
                  <option
                    key={role.roleId ?? role.roleTitle}
                    value={role.roleId ?? "all"}
                  >
                    {role.roleTitle}
                  </option>
                ))}
              </select>
            </label>
          )}
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
          {!!filters.location && (
            <Button type="button" variant="ghost" onClick={clearLocation}>
              Clear location
            </Button>
          )}
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
            {!hasCandidates && (
              <EmptyState
                title="No recommended candidates yet"
                description={
                  filters.location
                    ? `No matches in ${filters.location}. Try searching anywhere.`
                    : "No available profiles match these roles yet. Review the role skills or check back later."
                }
              >
                {!!filters.location && (
                  <Button variant="outline" onClick={clearLocation}>
                    Search anywhere
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href={`/collaborators/projects/${project.id}/edit`}>
                    Edit roles
                  </Link>
                </Button>
              </EmptyState>
            )}
            {hasCandidates &&
              visibleRoles.map(({ role, index }) => (
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
                              <div
                                className="shrink-0 text-right"
                                aria-label={`${person.matchPercentage}% match, rank ${rank + 1}`}
                              >
                                <p className="text-lg font-bold tabular-nums">
                                  {person.matchPercentage}% match
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
                                  {skill.level && ` · ${label(skill.level)}`}
                                </span>
                              ))}
                              {person.skills.length > 5 && (
                                <span className="px-2 py-1 text-xs text-muted-foreground">
                                  +{person.skills.length - 5} more
                                </span>
                              )}
                            </div>
                            <Explanation explanation={person.explanation} />
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={`View details for ${person.name}`}
                                onClick={() =>
                                  setDetails({
                                    person,
                                    roleId: role.roleId,
                                    roleTitle: role.roleTitle,
                                  })
                                }
                              >
                                View details
                              </Button>
                              {membership ? (
                                <StatusBadge status={membership.status} />
                              ) : (
                                <Button
                                  disabled={
                                    project.status !== "RECRUITING" ||
                                    project.activeMemberCount >=
                                      project.teamSize ||
                                    !!membershipAcceptanceIssue(project, {
                                      roleId: role.roleId,
                                    }) ||
                                    suggestions.isFetching
                                  }
                                  aria-label={`Invite ${person.name} as ${role.roleTitle}`}
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
                      <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                        No recommendations for this role yet.
                      </p>
                    )}
                  </div>
                </section>
              ))}
          </>
        )
      )}
      {details && (
        <CandidateDetails
          {...details}
          project={project}
          membership={memberships.find(
            (member) => member.userId === details.person.userId,
          )}
          onClose={() => setDetails(null)}
          onInvite={() => {
            setInvite(details);
            setDetails(null);
          }}
        />
      )}
      {invite && (
        <MessageDialog
          open
          title={`Invite ${invite.person.name}`}
          description={`${project.title} · ${invite.roleTitle}`}
          onClose={() => setInvite(null)}
          onSubmit={async (message) => {
            try {
              const issue = membershipAcceptanceIssue(project, {
                roleId: invite.roleId,
              });
              if (issue) throw new Error(issue);
              if (
                memberships.some(
                  (member) => member.userId === invite.person.userId,
                )
              )
                throw new Error(
                  "This person already has a request or membership for this project.",
                );
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
