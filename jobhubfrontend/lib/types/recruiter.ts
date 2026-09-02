export interface RecruiterJobSummaryResponse {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  jobType: string;
  workplaceType: string;
  isActive: boolean;
  tabLock: boolean;
  totalApplicants: number;
  pendingReviewCount: number;
  shortlistedCount: number;
  hasDesignTask: boolean;
  hasProgrammingTask: boolean;
  hasSqlTask: boolean;
  createdAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrentRole?: boolean;
  description?: string;
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

export interface SocialLink {
  id?: string;
  platform: string;
  url: string;
}

export interface TabSwitchEvent {
  eventType: string;
  durationSeconds?: number;
  details?: string;
  timestamp: string;
}

export interface TaskSubmission {
  taskId: string;
  taskType: string;
  passed: boolean;
  achievedScore: number;
  requiredScore: number;
  message?: string;
}

export type ApplicationStatus = 'APPLIED' | 'IN_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';

export interface CandidateDashboardResponse {
  candidateId: string;
  name: string;
  email: string;
  title?: string;
  bio?: string;
  location?: string;
  imageUrl?: string;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
  socialLinks: SocialLink[];
  applicationId?: string;
  jobId?: string;
  jobTitle?: string;
  appliedAt?: string;
  status?: ApplicationStatus;
  coverNote?: string;
  tabSwitchCount: number;
  tabSwitchLimitExceeded: boolean;
  tabSwitchEvents?: TabSwitchEvent[];
  designSubmission?: TaskSubmission;
  programmingSubmission?: TaskSubmission;
  sqlSubmission?: TaskSubmission;
  allTasksPassed: boolean;
  overallSimilarity: number;
  matchPercentage: number;
  platformSimilarity?: number;
  githubSimilarity?: number;
  devtoSimilarity?: number;
  orcidSimilarity?: number;
  stackoverflowSimilarity?: number;
  portfolioSimilarity?: number;
}

export interface CandidateSocialSnapshotDto {
  platform: 'GITHUB' | 'DEV_TO' | 'STACKOVERFLOW' | 'ORCID' | 'PORTFOLIO' | string;
  updatedAt?: string;
  aiCoolFeedItems: string[];
  summary: Record<string, any>;
}

export interface JobApplicationResponse {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  appliedAt: string;
}
