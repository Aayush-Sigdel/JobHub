package com.example.jobhub.dto.recruiter

import com.example.jobhub.dto.*
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.model.job.ApplicationStatus
import com.example.jobhub.model.job.JobType
import com.example.jobhub.model.job.TabSwitchEvent
import com.example.jobhub.model.job.WorkplaceType
import java.time.Instant
import java.util.UUID

data class CandidateFilterRequest(
    val fromDateTime: Instant? = null,
    val toDateTime: Instant? = null,
    val minSimilarity: Double? = null,
    val status: ApplicationStatus? = null,
    val search: String? = null,
    val sortBy: String = "similarity" // "similarity", "date", "score", "name"
)

data class UpdateApplicationStatusRequest(
    val status: ApplicationStatus
)

data class RecruiterJobSummaryResponse(
    val id: UUID,
    val title: String,
    val companyName: String,
    val location: String?,
    val jobType: JobType,
    val workplaceType: WorkplaceType,
    val isActive: Boolean,
    val tabLock: Boolean,
    val totalApplicants: Long,
    val pendingReviewCount: Long,
    val shortlistedCount: Long,
    val hasDesignTask: Boolean,
    val hasProgrammingTask: Boolean,
    val hasSqlTask: Boolean,
    val createdAt: Instant?
)

data class CandidateSocialSnapshotDto(
    val platform: SocialPlatform,
    val updatedAt: Instant?,
    val dataJson: String,
    val processingItems: List<String> = emptyList(),
    val summary: Map<String, Any?> = emptyMap()
)

data class CandidateDashboardResponse(
    val candidateId: UUID,
    val name: String,
    val email: String,
    val title: String?,
    val bio: String?,
    val location: String?,
    val imageUrl: String?,
    val skills: List<SkillDto>,
    val experiences: List<ExperienceDto>,
    val educations: List<EducationDto>,
    val socialLinks: List<SocialLinkDto>,

    // Application context
    val applicationId: UUID?,
    val jobId: UUID?,
    val jobTitle: String?,
    val appliedAt: Instant?,
    val status: ApplicationStatus?,
    val coverNote: String?,
    val tabSwitchCount: Int,
    val tabSwitchLimitExceeded: Boolean,
    val tabSwitchEvents: List<TabSwitchEvent>?,

    // Assessment Submissions
    val designSubmission: TaskSubmissionResponse?,
    val programmingSubmission: TaskSubmissionResponse?,
    val sqlSubmission: TaskSubmissionResponse?,
    val allTasksPassed: Boolean,

    // AI & Embedding Match
    val overallSimilarity: Double,
    val matchPercentage: Int, // e.g. 87%
    val platformSimilarity: Double?,
    val githubSimilarity: Double?,
    val devtoSimilarity: Double?,
    val orcidSimilarity: Double?,
    val stackoverflowSimilarity: Double?,
    val portfolioSimilarity: Double?,

    // Social Snapshots used to generate embeddings
    val socialSnapshots: List<CandidateSocialSnapshotDto>,
    val aiCoolFeedItems: List<String> // Live simulated or parsed cool feed strings for UI animations
)
