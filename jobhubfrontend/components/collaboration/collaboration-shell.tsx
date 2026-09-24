"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Compass,
  FolderKanban,
  Inbox,
  Plus,
  Settings2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { unreadMembershipCount } from "@/lib/collaboration";
import { useMyMemberships } from "@/lib/hooks/use-collaboration";
import { useInboxSeen } from "./inbox-indicator";

const pages = [
  { href: "/collaborators/explore", label: "Explore", icon: Compass },
  {
    href: "/collaborators/my-projects",
    label: "My projects",
    icon: FolderKanban,
  },
  { href: "/collaborators/inbox", label: "Requests", icon: Inbox },
];

export function CollaborationShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data } = useMyMemberships();
  const { seen } = useInboxSeen();
  const unread = unreadMembershipCount(data ?? [], seen);
  const creating = pathname === "/collaborators/projects/new";

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 py-2 md:py-4 lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-8">
      <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <Link
            href="/collaborators/explore"
            className="flex items-center gap-3 rounded-lg font-bold focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
              <Users className="size-5" />
            </span>
            Collaboration
          </Link>
          <nav
            aria-label="Collaboration section"
            className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {pages.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  pathname === href ||
                  (href === "/collaborators/explore" &&
                    pathname === "/collaborators/for-you")
                    ? "page"
                    : undefined
                }
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  pathname === href ||
                    (href === "/collaborators/explore" &&
                      pathname === "/collaborators/for-you")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
                {href === "/collaborators/inbox" && unread > 0 && (
                  <span className="ml-auto rounded-md bg-primary px-1.5 text-xs text-primary-foreground">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 lg:flex-col">
            <Button
              asChild
              variant={creating ? "secondary" : "default"}
              className="lg:w-full"
            >
              <Link
                href="/collaborators/projects/new"
                aria-current={creating ? "page" : undefined}
              >
                <Plus className="size-4" />
                Create project
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-xs text-muted-foreground lg:justify-start"
            >
              <Link href="/candidate-profile#collaboration-visibility">
                <Settings2 className="size-4" />
                Profile visibility
              </Link>
            </Button>
          </div>
        </div>
        <Link
          href="/home"
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-3.5" />
          Back to JobHub
        </Link>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
