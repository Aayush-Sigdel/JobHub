import type { UserProfileResponse } from "./user";

export type CollaborationCandidateProfile = Pick<
  UserProfileResponse,
  | "id"
  | "name"
  | "title"
  | "bio"
  | "location"
  | "skills"
  | "experiences"
  | "educations"
>;

export type ProjectStatus =
  | "RECRUITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type MembershipStatus =
  | "INVITED"
  | "REQUESTED"
  | "ACTIVE"
  | "DECLINED"
  | "LEFT";
export type MembershipAction = "ACCEPT" | "DECLINE" | "LEAVE";
export type WorkplaceType = "REMOTE" | "HYBRID" | "ON_SITE";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";

export interface RequiredSkill {
  name: string;
  minLevel: SkillLevel;
}
export interface ProjectRole {
  id: string;
  title: string;
  description?: string | null;
  requiredSkills: RequiredSkill[];
  filled?: boolean;
  isFilled?: boolean;
  filledByUserId?: string | null;
  filledByName?: string | null;
}
export interface TeamMember {
  userId: string;
  name: string;
  title?: string | null;
  imageUrl?: string | null;
  roleId?: string | null;
  roleTitle?: string | null;
}
export interface Membership extends TeamMember {
  id: string;
  projectId: string;
  projectTitle: string;
  status: MembershipStatus;
  initiatedBy: "OWNER" | "CANDIDATE";
  message?: string;
  updatedAt: string;
}
export interface MembershipResponse {
  id: string;
  projectId: string;
  projectTitle: string;
  memberId: string;
  memberName: string;
  memberImageUrl: string | null;
  roleId: string | null;
  roleTitle: string | null;
  status: MembershipStatus;
  initiatedBy: "OWNER" | "CANDIDATE";
  message: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
export interface MatchExplanation {
  gapFitPercentage: number;
  skillCoveragePercentage: number;
  teamOverlapPercentage: number;
  coveredSkills: string[];
  missingSkills: string[];
  summary: string;
}
export interface Project {
  id: string;
  title: string;
  description: string;
  goals?: string | null;
  durationWeeks?: number | null;
  teamSize: number;
  activeMemberCount: number;
  openSeats?: number;
  pendingCount?: number;
  status: ProjectStatus;
  workplaceType: WorkplaceType;
  location?: string | null;
  commitmentHoursPerWeek?: number | null;
  ownerId: string;
  ownerName?: string;
  ownerImageUrl?: string | null;
  owner?: TeamMember;
  roles: ProjectRole[];
  members?: TeamMember[];
  isOwner?: boolean;
  myMembership?: Membership | null;
  bestRoleId?: string;
  bestRoleTitle?: string;
  matchPercentage?: number;
  explanation?: MatchExplanation;
}
export interface ProjectDetailResponse {
  project: Project;
  members: TeamMember[];
  pendingCount: number;
  myMembership: MembershipResponse | null;
  // Jackson serializes Kotlin's isOwner getter as "owner" without the Kotlin module.
  owner?: boolean;
  isOwner?: boolean;
}
export interface ProjectSuggestionResponse {
  project: Project;
  bestRoleId: string | null;
  bestRoleTitle: string | null;
  matchPercentage: number;
  explanation: MatchExplanation;
}
export interface ProjectInput {
  title: string;
  description: string;
  goals?: string;
  durationWeeks?: number;
  teamSize: number;
  workplaceType: WorkplaceType;
  location?: string;
  commitmentHoursPerWeek?: number;
  roles: {
    id?: string;
    title: string;
    description?: string;
    requiredSkills: RequiredSkill[];
  }[];
}
export interface Suggestions {
  projectId: string;
  projectTitle: string;
  openSeats: number;
  poolSize: number;
  note?: string | null;
  suggestions: {
    roleId: string | null;
    roleTitle: string;
    requiredSkills: RequiredSkill[];
    candidates: (TeamMember & {
      bio?: string | null;
      location?: string | null;
      skills: { name: string; level?: string }[];
      matchPercentage: number;
      explanation: MatchExplanation;
    })[];
  }[];
}
export type CandidateSuggestion =
  Suggestions["suggestions"][number]["candidates"][number];
export interface SuggestionFilters {
  poolSize?: number;
  shortlistSize?: number;
  location?: string;
}
export interface ProjectFilters {
  query?: string;
  status?: ProjectStatus;
  workplaceType?: WorkplaceType;
  location?: string;
  maxCommitmentHours?: string;
}
export type CollabResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };
