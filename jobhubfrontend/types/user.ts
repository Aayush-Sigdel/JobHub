import { Salary } from "./common";

export interface Location {
  city: string;
  state?: string;
  country: string;
}

export type UserRole = "admin" | "candidate" | "employer";

export interface Language {
  name: string;
  proficiency?: "Basic" | "Conversational" | "Fluent" | "Native";
}

export interface Skill {
  id: string;
  name: string;
  level:
    | "Beginner"
    | "Intermediate"
    | "Expert"
    | "BEGINNER"
    | "INTERMEDIATE"
    | "EXPERT";
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
  imageUrls?: string[];
  technologies?: string[];
}

export interface SocialLink {
  platform:
    | "GitHub"
    | "LinkedIn"
    | "Portfolio"
    | "Website"
    | "ORCID"
    | "Other"
    | "GITHUB"
    | "LINKEDIN"
    | "PORTFOLIO"
    | "WEBSITE"
    | "ORCID"
    | "OTHER";
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

export interface LookingForRole {
  id: string;
  name: string;
  roleLevel:
    | "Internship"
    | "Entry-level"
    | "Mid-level"
    | "Senior-level"
    | "Director"
    | "Executive";
  workType: "Remote" | "On-site" | "Hybrid";
  expectedSalary?: Salary;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: "Applied" | "Interviewing" | "Offered" | "Rejected";
  appliedDate: string;
  updatedDate?: string;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  role: UserRole;

  name: string;
  username: string;
  title?: string;
  bio?: string;
  location?: Location;

  email: string;
  secondaryEmails?: string[];
  phone?: string;
  isVerified: boolean;
  onboardingCompleted?: boolean;

  imageUrl?: string;
  videoUrl?: string;
  resumeUrls?: string[];

  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  languages?: Language[];
  certifications?: Certification[];
  projects?: Project[];
  socialLinks?: SocialLink[];

  isLookingForWork?: boolean;
  lookingForRole?: LookingForRole[];

  companyId?: string;

  connections?: Connection[];
  connectionCount: number;
  followerCount: number;
  followingCount: number;
  profileViewCount: number;
  searchAppearanceCount?: number;

  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
