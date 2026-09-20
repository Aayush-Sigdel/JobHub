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
  description?: string;
  requiredSkills: RequiredSkill[];
  filled?: boolean;
  isFilled?: boolean;
}
export interface TeamMember {
  userId: string;
  name: string;
  title?: string;
  imageUrl?: string;
  roleId?: string;
  roleTitle?: string;
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
  teamSize: number;
  activeMemberCount: number;
  pendingCount?: number;
  status: ProjectStatus;
  workplaceType: WorkplaceType;
  location?: string;
  commitmentHoursPerWeek?: number;
  ownerId: string;
  ownerName?: string;
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
export interface ProjectInput {
  title: string;
  description: string;
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
  openSeats: number;
  lambda: number;
  poolSize: number;
  note?: string | null;
  suggestions: {
    roleId: string;
    roleTitle: string;
    requiredSkills: RequiredSkill[];
    candidates: (TeamMember & {
      skills: { name: string }[];
      matchPercentage: number;
      explanation: MatchExplanation;
    })[];
  }[];
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
