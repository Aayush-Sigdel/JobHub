"use client";

import { SessionProvider as NextAuthProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Session endpoint requests can persist a rotated token in the browser cookie.
  // Server-rendered reads cannot reliably write that cookie after a refresh.
  return (
    <NextAuthProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      {children}
    </NextAuthProvider>
  );
}
