"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, Search, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProjects } from "@/lib/actions/collaboration";
import { syncAllEmbeddingsAction } from "@/lib/actions/embeddings";
import {
  CollaborationError,
  unwrap,
  useCollaborationIdentity,
  useRefreshCollaboration,
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

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={`${panelClass} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground">
          {label(project.workplaceType)}
          {project.location ? ` · ${project.location}` : ""}
        </span>
      </div>
      <div>
        <h2 className="text-lg font-bold">
          <Link
            className="hover:underline"
            href={`/collaborators/projects/${project.id}${project.bestRoleId ? `?role=${encodeURIComponent(project.bestRoleId)}` : ""}`}
          >
            {project.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {project.roles?.map((role) => (
          <span
            key={role.id}
            className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs"
          >
            {role.title}
          </span>
        ))}
      </div>
      {project.explanation && <Explanation explanation={project.explanation} />}
      {project.bestRoleId && (
        <p className="text-xs font-medium">
          Your best role:{" "}
          {project.bestRoleTitle ||
            project.roles?.find((role) => role.id === project.bestRoleId)
              ?.title ||
            "View suggested role"}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5" />
          {project.activeMemberCount ?? 1}/{project.teamSize} people
        </span>
        {project.commitmentHoursPerWeek != null && (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {project.commitmentHoursPerWeek} hrs/week
          </span>
        )}
        {!!project.pendingCount && (
          <span className="font-semibold text-foreground">
            {project.pendingCount} pending
          </span>
        )}
        <Button asChild variant="outline" size="sm" className="ml-auto">
          <Link
            href={`/collaborators/projects/${project.id}${project.bestRoleId ? `?role=${encodeURIComponent(project.bestRoleId)}` : ""}`}
          >
            View project
            <ArrowRight className="size-3" />
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
      <h2 className="font-semibold">
        Prepare your profile for project matching
      </h2>
      <p className="max-w-xl text-sm text-muted-foreground">
        Refresh your matching data to find teams that need your skills. Keep the
        skills and experience on your profile up to date.
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
          {busy ? "Refreshing profile…" : "Refresh matching data"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/candidate-profile">Review profile</Link>
        </Button>
      </div>
    </div>
  );
}

export function ProjectList({ view }: { view: "browse" | "mine" | "for-me" }) {
  const [draft, setDraft] = useState<ProjectFilters>({ status: "RECRUITING" });
  const [filters, setFilters] = useState<ProjectFilters>({
    status: "RECRUITING",
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
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });
  return (
    <div className="space-y-5">
      {view === "browse" && (
        <form
          className={`${panelClass} space-y-4`}
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
                className="h-10 pl-9"
                placeholder="Search project titles, descriptions, or goals"
                value={draft.query ?? ""}
                onChange={(e) => setDraft({ ...draft, query: e.target.value })}
              />
            </label>
            <Button type="submit" className="h-10">
              Search
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        </form>
      )}
      {view === "for-me" && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-4" />
            Be the missing piece
          </div>
          <p className="mt-1 text-muted-foreground">
            Projects ranked by the skills you add to their current team. Your
            best role is selected when you ask to join.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Want teams to find you?{" "}
            <Link
              href="/candidate-profile#collaboration-visibility"
              className="font-medium text-foreground underline underline-offset-2"
            >
              Enable profile visibility
            </Link>{" "}
            and refresh your matching data from your profile.
          </p>
        </div>
      )}
      {projects.isPending ? (
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
          title={view === "mine" ? "Give your idea a team" : "No projects yet"}
          description={
            view === "browse"
              ? "Try different filters or create a project of your own."
              : view === "mine"
                ? "Create your first project and find people whose skills complement yours."
                : "No matching projects right now. Explore open projects or check back as teams change."
          }
        />
      )}
    </div>
  );
}
