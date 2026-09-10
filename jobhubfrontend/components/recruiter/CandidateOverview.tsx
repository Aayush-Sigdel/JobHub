"use client";

import {
  IconArrowUpRight,
  IconBriefcase,
  IconFileText,
  IconSchool,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import {
  candidateMatchLabel,
  candidateSubmissions,
  reviewDate,
} from "./candidate-review-utils";

function safeProfileUrl(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function CandidateOverview({
  candidate,
  onTabChange,
}: {
  candidate: CandidateDashboardResponse;
  onTabChange: (tab: string) => void;
}) {
  const submissions = candidateSubmissions(candidate);
  const links = (candidate.socialLinks ?? []).flatMap((link) => {
    const href = safeProfileUrl(link.url);
    return href ? [{ ...link, href }] : [];
  });
  return (
    <div className="grid items-start gap-7 @3xl/review:grid-cols-[minmax(0,1.6fr)_minmax(240px,1fr)]">
      <div className="min-w-0 space-y-7">
        <section className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/25 px-5 py-4">
            <IconFileText className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Cover letter</h3>
          </div>
          <div className="p-5 sm:p-6">
            {candidate.coverNote?.trim() ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-7">
                {candidate.coverNote}
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                The candidate did not include a cover letter with this
                application.
              </p>
            )}
          </div>
        </section>

        {candidate.bio?.trim() && (
          <section>
            <h3 className="text-sm font-semibold">About the candidate</h3>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
              {candidate.bio}
            </p>
          </section>
        )}

        <section>
          <h3 className="text-sm font-semibold">Skills</h3>
          {candidate.skills?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-md border border-border bg-muted/25 px-2.5 py-1.5 text-xs font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No skills added to this profile.
            </p>
          )}
        </section>

        <section className="border-t border-border/70 pt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <IconBriefcase className="size-4 text-muted-foreground" />
            Experience
          </h3>
          {candidate.experiences?.length ? (
            <div className="mt-5 space-y-6">
              {candidate.experiences.map((experience) => (
                <article
                  key={experience.id}
                  className="border-l-2 border-border pl-4"
                >
                  <h4 className="text-sm font-medium">{experience.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {experience.company}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {reviewDate(experience.startDate)} to{" "}
                    {experience.isCurrentRole || experience.currentRole
                      ? "Present"
                      : reviewDate(experience.endDate)}
                  </p>
                  {experience.description && (
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                      {experience.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No work experience added to this profile.
            </p>
          )}
        </section>

        {candidate.educations?.length > 0 && (
          <section className="border-t border-border/70 pt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <IconSchool className="size-4 text-muted-foreground" />
              Education
            </h3>
            <div className="mt-4 space-y-5">
              {candidate.educations.map((education) => (
                <article key={education.id}>
                  <h4 className="text-sm font-medium">
                    {education.degree}
                    {education.fieldOfStudy
                      ? `, ${education.fieldOfStudy}`
                      : ""}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {education.institution}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {reviewDate(education.startDate)}
                    {education.endDate
                      ? ` to ${reviewDate(education.endDate)}`
                      : ""}
                  </p>
                  {education.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {education.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="min-w-0 space-y-6">
        <section className="rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold">Application details</h3>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="mt-1 break-all font-medium">
                {candidate.email ? (
                  <a
                    href={`mailto:${candidate.email}`}
                    className="rounded hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {candidate.email}
                  </a>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>
            {[
              ["Location", candidate.location || "Not provided"],
              ["Applied for", candidate.jobTitle || "Selected role"],
              ["Applied on", reviewDate(candidate.appliedAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 break-words font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {links.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h4 className="text-xs text-muted-foreground">
                Connected profiles
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center gap-1 rounded-md border border-border px-2 text-xs hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {link.platform.replaceAll("_", " ")}
                    <IconArrowUpRight className="size-3.5" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-muted/35 p-5">
          <h3 className="text-sm font-semibold">Review at a glance</h3>
          <button
            type="button"
            onClick={() => onTabChange("match")}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-lg py-2 text-left outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-sm">Job match</span>
            <span className="ml-auto text-lg font-semibold tabular-nums">
              {candidateMatchLabel(candidate)}
            </span>
            <IconArrowRight className="size-4" />
          </button>
          <div className="mt-3 border-t border-border/70 pt-4">
            <h4 className="text-xs text-muted-foreground">
              Assessment results
            </h4>
            {submissions.length ? (
              <div className="mt-2 space-y-1">
                {submissions.map(({ label, data }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onTabChange("assessments")}
                    className="flex w-full items-center justify-between gap-2 rounded-lg py-2 text-left text-sm outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>{label}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${data.passed ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"}`}
                    >
                      {data.passed && <IconCheck className="size-3.5" />}
                      {data.passed ? "Passed" : "Not passed"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No submissions yet.
              </p>
            )}
          </div>
          <p className="mt-4 border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground">
            {candidate.tabSwitchCount ?? 0} tab switches recorded
            {candidate.tabSwitchLimitExceeded
              ? "; configured limit reached."
              : "."}
          </p>
        </section>
      </aside>
    </div>
  );
}
