import { Suspense } from "react";
import { fetchWithAuth } from "@/lib/service-api";
import NavigationBar from "../(applier)/_components/navigation/navigation-bar";
import CandidateMobileNav from "../(applier)/_components/navigation/candidate-mobile-nav";
import { PosterHeader } from "@/components/poster-header";
import type { UserProfileResponse } from "@/types/api/user";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile: UserProfileResponse | null = null;
  try {
    profile = await fetchWithAuth<UserProfileResponse>("/user/profile");
  } catch {
    // Unauthenticated or network error
  }

  const isEmployer = Boolean(profile?.employer);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {isEmployer ? (
        <PosterHeader profile={profile} />
      ) : (
        <Suspense>
          <NavigationBar profile={profile} />
        </Suspense>
      )}
      <main className="flex-1">{children}</main>
      {!isEmployer && <CandidateMobileNav />}
    </div>
  );
}
