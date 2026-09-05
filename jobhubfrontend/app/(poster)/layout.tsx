import { PosterHeader } from "@/components/poster-header";
import { fetchWithAuth } from "@/lib/service-api";
import type { UserProfileResponse } from "@/types/api/user";

export default async function PosterLayout({
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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PosterHeader profile={profile} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
