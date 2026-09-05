package com.example.jobhub.dto.job

import com.example.jobhub.dto.DesignTaskDto
import com.example.jobhub.dto.ProgrammingTaskDto
import com.example.jobhub.dto.SQLTaskDto
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.job.ApplicationStatus
import com.example.jobhub.model.job.JobType
import com.example.jobhub.model.job.TabSwitchEvent
import com.example.jobhub.model.job.WorkplaceType
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.PositiveOrZero
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class CreateJobPostRequest(
    @field:NotBlank(message = "Title is required")
    val title: String,

    @field:NotBlank(message = "Company name is required")
    val companyName: String,

    @field:NotBlank(message = "Description is required")
    val description: String,

    val requirements: String? = null,
    val location: String? = null,
    val jobType: JobType = JobType.FULL_TIME,
    val workplaceType: WorkplaceType = WorkplaceType.REMOTE,
    val experienceLevel: SkillLevel = SkillLevel.BEGINNER,

    @field:PositiveOrZero(message = "Minimum salary cannot be negative")
    val salaryMin: Double? = null,

    @field:PositiveOrZero(message = "Maximum salary cannot be negative")
    val salaryMax: Double? = null,

    @field:Size(max = 10, message = "Salary currency code too long")
    val salaryCurrency: String? = "USD",

    val tabLock: Boolean? = false,

    @field:Min(value = 1, message = "Tab lock warning limit must be at least 1")
    val tabLockWarningLimit: Int? = 3,

    val deadline: Instant? = null,

    val designTaskId: UUID? = null,
    val programmingTaskId: UUID? = null,
    val sqlTaskId: UUID? = null
)

data class UpdateJobPostRequest(
    val title: String? = null,
    val companyName: String? = null,
    val description: String? = null,
    val requirements: String? = null,
    val location: String? = null,
    val jobType: JobType? = null,
    val workplaceType: WorkplaceType? = null,
    val experienceLevel: SkillLevel? = null,

    @field:PositiveOrZero(message = "Minimum salary cannot be negative")
    val salaryMin: Double? = null,

    @field:PositiveOrZero(message = "Maximum salary cannot be negative")
    val salaryMax: Double? = null,

    @field:Size(max = 10, message = "Salary currency code too long")
    val salaryCurrency: String? = null,

    val tabLock: Boolean? = null,

    @field:Min(value = 1, message = "Tab lock warning limit must be at least 1")
    val tabLockWarningLimit: Int? = null,

    val deadline: Instant? = null,
    val isActive: Boolean? = null,

    val designTaskId: UUID? = null,
    val programmingTaskId: UUID? = null,
    val sqlTaskId: UUID? = null,
    val removeDesignTask: Boolean? = false,
    val removeProgrammingTask: Boolean? = false,
    val removeSqlTask: Boolean? = false,
    val removeRequirements: Boolean? = false,
    val removeLocation: Boolean? = false,
    val removeSalaryMin: Boolean? = false,
    val removeSalaryMax: Boolean? = false,
    val removeDeadline: Boolean? = false
)

data class JobPostResponse(
    val id: UUID,
    val title: String,
    val companyName: String,
    val description: String,
    val requirements: String?,
    val location: String?,
    val jobType: JobType,
    val workplaceType: WorkplaceType,
    val experienceLevel: SkillLevel,
    val salaryMin: Double?,
    val salaryMax: Double?,
    val salaryCurrency: String?,
    val tabLock: Boolean,
    val tabLockWarningLimit: Int,
    val deadline: Instant?,
    val isActive: Boolean,
    val postedById: UUID,
    val postedByName: String,
    val hasDesignTask: Boolean,
    val hasProgrammingTask: Boolean,
    val hasSqlTask: Boolean,
    val designTaskId: UUID?,
    val programmingTaskId: UUID?,
    val sqlTaskId: UUID?,
    val similarityScore: Double? = null,
    val matchPercentage: Int? = null,
    val createdAt: Instant?,
    val updatedAt: Instant?
)

data class JobPostDetailResponse(
    val job: JobPostResponse,
    val designTask: DesignTaskDto? = null,
    val programmingTask: ProgrammingTaskDto? = null,
    val sqlTask: SQLTaskDto? = null,
    val applicantCount: Long = 0,
    val hasApplied: Boolean = false,
    val myApplicationId: UUID? = null,
    val allTasksPassed: Boolean? = null,
    val overallSimilarity: Double? = null,
    val matchPercentage: Int? = null,
    val platformSimilarity: Double? = null,
    val githubSimilarity: Double? = null,
    val devtoSimilarity: Double? = null,
    val orcidSimilarity: Double? = null,
    val stackoverflowSimilarity: Double? = null,
    val portfolioSimilarity: Double? = null
)

data class ApplyJobRequest(
    val coverNote: String? = null,
    val designSubmissionId: UUID? = null,
    val programmingSubmissionId: UUID? = null,
    val sqlSubmissionId: UUID? = null,

    @field:Min(value = 0, message = "Tab switch count cannot be negative")
    val tabSwitchCount: Int = 0,

    val tabSwitchEvents: List<TabSwitchEvent>? = null
)

data class JobApplicationResponse(
    val id: UUID,
    val jobPostId: UUID,
    val jobTitle: String,
    val companyName: String,
    val candidateId: UUID,
    val candidateName: String,
    val candidateEmail: String,
    val status: ApplicationStatus,
    val similarityScore: Double?,
    val tabSwitchCount: Int,
    val tabSwitchEvents: List<TabSwitchEvent>? = null,
    val coverNote: String?,
    val designSubmission: TaskSubmissionResponse? = null,
    val programmingSubmission: TaskSubmissionResponse? = null,
    val sqlSubmission: TaskSubmissionResponse? = null,
    val createdAt: Instant?,
    val updatedAt: Instant?
)

data class RecordTabSwitchRequest(
    @field:NotBlank(message = "Event type is required")
    val eventType: String = "TAB_BLUR",

    @field:PositiveOrZero(message = "Duration seconds cannot be negative")
    val durationSeconds: Long? = null,

    val details: String? = null
)

data class RecordTabSwitchResponse(
    val tabSwitchCount: Int,
    val warningLimit: Int,
    val warningLimitExceeded: Boolean,
    val message: String
)

data class JobSearchRequest(
    val query: String? = null,
    val jobType: JobType? = null,
    val workplaceType: WorkplaceType? = null,
    val experienceLevel: SkillLevel? = null,
    val location: String? = null,

    @field:PositiveOrZero(message = "Minimum salary cannot be negative")
    val salaryMin: Double? = null,

    val hasTasks: Boolean? = null,
    val semanticSearch: Boolean = false,
    val sortBy: String = "date"
)
