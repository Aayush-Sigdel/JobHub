"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ProfileHeader } from "./_components/profile-header";
import { ProfileAbout } from "./_components/profile-about";
import { ProfilePortfolio } from "./_components/profile-portfolio";
import { ProfileIntroVideo } from "./_components/profile-intro-video";
import { ProfileWorkExperience } from "./_components/profile-work-experience";
import { ProfileSkills } from "./_components/profile-skills";
import { ProfileEducation } from "./_components/profile-education";
import { ProfileCertifications } from "./_components/profile-certifications";
import { ProfileStrength } from "./_components/profile-strength";
import { ProfileContact } from "./_components/profile-contact";
import { ProfileLookingForRole } from "./_components/profile-looking-for-role";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function CandidateProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/user/profile");
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error("Failed to load candidate profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading your profile...
        </p>
      </div>
    );
  }

  const name = profile?.name || session?.user?.name || "";
  // const username = profile?.email?.split("@")[0] || "";
  const title = profile?.title || "";
  const bio = profile?.bio || "";
  const locationObj = profile?.location
    ? {
        city: profile.location.split(",")[0]?.trim() || profile.location,
        country: profile.location.split(",")[1]?.trim() || "",
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12 font-sans text-foreground">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-6">
          <ProfileHeader
            userId={profile?.id}
            name={name}
            username=""
            title={title}
            location={locationObj}
            imageUrl={profile?.imageUrl || (session?.user as any)?.imageUrl}
            isVerified={profile?.verified ?? true}
            onProfileUpdated={fetchProfile}
          />
          <ProfileLookingForRole />
          <ProfileAbout about={bio} onSaved={fetchProfile} />
          <ProfilePortfolio />
          <ProfileIntroVideo />
          <ProfileWorkExperience />
          <ProfileSkills
            initialSkills={profile?.skills || []}
            onSkillsUpdated={fetchProfile}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileEducation />
            <ProfileCertifications />
          </div>
        </div>

        <div className="w-full lg:w-[320px] flex flex-col gap-6">
          <ProfileContact
            initialEmails={profile?.email ? [profile.email] : []}
            initialPhones={profile?.contactNumbers || []}
            initialSocialLinks={profile?.socialLinks || []}
            onContactUpdated={fetchProfile}
          />
          <ProfileStrength />
        </div>
      </div>
    </div>
  );
}
