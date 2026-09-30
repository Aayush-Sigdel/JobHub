"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import {
  CandidateListSkeleton,
  CandidateMatch,
  CandidateSkills,
} from "./candidate-ui";
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
  MessageDialog,
  panelClass,
  Person,
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
  const filterId = useId();
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
    <section aria-label="Recommended candidates" className="min-w-0 space-y-7">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <span className="mr-1 flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
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
            className="h-11 rounded-lg px-4"
            disabled={suggestions.isFetching}
            onClick={() => suggestions.refetch()}
          >
            <RefreshCw
              className={`size-4 ${suggestions.isFetching ? "motion-safe:animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        {shortlists.length > 1 && (
          <div
            role="group"
            aria-label="Filter candidates by role"
            className="flex flex-wrap gap-x-5 gap-y-1 border-b border-border"
          >
            {[
              {
                id: "all",
                title: "All roles",
                count: shortlists.reduce(
                  (total, role) => total + role.candidates.length,
                  0,
                ),
              },
              ...shortlists
                .filter((role) => role.roleId !== null)
                .map((role) => ({
                  id: role.roleId!,
                  title: role.roleTitle,
                  count: role.candidates.length,
                })),
            ].map((role) => {
              const activeRole = shortlists.some(
                (item) => item.roleId === selectedRole,
              )
                ? selectedRole
                : "all";
              const active = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex min-h-12 max-w-full items-center gap-2 border-b-2 px-1 py-3 text-left text-sm transition-colors motion-reduce:transition-none ${active ? "border-foreground font-semibold text-foreground" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"}`}
                >
                  <span className="min-w-0 break-words">{role.title}</span>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${active ? "bg-primary/20 text-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {role.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <form
          className="grid max-w-xl min-w-0 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({ ...draft, location: draft.location?.trim() });
          }}
        >
          <div className="min-w-0 space-y-2">
            <label
              htmlFor={`${filterId}-location`}
              className="block text-xs font-medium text-muted-foreground"
            >
              Candidate location
            </label>
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={`${filterId}-location`}
                placeholder="City, region, or anywhere"
                className="h-11 rounded-lg border-border bg-background pl-10 pr-3 text-sm focus-visible:ring-0"
                value={draft.location ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, location: event.target.value })
                }
              />
            </div>
          </div>
          <Button
            type="submit"
            className="h-11 rounded-lg px-4"
            disabled={suggestions.isFetching}
          >
            <Search className="size-4" aria-hidden="true" /> Apply location
          </Button>
        </form>
        <div className="flex min-h-6 flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p role="status" aria-live="polite">
            {suggestions.isPending
              ? "Finding people for your team…"
              : suggestions.error
                ? "Recommendations unavailable"
                : `${visibleRoles.reduce((count, { role }) => count + role.candidates.length, 0)} recommendations across ${visibleRoles.length} ${visibleRoles.length === 1 ? "role" : "roles"}`}
          </p>
          {filters.location ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 max-w-full gap-2 rounded-lg text-xs"
              onClick={clearLocation}
              aria-label={`Clear location filter: ${filters.location}`}
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              <span className="truncate">{filters.location}</span>
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          ) : (
            <span>Sorted by role match</span>
          )}
        </div>
      </div>
      {suggestions.isPending ? (
        <CandidateListSkeleton />
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
                  className="grid min-w-0 gap-5 border-t border-border/70 pt-6 lg:grid-cols-[180px_minmax(0,1fr)] xl:gap-8"
                >
                  <div className="min-w-0 space-y-3 lg:sticky lg:top-24 lg:self-start">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <BriefcaseBusiness
                        className="size-3.5"
                        aria-hidden="true"
                      />{" "}
                      Open role {index + 1}
                    </span>
                    <h3 className="break-words text-lg font-semibold leading-snug tracking-tight">
                      {role.roleTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {role.candidates.length}{" "}
                      {role.candidates.length === 1
                        ? "candidate"
                        : "candidates"}{" "}
                      shortlisted
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.requiredSkills.map((skill) => (
                        <span
                          key={skill.name}
                          className="max-w-full break-words rounded-md bg-muted px-2 py-1 text-xs leading-relaxed text-muted-foreground"
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
                  <div className="min-w-0 space-y-4">
                    {role.candidates.length ? (
                      role.candidates.map((person, rank) => {
                        const membership = memberships.find(
                          (member) => member.userId === person.userId,
                        );
                        return (
                          <article
                            key={person.userId}
                            className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-5 transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 hover:shadow-sm motion-reduce:transition-none sm:p-6"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <Person person={person} prominent />
                              <div className="shrink-0 space-y-1.5 text-center">
                                <CandidateMatch
                                  percentage={person.matchPercentage}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                  Rank {rank + 1}
                                </p>
                              </div>
                            </div>
                            {person.location && (
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin
                                  className="size-3.5 shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 break-words">
                                  {person.location}
                                </span>
                              </p>
                            )}
                            {person.bio && (
                              <p className="line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">
                                {person.bio}
                              </p>
                            )}
                            <CandidateSkills
                              skills={person.skills}
                              matched={person.explanation.coveredSkills}
                              limit={5}
                            />
                            <Explanation explanation={person.explanation} />
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <Button
                                variant="ghost"
                                className="h-11 rounded-lg px-2 text-muted-foreground hover:text-foreground"
                                aria-label={`View details for ${person.name}`}
                                onClick={() =>
                                  setDetails({
                                    person,
                                    roleId: role.roleId,
                                    roleTitle: role.roleTitle,
                                  })
                                }
                              >
                                View details{" "}
                                <ArrowUpRight
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              </Button>
                              {membership ? (
                                <StatusBadge status={membership.status} />
                              ) : (
                                <Button
                                  className="h-11 rounded-lg px-4"
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
                                  <UserPlus
                                    className="size-4"
                                    aria-hidden="true"
                                  />{" "}
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
