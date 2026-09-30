import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { label } from "./shared";

export function CandidateSkills({
  skills,
  matched = [],
  limit,
}: {
  skills: { name: string; level?: string }[];
  matched?: string[];
  limit?: number;
}) {
  const matchedNames = new Set(matched.map((name) => name.toLowerCase()));
  const visible = limit ? skills.slice(0, limit) : skills;
  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {visible.map((skill) => {
        const isMatch = matchedNames.has(skill.name.toLowerCase());
        return (
          <span
            key={skill.name}
            className={cn(
              "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs leading-snug",
              isMatch
                ? "border-primary/25 bg-primary/10 text-foreground"
                : "border-border/70 bg-muted/40 text-muted-foreground",
            )}
          >
            {isMatch && (
              <Check className="size-3 shrink-0" aria-hidden="true" />
            )}
            <span className="min-w-0 break-words">
              {skill.name}
              {isMatch && <span className="sr-only"> (matched skill)</span>}
              {skill.level && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {label(skill.level)}
                </span>
              )}
            </span>
          </span>
        );
      })}
      {skills.length > visible.length && (
        <span className="self-center px-1 text-xs text-muted-foreground">
          +{skills.length - visible.length} more
        </span>
      )}
    </div>
  );
}

export function CandidateMatch({ percentage }: { percentage: number }) {
  return (
    <div
      className="shrink-0 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-center"
      aria-label={`${percentage}% role match`}
    >
      <p className="text-2xl font-semibold leading-none tracking-tight tabular-nums">
        {percentage}
        <span className="ml-0.5 text-sm">%</span>
      </p>
      <p className="mt-1 text-[10px] font-medium text-muted-foreground">
        Role match
      </p>
    </div>
  );
}

export function CandidateListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Finding recommended candidates"
      className="space-y-4"
    >
      <span className="sr-only">Finding recommended candidates…</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          aria-hidden="true"
          className="space-y-5 rounded-xl border border-border bg-card p-5 motion-safe:animate-pulse sm:p-6"
        >
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-2.5 w-40 max-w-full rounded bg-muted" />
            </div>
            <div className="h-14 w-16 rounded-lg bg-muted" />
          </div>
          <div className="h-3 w-4/5 rounded bg-muted" />
          <div className="h-8 w-2/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
