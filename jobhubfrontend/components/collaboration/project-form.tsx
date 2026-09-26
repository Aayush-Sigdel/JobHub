"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkdownEditor from "@/components/post-job/MarkdownEditor";
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
import { Hint, FieldHint } from "@/components/ui/tooltip";
import { label, selectClass } from "./shared";

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
      router.push(
        `/collaborators/projects/${saved.id || project?.id}${project ? "" : "?section=suggestions"}`,
      );
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
        className="inline-flex min-h-11 items-center gap-2 rounded text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to {project ? "project" : "collaboration"}
      </Link>
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {project ? "Edit project" : "Create project"}
        </h1>
      </header>
      <form
        onSubmit={submit}
        className="space-y-6 [&_input]:h-11 [&_input]:rounded-md"
      >
        <fieldset disabled={busy} className="min-w-0 space-y-8">
          <section className="min-w-0 space-y-5 border-t border-border pt-6">
            <h2 className="flex items-center gap-3 text-base font-semibold">
              <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <FileText aria-hidden="true" className="size-4" />
              </span>
              Project details
            </h2>
            <label className="block space-y-2 text-sm">
              <span>Project title</span>
              <Input
                required
                value={input.title}
                onChange={(e) => setInput({ ...input, title: e.target.value })}
                placeholder="What do you want to build?"
              />
            </label>
            <div className="space-y-2 text-sm">
              <label htmlFor="project-description" className="font-medium">
                Description
              </label>
              <MarkdownEditor
                id="project-description"
                label="Project description"
                required
                disabled={busy}
                value={input.description}
                onChange={(description) =>
                  setInput((current) => ({ ...current, description }))
                }
                placeholder="Describe what you are building and how teammates can contribute."
              />
            </div>
            <div className="space-y-2 text-sm">
              <label htmlFor="project-goals" className="font-medium">
                Goals (optional)
              </label>
              <MarkdownEditor
                id="project-goals"
                label="Project goals"
                height={180}
                disabled={busy}
                value={input.goals ?? ""}
                onChange={(goals) =>
                  setInput((current) => ({ ...current, goals }))
                }
                placeholder="What would you like the team to achieve?"
              />
            </div>
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
          <section className="min-w-0 space-y-5 border-t border-border pt-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="flex items-center gap-3 text-base font-semibold">
                  <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                    <Users aria-hidden="true" className="size-4" />
                  </span>
                  Open roles
                </h2>
                <FieldHint
                  label="About project roles"
                  content="Each role is one teammate seat. Required skills help find matches; filled role titles cannot be changed."
                />
              </div>
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
                  className="min-w-0 space-y-4 rounded-md border border-border p-4 sm:p-5"
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
                    <Hint
                      content={
                        filled
                          ? "Filled roles cannot be removed."
                          : input.roles.length <= 1
                            ? "Keep at least one role."
                            : "Remove this role"
                      }
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-disabled={!!filled || input.roles.length <= 1}
                        className="size-11 shrink-0 rounded-md aria-disabled:opacity-50"
                        aria-label={`Remove role ${index + 1}`}
                        onClick={() => {
                          if (filled || input.roles.length <= 1) return;
                          setInput({
                            ...input,
                            roles: input.roles.filter((_, i) => i !== index),
                          });
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </Hint>
                  </div>
                  <div className="space-y-2 text-sm">
                    <label
                      htmlFor={`project-role-description-${role.id || index}`}
                      className="font-medium"
                    >
                      Role description (optional)
                    </label>
                    <MarkdownEditor
                      id={`project-role-description-${role.id || index}`}
                      label={`Role ${index + 1} description`}
                      height={180}
                      disabled={busy}
                      value={role.description || ""}
                      onChange={(description) =>
                        updateRole(index, { description })
                      }
                      placeholder="Describe this teammate’s responsibilities."
                    />
                  </div>
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
                      <Hint content="Remove this skill">
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
                      </Hint>
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
        <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-border bg-background py-4">
          <Button asChild variant="outline" className="min-h-11 rounded-md">
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
          <Button
            disabled={busy}
            type="submit"
            className="min-h-11 rounded-md px-5"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {unavailable
              ? "Retry saving project"
              : project
                ? "Save changes"
                : "Create & find candidates"}
          </Button>
        </div>
      </form>
    </div>
  );
}
