import { fetchWithAuth } from "@/lib/service-api";
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

interface ProfileData {
  id: string;
  name: string;
  email: string;
  title?: string;
  bio?: string;
  location?: string;
  imageUrl?: string;
  isVerified?: boolean;
  verified?: boolean;
  contactNumbers?: string[];
  skills?: { id: string; name: string; level: string }[];
  experiences?: any[];
  educations?: any[];
  socialLinks?: { id: string; platform: string; url: string }[];
  connectionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default async function CandidateProfilePage() {
  const profile = await fetchWithAuth<ProfileData>("/user/profile");

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
            name={profile?.name || ""}
            username=""
            title={profile?.title}
            location={locationObj}
            imageUrl={profile?.imageUrl}
            isVerified={profile?.isVerified ?? profile?.verified ?? true}
          />
          <ProfileLookingForRole />
          <ProfileAbout about={profile?.bio || ""} />
          <ProfilePortfolio />
          <ProfileIntroVideo />
          <ProfileWorkExperience />
          <ProfileSkills initialSkills={profile?.skills || []} />

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
          />
          <ProfileStrength />
        </div>
      </div>
    </div>
  );
}
