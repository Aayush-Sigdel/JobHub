import { DesignTaskDto, ProgrammingTaskDto, SQLTaskDto, TaskSubmissionResponse } from "./tasks";

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type WorkplaceType = "REMOTE" | "HYBRID" | "ON_SITE";
export type ApplicationStatus = "APPLIED" | "IN_REVIEW" | "SHORTLISTED" | "ACCEPTED" | "REJECTED";

export interface TabSwitchEvent {
  eventType: string;
  timestamp: string;
  durationSeconds?: number;
  details?: string;
}

export interface JobPostResponse {
  id: string;
  title: string;
  companyName: string;
  description: string;
  requirements?: string;
  location?: string;
  jobType: JobType;
  workplaceType: WorkplaceType;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  tabLock: boolean;
  tabLockWarningLimit: number;
  deadline?: string;
  isActive: boolean;
  postedById: string;
  postedByName: string;
  hasDesignTask: boolean;
  hasProgrammingTask: boolean;
  hasSqlTask: boolean;
  designTaskId?: string;
  programmingTaskId?: string;
  sqlTaskId?: string;
  similarityScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobPostDetailResponse {
  job: JobPostResponse;
  designTask?: DesignTaskDto;
  programmingTask?: ProgrammingTaskDto;
  sqlTask?: SQLTaskDto;
  applicantCount: number;
  hasApplied: boolean;
  myApplicationId?: string;
}

export interface CreateJobPostRequest {
  title: string;
  companyName: string;
  description: string;
  requirements?: string;
  location?: string;
  jobType?: JobType;
  workplaceType?: WorkplaceType;
  experienceLevel?: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  tabLock?: boolean;
  tabLockWarningLimit?: number;
  deadline?: string;
  designTaskId?: string;
  programmingTaskId?: string;
  sqlTaskId?: string;
}

export interface UpdateJobPostRequest extends Partial<CreateJobPostRequest> {
  isActive?: boolean;
  removeDesignTask?: boolean;
  removeProgrammingTask?: boolean;
  removeSqlTask?: boolean;
}

export interface ApplyJobRequest {
  coverNote?: string;
  designSubmissionId?: string;
  programmingSubmissionId?: string;
  sqlSubmissionId?: string;
  tabSwitchCount?: number;
  tabSwitchEvents?: TabSwitchEvent[];
}

export interface JobApplicationResponse {
  id: string;
  jobPostId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: ApplicationStatus;
  similarityScore?: number;
  tabSwitchCount: number;
  tabSwitchEvents?: TabSwitchEvent[];
  coverNote?: string;
  designSubmission?: TaskSubmissionResponse;
  programmingSubmission?: TaskSubmissionResponse;
  sqlSubmission?: TaskSubmissionResponse;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecordTabSwitchRequest {
  eventType?: string;
  durationSeconds?: number;
  details?: string;
}

export interface RecordTabSwitchResponse {
  tabSwitchCount: number;
  warningLimit: number;
  warningLimitExceeded: boolean;
  message: string;
}

export interface JobSearchParams {
  query?: string;
  jobType?: JobType;
  workplaceType?: WorkplaceType;
  experienceLevel?: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  location?: string;
  salaryMin?: number;
  hasTasks?: boolean;
  semanticSearch?: boolean;
  sortBy?: "date" | "similarity" | "salary";
}
