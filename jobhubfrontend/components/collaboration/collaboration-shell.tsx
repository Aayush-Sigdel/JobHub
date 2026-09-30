"use client";

import { CollaborationNavbar } from "./collaboration-navbar";
import type { CollaborationProfile } from "./collaboration-profile-menu";
import styles from "./collaboration.module.css";

export function CollaborationShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile?: CollaborationProfile | null;
}) {
  return (
    <div
      className={`${styles.workspace} flex min-h-dvh flex-col bg-background text-foreground`}
    >
      <a
        href="#collaboration-content"
        className="sr-only fixed left-4 top-3 z-50 rounded-lg bg-background px-4 py-3 text-sm font-medium shadow-md focus:not-sr-only"
      >
        Skip to content
      </a>
      <CollaborationNavbar profile={profile} />
      <main
        id="collaboration-content"
        tabIndex={-1}
        className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        {children}
      </main>
    </div>
  );
}
