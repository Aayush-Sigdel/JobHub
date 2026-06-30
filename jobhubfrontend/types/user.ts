export type UserRole = "admin" | "candidate" | "employer";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  username: string;
  title?: string;
  email: string[];
  bio?: string;
  location?: Location;
  languages?: Language[];
  skills?: Skill[];
  experiences?: Experience[];
  socialLinks?: SocialLink[];
  videoUrl?: string;
  imageUrl?: string;
  projects?: Project[];
  educations?: Education[];
  lookingForRole?: LookingForRole[];
  certifications?: Certification[];
  contactNumber?: string[];
  isVerified?: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}
interface LookingForRole {
  id: string;
  name: string;
  roleLevel:
    | "Internship"
    | "Entry-level"
    | "Mid-level"
    | "Senior-level"
    | "Director"
    | "Executive";
  workType: "ReRemote" | "On-site" | "Hybrid";
}

export interface Location {
  city: string;
  state?: string;
  country: string;
}

export interface Language {
  name: string;
  proficiency?: "Basic" | "Conversational" | "Fluent" | "Native";
}

export interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Expert";
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  imageUrl?: string[];
  technologies?: string[];
}

export interface SocialLink {
  platform: "GitHub" | "LinkedIn" | "Portfolio" | "Website" | "ORCID" | "Other";
  url: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrentRole?: boolean;
  description: string;
}
