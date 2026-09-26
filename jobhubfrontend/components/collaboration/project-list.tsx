"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProjects } from "@/lib/actions/collaboration";
import { syncAllEmbeddingsAction } from "@/lib/actions/embeddings";
import {
  CollaborationError,
  unwrap,
  useCollaborationIdentity,
  useRefreshCollaboration,
  useMyMemberships,
} from "@/lib/hooks/use-collaboration";
import type { Project, ProjectFilters } from "@/types/api/collaboration";
import {
  EmptyState,
  ErrorState,
  Explanation,
  label,
  LoadingState,
  panelClass,
  selectClass,
  StatusBadge,
} from "./shared";
import { toast } from "sonner";
import { isRoleFilled, projectTeam } from "@/lib/collaboration";
import { ProjectMarkdown } from "./project-markdown";

function ProjectCard({ project }: { project: Project }) {
  const viewer = useCollaborationIdentity();
  const owner = projectTeam(project, viewer)[0];
  const isOwner = project.ownerId === viewer.userId;
  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-border bg-background transition-colors hover:border-foreground/30 focus-within:border-foreground/50">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge status={project.status} />
          <span className="text-xs text-muted-foreground">
            {label(project.workplaceType)}
            {project.location ? ` · ${project.location}` : ""}
          </span>
        </div>
        <div>
          <h2 className="break-words text-lg font-semibold">
            <Link
              className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              href={`/collaborators/projects/${project.id}${project.bestRoleId ? `?role=${encodeURIComponent(project.bestRoleId)}` : ""}`}
            >
              {project.title}
            </Link>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {owner.name}
            {isOwner ? " · Your project" : " · Owner"}
          </p>
          <div className="mt-3">
            <ProjectMarkdown summary>{project.description}</ProjectMarkdown>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.roles
            ?.filter((role) => !isRoleFilled(role, project))
            .slice(0, 3)
            .map((role) => (
              <span
                key={role.id}
                className="rounded-sm bg-muted px-2 py-1 text-xs"
              >
                {role.title}
              </span>
            ))}
        </div>
        {project.explanation && (
          <Explanation explanation={project.explanation} />
        )}
        {project.bestRoleId && (
          <p className="text-xs font-medium">
            Suggested role:{" "}
            {project.bestRoleTitle ||
              project.roles?.find((role) => role.id === project.bestRoleId)
                ?.title ||
              "View suggested role"}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {isOwner
              ? `${project.activeMemberCount} / ${project.teamSize} members`
              : project.status !== "RECRUITING"
                ? "Recruitment closed"
                : `${project.openSeats ?? Math.max(0, project.teamSize - project.activeMemberCount)} open seats`}
          </span>
          {project.commitmentHoursPerWeek != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {project.commitmentHoursPerWeek} hrs/week
            </span>
          )}
          {isOwner && (
            <Link
              href={`/collaborators/projects/${project.id}?section=requests`}
              className="rounded-sm font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              Requests
            </Link>
          )}
          {isOwner &&
            project.status === "RECRUITING" &&
            project.activeMemberCount < project.teamSize && (
              <Link
                href={`/collaborators/projects/${project.id}?section=suggestions`}
                className="inline-flex items-center gap-1 rounded-sm font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Sparkles className="size-3.5" aria-hidden="true" />
                Recommended candidates
              </Link>
            )}
          {!!project.pendingCount && (
            <span className="font-semibold text-foreground">
              {project.pendingCount} pending
            </span>
          )}
          <Button asChild size="sm" className="ml-auto min-h-11 rounded-md">
            <Link
              href={`/collaborators/projects/${project.id}${project.bestRoleId ? `?role=${encodeURIComponent(project.bestRoleId)}` : ""}`}
            >
              {isOwner ? "Manage project" : "View project"}
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function MatchingPrompt() {
  const [busy, setBusy] = useState(false);
  const refresh = useRefreshCollaboration();
  return (
    <div className={`${panelClass} space-y-4`}>
      <Sparkles className="size-6" />
      <h2 className="font-semibold">Complete your profile to find matches</h2>
      <p className="max-w-xl text-sm text-muted-foreground">
        Add your skills, then refresh recommendations.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const result = await syncAllEmbeddingsAction();
              if (
                !result.profileEmbeddingUpdated &&
                !result.platformEmbeddingUpdated
              )
                throw new Error(
                  "Your matching data could not be refreshed. Please try again from your profile.",
                );
              await refresh();
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Refreshing profile…" : "Find matches"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/candidate-profile">Review profile</Link>
        </Button>
      </div>
    </div>
  );
}

export function ProjectList({
  view,
  initialQuery = "",
}: {
  view: "browse" | "mine" | "for-me";
  initialQuery?: string;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [mineTab, setMineTab] = useState("owned");
  const memberships = useMyMemberships();
  const [draft, setDraft] = useState<ProjectFilters>({
    status: "RECRUITING",
    query: initialQuery,
  });
  const [filters, setFilters] = useState<ProjectFilters>({
    status: "RECRUITING",
    query: initialQuery,
  });
  const { userId, enabled } = useCollaborationIdentity();
  const projects = useQuery({
    queryKey: [
      "collaboration",
      userId,
      "projects",
      view,
      ...(view === "browse" ? [filters] : []),
    ],
    queryFn: () => unwrap(getProjects(view, filters)),
    enabled: enabled && (view !== "mine" || mineTab === "owned"),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });
  return (
    <div className="space-y-5">
      {view !== "mine" ? (
        <nav aria-label="Project discovery" className="flex gap-2">
          <Button
            asChild
            className="min-h-11 rounded-md sm:min-h-9"
            variant={view === "browse" ? "default" : "ghost"}
          >
            <Link
              href="/collaborators/explore"
              aria-current={view === "browse" ? "page" : undefined}
            >
              All projects
            </Link>
          </Button>
          <Button
            asChild
            className="min-h-11 rounded-md sm:min-h-9"
            variant={view === "for-me" ? "default" : "ghost"}
          >
            <Link
              href="/collaborators/for-you"
              aria-current={view === "for-me" ? "page" : undefined}
            >
              <Sparkles className="size-4" />
              For you
            </Link>
          </Button>
        </nav>
      ) : (
        <div aria-label="Your projects" className="flex gap-2">
          {[
            ["owned", "Created by me"],
            ["joined", "Joined"],
          ].map(([value, title]) => (
            <Button
              key={value}
              aria-pressed={mineTab === value}
              className="min-h-11 rounded-md sm:min-h-9"
              variant={mineTab === value ? "default" : "ghost"}
              onClick={() => setMineTab(value)}
            >
              {title}
            </Button>
          ))}
        </div>
      )}
      {view === "browse" && (
        <form
          className="space-y-3 border-b border-border pb-5"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters(draft);
          }}
        >
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search projects</span>
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                className="h-11 rounded-md pl-9"
                placeholder="Search projects"
                value={draft.query ?? ""}
                onChange={(e) => setDraft({ ...draft, query: e.target.value })}
              />
            </label>
            <Button type="submit" className="min-h-11 rounded-md">
              Search
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={showFilters}
              aria-controls="project-filters"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              {[
                label(filters.status || "RECRUITING"),
                filters.workplaceType && label(filters.workplaceType),
                filters.location,
                filters.maxCommitmentHours &&
                  `Up to ${filters.maxCommitmentHours} hrs/week`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft({ status: "RECRUITING" });
                setFilters({ status: "RECRUITING" });
              }}
            >
              Reset
            </Button>
          </div>
          {showFilters && (
            <div
              id="project-filters"
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <label className="space-y-1 text-xs">
                <span>Status</span>
                <select
                  className={selectClass}
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as ProjectFilters["status"],
                    })
                  }
                >
                  {["RECRUITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(
                    (value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="space-y-1 text-xs">
                <span>Workplace</span>
                <select
                  className={selectClass}
                  value={draft.workplaceType ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      workplaceType: e.target
                        .value as ProjectFilters["workplaceType"],
                    })
                  }
                >
                  <option value="">Any workplace</option>
                  {["REMOTE", "HYBRID", "ON_SITE"].map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs">
                <span>Location</span>
                <Input
                  className="h-10"
                  placeholder="Anywhere"
                  value={draft.location ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value })
                  }
                />
              </label>
              <label className="space-y-1 text-xs">
                <span>Maximum hours / week</span>
                <Input
                  className="h-10"
                  type="number"
                  min="1"
                  placeholder="Any commitment"
                  value={draft.maxCommitmentHours ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, maxCommitmentHours: e.target.value })
                  }
                />
              </label>
            </div>
          )}
        </form>
      )}
      {view === "mine" && mineTab === "joined" ? (
        memberships.isPending ? (
          <LoadingState />
        ) : memberships.error ? (
          <ErrorState
            error={memberships.error}
            retry={() => memberships.refetch()}
          />
        ) : memberships.data?.some((member) => member.status === "ACTIVE") ? (
          <div className="grid gap-4 md:grid-cols-2">
            {memberships.data
              .filter((member) => member.status === "ACTIVE")
              .map((member) => (
                <article
                  key={member.id}
                  className="min-w-0 rounded-lg border border-border bg-background transition-colors hover:border-foreground/30"
                >
                  <div className="space-y-4 p-5">
                    <h2 className="break-words text-lg font-semibold">
                      <Link
                        className="hover:underline"
                        href={`/collaborators/projects/${member.projectId}`}
                      >
                        {member.projectTitle}
                      </Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {member.roleTitle || "Team member"}
                    </p>
                    <Button asChild size="sm" className="min-h-11 rounded-md">
                      <Link
                        href={`/collaborators/projects/${member.projectId}`}
                      >
                        Open project
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <EmptyState
            title="No joined projects"
            description="Find a project and request to join its team."
          >
            <Button asChild>
              <Link href="/collaborators/explore">Explore projects</Link>
            </Button>
          </EmptyState>
        )
      ) : projects.isPending ? (
        <LoadingState />
      ) : projects.error instanceof CollaborationError &&
        projects.error.status === 409 &&
        view === "for-me" ? (
        <MatchingPrompt />
      ) : projects.error ? (
        <ErrorState error={projects.error} retry={() => projects.refetch()} />
      ) : projects.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            view === "mine"
              ? "No projects created"
              : view === "for-me"
                ? "No matches yet"
                : "No projects found"
          }
          description={
            view === "mine"
              ? "Create a project and invite your first teammate."
              : view === "for-me"
                ? "Explore projects while new matches become available."
                : "Try another search or start a project."
          }
        >
          {view === "browse" && (
            <Button
              variant="outline"
              onClick={() => {
                setDraft({ status: "RECRUITING" });
                setFilters({ status: "RECRUITING" });
              }}
            >
              Reset filters
            </Button>
          )}
          <Button asChild>
            <Link
              href={
                view === "for-me"
                  ? "/collaborators/explore"
                  : "/collaborators/projects/new"
              }
            >
              {view === "for-me" ? "Explore projects" : "Create project"}
            </Link>
          </Button>
        </EmptyState>
      )}
    </div>
  );
}
