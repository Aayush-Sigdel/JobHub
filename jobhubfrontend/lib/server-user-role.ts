import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth-option";
import { fetchWithAuth } from "./service-api";
import { resolveEmployerRole } from "./user-role";
import type { UserProfileResponse } from "@/types/api/user";

const readUserRole = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  let profile: UserProfileResponse | null = null;
  try {
    profile = await fetchWithAuth<UserProfileResponse>("/user/profile", {
      cache: "no-store",
    });
  } catch {
    // Keep the signed session role when the profile service is unavailable.
  }

  return { profile, employer: resolveEmployerRole(profile, session.user) };
});

/** Use the same role source on both sides of a role redirect. */
export async function requireUserRole(employer: boolean) {
  const user = await readUserRole();
  if (user.employer !== employer) {
    redirect(user.employer ? "/dashboard" : "/home");
  }
  return user;
}
