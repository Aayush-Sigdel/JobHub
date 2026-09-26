"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Hint } from "@/components/ui/tooltip";
import { Inbox } from "lucide-react";
import {
  useCollaborationIdentity,
  useMyMemberships,
  useOwnerMemberships,
} from "@/lib/hooks/use-collaboration";
import { unreadMembershipCount } from "@/lib/collaboration";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("collaboration-seen", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("collaboration-seen", callback);
  };
}
export function useInboxSeen() {
  const { userId } = useCollaborationIdentity();
  const key = `jobhub:collaboration:seen:${userId}`;
  const seen = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
  return {
    seen,
    markSeen: () => {
      try {
        localStorage.setItem(key, new Date().toISOString());
        window.dispatchEvent(new Event("collaboration-seen"));
      } catch {
        /* Storage may be disabled. */
      }
    },
  };
}
export function CollaborationInboxIndicator() {
  const { data } = useMyMemberships();
  const { seen } = useInboxSeen();
  const { requests } = useOwnerMemberships();
  const count =
    unreadMembershipCount(data ?? [], seen) +
    (requests.data?.memberships.filter(
      (member) => member.status === "REQUESTED",
    ).length ?? 0);
  return (
    <Hint content="Collaboration requests">
      <Link
        href="/collaborators/inbox"
        aria-label={`Collaboration requests${count ? `, ${count} updates` : ""}`}
        className="relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Inbox className="size-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Hint>
  );
}
