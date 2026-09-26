"use client";

import { useId, type ReactNode } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import { reviewDate } from "./candidate-review-utils";

function safeProfileUrl(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="grid min-w-0 gap-4 border-t border-border py-7 @3xl/review:grid-cols-[9rem_minmax(0,1fr)] @3xl/review:gap-8"
    >
      <h4 id={headingId} className="text-base font-semibold">
        {title}
      </h4>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function CandidateOverview({
  candidate,
  onTabChange,
}: {
  candidate: CandidateDashboardResponse;
  onTabChange: (tab: string) => void;
}) {
  const links = (candidate.socialLinks ?? []).flatMap((link) => {
    const href = safeProfileUrl(link.url);
    return href ? [{ ...link, href }] : [];
  });
  return (
    <div className="min-w-0">
      <header className="pb-6">
        <h3 className="text-xl font-semibold tracking-tight">
          Candidate profile
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Read their application, skills, and professional background.
        </p>
      </header>
      <ProfileSection title="Cover letter">
        <p
          className={`whitespace-pre-wrap break-words text-sm leading-7 ${candidate.coverNote?.trim() ? "text-foreground" : "text-muted-foreground"}`}
        >
          {candidate.coverNote?.trim() ||
            "No cover letter was included with this application."}
        </p>
      </ProfileSection>
      {candidate.bio?.trim() && (
        <ProfileSection title="About">
          <p className="whitespace-pre-wrap break-words text-sm leading-7">
            {candidate.bio}
          </p>
        </ProfileSection>
      )}
      <ProfileSection title="Skills">
        {candidate.skills?.length ? (
          <ul
            aria-label="Candidate skills"
            className="flex flex-wrap gap-x-5 gap-y-3"
          >
            {candidate.skills.map((skill) => (
              <li key={skill.id} className="text-sm font-medium">
                {skill.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No skills added to this profile.
          </p>
        )}
      </ProfileSection>
      <ProfileSection title="Work experience">
        {candidate.experiences?.length ? (
          <div className="space-y-7">
            {candidate.experiences.map((experience) => (
              <article key={experience.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h5 className="text-sm font-semibold">{experience.title}</h5>
                  {(experience.isCurrentRole || experience.currentRole) && (
                    <span className="text-xs font-medium text-muted-foreground">
                      Current role
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm">{experience.company}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {reviewDate(experience.startDate)} to{" "}
                  {experience.isCurrentRole || experience.currentRole
                    ? "Present"
                    : reviewDate(experience.endDate)}
                </p>
                {experience.description && (
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">
                    {experience.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No work experience added to this profile.
          </p>
        )}
      </ProfileSection>
      <ProfileSection title="Education">
        {candidate.educations?.length ? (
          <div className="space-y-7">
            {candidate.educations.map((education) => (
              <article key={education.id}>
                <h5 className="text-sm font-semibold">
                  {education.degree}
                  {education.fieldOfStudy ? `, ${education.fieldOfStudy}` : ""}
                </h5>
                <p className="mt-1 text-sm">{education.institution}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {reviewDate(education.startDate)}
                  {education.endDate
                    ? ` to ${reviewDate(education.endDate)}`
                    : ""}
                </p>
                {education.description && (
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">
                    {education.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No education added to this profile.
          </p>
        )}
      </ProfileSection>
      <ProfileSection title="Contact & links">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="mt-2 break-all text-sm">
              {candidate.email ? (
                <a
                  href={`mailto:${candidate.email}`}
                  className="underline decoration-foreground/30 underline-offset-4"
                >
                  {candidate.email}
                </a>
              ) : (
                "Not provided"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Location</dt>
            <dd className="mt-2 text-sm">
              {candidate.location || "Not provided"}
            </dd>
          </div>
        </dl>
        {links.length > 0 && (
          <ul
            aria-label="Connected profiles"
            className="mt-4 flex flex-wrap gap-x-5 gap-y-2"
          >
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm underline decoration-foreground/30 underline-offset-4"
                >
                  {link.platform.replaceAll("_", " ")}
                  <IconArrowUpRight aria-hidden="true" className="size-4" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </ProfileSection>
      <ProfileSection title="Session activity">
        <p className="text-sm text-muted-foreground">
          {candidate.tabSwitchCount ?? 0} tab switches recorded during
          assessments.
        </p>
        <button
          type="button"
          onClick={() => onTabChange("assessments")}
          className="mt-2 min-h-11 text-sm font-medium underline decoration-foreground/30 underline-offset-4"
        >
          View assessment activity
        </button>
      </ProfileSection>
    </div>
  );
}
