"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BriefcaseBusiness,
  FolderKanban,
  MapPin,
  Clock,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { workspaceTabClass, WorkspaceLoading } from "./workspace-ui";
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
  panelClass,
  StatusBadge,
} from "./shared";
import { toast } from "sonner";
import { isRoleFilled, projectTeam } from "@/lib/collaboration";
import { ProjectMarkdown } from "./project-markdown";

function ProjectCard({ project }: { project: Project }) {
  const viewer = useCollaborationIdentity();
  const owner = projectTeam(project, viewer)[0];
  const isOwner = project.ownerId === viewer.userId;
  const roles =
    project.roles?.filter((role) => !isRoleFilled(role, project)) ?? [];
  const projectHref = `/collaborators/projects/${project.id}${project.bestRoleId ? `?role=${encodeURIComponent(project.bestRoleId)}` : ""}`;
  return (
    <article className="group/project flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-sm focus-within:border-foreground/30 motion-reduce:transition-none">
      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-background">
            <FolderKanban
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
          <StatusBadge status={project.status} />
        </div>
        <div className="min-w-0 space-y-3">
          <h2 className="break-words text-xl font-semibold leading-snug tracking-tight">
            <Link
              className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              href={projectHref}
            >
              {project.title}
            </Link>
          </h2>
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="size-6">
              <AvatarImage src={owner.imageUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-[10px]">
                {owner.name
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {owner.name}
              {isOwner ? " · Your project" : " · Owner"}
            </span>
          </div>
          <ProjectMarkdown summary>{project.description}</ProjectMarkdown>
        </div>
        {roles.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground">
              Looking for
            </p>
            <div className="flex flex-wrap gap-1.5">
              {roles.slice(0, 3).map((role) => (
                <span
                  key={role.id}
                  className="max-w-full break-words rounded-md border border-border/70 bg-muted/40 px-2.5 py-1.5 text-xs"
                >
                  {role.title}
                </span>
              ))}
              {roles.length > 3 && (
                <span className="self-center text-xs text-muted-foreground">
                  +{roles.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        {project.bestRoleId && (
          <p className="flex items-start gap-2 text-xs font-medium">
            <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              Suggested role:{" "}
              {project.bestRoleTitle ||
                project.roles?.find((role) => role.id === project.bestRoleId)
                  ?.title ||
                "View suggested role"}
            </span>
          </p>
        )}
        {project.explanation && (
          <Explanation explanation={project.explanation} />
        )}
        <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-start gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="break-words">
              {label(project.workplaceType)}
              {project.location ? ` · ${project.location}` : ""}
            </span>
          </span>
          <span className="inline-flex items-start gap-1.5">
            <Users className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {isOwner
                ? `${project.activeMemberCount} / ${project.teamSize} members`
                : project.status !== "RECRUITING"
                  ? "Recruitment closed"
                  : `${project.openSeats ?? Math.max(0, project.teamSize - project.activeMemberCount)} open seats`}
            </span>
          </span>
          {project.commitmentHoursPerWeek != null && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {project.commitmentHoursPerWeek} hrs/week
            </span>
          )}
          {project.durationWeeks != null && (
            <span>{project.durationWeeks} weeks</span>
          )}
        </div>
      </div>
      <div className="space-y-3 border-t border-border/70 bg-muted/20 px-5 py-4 sm:px-6">
        {isOwner && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <Link
              href={`/collaborators/projects/${project.id}?section=requests`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              Requests
              {!!project.pendingCount && (
                <span className="rounded bg-primary/15 px-1.5 py-0.5 text-foreground">
                  {project.pendingCount} pending
                </span>
              )}
            </Link>
            {project.status === "RECRUITING" &&
              project.activeMemberCount < project.teamSize && (
                <Link
                  href={`/collaborators/projects/${project.id}?section=suggestions`}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
                >
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Recommended candidates
                </Link>
              )}
          </div>
        )}
        <Button
          asChild
          variant={isOwner ? "default" : "outline"}
          className="h-11 w-full justify-between rounded-lg px-4"
        >
          <Link href={projectHref}>
            {isOwner ? "Manage project" : "View project"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
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
  layout = "cards",
  initialMineTab = "owned",
}: {
  view: "browse" | "mine" | "for-me";
  initialQuery?: string;
  layout?: "cards" | "feed";
  initialMineTab?: "owned" | "joined";
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [mineTab, setMineTab] = useState(initialMineTab);
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
    <div className="min-w-0 space-y-6">
      {view !== "mine" ? (
        <nav
          aria-label="Project discovery"
          className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-border bg-card p-1"
        >
          <Button
            asChild
            className={workspaceTabClass}
            variant={view === "browse" ? "secondary" : "ghost"}
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
            className={workspaceTabClass}
            variant={view === "for-me" ? "secondary" : "ghost"}
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
        <div
          role="group"
          aria-label="Your projects"
          className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-border bg-card p-1"
        >
          {[
            ["owned", "Created by me"],
            ["joined", "Joined"],
          ].map(([value, title]) => (
            <Button
              key={value}
              aria-pressed={mineTab === value}
              className={workspaceTabClass}
              variant={mineTab === value ? "secondary" : "ghost"}
              onClick={() =>
                setMineTab(value === "joined" ? "joined" : "owned")
              }
            >
              {title}
            </Button>
          ))}
        </div>
      )}
      {view === "browse" && (
        <form
          className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters(draft);
          }}
        >
          <div className="flex gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search projects</span>
              <Search className="pointer-events-none absolute left-3.5 top-4 size-4 text-muted-foreground" />
              <Input
                className="h-12 rounded-lg border-border bg-background pl-10"
                placeholder="Search projects by name or idea"
                value={draft.query ?? ""}
                onChange={(e) => setDraft({ ...draft, query: e.target.value })}
              />
            </label>
            <Button type="submit" className="h-12 rounded-lg px-5">
              Search
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 rounded-lg"
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
              className="ml-auto min-h-11 rounded-lg text-xs text-muted-foreground"
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
              className="space-y-5 border-t border-border pt-5"
            >
              <div className="grid gap-5 lg:grid-cols-2">
                <fieldset className="min-w-0 space-y-2.5">
                  <legend className="text-xs font-medium text-muted-foreground">
                    Project status
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "RECRUITING",
                        "IN_PROGRESS",
                        "COMPLETED",
                        "CANCELLED",
                      ] as const
                    ).map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={draft.status === value}
                        onClick={() => setDraft({ ...draft, status: value })}
                        className={cn(
                          "min-h-11 rounded-lg border px-3 text-xs transition-colors",
                          draft.status === value
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/30",
                        )}
                      >
                        {label(value)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="min-w-0 space-y-2.5">
                  <legend className="text-xs font-medium text-muted-foreground">
                    Workplace
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {(["", "REMOTE", "HYBRID", "ON_SITE"] as const).map(
                      (value) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={(draft.workplaceType ?? "") === value}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              workplaceType: value || undefined,
                            })
                          }
                          className={cn(
                            "min-h-11 rounded-lg border px-3 text-xs transition-colors",
                            (draft.workplaceType ?? "") === value
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30",
                          )}
                        >
                          {value ? label(value) : "Any workplace"}
                        </button>
                      ),
                    )}
                  </div>
                </fieldset>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-xs font-medium text-muted-foreground">
                  <span>Location</span>
                  <Input
                    className="h-11 rounded-lg border-border bg-background text-foreground"
                    placeholder="City or region"
                    value={draft.location ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, location: e.target.value })
                    }
                  />
                </label>
                <label className="block space-y-2 text-xs font-medium text-muted-foreground">
                  <span>Maximum hours / week</span>
                  <Input
                    className="h-11 rounded-lg border-border bg-background text-foreground"
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Apply your choices to update the projects below.
                </p>
                <Button type="submit" className="h-11 rounded-lg px-4">
                  Apply filters
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
      <div
        className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <p>
          {view === "mine" && mineTab === "joined"
            ? memberships.isPending
              ? "Loading your teams…"
              : memberships.error
                ? "Could not load your teams"
                : `${memberships.data?.filter((member) => member.status === "ACTIVE").length ?? 0} joined projects`
            : projects.isPending
              ? "Finding projects…"
              : projects.error
                ? "Could not load projects"
                : `${projects.data?.length ?? 0} ${view === "mine" ? "projects created" : "projects to explore"}`}
        </p>
        <span>
          {view === "mine"
            ? mineTab === "joined"
              ? "Your active memberships"
              : "Your ideas, your teams"
            : view === "for-me"
              ? "Matched to your profile"
              : "Find your next team"}
        </span>
      </div>
      {view === "mine" && mineTab === "joined" ? (
        memberships.isPending ? (
          <WorkspaceLoading cards={layout === "cards"} />
        ) : memberships.error ? (
          <ErrorState
            error={memberships.error}
            retry={() => memberships.refetch()}
          />
        ) : memberships.data?.some((member) => member.status === "ACTIVE") ? (
          <div
            className={cn("grid gap-5", layout === "cards" && "md:grid-cols-2")}
          >
            {memberships.data
              .filter((member) => member.status === "ACTIVE")
              .map((member) => (
                <article
                  key={member.id}
                  className="min-w-0 rounded-xl border border-border bg-card transition-colors hover:border-foreground/20"
                >
                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                        <FolderKanban
                          className="size-5 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </span>
                      <StatusBadge status="ACTIVE" />
                    </div>
                    <h2 className="break-words text-xl font-semibold tracking-tight">
                      <Link
                        className="hover:underline"
                        href={`/collaborators/projects/${member.projectId}`}
                      >
                        {member.projectTitle}
                      </Link>
                    </h2>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BriefcaseBusiness
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {member.roleTitle || "Team member"}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 w-full justify-between rounded-lg"
                    >
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
        <WorkspaceLoading cards={layout === "cards"} />
      ) : projects.error instanceof CollaborationError &&
        projects.error.status === 409 &&
        view === "for-me" ? (
        <MatchingPrompt />
      ) : projects.error ? (
        <ErrorState error={projects.error} retry={() => projects.refetch()} />
      ) : projects.data?.length ? (
        <div
          className={cn("grid gap-5", layout === "cards" && "md:grid-cols-2")}
        >
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
