"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  SessionProvider as NextAuthProvider,
  getSession,
  useSession,
} from "next-auth/react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import {
  STORAGE_OWNER_KEY,
  synchronizeLocalSession,
} from "@/lib/local-session-storage";

function LocalSessionBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  // NextAuth keeps the current session while update() is in flight. Hiding the
  // page for that loading state remounts every query and effect on completion.
  const owner = session?.user?.id ?? (status === "loading" ? undefined : null);
  const [readyOwner, setReadyOwner] = useState<string | null>();
  const reloadPending = useRef(false);

  useEffect(() => {
    // Persist any token rotated during the server render. Seeding NextAuth with
    // that session skips its usual initial request; do not broadcast this read.
    void getSession({ broadcast: false });
  }, []);

  useEffect(() => {
    if (owner === undefined) return;
    synchronizeLocalSession(owner);
    let active = true;
    queueMicrotask(() => {
      if (active) setReadyOwner(owner);
    });
    return () => {
      active = false;
    };
  }, [owner]);

  useEffect(() => {
    if (owner === undefined) return;
    const expectedOwner = owner === null ? "signed-out" : `user:${owner}`;
    let active = true;
    let checking = false;
    const refreshChangedAccount = async () => {
      if (checking || reloadPending.current) return;
      checking = true;
      try {
        // A marker from another tab is only a signal. Verify the shared cookie
        // before reloading; stale tabs must not repeatedly reload fresh pages.
        // Read directly so transport errors cannot masquerade as a sign-out.
        const response = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok) return;
        const currentSession: Session | null = await response.json();
        if (!active || (currentSession?.user?.id ?? null) === owner) return;
        reloadPending.current = true;
        window.location.reload();
      } catch {
        // Offline or unavailable session checks should never reload the page.
      } finally {
        checking = false;
      }
    };
    const refreshAccount = (event: StorageEvent) => {
      if (event.key !== STORAGE_OWNER_KEY || event.newValue === null) return;
      try {
        if (event.storageArea !== window.localStorage) return;
        // Storage events are queued: an older sign-out may arrive after sign-in.
        if (window.localStorage.getItem(STORAGE_OWNER_KEY) !== event.newValue)
          return;
        if (event.newValue !== expectedOwner) void refreshChangedAccount();
      } catch {
        // Browser storage may be disabled.
      }
    };
    const refreshRestoredPage = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      void refreshChangedAccount();
    };
    window.addEventListener("storage", refreshAccount);
    window.addEventListener("pageshow", refreshRestoredPage);
    return () => {
      active = false;
      window.removeEventListener("storage", refreshAccount);
      window.removeEventListener("pageshow", refreshRestoredPage);
    };
  }, [owner]);

  // Public pages still render on the server. Private state only mounts after cleanup.
  const publicPage = [
    "/",
    "/sign-in",
    "/sign-up",
    "/forget-password",
    "/verification",
    "/privacy-policy",
    "/terms-of-service",
    "/admin/sign-in",
    "/admin/reset-password",
  ].includes(pathname);
  if (
    (!publicPage && owner === undefined) ||
    (owner !== undefined && readyOwner !== owner)
  ) {
    return (
      <div
        role="status"
        className="flex min-h-48 items-center justify-center text-sm text-muted-foreground"
      >
        Loading your session…
      </div>
    );
  }
  return <Fragment key={owner ?? "anonymous"}>{children}</Fragment>;
}

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  // Session endpoint requests can persist a rotated token in the browser cookie.
  // Server-rendered reads cannot reliably write that cookie after a refresh.
  return (
    <NextAuthProvider
      session={session}
      refetchInterval={5 * 60}
      refetchOnWindowFocus
    >
      <LocalSessionBoundary>{children}</LocalSessionBoundary>
    </NextAuthProvider>
  );
}
