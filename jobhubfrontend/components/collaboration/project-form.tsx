"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isRoleFilled, validateProject } from "@/lib/collaboration";
import { saveProject } from "@/lib/actions/collaboration";
import {
  CollaborationError,
  unwrap,
  useRefreshCollaboration,
} from "@/lib/hooks/use-collaboration";
import type {
  Project,
  ProjectInput,
  SkillLevel,
  WorkplaceType,
} from "@/types/api/collaboration";
import { label, panelClass, selectClass } from "./shared";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const refresh = useRefreshCollaboration();
  const [input, setInput] = useState<ProjectInput>(() =>
    project
      ? {
          title: project.title,
          description: project.description,
          goals: project.goals || "",
          durationWeeks: project.durationWeeks ?? undefined,
          teamSize: project.teamSize,
          workplaceType: project.workplaceType,
          location: project.location || "",
          commitmentHoursPerWeek: project.commitmentHoursPerWeek ?? undefined,
          roles: project.roles.map((role) => ({
            id: role.id,
            title: role.title,
            description: role.description ?? "",
            requiredSkills: role.requiredSkills,
          })),
        }
      : {
          title: "",
          description: "",
          teamSize: 3,
          workplaceType: "REMOTE",
          location: "",
          commitmentHoursPerWeek: 10,
          roles: [{ title: "", requiredSkills: [] }],
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  function updateRole(
    index: number,
    change: Partial<ProjectInput["roles"][number]>,
  ) {
    setInput((current) => ({
      ...current,
      roles: current.roles.map((role, i) =>
        i === index ? { ...role, ...change } : role,
      ),
    }));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleaned = {
      ...input,
      title: input.title.trim(),
      description: input.description.trim(),
      goals: input.goals?.trim(),
      location: input.location?.trim(),
      roles: input.roles.map((role) => ({
        ...role,
        title: role.title.trim(),
        requiredSkills: role.requiredSkills.map((skill) => ({
          ...skill,
          name: skill.name.trim(),
        })),
      })),
    };
    const validation = validateProject(cleaned, project);
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError("");
    setUnavailable(false);
    try {
      const saved = await unwrap(saveProject(cleaned, project?.id));
      await refresh();
      router.push(`/collaborators/projects/${saved.id || project?.id}`);
    } catch (e) {
      setError((e as Error).message);
      setUnavailable(e instanceof CollaborationError && e.status === 503);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <Link
        href={
          project
            ? `/collaborators/projects/${project.id}`
            : "/collaborators/explore"
        }
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to {project ? "project" : "collaboration"}
      </Link>
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {project ? "Edit project" : "Create project"}
        </h1>
      </header>
      <form onSubmit={submit} className="space-y-5">
        <fieldset disabled={busy} className="space-y-5">
          <section className={`${panelClass} space-y-5`}>
            <h2 className="font-semibold">Project details</h2>
            <label className="block space-y-2 text-sm">
              <span>Project title</span>
              <Input
                required
                value={input.title}
                onChange={(e) => setInput({ ...input, title: e.target.value })}
                placeholder="What do you want to build?"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span>Description</span>
              <Textarea
                required
                rows={5}
                value={input.description}
                onChange={(e) =>
                  setInput({ ...input, description: e.target.value })
                }
                placeholder="What are you building?"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span>Goals (optional)</span>
              <Textarea
                rows={3}
                value={input.goals ?? ""}
                onChange={(event) =>
                  setInput({ ...input, goals: event.target.value })
                }
                placeholder="What would you like the team to achieve?"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span>Team size, including you</span>
                <Input
                  type="number"
                  min={Math.max(
                    2,
                    input.roles.length + 1,
                    project?.activeMemberCount ?? 1,
                  )}
                  step="1"
                  max={20}
                  required
                  value={input.teamSize || ""}
                  onChange={(e) =>
                    setInput({ ...input, teamSize: Number(e.target.value) })
                  }
                />
                <span className="block text-xs text-muted-foreground">
                  You occupy one seat. {Math.max(0, input.teamSize - 1)}{" "}
                  teammate seats.
                </span>
              </label>
              <label className="space-y-2 text-sm">
                <span>Hours per week (optional)</span>
                <Input
                  type="number"
                  min="1"
                  max={80}
                  step={1}
                  value={input.commitmentHoursPerWeek ?? ""}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      commitmentHoursPerWeek: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Duration in weeks (optional)</span>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={input.durationWeeks ?? ""}
                  onChange={(event) =>
                    setInput({
                      ...input,
                      durationWeeks: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Workplace</span>
                <select
                  className={selectClass}
                  value={input.workplaceType}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      workplaceType: e.target.value as WorkplaceType,
                    })
                  }
                >
                  {["REMOTE", "HYBRID", "ON_SITE"].map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span>Location (optional)</span>
                <Input
                  value={input.location}
                  onChange={(e) =>
                    setInput({ ...input, location: e.target.value })
                  }
                  placeholder="e.g. Kathmandu"
                />
              </label>
            </div>
          </section>
          <section className={`${panelClass} space-y-5`}>
            <div>
              <h2 className="font-semibold">Open roles</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Add up to {Math.max(0, input.teamSize - 1)} roles for teammates.
              </p>
            </div>
            {input.roles.map((role, index) => {
              const filled =
                project &&
                project.roles.some(
                  (original) =>
                    original.id === role.id && isRoleFilled(original, project),
                );
              return (
                <fieldset
                  key={role.id || index}
                  className="space-y-4 rounded-xl border border-border p-4"
                >
                  <legend className="px-1 text-xs font-semibold">
                    Role {index + 1}
                    {filled ? " · Filled" : ""}
                  </legend>
                  <div className="flex items-end gap-3">
                    <label className="flex-1 space-y-2 text-sm">
                      <span>Role title</span>
                      <Input
                        required
                        readOnly={!!filled}
                        title={
                          filled
                            ? "Filled roles must keep their title"
                            : undefined
                        }
                        value={role.title}
                        onChange={(e) =>
                          updateRole(index, { title: e.target.value })
                        }
                        placeholder="e.g. Flutter developer"
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!!filled || input.roles.length <= 1}
                      aria-label={`Remove role ${index + 1}`}
                      title={
                        filled
                          ? "Filled roles must stay on the project"
                          : "Remove role"
                      }
                      onClick={() =>
                        setInput({
                          ...input,
                          roles: input.roles.filter((_, i) => i !== index),
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <label className="block space-y-2 text-sm">
                    <span>Role description (optional)</span>
                    <Textarea
                      rows={2}
                      value={role.description || ""}
                      onChange={(e) =>
                        updateRole(index, { description: e.target.value })
                      }
                    />
                  </label>
                  {role.requiredSkills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <label className="min-w-28 flex-1 space-y-1 text-xs">
                        <span>Required skill</span>
                        <Input
                          required
                          value={skill.name}
                          onChange={(e) =>
                            updateRole(index, {
                              requiredSkills: role.requiredSkills.map(
                                (item, i) =>
                                  i === skillIndex
                                    ? { ...item, name: e.target.value }
                                    : item,
                              ),
                            })
                          }
                          placeholder="e.g. Flutter"
                        />
                      </label>
                      <label className="min-w-32 flex-1 space-y-1 text-xs">
                        <span>Minimum level</span>
                        <select
                          className={selectClass}
                          value={skill.minLevel}
                          onChange={(e) =>
                            updateRole(index, {
                              requiredSkills: role.requiredSkills.map(
                                (item, i) =>
                                  i === skillIndex
                                    ? {
                                        ...item,
                                        minLevel: e.target.value as SkillLevel,
                                      }
                                    : item,
                              ),
                            })
                          }
                        >
                          {["BEGINNER", "INTERMEDIATE", "EXPERT"].map(
                            (level) => (
                              <option key={level} value={level}>
                                {label(level)}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove skill ${skillIndex + 1} from role ${index + 1}`}
                        onClick={() =>
                          updateRole(index, {
                            requiredSkills: role.requiredSkills.filter(
                              (_, i) => i !== skillIndex,
                            ),
                          })
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateRole(index, {
                        requiredSkills: [
                          ...role.requiredSkills,
                          { name: "", minLevel: "INTERMEDIATE" },
                        ],
                      })
                    }
                  >
                    <Plus className="size-3" />
                    Add required skill
                  </Button>
                </fieldset>
              );
            })}
            <Button
              type="button"
              variant="outline"
              disabled={input.roles.length >= input.teamSize - 1}
              onClick={() =>
                setInput({
                  ...input,
                  roles: [...input.roles, { title: "", requiredSkills: [] }],
                })
              }
            >
              <Plus className="size-4" />
              Add role
            </Button>
          </section>
        </fieldset>
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 p-4 text-sm"
          >
            <p className="text-destructive">{error}</p>
            {unavailable && (
              <p className="mt-2 text-muted-foreground">
                The matching service is temporarily unavailable. Your entries
                are still here; retry when the service is ready.
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link
              href={
                project
                  ? `/collaborators/projects/${project.id}`
                  : "/collaborators/explore"
              }
            >
              Cancel
            </Link>
          </Button>
          <Button disabled={busy} type="submit">
            {busy && <Loader2 className="size-4 animate-spin" />}
            {unavailable
              ? "Retry saving project"
              : project
                ? "Save changes"
                : "Create project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
