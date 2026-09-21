"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getProject, getProjects } from "@/lib/actions/collaboration";
import { unwrap, useCollaborationIdentity } from "@/lib/hooks/use-collaboration";
import { ProjectTeamTools } from "@/components/collaboration/project-detail";
import { EmptyState, ErrorState, LoadingState, panelClass, selectClass, label } from "@/components/collaboration/shared";

function ProjectPeople({ id }: { id: string }) {
  const { userId, enabled } = useCollaborationIdentity();
  const project = useQuery({
    queryKey: ["collaboration", userId, "project", id],
    queryFn: () => unwrap(getProject(id)),
    enabled,
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  if (project.isPending) return <LoadingState />;
  if (project.error) return <ErrorState error={project.error} retry={() => project.refetch()} />;
  if (!project.data?.isOwner) return <EmptyState title="Choose a project you own" description="Candidate suggestions are available to the project owner." />;
  return <ProjectTeamTools project={project.data} />;
}

export function CollaboratorDirectory() {
  const { userId, enabled } = useCollaborationIdentity();
  const [selectedId, setSelectedId] = useState("");
  const projects = useQuery({
    queryKey: ["collaboration", userId, "projects", "mine"],
    queryFn: () => unwrap(getProjects("mine")),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });
  if (projects.isPending) return <LoadingState />;
  if (projects.error) return <ErrorState error={projects.error} retry={() => projects.refetch()} />;
  if (!projects.data?.length) return (
    <div className="space-y-4">
      <EmptyState title="Find people for your project" description="Create a project and define the roles you need. We’ll find candidates whose skills complement your team, ready for you to invite." />
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild><Link href="/collaborators/projects/new">Create project</Link></Button>
        <Button asChild variant="outline"><Link href="/collaborators/for-you">Find a team to join</Link></Button>
      </div>
    </div>
  );
  const selected = projects.data.find(project => project.id === selectedId)
    ?? projects.data.find(project => project.status === "RECRUITING")
    ?? projects.data[0];
  return (
    <div className="space-y-5">
      <div className={`${panelClass} space-y-3`}>
        <label className="block space-y-2 text-sm">
          <span>Find people for</span>
          <select className={selectClass} value={selected.id} onChange={event => setSelectedId(event.target.value)}>
            {projects.data.map(project => <option key={project.id} value={project.id}>{project.title} · {label(project.status)}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Candidates are matched to your open roles and the skills your team needs.</p>
          <Button asChild variant="outline" size="sm"><Link href={`/collaborators/projects/${selected.id}`}>View project</Link></Button>
        </div>
      </div>
      <ProjectPeople key={selected.id} id={selected.id} />
    </div>
  );
}
