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
import { CandidateProfile } from "@/types";

export default function CandidateProfilePage({
  user,
}: {
  user: CandidateProfile;
}) {
  console.log(user.user.followingCount);
  console.log(user.jobsApplied);
  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12 font-sans text-foreground">
      <div className="max-w-275 mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-6">
          <ProfileHeader
            name="Aayush Sigdel"
            username="aayushsigdel"
            isVerified={true}
          />
          <ProfileLookingForRole />
          <ProfileAbout />
          <ProfilePortfolio />
          <ProfileIntroVideo />
          <ProfileWorkExperience />
          <ProfileSkills />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileEducation />
            <ProfileCertifications />
          </div>
        </div>

        <div className="w-full lg:w-[320px] flex flex-col gap-6">
          <ProfileContact />
          <ProfileStrength />
        </div>
      </div>
    </div>
  );
}
