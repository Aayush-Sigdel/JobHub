"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { FieldHint } from "@/components/ui/tooltip";
import { getCandidateProfile } from "@/lib/actions/collaboration";
import {
  unwrap,
  useCollaborationIdentity,
} from "@/lib/hooks/use-collaboration";
import { membershipAcceptanceIssue } from "@/lib/collaboration";
import type {
  CandidateSuggestion,
  Membership,
  Project,
} from "@/types/api/collaboration";
import { ErrorState, LoadingState, StatusBadge, label } from "./shared";

export function CandidateDetails({
  person,
  project,
  roleId,
  roleTitle,
  membership,
  onClose,
  onInvite,
}: {
  person: CandidateSuggestion;
  project: Project;
  roleId: string | null;
  roleTitle: string;
  membership?: Membership;
  onClose: () => void;
  onInvite: () => void;
}) {
  const { userId, enabled } = useCollaborationIdentity();
  const profile = useQuery({
    queryKey: ["collaboration", userId, "candidate-profile", person.userId],
    queryFn: () => unwrap(getCandidateProfile(person.userId)),
    enabled: enabled && !!project.isOwner,
    staleTime: 60_000,
    retry: false,
  });
  const details = profile.data;
  const skills = details?.skills ?? person.skills;
  const issue = membershipAcceptanceIssue(project, { roleId });
  if (!project.isOwner) return null;
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex h-dvh w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border p-5 pr-12 text-left">
          <SheetTitle>{details?.name || person.name}</SheetTitle>
          <SheetDescription>
            {roleTitle} · {project.title}
          </SheetDescription>
          {(details?.title || person.title) && (
            <p className="text-sm">{details?.title || person.title}</p>
          )}
          {(details?.location || person.location) && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              {details?.location || person.location}
            </p>
          )}
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          <section className="space-y-3" aria-label="Role match">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold">{person.matchPercentage}% match</h3>
              <FieldHint
                label="About this match"
                content="The score reflects role skills and what your current team needs. It is not a hiring assessment."
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {person.explanation.summary}
            </p>
            {!!person.explanation.coveredSkills.length && (
              <p className="text-sm">
                <span className="font-medium">Matched skills: </span>
                {person.explanation.coveredSkills.join(", ")}
              </p>
            )}
            {!!person.explanation.missingSkills.length && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Missing skills: </span>
                {person.explanation.missingSkills.join(", ")}
              </p>
            )}
          </section>
          <section className="space-y-2">
            <h3 className="font-semibold">About</h3>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {details?.bio || person.bio || "No bio added."}
            </p>
          </section>
          <section className="space-y-3">
            <h3 className="font-semibold">Skills</h3>
            {skills.length ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="rounded-md border border-border px-2.5 py-1 text-xs"
                  >
                    {skill.name}
                    {skill.level ? ` · ${label(skill.level)}` : ""}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No skills added.</p>
            )}
          </section>
          {profile.isPending ? (
            <LoadingState />
          ) : profile.error ? (
            <ErrorState error={profile.error} retry={() => profile.refetch()} />
          ) : (
            details && (
              <>
                <section className="space-y-3">
                  <h3 className="font-semibold">Experience</h3>
                  {details.experiences?.length ? (
                    <div className="space-y-4">
                      {details.experiences.map((experience) => (
                        <article key={experience.id} className="space-y-1">
                          <h4 className="text-sm font-medium">
                            {experience.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {experience.company}
                            {(experience.isCurrentRole ||
                              experience.currentRole) &&
                              " · Current"}
                          </p>
                          {experience.description && (
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                              {experience.description}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No experience added.
                    </p>
                  )}
                </section>
                <section className="space-y-3">
                  <h3 className="font-semibold">Education</h3>
                  {details.educations?.length ? (
                    <div className="space-y-4">
                      {details.educations.map((education) => (
                        <article key={education.id} className="space-y-1">
                          <h4 className="text-sm font-medium">
                            {education.institution}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {[education.degree, education.fieldOfStudy]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No education added.
                    </p>
                  )}
                </section>
              </>
            )
          )}
        </div>
        <div className="space-y-2 border-t border-border bg-background p-5">
          {issue && !membership && (
            <p className="text-sm text-muted-foreground">{issue}</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="outline">
              <Link
                href={`/preview/${person.userId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Full profile
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </Button>
            {membership ? (
              <StatusBadge status={membership.status} />
            ) : (
              <Button disabled={!!issue} onClick={onInvite}>
                Invite as {roleTitle}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
