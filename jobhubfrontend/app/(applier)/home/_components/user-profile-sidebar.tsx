"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatSkillName } from "@/lib/utils";
import { formatJobDate, jobLabel } from "@/lib/job-display";
import type { UserProfileResponse } from "@/types/api/user";
import type { JobApplicationResponse } from "@/types/api/jobs";

export function UserProfileSidebar({
  profile,
  applications,
  activityUnavailable = false,
}: {
  profile: UserProfileResponse | null;
  applications: JobApplicationResponse[];
  activityUnavailable?: boolean;
}) {
  const recentActivity = [...applications]
    .sort(
      (a, b) =>
        (Date.parse(b.updatedAt || b.createdAt || "") || 0) -
        (Date.parse(a.updatedAt || a.createdAt || "") || 0),
    )
    .slice(0, 3);
  const name = profile?.name || "Your profile";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  const nextStep = !profile?.title
    ? "Add a title so employers know what you do."
    : !profile.skills?.length
      ? "Add your skills for more relevant recommendations."
      : !profile.bio
        ? "Introduce yourself with a short bio."
        : null;

  return (
    <aside
      aria-label="Your profile and activity"
      className="min-w-0 lg:sticky lg:top-24"
    >
      <Link
        href="/candidate-profile"
        className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={profile?.imageUrl} alt="" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {profile?.title || "Edit your profile"}
          </p>
        </div>
      </Link>
      <div className="my-5 border-b border-border/70 pb-5">
        {profile?.location && (
          <p className="mb-3 text-xs text-muted-foreground">
            {profile.location}
          </p>
        )}
        {Boolean(profile?.skills?.length) && (
          <>
            <h3 className="text-xs font-medium">What you bring</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {profile!
                .skills!.slice(0, 4)
                .map((skill) => formatSkillName(skill.name))
                .join(" · ")}
            </p>
          </>
        )}
      </div>
      {nextStep && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {nextStep}
        </p>
      )}
      <Link
        href="/candidate-profile"
        className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium hover:underline underline-offset-4"
      >
        {nextStep ? "Update profile" : "Manage profile"}{" "}
        <ArrowUpRight className="size-3.5" />
      </Link>
      {!activityUnavailable && (
        <section
          aria-label="Recent application activity"
          className="mt-7 border-t border-border/70 pt-5"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <Link
              href="/job-tracker"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              View all
            </Link>
          </div>
          {recentActivity.length ? (
            <div className="mt-2 divide-y divide-border/50">
              {recentActivity.map((application) => (
                <Link
                  key={application.id}
                  href={`/job-tracker?tab=${application.status.toLowerCase().replaceAll("_", "-")}`}
                  className="block rounded-lg py-3 hover:bg-muted/30"
                >
                  <p className="text-xs font-medium">
                    {application.status === "REJECTED"
                      ? "Not selected"
                      : jobLabel(application.status)}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {application.jobTitle}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {formatJobDate(
                      application.updatedAt || application.createdAt,
                    )}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your application progress will appear here after you apply.
            </p>
          )}
        </section>
      )}
    </aside>
  );
}
