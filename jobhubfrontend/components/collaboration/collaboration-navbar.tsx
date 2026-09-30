"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import JobHubLogo from "@/components/brand/JobHubLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { unreadMembershipCount } from "@/lib/collaboration";
import {
  useMyMemberships,
  useOwnerMemberships,
} from "@/lib/hooks/use-collaboration";
import { useInboxSeen } from "./inbox-indicator";
import {
  CollaborationProfileMenu,
  type CollaborationProfile,
} from "./collaboration-profile-menu";

const pages = [
  { href: "/collaborators/explore", label: "Explore" },
  { href: "/collaborators/my-projects", label: "My projects" },
  { href: "/collaborators/inbox", label: "Requests" },
];

export function CollaborationNavbar({
  profile,
}: {
  profile?: CollaborationProfile | null;
}) {
  const pathname = usePathname();
  const { data } = useMyMemberships();
  const { seen } = useInboxSeen();
  const { requests } = useOwnerMemberships();
  const unread =
    unreadMembershipCount(data ?? [], seen) +
    (requests.data?.memberships.filter(
      (member) => member.status === "REQUESTED",
    ).length ?? 0);
  const creating = pathname === "/collaborators/projects/new";
  const editing = pathname.endsWith("/edit");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-2 px-4 sm:gap-x-6 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link
          href="/collaborators/explore"
          aria-label="JobHub collaboration home"
          className="flex h-16 shrink-0 items-center gap-2.5 rounded-lg"
        >
          <JobHubLogo />
        </Link>
        <div className="order-last flex w-full min-w-0 items-center gap-2 border-t border-border/60 lg:order-none lg:w-auto lg:flex-1 lg:border-0">
          <nav
            aria-label="Collaboration section"
            className="flex min-w-0 flex-1 gap-0.5 lg:flex-none lg:gap-1"
          >
            {pages.map(({ href, label }) => {
              const active =
                pathname === href ||
                (href === "/collaborators/explore" &&
                  pathname === "/collaborators/for-you") ||
                (href === "/collaborators/my-projects" &&
                  (creating || editing));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 border-b-2 px-2 text-xs font-medium whitespace-nowrap transition-colors motion-reduce:transition-none sm:px-3 sm:text-sm lg:min-h-16 lg:flex-none",
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {label}
                  {href === "/collaborators/inbox" && unread > 0 && (
                    <span
                      className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground"
                      aria-label={`${unread} updates`}
                    >
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          {!creating && !editing && (
            <Button
              asChild
              className="ml-auto size-11 shrink-0 rounded-lg p-0 sm:w-auto sm:px-3 lg:ml-auto"
            >
              <Link
                href="/collaborators/projects/new"
                aria-label="Create project"
              >
                <Plus className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Create project</span>
              </Link>
            </Button>
          )}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3 lg:ml-0">
          <Link
            href="/find-job"
            aria-label="Back to jobs"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:gap-2 sm:px-3"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span className="sm:hidden">Jobs</span>
            <span className="hidden sm:inline">Back to jobs</span>
          </Link>
          <span
            className="hidden h-6 w-px bg-border sm:block"
            aria-hidden="true"
          />
          <CollaborationProfileMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
