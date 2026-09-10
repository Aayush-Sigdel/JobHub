"use client";

import JobMarkdown from "@/components/jobs/JobMarkdown";
import { IconPhoto } from "@tabler/icons-react";
import type { SkillLevel, TaskScope } from "@/types/api/tasks";

interface CandidateLiveSimulationProps {
  imagePreviewUrl: string | null;
  title: string;
  skillLevel: SkillLevel;
  scope: TaskScope;
  minimumMatchingScore: number;
  instructions: string;
}

export default function CandidateLiveSimulation({
  imagePreviewUrl,
  title,
  skillLevel,
  scope,
  minimumMatchingScore,
  instructions,
}: CandidateLiveSimulationProps) {
  return (
    <section
      className="sticky top-6 overflow-hidden rounded-xl border border-border bg-card"
      aria-label="CSS assessment preview"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-medium">Candidate preview</h2>
        <span className="text-xs text-muted-foreground">CSS</span>
      </div>
      <div className="space-y-5 p-5">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted/30">
          {imagePreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreviewUrl}
              alt="Reference target candidates will recreate"
              className="h-full w-full bg-white object-contain"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center">
              <IconPhoto className="mb-1 size-7 text-muted-foreground" />
              <p className="text-sm font-medium">Your target goes here</p>
              <p className="max-w-56 text-xs leading-5 text-muted-foreground">
                Upload a reference or create one with HTML and CSS.
              </p>
            </div>
          )}
        </div>
        <div>
          <h3 className="break-words text-lg font-semibold">
            {title.trim() || "Untitled CSS assessment"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            400 × 300 px reference
          </p>
        </div>
        <dl className="space-y-3 border-y border-border py-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Skill level</dt>
            <dd className="capitalize">{skillLevel.toLowerCase()}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Visibility</dt>
            <dd className="capitalize">{scope.toLowerCase()}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Target accuracy</dt>
            <dd className="font-medium tabular-nums">
              {minimumMatchingScore}%
            </dd>
          </div>
        </dl>
        <div>
          <h3 className="text-sm font-medium">Instructions</h3>
          <div className="mt-2 max-h-64 overflow-auto">
            <JobMarkdown>
              {instructions.trim() ||
                "Candidate instructions will appear here."}
            </JobMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}
