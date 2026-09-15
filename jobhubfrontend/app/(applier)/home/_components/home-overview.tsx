"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  FilePenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useLocalInProgressJobs,
  useLocalSavedJobs,
} from "@/lib/hooks/use-local-jobs";
import type { UserProfileResponse } from "@/types/api/user";

export interface HomeApplicationError {
  message: string;
  signIn: boolean;
}

export function HomeOverview({
  profile,
  applicationCount,
  applicationError,
}: {
  profile: UserProfileResponse | null;
  applicationCount: number;
  applicationError?: HomeApplicationError;
}) {
  const { savedJobs } = useLocalSavedJobs();
  const { inProgressJobs } = useLocalInProgressJobs();
  const latestDraft = [...inProgressJobs].sort(
    (a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0),
  )[0];
  const activity = [
    {
      label: "Applications",
      count: applicationError ? "—" : applicationCount,
      href: "/job-tracker",
      icon: BriefcaseBusiness,
    },
    {
      label: "Saved for later",
      count: savedJobs.length,
      href: "/job-tracker?tab=saved",
      icon: Bookmark,
    },
    {
      label: "In progress",
      count: inProgressJobs.length,
      href: "/job-tracker?tab=in-progress",
      icon: FilePenLine,
    },
  ];

  return (
    <section aria-label="Your job search overview" className="mb-9">
      <div className="grid overflow-hidden rounded-2xl border border-border bg-muted/25 sm:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="px-6 py-7 sm:px-8 lg:py-9">
          <p className="text-sm text-muted-foreground">
            Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
            Make your next move.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {latestDraft
              ? `Your application for ${latestDraft.jobTitle} is waiting. Pick up where you left off, or explore something new.`
              : "Find a role that fits what you do best. Your opportunities, saved roles, and next steps are all here."}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Button
              asChild
              className="h-10 rounded-xl bg-primary px-4 text-black hover:bg-primary/90"
            >
              <Link
                href={
                  latestDraft ? `/find-job/${latestDraft.jobId}` : "/find-job"
                }
              >
                {latestDraft ? "Continue application" : "Explore opportunities"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Link
              href={latestDraft ? "/find-job" : "/candidate-profile"}
              className="inline-flex min-h-10 items-center text-sm font-medium hover:underline underline-offset-4"
            >
              {latestDraft ? "Browse jobs" : "Update your profile"}
            </Link>
          </div>
        </div>
        <div className="relative hidden min-h-64 overflow-hidden sm:block">
          <Image
            src="/jobhub-team-illustration.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 320px, 220px"
            className="object-cover object-[50%_35%]"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border/70 border-b border-border/70 py-5">
        {activity.map(({ label, count, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col gap-2 rounded-lg px-3 first:pl-1 sm:flex-row sm:items-center sm:gap-3 sm:px-6 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-semibold tabular-nums">{count}</p>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {label}
              </p>
            </div>
            <ArrowRight className="ml-auto hidden size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none lg:block" />
          </Link>
        ))}
      </div>
      {applicationError && (
        <p
          role="status"
          className="mt-3 text-xs leading-relaxed text-muted-foreground"
        >
          {applicationError.signIn
            ? "Sign in again to refresh your application activity."
            : "Application activity is temporarily unavailable. You can still explore jobs and resume drafts."}{" "}
          <Link
            href={
              applicationError.signIn
                ? "/sign-in?callbackUrl=%2Fhome"
                : "/job-tracker"
            }
            className="font-medium text-foreground underline underline-offset-4"
          >
            {applicationError.signIn ? "Sign in" : "Open tracker"}
          </Link>
        </p>
      )}
    </section>
  );
}
