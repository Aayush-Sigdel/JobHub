export interface SkillDto {
  id: string;
  name: string;
  level: string;
}

export interface ExperienceDto {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrentRole?: boolean;
  currentRole?: boolean;
  description?: string;
}

export interface EducationDto {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface SocialLinkDto {
  id: string;
  platform: string;
  url: string;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  title?: string;
  bio?: string;
  location?: string;
  imageUrl?: string;
  employer: boolean;
  isVerified: boolean;
  onboardingCompleted: boolean;
  discoverable: boolean;
  contactNumbers: string[];
  skills: SkillDto[];
  experiences: ExperienceDto[];
  educations: EducationDto[];
  socialLinks: SocialLinkDto[];
  createdAt: string;
  updatedAt: string;
}

export interface UserBasicInfoResponse {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  employer: boolean;
  onboardingCompleted: boolean;
}

export interface UpdateUserProfileRequest {
  name?: string;
  title?: string;
  bio?: string;
  location?: string;
  imageUrl?: string;
  onboardingCompleted?: boolean;
}

export interface CreateSkillRequest {
  name: string;
  level: string;
}

export interface UpdateSkillRequest {
  name?: string;
  level?: string;
}

export interface CreateExperienceRequest {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrentRole?: boolean;
  description?: string;
}

export interface UpdateExperienceRequest {
  company?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  isCurrentRole?: boolean;
  description?: string;
}

export interface CreateEducationRequest {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface UpdateEducationRequest {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CreateSocialLinkRequest {
  platform: string;
  url: string;
}

export interface UpdateSocialLinkRequest {
  platform?: string;
  url?: string;
}
