package com.example.jobhub.mapper

import com.example.jobhub.dto.collab.*
import com.example.jobhub.model.User
import com.example.jobhub.model.collab.CollabMembership
import com.example.jobhub.model.collab.CollabProject
import com.example.jobhub.model.collab.CollabProjectRole
import com.example.jobhub.model.collab.RequiredSkill
import com.example.jobhub.service.collab.ScoredCandidate
import org.springframework.stereotype.Component
import java.util.UUID
import kotlin.math.roundToInt

@Component
class CollabMapper(
    private val userMapper: UserMapper
) {

    fun toCollabProject(
        request: CreateCollabProjectRequest,
        owner: User,
        embedding: FloatArray?
    ): CollabProject {
        val project = CollabProject(
            title = request.title,
            description = request.description,
            goals = request.goals,
            location = request.location,
            workplaceType = request.workplaceType,
            status = com.example.jobhub.model.collab.ProjectStatus.RECRUITING,
            teamSize = request.teamSize,
            commitmentHoursPerWeek = request.commitmentHoursPerWeek,
            durationWeeks = request.durationWeeks,
            owner = owner,
            embedding = embedding
        )
        project.roles = request.roles.map { toProjectRole(project, it) }.toMutableList()
        return project
    }

    fun toProjectRole(project: CollabProject, request: CreateProjectRoleRequest) =
        CollabProjectRole(
            project = project,
            title = request.title,
            description = request.description,
            requiredSkills = request.requiredSkills
                .map { RequiredSkill(it.name.trim(), it.minLevel) }
                .toMutableList()
        )

    fun toRequiredSkillDto(skill: RequiredSkill) = RequiredSkillDto(
        name = skill.name,
        minLevel = skill.minLevel
    )

    fun toProjectRoleResponse(role: CollabProjectRole, filledBy: User?) = ProjectRoleResponse(
        id = role.id!!,
        title = role.title,
        description = role.description,
        requiredSkills = role.requiredSkills.map { toRequiredSkillDto(it) },
        filled = role.filled,
        filledByUserId = filledBy?.id,
        filledByName = filledBy?.name
    )

    fun toCollabProjectResponse(
        project: CollabProject,
        activeMemberCount: Int,
        roleHolders: Map<UUID, User> = emptyMap()
    ): CollabProjectResponse {
        val owner = project.owner!!
        return CollabProjectResponse(
            id = project.id!!,
            title = project.title,
            description = project.description,
            goals = project.goals,
            location = project.location,
            workplaceType = project.workplaceType,
            status = project.status,
            teamSize = project.teamSize,
            activeMemberCount = activeMemberCount,
            openSeats = (project.teamSize - activeMemberCount).coerceAtLeast(0),
            commitmentHoursPerWeek = project.commitmentHoursPerWeek,
            durationWeeks = project.durationWeeks,
            ownerId = owner.id,
            ownerName = owner.name,
            ownerImageUrl = owner.imageUrl,
            roles = project.roles.map { toProjectRoleResponse(it, roleHolders[it.id]) },
            createdAt = project.createdAt,
            updatedAt = project.updatedAt
        )
    }

    fun toProjectMemberResponse(membership: CollabMembership): ProjectMemberResponse {
        val member = membership.member!!
        return ProjectMemberResponse(
            userId = member.id,
            name = member.name,
            title = member.title,
            imageUrl = member.imageUrl,
            roleId = membership.role?.id,
            roleTitle = membership.role?.title,
            joinedAt = membership.updatedAt
        )
    }

    fun toMembershipResponse(membership: CollabMembership): MembershipResponse {
        val member = membership.member!!
        val project = membership.project!!
        return MembershipResponse(
            id = membership.id!!,
            projectId = project.id!!,
            projectTitle = project.title,
            memberId = member.id,
            memberName = member.name,
            memberImageUrl = member.imageUrl,
            roleId = membership.role?.id,
            roleTitle = membership.role?.title,
            status = membership.status,
            initiatedBy = membership.initiatedBy,
            message = membership.message,
            createdAt = membership.createdAt,
            updatedAt = membership.updatedAt
        )
    }

    fun toCandidateSuggestionResponse(user: User, scored: ScoredCandidate) =
        CandidateSuggestionResponse(
            userId = user.id,
            name = user.name,
            title = user.title,
            bio = user.bio,
            location = user.location,
            imageUrl = user.imageUrl,
            skills = user.skills.map { userMapper.toSkillDto(it) },
            matchPercentage = percentage(scored.score),
            explanation = toMatchExplanation(scored)
        )

    fun toMatchExplanation(scored: ScoredCandidate) = MatchExplanation(
        gapFitPercentage = percentage(scored.gapFit),
        skillCoveragePercentage = percentage(scored.skillCoverage),
        teamOverlapPercentage = percentage(scored.teamOverlap),
        coveredSkills = scored.coveredSkills,
        missingSkills = scored.missingSkills,
        summary = summarize(scored)
    )

    private fun summarize(scored: ScoredCandidate): String {
        val parts = mutableListOf<String>()

        if (scored.coveredSkills.isNotEmpty()) {
            parts += "covers ${scored.coveredSkills.joinToString(", ")}"
        }
        if (scored.missingSkills.isNotEmpty()) {
            parts += "missing ${scored.missingSkills.joinToString(", ")}"
        }

        parts += when {
            scored.teamOverlap < 0.4 -> "little overlap with the current team"
            scored.teamOverlap < 0.7 -> "some overlap with the current team"
            else -> "similar to someone already on the team"
        }

        if (scored.gapFit >= 0.5) {
            parts += "strong fit for the remaining gap"
        }

        return parts.joinToString("; ").replaceFirstChar { it.uppercase() }
    }

    private fun percentage(value: Double): Int =
        (value.coerceIn(0.0, 1.0) * 100).roundToInt()
}
