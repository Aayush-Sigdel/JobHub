import { fetchWithAuth } from "@/lib/service-api";
import { ProfileHeader } from "./_components/profile-header";
import { ProfileAbout } from "./_components/profile-about";
import { ProfileSkills } from "./_components/profile-skills";
import { ProfileStrength } from "./_components/profile-strength";
import { ProfileContact } from "./_components/profile-contact";
import { ProfileWorkExperience } from "@/components/profile/profile-work-experience";
import { ProfileEducation } from "@/components/profile/profile-education";
import type { UserProfileResponse } from "@/types/api/user";

export default async function CandidateProfilePage() {
  const profile = await fetchWithAuth<UserProfileResponse>("/user/profile");

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
            key={`header-${profile.updatedAt}`}
            userId={profile?.id}
            name={profile?.name || ""}
            title={profile?.title}
            location={locationObj}
            imageUrl={profile?.imageUrl}
            isVerified={profile?.isVerified ?? false}
          />
          {/* Preferred roles are hidden until profile preference endpoints are available. */}
          <ProfileAbout key={`about-${profile.updatedAt}`} about={profile?.bio || ""} />
          {/* Portfolio projects and intro video are hidden until their endpoints are available. */}
          <ProfileWorkExperience experiences={profile?.experiences || []} />
          <ProfileSkills
            key={`skills-${profile.updatedAt}`}
            initialSkills={profile?.skills || []}
          />

          <ProfileEducation educations={profile?.educations || []} />
          {/* Certifications and languages are hidden until their endpoints are available. */}
        </div>

        <div className="w-full lg:w-[320px] flex flex-col gap-6">
          <ProfileContact
            key={`contact-${profile.updatedAt}`}
            initialEmails={profile?.email ? [profile.email] : []}
            initialPhones={profile?.contactNumbers || []}
            initialSocialLinks={profile?.socialLinks || []}
          />
          <ProfileStrength profile={profile ?? {}} />
        </div>
      </div>
    </div>
  );
}
