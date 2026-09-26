"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { unreadMembershipCount } from "@/lib/collaboration";
import {
  useMyMemberships,
  useOwnerMemberships,
} from "@/lib/hooks/use-collaboration";
import { useInboxSeen } from "./inbox-indicator";
import styles from "./collaboration.module.css";

const pages = [
  { href: "/collaborators/explore", label: "Explore" },
  { href: "/collaborators/my-projects", label: "My projects" },
  { href: "/collaborators/inbox", label: "Requests" },
];

export function CollaborationShell({
  children,
}: {
  children: React.ReactNode;
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
    <div
      className={`${styles.workspace} mx-auto w-full max-w-6xl space-y-6 py-2 md:py-3`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border pb-3">
        <nav aria-label="Collaboration section" className="flex min-w-0 gap-1">
          {pages.map(({ href, label }) => {
            const active =
              pathname === href ||
              (href === "/collaborators/explore" &&
                pathname === "/collaborators/for-you") ||
              (href === "/collaborators/my-projects" && creating);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors sm:min-h-9",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
                {href === "/collaborators/inbox" && unread > 0 && (
                  <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Hint content="Control whether project owners can find your profile">
            <Button asChild variant="ghost" size="icon" className="size-10">
              <Link
                href="/candidate-profile#collaboration-visibility"
                aria-label="Profile visibility"
              >
                <Settings2 className="size-4" />
              </Link>
            </Button>
          </Hint>
          {!creating && !editing && (
            <Button asChild className="min-h-11 rounded-md px-4">
              <Link href="/collaborators/projects/new">
                <Plus className="size-4" />
                Create project
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
