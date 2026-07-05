import { Job } from "./jobs";
import { JobApplication, User } from "./user";

interface BaseProfile {
  user: User;
}

export interface CandidateProfile extends BaseProfile {
  user: User & { role: "candidate" };
  jobsApplied: JobApplication[];
}

export interface EmployerProfile extends BaseProfile {
  user: User & { role: "employer" };
  jobsPosted: Job[];
}

export interface AdminProfile extends BaseProfile {
  user: User & { role: "admin" };
}

export type UserProfile = CandidateProfile | EmployerProfile | AdminProfile;
