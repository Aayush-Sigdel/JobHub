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
      {isEmployer ? (
        <PosterHeader profile={profile} />
      ) : (
        <Suspense>
          <NavigationBar profile={profile} />
        </Suspense>
      )}
      <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 pb-20 lg:pb-8">
        {children}
      </main>
      {!isEmployer && <CandidateMobileNav />}
    </div>
  );
}
