import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

export function ProfileStrength({ profile }: { profile: any }) {
  if (!profile) return null;

  const hasPhoto = Boolean(
    profile.imageUrl && !profile.imageUrl.includes("dicebear.com/api/avataaars")
  );
  const hasTitle = Boolean(profile.title && profile.title.trim().length > 0);
  const hasBio = Boolean(profile.bio && profile.bio.trim().length > 50);
  const hasLocation = Boolean(
    profile.location && profile.location.trim().length > 0
  );
  const hasSkills = Boolean(profile.skills && profile.skills.length >= 3);
  const hasExperience = Boolean(
    profile.experiences && profile.experiences.length >= 1
  );
  const hasEducation = Boolean(
    profile.educations && profile.educations.length >= 1
  );
  const hasSocialLinks = Boolean(
    profile.socialLinks && profile.socialLinks.length >= 1
  );

  const checks = [
    { label: "Profile Photo", completed: hasPhoto },
    { label: "Professional Title", completed: hasTitle },
    { label: "Bio (>50 chars)", completed: hasBio },
    { label: "Location", completed: hasLocation },
    { label: "Skills (3+)", completed: hasSkills },
    { label: "Work Experience (1+)", completed: hasExperience },
    { label: "Education (1+)", completed: hasEducation },
    { label: "Social Links (1+)", completed: hasSocialLinks },
  ];

  const completedCount = checks.filter((c) => c.completed).length;
  const percentage = Math.round((completedCount / checks.length) * 100);

  let strengthLabel = "Needs Improvement";
  let colorClass = "text-red-500";

  if (percentage > 70) {
    strengthLabel = "Strong";
    colorClass = "text-green-500";
  } else if (percentage >= 40) {
    strengthLabel = "Intermediate";
    colorClass = "text-yellow-500";
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Profile Strength</h2>
          <p className={`font-medium text-sm ${colorClass}`}>{strengthLabel}</p>
        </div>
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>

      <Progress value={percentage} className="h-2 mb-6" />

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Checklist
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              {check.completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 shrink-0" />
              )}
              <span
                className={
                  check.completed
                    ? "text-gray-900 font-medium"
                    : "text-gray-500"
                }
              >
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
