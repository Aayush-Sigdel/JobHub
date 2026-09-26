"use client";

import { signOut } from "next-auth/react";
import { clearLocalSessionData } from "./local-session-storage";

export function signOutAndClearLocalData() {
  clearLocalSessionData();
  return signOut({ callbackUrl: "/sign-in" });
}
