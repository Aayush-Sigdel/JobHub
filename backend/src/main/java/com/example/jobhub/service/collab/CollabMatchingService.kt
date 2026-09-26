package com.example.jobhub.service.collab

import com.example.jobhub.dto.collab.*
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.CollabMapper
import com.example.jobhub.model.User
import com.example.jobhub.model.collab.CollabProjectRole
import com.example.jobhub.model.collab.MembershipStatus
import com.example.jobhub.model.collab.ProjectStatus
import com.example.jobhub.repository.CollabMembershipRepository
import com.example.jobhub.repository.CollabProjectRepository
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.embedding.EmbeddingAggregator
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CollabMatchingService(
    private val collabProjectRepository: CollabProjectRepository,
    private val collabMembershipRepository: CollabMembershipRepository,
    private val userRepository: UserRepository,
    private val collabProjectService: CollabProjectService,
    private val teamMatchService: TeamMatchService,
    private val collabMapper: CollabMapper
) {

    companion object {
        private const val MIN_POOL = 10
        private const val MAX_POOL = 500
        private const val DEFAULT_POOL = 200
        private const val MIN_SHORTLIST = 1
        private const val MAX_SHORTLIST = 25

        private val ENGAGED_STATUSES = listOf(
            MembershipStatus.ACTIVE,
            MembershipStatus.INVITED,
            MembershipStatus.REQUESTED,
            MembershipStatus.DECLINED,
            MembershipStatus.LEFT
        )
    }

    @Transactional(readOnly = true)
    fun suggestSquad(
        projectId: UUID,
        requesterId: UUID,
        poolSize: Int?,
        shortlistSize: Int?,
        location: String?
    ): SquadSuggestionResponse {
        val project = collabProjectRepository.findByIdWithRoles(projectId).orElseThrow {
            ApiException("Project not found", HttpStatus.NOT_FOUND)
        }

        if (project.owner?.id != requesterId) {
            throw ApiException("Only the project owner can view suggestions", HttpStatus.FORBIDDEN)
        }

        val projectVector = project.embedding
            ?: throw ApiException(
                "This project has no embedding yet; re-save it to generate one",
                HttpStatus.CONFLICT
            )

        val effectivePool = (poolSize ?: DEFAULT_POOL).coerceIn(MIN_POOL, MAX_POOL)
        val effectiveShortlist = (shortlistSize ?: 10).coerceIn(MIN_SHORTLIST, MAX_SHORTLIST)

        val activeMembers = collabMembershipRepository
            .findByProjectIdAndStatus(projectId, MembershipStatus.ACTIVE)
            .mapNotNull { it.member }
        val teamVectors = listOfNotNull(project.owner, *activeMembers.toTypedArray())
            .mapNotNull { vectorOf(it) }

        val openRoles = project.roles.filter { !it.filled }
        val openSeats = (project.teamSize - collabProjectService.activeMemberCount(projectId)).coerceAtLeast(0)

        if (openRoles.isEmpty() || openSeats == 0) {
            return SquadSuggestionResponse(
                projectId = projectId,
                projectTitle = project.title,
                openSeats = openSeats,
                poolSize = 0,
                suggestions = emptyList(),
                note = "Every role on this project is filled."
            )
        }

        // Rank against the gap, not the project: the pool we pull is already biased towards what
        // the team is missing rather than towards the project as a whole.
        val residual = teamMatchService.residual(projectVector, teamVectors)

        val excluded = buildSet {
            project.owner?.id?.let { add(it) }
            addAll(collabMembershipRepository.findMemberIdsByProjectIdAndStatusIn(projectId, ENGAGED_STATUSES))
        }

        val hits = userRepository.searchCollabCandidates(
            queryVector = EmbeddingAggregator.toPgVector(residual),
            excludeUserIds = excluded,
            location = location,
            poolSize = effectivePool
        )

        if (hits.isEmpty()) {
            return SquadSuggestionResponse(
                projectId = projectId,
                projectTitle = project.title,
                openSeats = openSeats,
                poolSize = 0,
                suggestions = openRoles.map { emptyShortlist(it) },
                note = "No discoverable candidates with a synced embedding matched this project yet."
            )
        }

        val usersById = userRepository.findAllWithSkillsByIdIn(hits.map { it.userId }).associateBy { it.id }
        val pool = hits.mapNotNull { hit -> usersById[hit.userId]?.let { toProfile(it) } }

        val shortlists = teamMatchService.buildSquad(
            projectVector = projectVector,
            openRoles = openRoles.map { toRoleSpec(it) },
            pool = pool,
            teamVectors = teamVectors,
            shortlistSize = effectiveShortlist
        )

        return SquadSuggestionResponse(
            projectId = projectId,
            projectTitle = project.title,
            openSeats = openSeats,
            poolSize = pool.size,
            suggestions = shortlists.map { shortlist ->
                RoleSuggestionResponse(
                    roleId = shortlist.role.roleId,
                    roleTitle = shortlist.role.title,
                    requiredSkills = shortlist.role.requiredSkills.map { collabMapper.toRequiredSkillDto(it) },
                    candidates = shortlist.candidates.mapNotNull { scored ->
                        usersById[scored.userId]?.let { collabMapper.toCandidateSuggestionResponse(it, scored) }
                    }
                )
            },
            note = null
        )
    }

    @Transactional(readOnly = true)
    fun suggestProjectsForUser(userId: UUID, limit: Int): List<ProjectSuggestionResponse> {
        val user = userRepository.findAllWithSkillsByIdIn(listOf(userId)).firstOrNull()
            ?: throw ApiException("User not found", HttpStatus.NOT_FOUND)

        if (vectorOf(user) == null) {
            throw ApiException(
                "No embedding found on your profile. Sync it first via POST /api/user/embedding/sync",
                HttpStatus.CONFLICT
            )
        }

        val alreadyEngaged = collabMembershipRepository
            .findProjectIdsByMemberIdAndStatusIn(userId, ENGAGED_STATUSES)
            .toSet()

        val projects = collabProjectRepository.findMatchableByStatus(ProjectStatus.RECRUITING)
            .filter { it.owner?.id != userId }
            .filter { it.id !in alreadyEngaged }
            .filter { project -> project.roles.any { !it.filled } }

        if (projects.isEmpty()) return emptyList()

        val activeByProject = collabMembershipRepository
            .findByProjectIdInAndStatus(projects.mapNotNull { it.id }, MembershipStatus.ACTIVE)
            .groupBy { it.project?.id }

        val profile = toProfile(user)

        return projects.mapNotNull { project ->
            val projectVector = project.embedding ?: return@mapNotNull null

            val activeMembers = activeByProject[project.id]?.mapNotNull { it.member } ?: emptyList()

            // Owner holds a seat without a membership row, so active headcount is members + 1.
            val activeCount = activeMembers.size + 1
            if (activeCount >= project.teamSize) return@mapNotNull null

            val teamVectors = listOfNotNull(project.owner, *activeMembers.toTypedArray())
                .mapNotNull { vectorOf(it) }

            val residual = teamMatchService.residual(projectVector, teamVectors)

            // Score against every open role and keep the one the user fits best — that is the role
            // the UI should offer them when they hit "request to join".
            val best = project.roles
                .filter { !it.filled }
                .map { role ->
                    role to teamMatchService.score(
                        candidate = profile,
                        residual = residual,
                        role = toRoleSpec(role),
                        teamVectors = teamVectors,
                    )
                }
                .maxByOrNull { it.second.score }
                ?: return@mapNotNull null

            ProjectSuggestionResponse(
                project = collabMapper.toCollabProjectResponse(project, activeCount),
                bestRoleId = best.first.id,
                bestRoleTitle = best.first.title,
                matchPercentage = (best.second.score.coerceIn(0.0, 1.0) * 100).toInt(),
                explanation = collabMapper.toMatchExplanation(best.second)
            )
        }
            .sortedByDescending { it.matchPercentage }
            .take(limit.coerceIn(1, 50))
    }

    private fun emptyShortlist(role: CollabProjectRole) = RoleSuggestionResponse(
        roleId = role.id,
        roleTitle = role.title,
        requiredSkills = role.requiredSkills.map { collabMapper.toRequiredSkillDto(it) },
        candidates = emptyList()
    )

    private fun toRoleSpec(role: CollabProjectRole) = RoleSpec(
        roleId = role.id,
        title = role.title,
        requiredSkills = role.requiredSkills.toList()
    )

    private fun toProfile(user: User) = CandidateProfile(
        userId = user.id,
        vector = vectorOf(user) ?: FloatArray(0),
        skills = user.skills
            .filter { it.name != null && it.level != null }
            .associate { teamMatchService.normalizeSkill(it.name) to it.level }
    )

    private fun vectorOf(user: User): FloatArray? =
        user.overallEmbedding?.takeIf { it.isNotEmpty() }
            ?: user.profileEmbedding?.takeIf { it.isNotEmpty() }
}
