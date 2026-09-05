import { ApplicationStatus, JobType, TabSwitchEvent, WorkplaceType } from "./jobs";
import { EducationDto, ExperienceDto, SkillDto, SocialLinkDto } from "./user";
import { TaskSubmissionResponse } from "./tasks";

export interface RecruiterJobSummaryResponse {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  jobType: JobType;
  workplaceType: WorkplaceType;
  isActive?: boolean;
  active?: boolean;
  tabLock: boolean;
  totalApplicants: number;
  pendingReviewCount: number;
  shortlistedCount: number;
  hasDesignTask: boolean;
  hasProgrammingTask: boolean;
  hasSqlTask: boolean;
  createdAt?: string;
}

export interface CandidateDashboardResponse {
  candidateId: string;
  name: string;
  email: string;
  title?: string;
  bio?: string;
  location?: string;
  imageUrl?: string;
  skills: SkillDto[];
  experiences: ExperienceDto[];
  educations: EducationDto[];
  socialLinks: SocialLinkDto[];
  applicationId?: string;
  jobId?: string;
  jobTitle?: string;
  appliedAt?: string;
  status?: ApplicationStatus;
  coverNote?: string;
  tabSwitchCount: number;
  tabSwitchLimitExceeded: boolean;
  tabSwitchEvents?: TabSwitchEvent[];
  designSubmission?: TaskSubmissionResponse;
  programmingSubmission?: TaskSubmissionResponse;
  sqlSubmission?: TaskSubmissionResponse;
  allTasksPassed: boolean;
  overallSimilarity?: number;
  matchPercentage?: number;
  platformSimilarity?: number;
  githubSimilarity?: number;
  devtoSimilarity?: number;
  orcidSimilarity?: number;
  stackoverflowSimilarity?: number;
  portfolioSimilarity?: number;
}

export interface CandidateFilterRequest {
  fromDateTime?: string;
  toDateTime?: string;
  minSimilarity?: number;
  status?: ApplicationStatus;
  search?: string;
  sortBy?: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
}

export interface CandidateSocialSnapshotDto {
  platform: string;
  updatedAt?: string;
  aiCoolFeedItems: string[];
  summary: Record<string, unknown>;
}
