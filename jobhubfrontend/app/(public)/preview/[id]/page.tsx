import Link from "next/link";
import { UserRound } from "lucide-react";
import { fetchWithAuth } from "@/lib/service-api";
import type { UserProfileResponse } from "@/types/api/user";
import { Button } from "@/components/ui/button";
import ProfilePreviewView from "./_components/ProfilePreviewView";

export default async function ProfilePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let profile: UserProfileResponse | null = null;
  let currentUser: UserProfileResponse | null = null;

  try {
    currentUser = await fetchWithAuth<UserProfileResponse>("/user/profile");
  } catch {
    // Guest or unauthenticated viewer
  }

  try {
    if (id === "me") {
      profile = currentUser || (await fetchWithAuth<UserProfileResponse>("/user/profile"));
    } else {
      profile = await fetchWithAuth<UserProfileResponse>(`/user/profile/${id}`);
    }
  } catch (error) {
    console.error("Failed to load profile preview", error);
  }

  if (!profile) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-background">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center">
            <UserRound className="w-6 h-6 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">Profile Unavailable</h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            This candidate profile could not be loaded. Please sign in or verify the link is valid.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild variant="outline" className="rounded-xl font-semibold text-xs h-9">
              <Link href="/find-job">Browse Jobs</Link>
            </Button>
            <Button asChild className="rounded-xl font-bold text-xs h-9 bg-primary text-black hover:bg-primary/90 shadow-xs">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const isOwner = Boolean(
    id === "me" || (currentUser?.id && profile.id && currentUser.id === profile.id)
  );

  return <ProfilePreviewView profile={profile} isOwner={isOwner} />;
}
