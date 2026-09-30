"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  MapPin,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CandidateMatch, CandidateSkills } from "./candidate-ui";
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
import { ErrorState, LoadingState, StatusBadge } from "./shared";

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
      <SheetContent className="flex h-dvh w-full flex-col gap-0 p-0 sm:max-w-xl motion-reduce:animate-none [&>button]:flex [&>button]:size-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-lg">
        <SheetHeader className="border-b border-border bg-card px-6 pb-6 pt-8 text-left">
          <div className="mb-3 flex items-center gap-2 pr-8 text-xs text-muted-foreground">
            <BriefcaseBusiness
              className="size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">Candidate details</span>
          </div>
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={person.imageUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-foreground">
                {(details?.name || person.name || "?")
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="break-words text-2xl tracking-tight">
                {details?.name || person.name}
              </SheetTitle>
              {(details?.title || person.title) && (
                <p className="mt-1 break-words text-sm text-muted-foreground">
                  {details?.title || person.title}
                </p>
              )}
              {(details?.location || person.location) && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="break-words">
                    {details?.location || person.location}
                  </span>
                </p>
              )}
            </div>
          </div>
          <SheetDescription className="pt-3 text-xs leading-relaxed">
            Recommended for{" "}
            <span className="font-medium text-foreground">{roleTitle}</span> ·{" "}
            {project.title}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain p-6">
          <section
            className="space-y-4 rounded-xl border border-border bg-card p-4"
            aria-label="Role match"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold">
                    How they fit your team
                  </h3>
                  <FieldHint
                    label="About this match"
                    content="The score reflects role skills and what your current team needs. It is not a hiring assessment."
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on this role’s requirements
                </p>
              </div>
              <CandidateMatch percentage={person.matchPercentage} />
            </div>
            <p className="break-words text-sm leading-relaxed text-muted-foreground">
              {person.explanation.summary}
            </p>
            {!!person.explanation.coveredSkills.length && (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <Check className="size-3.5" aria-hidden="true" /> Matched
                  skills
                </p>
                <CandidateSkills
                  skills={person.explanation.coveredSkills.map((name) => ({
                    name,
                  }))}
                  matched={person.explanation.coveredSkills}
                />
              </div>
            )}
            {!!person.explanation.missingSkills.length && (
              <p className="break-words text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium">Skills to explore: </span>
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
              <CandidateSkills
                skills={skills}
                matched={person.explanation.coveredSkills}
              />
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
                    <div className="space-y-5 border-l border-border pl-4">
                      {details.experiences.map((experience) => (
                        <article
                          key={experience.id}
                          className="relative space-y-1 before:absolute before:-left-[21px] before:top-1.5 before:size-2 before:rounded-full before:border before:border-border before:bg-background"
                        >
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
                    <div className="space-y-5 border-l border-border pl-4">
                      {details.educations.map((education) => (
                        <article
                          key={education.id}
                          className="relative space-y-1 before:absolute before:-left-[21px] before:top-1.5 before:size-2 before:rounded-full before:border before:border-border before:bg-background"
                        >
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
        <div className="space-y-3 border-t border-border bg-card px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {issue && !membership && (
            <p className="text-sm text-muted-foreground">{issue}</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="outline" className="h-11 rounded-lg">
              <Link
                href={`/preview/${person.userId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Full profile{" "}
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </Button>
            {membership ? (
              <StatusBadge status={membership.status} />
            ) : (
              <Button
                className="h-11 rounded-lg px-4"
                disabled={!!issue}
                onClick={onInvite}
                aria-label={`Invite ${person.name} as ${roleTitle}`}
              >
                <UserPlus className="size-4" aria-hidden="true" /> Invite to
                team
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
