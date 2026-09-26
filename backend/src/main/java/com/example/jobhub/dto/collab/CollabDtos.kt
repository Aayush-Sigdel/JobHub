package com.example.jobhub.dto.collab

import com.example.jobhub.dto.SkillDto
import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.collab.MembershipInitiator
import com.example.jobhub.model.collab.MembershipStatus
import com.example.jobhub.model.collab.ProjectStatus
import com.example.jobhub.model.job.WorkplaceType
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

// ---------------------------------------------------------------------------
// Project CRUD
// ---------------------------------------------------------------------------

data class RequiredSkillDto(
    @field:NotBlank(message = "Skill name is required")
    val name: String,

    val minLevel: SkillLevel = SkillLevel.BEGINNER
)

data class CreateProjectRoleRequest(
    @field:NotBlank(message = "Role title is required")
    val title: String,

    val description: String? = null,

    @field:Valid
    val requiredSkills: List<RequiredSkillDto> = emptyList()
)

data class CreateCollabProjectRequest(
    @field:NotBlank(message = "Title is required")
    val title: String,

    @field:NotBlank(message = "Description is required")
    val description: String,

    val goals: String? = null,
    val location: String? = null,
    val workplaceType: WorkplaceType = WorkplaceType.REMOTE,

    @field:Min(value = 2, message = "A collaboration needs at least 2 people")
    @field:Max(value = 20, message = "Team size cannot exceed 20")
    val teamSize: Int = 3,

    @field:Min(value = 1, message = "Weekly commitment must be at least 1 hour")
    @field:Max(value = 80, message = "Weekly commitment cannot exceed 80 hours")
    val commitmentHoursPerWeek: Int? = null,

    @field:Min(value = 1, message = "Duration must be at least 1 week")
    val durationWeeks: Int? = null,

    @field:Valid
    @field:NotEmpty(message = "Define at least one role you are looking to fill")
    @field:Size(max = 20, message = "Cannot define more than 20 roles")
    val roles: List<CreateProjectRoleRequest>
)

data class UpdateCollabProjectRequest(
    val title: String? = null,
    val description: String? = null,
    val goals: String? = null,
    val location: String? = null,
    val workplaceType: WorkplaceType? = null,
    val status: ProjectStatus? = null,

    @field:Min(value = 2, message = "A collaboration needs at least 2 people")
    @field:Max(value = 20, message = "Team size cannot exceed 20")
    val teamSize: Int? = null,

    @field:Min(value = 1, message = "Weekly commitment must be at least 1 hour")
    @field:Max(value = 80, message = "Weekly commitment cannot exceed 80 hours")
    val commitmentHoursPerWeek: Int? = null,

    @field:Min(value = 1, message = "Duration must be at least 1 week")
    val durationWeeks: Int? = null,

    val removeGoals: Boolean? = false,
    val removeLocation: Boolean? = false,
    val removeCommitment: Boolean? = false,
    val removeDuration: Boolean? = false,

    /** When present, replaces the whole role list. Roles already filled cannot be removed. */
    @field:Valid
    val roles: List<CreateProjectRoleRequest>? = null
)

data class UpdateProjectStatusRequest(
    val status: ProjectStatus
)

// ---------------------------------------------------------------------------
// Project responses
// ---------------------------------------------------------------------------

data class ProjectRoleResponse(
    val id: UUID,
    val title: String,
    val description: String?,
    val requiredSkills: List<RequiredSkillDto>,
    val filled: Boolean,
    val filledByUserId: UUID?,
    val filledByName: String?
)

data class CollabProjectResponse(
    val id: UUID,
    val title: String,
    val description: String,
    val goals: String?,
    val location: String?,
    val workplaceType: WorkplaceType,
    val status: ProjectStatus,
    val teamSize: Int,
    val activeMemberCount: Int,
    val openSeats: Int,
    val commitmentHoursPerWeek: Int?,
    val durationWeeks: Int?,
    val ownerId: UUID,
    val ownerName: String,
    val ownerImageUrl: String?,
    val roles: List<ProjectRoleResponse>,
    val createdAt: Instant?,
    val updatedAt: Instant?
)

data class CollabProjectDetailResponse(
    val project: CollabProjectResponse,
    val members: List<ProjectMemberResponse>,
    val pendingCount: Int,
    val myMembership: MembershipResponse?,
    val isOwner: Boolean
)

data class ProjectMemberResponse(
    val userId: UUID,
    val name: String,
    val title: String?,
    val imageUrl: String?,
    val roleId: UUID?,
    val roleTitle: String?,
    val joinedAt: Instant?
)

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/**
 * The "why" behind a suggestion. Returned alongside every match so the UI never has to show a bare
 * percentage: a recommendation nobody can interrogate is a recommendation nobody trusts.
 */
data class MatchExplanation(
    /** How well this person covers what the team is *missing*, not how well they match the project. */
    val gapFitPercentage: Int,

    /** Share of the role's hard skill requirements they meet. */
    val skillCoveragePercentage: Int,

    /** Similarity to the closest existing team member. High means redundant. */
    val teamOverlapPercentage: Int,

    val coveredSkills: List<String>,
    val missingSkills: List<String>,
    val summary: String
)

data class CandidateSuggestionResponse(
    val userId: UUID,
    val name: String,
    val title: String?,
    val bio: String?,
    val location: String?,
    val imageUrl: String?,
    val skills: List<SkillDto>,
    val matchPercentage: Int,
    val explanation: MatchExplanation
)

data class RoleSuggestionResponse(
    val roleId: UUID?,
    val roleTitle: String,
    val requiredSkills: List<RequiredSkillDto>,
    val candidates: List<CandidateSuggestionResponse>
)

data class SquadSuggestionResponse(
    val projectId: UUID,
    val projectTitle: String,
    val openSeats: Int,
    val poolSize: Int,
    val suggestions: List<RoleSuggestionResponse>,
    val note: String?
)

data class ProjectSuggestionResponse(
    val project: CollabProjectResponse,
    val bestRoleId: UUID?,
    val bestRoleTitle: String?,
    val matchPercentage: Int,
    val explanation: MatchExplanation
)

// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------

data class InviteMemberRequest(
    val userId: UUID,
    val roleId: UUID? = null,

    @field:Size(max = 1000, message = "Message is too long")
    val message: String? = null
)

data class RequestToJoinRequest(
    val roleId: UUID? = null,

    @field:Size(max = 1000, message = "Message is too long")
    val message: String? = null
)

enum class MembershipAction {
    ACCEPT,
    DECLINE,
    LEAVE
}

data class UpdateMembershipRequest(
    val action: MembershipAction
)

data class MembershipResponse(
    val id: UUID,
    val projectId: UUID,
    val projectTitle: String,
    val memberId: UUID,
    val memberName: String,
    val memberImageUrl: String?,
    val roleId: UUID?,
    val roleTitle: String?,
    val status: MembershipStatus,
    val initiatedBy: MembershipInitiator,
    val message: String?,
    val createdAt: Instant?,
    val updatedAt: Instant?
)
