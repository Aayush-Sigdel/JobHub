"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import {
  useCollaborationIdentity,
  useMyMemberships,
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
  const count = unreadMembershipCount(data ?? [], seen);
  return (
    <Link
      href="/collaborators/inbox"
      aria-label={`Collaboration inbox${count ? `, ${count} updates` : ""}`}
      title="Collaboration inbox"
      className="relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Inbox className="size-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
