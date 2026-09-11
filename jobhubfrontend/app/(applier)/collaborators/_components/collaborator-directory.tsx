"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, RefreshCw, SearchX, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getCollaboratorsAction,
  type CollaboratorDirectoryResult,
} from "@/lib/actions/user";
import type { CollaboratorMatchResponse } from "@/types/api/user";

const initialResult: CollaboratorDirectoryResult = {
  collaborators: [],
  error: null,
};

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

function sourceLabel(source: CollaboratorMatchResponse["source"]) {
  const labels: Record<CollaboratorMatchResponse["source"], string> = {
    OVERALL: "Overall profile",
    PLATFORM: "JobHub profile",
    GITHUB: "GitHub",
    DEVTO: "Dev.to",
    STACKOVERFLOW: "Stack Overflow",
    ORCID: "ORCID",
  };
  return labels[source];
}

function DirectorySkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      aria-label="Loading collaborators"
    >
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="mt-5 h-3 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-muted" />
          <span className="sr-only">Loading collaborator</span>
        </div>
      ))}
    </div>
  );
}

function CollaboratorCard({
  collaborator,
}: {
  collaborator: CollaboratorMatchResponse;
}) {
  const displayedSkills = collaborator.skills.slice(0, 4);
  const additionalSkills = Math.max(
    collaborator.skills.length - displayedSkills.length,
    0,
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-foreground/20">
      <div className="flex items-start gap-3">
        <Avatar
          className="size-12"
          aria-label={`${collaborator.name}'s profile image`}
        >
          <AvatarImage src={collaborator.imageUrl} alt="" />
          <AvatarFallback className="font-semibold text-foreground">
            {initials(collaborator.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-foreground">
                {collaborator.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {collaborator.title || "Candidate collaborator"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold tabular-nums text-foreground">
                {collaborator.matchPercentage}%
              </p>
              <p className="text-[10px] text-muted-foreground">match</p>
            </div>
          </div>

          {collaborator.location && (
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{collaborator.location}</span>
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-relaxed text-foreground/75">
        {collaborator.bio ||
          "Open to connecting with candidates who share similar skills and interests."}
      </p>

      <div className="mt-4 flex min-h-6 flex-wrap gap-1.5">
        {displayedSkills.length ? (
          <>
            {displayedSkills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {skill.name}
              </span>
            ))}
            {additionalSkills > 0 && (
              <span className="px-1 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{additionalSkills} more
              </span>
            )}
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            No skills listed yet
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="truncate text-[11px] text-muted-foreground">
          Matched from {sourceLabel(collaborator.source)}
        </span>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 rounded-xl px-3 text-xs"
        >
          <Link href={`/preview/${collaborator.userId}`}>
            View profile <ArrowRight className="ml-1 size-3" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function CollaboratorDirectory() {
  const [result, setResult] = useState(initialResult);
  const [isLoading, setIsLoading] = useState(true);

  const retry = async () => {
    setIsLoading(true);
    const nextResult = await getCollaboratorsAction();
    setResult(nextResult);
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    void getCollaboratorsAction().then((nextResult) => {
      if (cancelled) return;
      setResult(nextResult);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) return <DirectorySkeleton />;

  if (result.error) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-muted">
          <SearchX
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Collaborators are unavailable
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {result.error}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void retry()}
          className="mt-5 rounded-xl"
        >
          <RefreshCw className="mr-2 size-4" /> Try again
        </Button>
      </div>
    );
  }

  if (!result.collaborators.length) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-muted">
          <Users className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          No collaborators found yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          New matches will appear here when discoverable candidates share enough
          profile evidence with you.
        </p>
        <Button asChild variant="outline" className="mt-5 rounded-xl">
          <Link href="/candidate-profile">Review your profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {result.collaborators.map((collaborator) => (
        <CollaboratorCard
          key={collaborator.userId}
          collaborator={collaborator}
        />
      ))}
    </div>
  );
}
