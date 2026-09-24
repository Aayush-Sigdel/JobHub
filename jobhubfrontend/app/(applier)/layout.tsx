import { Suspense } from "react";
import { fetchWithAuth } from "@/lib/service-api";
import NavigationBar from "./_components/navigation/navigation-bar";
import CandidateMobileNav from "./_components/navigation/candidate-mobile-nav";
import { PosterHeader } from "@/components/poster-header";
import type { UserProfileResponse } from "@/types/api/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-option";
import { resolveEmployerRole } from "@/lib/user-role";

export default async function ApplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  let profile: UserProfileResponse | null = null;
  try {
    profile = await fetchWithAuth<UserProfileResponse>("/user/profile");
  } catch {
    // Unauthenticated or network error
  }

  const isEmployer = resolveEmployerRole(profile, session?.user);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <a
        href="#applicant-content"
        className="sr-only fixed left-4 top-2 z-[110] rounded-lg bg-background px-4 py-3 font-medium text-foreground shadow-md focus:not-sr-only focus:fixed focus:outline-2 focus:outline-ring"
      >
        Skip to content
      </a>
      {isEmployer ? (
        <PosterHeader profile={profile} />
      ) : (
        <Suspense>
          <NavigationBar profile={profile} />
        </Suspense>
      )}
      <main
        id="applicant-content"
        tabIndex={-1}
        className="flex-1 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 pb-20 lg:pb-8"
      >
        {children}
      </main>
      {!isEmployer && <CandidateMobileNav />}
    </div>
  );
}
