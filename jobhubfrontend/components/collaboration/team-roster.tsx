"use client";

import type { Project } from "@/types/api/collaboration";
import { projectTeam } from "@/lib/collaboration";
import { useCollaborationIdentity } from "@/lib/hooks/use-collaboration";
import { Person } from "./shared";

export function TeamRoster({ project }: { project: Project }) {
  const viewer = useCollaborationIdentity();
  const team = projectTeam(project, viewer);
  return (
    <section
      aria-label="Project team"
      className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-semibold">Team</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {project.activeMemberCount} / {project.teamSize} members
        </span>
      </div>
      <div className="space-y-6">
        {team.map((person) => (
          <Person
            key={person.userId}
            person={{
              ...person,
              roleTitle:
                person.userId === project.ownerId
                  ? "Owner"
                  : person.roleTitle || "Team member",
            }}
            prominent
            isYou={person.userId === viewer.userId}
          />
        ))}
      </div>
      {project.activeMemberCount < project.teamSize && (
        <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
          {project.teamSize - project.activeMemberCount} open{" "}
          {project.teamSize - project.activeMemberCount === 1
            ? "seat"
            : "seats"}
        </p>
      )}
    </section>
  );
}
