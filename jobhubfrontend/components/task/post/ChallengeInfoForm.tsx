"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SkillLevel, TaskScope } from "@/types/api/tasks";
export type { TaskScope } from "@/types/api/tasks";

interface ChallengeInfoFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  skillLevel: SkillLevel;
  onSkillLevelChange: (level: SkillLevel) => void;
  scope: TaskScope;
  onScopeChange: (scope: TaskScope) => void;
  assessmentType?: "design" | "programming" | "sql";
  titleError?: string;
}

export default function ChallengeInfoForm({
  title,
  onTitleChange,
  skillLevel,
  onSkillLevelChange,
  scope,
  onScopeChange,
  assessmentType = "design",
  titleError,
}: ChallengeInfoFormProps) {
  const placeholders = {
    design: "e.g. Recreate a geometric layout",
    programming: "e.g. Find the longest sequence",
    sql: "e.g. Department headcount report",
  };
  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-base font-semibold">Task details</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="assessment-title">
            Title <span aria-hidden="true">*</span>
          </Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {title.length}/60
          </span>
        </div>
        <Input
          id="assessment-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={60}
          placeholder={placeholders[assessmentType]}
          className="h-11 rounded-lg"
          aria-required="true"
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? "assessment-title-error" : undefined}
        />
        {titleError && (
          <p id="assessment-title-error" className="text-xs text-destructive">
            {titleError}
          </p>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="assessment-level">Skill level</Label>
          <select
            id="assessment-level"
            value={skillLevel}
            onChange={(event) =>
              onSkillLevelChange(event.target.value as SkillLevel)
            }
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="assessment-scope">Visibility</Label>
          <select
            id="assessment-scope"
            value={scope}
            onChange={(event) => onScopeChange(event.target.value as TaskScope)}
            aria-describedby="assessment-scope-description"
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>
      </div>
      <p
        id="assessment-scope-description"
        className="text-xs leading-5 text-muted-foreground"
      >
        {scope === "PUBLIC"
          ? "Public assessments appear in the shared library and can be used by other employers."
          : "Private assessments are available for your own job applications."}
      </p>
    </section>
  );
}
