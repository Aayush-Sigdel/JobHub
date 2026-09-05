"use client";

import { ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function ProfileAccessError() {
  return (
    <main className="mx-auto flex min-h-[60dvh] w-full max-w-2xl items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-destructive/10 p-2.5 text-destructive">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-foreground">Your session needs to be refreshed</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              JobHub could not authenticate this profile request. Sign in again to reload your profile and continue editing.
            </p>
            <Button className="mt-5" onClick={() => signOut({ callbackUrl: "/sign-in" })}>
              Sign in again
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
