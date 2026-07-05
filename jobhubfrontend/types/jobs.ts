import { Salary } from "./common";

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
}

export interface JobCategory {
  id: string;
  name: string;
}

export interface SearchTag {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;

  company: Company;
  categories: JobCategory[];
  searchTags?: SearchTag[];

  location: string;
  workplaceType: "Remote" | "On-site" | "Hybrid";
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Temporary";
  experienceLevel:
    | "Entry-level"
    | "Mid-level"
    | "Senior-level"
    | "Director"
    | "Executive";
  industry?: string;
  salary?: Salary;

  applyUrl?: string;
  applyEmail?: string;
  isDirectApply?: boolean;

  status: "Draft" | "Active" | "Closed";
  postedDate: string;
  applicationDeadline?: string;

  skillsRequired?: string[];
  educationRequired?: string[];
  visaSponsorship?: boolean;
  benefits?: string[];
  numberOfOpenings?: number;

  viewCount: number;
  applicantCount: number;

  isPromoted?: boolean;
  featuredUntil?: string;
}
