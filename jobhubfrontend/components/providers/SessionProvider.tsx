"use client";

import { Fragment, useEffect, useState } from "react";
import {
  SessionProvider as NextAuthProvider,
  useSession,
} from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  STORAGE_OWNER_KEY,
  synchronizeLocalSession,
} from "@/lib/local-session-storage";

function LocalSessionBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const owner = status === "loading" ? undefined : (session?.user?.id ?? null);
  const [readyOwner, setReadyOwner] = useState<string | null>();

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
    const refreshAccount = (event: StorageEvent) => {
      if (event.key === STORAGE_OWNER_KEY && event.newValue !== null) {
        // Refresh server-rendered profile data and in-memory editor/query state in other tabs.
        window.location.reload();
      }
    };
    const refreshRestoredPage = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("storage", refreshAccount);
    window.addEventListener("pageshow", refreshRestoredPage);
    return () => {
      window.removeEventListener("storage", refreshAccount);
      window.removeEventListener("pageshow", refreshRestoredPage);
    };
  }, []);

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

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Session endpoint requests can persist a rotated token in the browser cookie.
  // Server-rendered reads cannot reliably write that cookie after a refresh.
  return (
    <NextAuthProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      <LocalSessionBoundary>{children}</LocalSessionBoundary>
    </NextAuthProvider>
  );
}
