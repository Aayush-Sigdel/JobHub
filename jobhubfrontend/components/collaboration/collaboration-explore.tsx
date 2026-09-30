"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  FolderKanban,
  Inbox,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useCollaborationIdentity,
  useMyMemberships,
  useOwnerMemberships,
} from "@/lib/hooks/use-collaboration";
import type { UserProfileResponse } from "@/types/api/user";
import { ProjectList } from "./project-list";
import { label } from "./shared";

export type ExploreProfile = Pick<
  UserProfileResponse,
  "name" | "title" | "imageUrl" | "location" | "skills" | "discoverable"
>;

export function CollaborationExplore({
  profile,
  view = "browse",
  initialQuery = "",
}: {
  profile: ExploreProfile | null;
  view?: "browse" | "for-me";
  initialQuery?: string;
}) {
  const identity = useCollaborationIdentity();
  const memberships = useMyMemberships();
  const { projects, requests } = useOwnerMemberships();
  const name = profile?.name || identity.userName;
  const nameLabel = name || "Your profile";
  const personalUnavailable = memberships.isPending || !!memberships.error;
  const projectsUnavailable = projects.isPending || !!projects.error;
  const requestsUnavailable =
    personalUnavailable ||
    projectsUnavailable ||
    requests.isPending ||
    !!requests.error ||
    !!requests.data?.failedProjects.length;
  const incoming =
    (memberships.data?.filter((member) => member.status === "INVITED").length ??
      0) +
    (requests.data?.memberships.filter(
      (member) => member.status === "REQUESTED",
    ).length ?? 0);
  const shortcuts = [
    {
      title: "My projects",
      count: projectsUnavailable ? "—" : (projects.data?.length ?? 0),
      href: "/collaborators/my-projects",
      icon: FolderKanban,
    },
    {
      title: "Teams joined",
      count: personalUnavailable
        ? "—"
        : (memberships.data?.filter((member) => member.status === "ACTIVE")
            .length ?? 0),
      href: "/collaborators/my-projects?tab=joined",
      icon: Users,
    },
    {
      title: "To review",
      count: requestsUnavailable ? "—" : incoming,
      href: "/collaborators/inbox",
      icon: Inbox,
    },
  ];
  const activity = [
    ...(memberships.data ?? []).map((member) => ({
      ...member,
      key: `personal-${member.id}`,
    })),
    ...(requests.data?.memberships ?? []).map((member) => ({
      ...member,
      key: `owner-${member.id}`,
    })),
  ]
    .sort(
      (a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0),
    )
    .slice(0, 3);

  return (
    <div className="min-w-0 pb-8">
      <section aria-label="Your collaboration overview" className="mb-9">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-muted/25 sm:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="px-6 py-7 sm:px-8 lg:py-9">
            <p className="text-sm text-muted-foreground">
              Welcome back{name ? `, ${name.trim().split(/\s+/)[0]}` : ""}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
              Build something.
              <br />
              Together.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Find a project that needs your skills, meet your next teammates,
              or bring an idea of your own.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Button asChild className="h-11 rounded-xl px-4">
                <Link href="#project-feed">
                  Explore projects
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Link
                href="/collaborators/projects/new"
                className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline"
              >
                Start a project
              </Link>
            </div>
          </div>
          <div className="relative hidden min-h-64 overflow-hidden sm:block">
            <Image
              src="/images/home/collaboration.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 320px, 220px"
              className="object-cover object-center"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border/70 border-b border-border/70 py-5">
          {shortcuts.map(({ title, count, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group flex min-w-0 flex-col gap-2 rounded-lg px-3 first:pl-1 hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-3 sm:px-6"
            >
              <Icon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <p className="text-xl font-semibold tabular-nums">
                  {count}
                  <span className="sr-only">
                    {count === "—" ? " unavailable" : ""}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {title}
                </p>
              </div>
              <ArrowRight
                className="ml-auto hidden size-3.5 text-muted-foreground lg:block"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section
          id="project-feed"
          aria-label="Explore projects"
          className="min-w-0 scroll-mt-36 lg:scroll-mt-24"
        >
          <header className="mb-5">
            <h2 className="text-lg font-semibold">Projects to explore</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover open teams or find projects matched to your skills.
            </p>
          </header>
          <ProjectList
            key={`${view}-${initialQuery}`}
            view={view}
            initialQuery={initialQuery}
            layout="feed"
          />
        </section>
        <aside
          aria-label="Your collaboration profile and activity"
          className="min-w-0 border-t border-border pt-6 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-1"
        >
          <Link
            href="/candidate-profile"
            className="flex items-center gap-3 rounded-lg"
          >
            <Avatar className="size-11">
              <AvatarImage
                src={profile?.imageUrl || identity.userImageUrl || undefined}
                alt=""
              />
              <AvatarFallback>
                {nameLabel
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{nameLabel}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {profile?.title || "Edit your profile"}
              </p>
            </div>
          </Link>
          <div className="my-5 space-y-3 border-b border-border/70 pb-5">
            {profile?.location && (
              <p className="text-xs text-muted-foreground">
                {profile.location}
              </p>
            )}
            <h3 className="text-xs font-medium">What you bring</h3>
            <p className="break-words text-sm leading-relaxed text-muted-foreground">
              {profile?.skills.length
                ? profile.skills
                    .slice(0, 5)
                    .map((skill) => skill.name)
                    .join(" · ")
                : "Add your skills to help project owners find you."}
            </p>
            <Link
              href="/candidate-profile"
              className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              Update profile
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <section
            className="space-y-2.5"
            aria-label="Collaboration visibility"
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Eye className="size-4" aria-hidden="true" />
              Profile visibility
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {profile
                ? profile.discoverable
                  ? "Project owners can discover your profile and invite you to their teams."
                  : "Your profile is hidden from project recommendations. You can still request to join a team."
                : "Manage whether project owners can discover your profile."}
            </p>
            <Link
              href="/candidate-profile#collaboration-visibility"
              className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium underline-offset-4 hover:underline"
            >
              Manage visibility
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </section>
          <section
            className="mt-6 border-t border-border/70 pt-5"
            aria-label="Recent collaboration activity"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Recent activity</h3>
              <Link
                href="/collaborators/inbox"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                View all
              </Link>
            </div>
            {activity.length ? (
              <div className="mt-2 divide-y divide-border/50">
                {activity.map((member) => (
                  <Link
                    key={member.key}
                    href={`/collaborators/projects/${member.projectId}`}
                    className="block rounded-lg py-3 hover:bg-muted/30"
                  >
                    <p className="text-xs font-medium">
                      {member.status === "INVITED"
                        ? "Invitation"
                        : member.status === "REQUESTED"
                          ? "Join request"
                          : label(member.status)}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {member.projectTitle}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {memberships.isPending ||
                projects.isPending ||
                requests.isPending
                  ? "Loading activity…"
                  : requestsUnavailable
                    ? "Activity is temporarily unavailable. Open Requests to try again."
                    : "Your project invitations and team activity will appear here."}
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
