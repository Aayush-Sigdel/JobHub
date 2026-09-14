package com.example.jobhub.service.collab

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.dto.collab.*
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.CollabMapper
import com.example.jobhub.model.User
import com.example.jobhub.model.collab.CollabProject
import com.example.jobhub.model.collab.MembershipStatus
import com.example.jobhub.model.collab.ProjectStatus
import com.example.jobhub.model.collab.RequiredSkill
import com.example.jobhub.model.job.WorkplaceType
import com.example.jobhub.repository.CollabMembershipRepository
import com.example.jobhub.repository.CollabProjectRepository
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.util.FormatUtil
import jakarta.persistence.criteria.Predicate
import org.slf4j.LoggerFactory
import org.springframework.data.jpa.domain.Specification
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class CollabProjectService(
    private val collabProjectRepository: CollabProjectRepository,
    private val collabMembershipRepository: CollabMembershipRepository,
    private val userRepository: UserRepository,
    private val embeddingApiClient: EmbeddingApiClient,
    private val collabMapper: CollabMapper
) {

    private val logger = LoggerFactory.getLogger(CollabProjectService::class.java)

    companion object {
        private const val EMBEDDING_DIMENSIONS = 256
        private const val EMBEDDING_MAX_CHARS = 8_000
    }

    @Transactional
    fun createProject(ownerId: UUID, request: CreateCollabProjectRequest): CollabProjectResponse {
        val owner = userRepository.findById(ownerId).orElseThrow {
            ApiException("User not found", HttpStatus.NOT_FOUND)
        }

        if (owner.isEmployer) {
            throw ApiException("Employer accounts cannot start collaborations", HttpStatus.FORBIDDEN)
        }

        if (request.roles.size > request.teamSize - 1) {
            throw ApiException(
                "You defined ${request.roles.size} roles but only ${request.teamSize - 1} seats " +
                    "besides your own. Increase the team size or remove a role.",
                HttpStatus.BAD_REQUEST
            )
        }

        val embedding = generateProjectEmbedding(
            title = request.title,
            description = request.description,
            goals = request.goals,
            location = request.location,
            workplaceType = request.workplaceType.name,
            roleTitles = request.roles.map { it.title },
            requiredSkills = request.roles.flatMap { role -> role.requiredSkills.map { it.name } }
        )

        val project = collabMapper.toCollabProject(request, owner, embedding)
        val saved = collabProjectRepository.save(project)

        // The owner occupies one seat but has no membership row: they are the team by definition.
        return collabMapper.toCollabProjectResponse(saved, activeMemberCount(saved.id!!))
    }

    @Transactional
    fun updateProject(
        ownerId: UUID,
        projectId: UUID,
        request: UpdateCollabProjectRequest
    ): CollabProjectResponse {
        val project = collabProjectRepository.findByIdAndOwnerId(projectId, ownerId).orElseThrow {
            ApiException("Project not found or you are not authorized to edit it", HttpStatus.NOT_FOUND)
        }

        if (request.title?.isBlank() == true) {
            throw ApiException("Title cannot be blank", HttpStatus.BAD_REQUEST)
        }
        if (request.description?.isBlank() == true) {
            throw ApiException("Description cannot be blank", HttpStatus.BAD_REQUEST)
        }

        val activeCount = activeMemberCount(projectId)
        request.teamSize?.let { newSize ->
            if (newSize < activeCount) {
                throw ApiException(
                    "Team size cannot be smaller than the $activeCount people already on the team",
                    HttpStatus.BAD_REQUEST
                )
            }
        }

        request.title?.let { project.title = it }
        request.description?.let { project.description = it }
        if (request.removeGoals == true) project.goals = null else request.goals?.let { project.goals = it }
        if (request.removeLocation == true) project.location = null else request.location?.let { project.location = it }
        if (request.removeCommitment == true) {
            project.commitmentHoursPerWeek = null
        } else {
            request.commitmentHoursPerWeek?.let { project.commitmentHoursPerWeek = it }
        }
        if (request.removeDuration == true) {
            project.durationWeeks = null
        } else {
            request.durationWeeks?.let { project.durationWeeks = it }
        }
        request.workplaceType?.let { project.workplaceType = it }
        request.teamSize?.let { project.teamSize = it }
        request.status?.let { project.status = it }

        request.roles?.let { newRoles -> replaceRoles(project, newRoles) }

        if (shouldRegenerateEmbedding(request)) {
            project.embedding = generateProjectEmbedding(
                title = project.title,
                description = project.description,
                goals = project.goals,
                location = project.location,
                workplaceType = project.workplaceType.name,
                roleTitles = project.roles.map { it.title },
                requiredSkills = project.roles.flatMap { role -> role.requiredSkills.map { it.name } }
            )
        }

        val saved = collabProjectRepository.save(project)
        return collabMapper.toCollabProjectResponse(saved, activeMemberCount(projectId), roleHolders(projectId))
    }

    @Transactional
    fun updateStatus(ownerId: UUID, projectId: UUID, status: ProjectStatus): CollabProjectResponse {
        val project = collabProjectRepository.findByIdAndOwnerId(projectId, ownerId).orElseThrow {
            ApiException("Project not found or you are not authorized to edit it", HttpStatus.NOT_FOUND)
        }
        project.status = status
        val saved = collabProjectRepository.save(project)
        return collabMapper.toCollabProjectResponse(saved, activeMemberCount(projectId), roleHolders(projectId))
    }

    @Transactional
    fun deleteProject(ownerId: UUID, projectId: UUID) {
        val project = collabProjectRepository.findByIdAndOwnerId(projectId, ownerId).orElseThrow {
            ApiException("Project not found or you are not authorized to delete it", HttpStatus.NOT_FOUND)
        }
        collabMembershipRepository.deleteAll(collabMembershipRepository.findByProjectIdOrderByCreatedAtDesc(projectId))
        collabProjectRepository.delete(project)
    }

    @Transactional(readOnly = true)
    fun getProjectDetail(projectId: UUID, currentUserId: UUID): CollabProjectDetailResponse {
        val project = collabProjectRepository.findByIdWithRoles(projectId).orElseThrow {
            ApiException("Project not found", HttpStatus.NOT_FOUND)
        }

        val memberships = collabMembershipRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
        val active = memberships.filter { it.status == MembershipStatus.ACTIVE }
        val pending = memberships.count {
            it.status == MembershipStatus.INVITED || it.status == MembershipStatus.REQUESTED
        }

        val myMembership = memberships.firstOrNull { it.member?.id == currentUserId }

        val holders = active.mapNotNull { m -> m.role?.id?.let { it to m.member!! } }.toMap()

        return CollabProjectDetailResponse(
            project = collabMapper.toCollabProjectResponse(project, active.size + 1, holders),
            members = active.map { collabMapper.toProjectMemberResponse(it) },
            pendingCount = pending,
            myMembership = myMembership?.let { collabMapper.toMembershipResponse(it) },
            isOwner = project.owner?.id == currentUserId
        )
    }

    @Transactional(readOnly = true)
    fun searchProjects(
        query: String?,
        status: ProjectStatus?,
        workplaceType: WorkplaceType?,
        location: String?,
        maxCommitmentHours: Int?
    ): List<CollabProjectResponse> {
        val spec = Specification<CollabProject> { root, _, cb ->
            val predicates = mutableListOf<Predicate>()

            predicates.add(cb.equal(root.get<ProjectStatus>("status"), status ?: ProjectStatus.RECRUITING))

            workplaceType?.let { predicates.add(cb.equal(root.get<WorkplaceType>("workplaceType"), it)) }

            if (!location.isNullOrBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%${location.trim().lowercase()}%"))
            }

            maxCommitmentHours?.let { max ->
                predicates.add(
                    cb.or(
                        cb.isNull(root.get<Int>("commitmentHoursPerWeek")),
                        cb.lessThanOrEqualTo(root.get("commitmentHoursPerWeek"), max)
                    )
                )
            }

            if (!query.isNullOrBlank()) {
                val q = "%${query.trim().lowercase()}%"
                predicates.add(
                    cb.or(
                        cb.like(cb.lower(root.get("title")), q),
                        cb.like(cb.lower(root.get("description")), q),
                        cb.like(cb.lower(root.get("goals")), q)
                    )
                )
            }

            cb.and(*predicates.toTypedArray())
        }

        val projects = collabProjectRepository.findAll(spec)
            .sortedByDescending { it.createdAt ?: Instant.MIN }

        return withMemberCounts(projects)
    }

    @Transactional(readOnly = true)
    fun getMyProjects(ownerId: UUID): List<CollabProjectResponse> =
        withMemberCounts(collabProjectRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId))

    private fun withMemberCounts(projects: List<CollabProject>): List<CollabProjectResponse> {
        if (projects.isEmpty()) return emptyList()

        val activeByProject = collabMembershipRepository
            .findByProjectIdInAndStatus(projects.mapNotNull { it.id }, MembershipStatus.ACTIVE)
            .groupBy { it.project?.id }

        return projects.map { project ->
            val active = activeByProject[project.id] ?: emptyList()
            val holders = active.mapNotNull { m -> m.role?.id?.let { it to m.member!! } }.toMap()
            // Owner holds a seat without a membership row.
            collabMapper.toCollabProjectResponse(project, active.size + 1, holders)
        }
    }

    fun activeMemberCount(projectId: UUID): Int =
        collabMembershipRepository.countByProjectIdAndStatus(projectId, MembershipStatus.ACTIVE).toInt() + 1

    fun roleHolders(projectId: UUID): Map<UUID, User> =
        collabMembershipRepository.findByProjectIdAndStatus(projectId, MembershipStatus.ACTIVE)
            .mapNotNull { m -> m.role?.id?.let { it to m.member!! } }
            .toMap()

    private fun replaceRoles(project: CollabProject, newRoles: List<CreateProjectRoleRequest>) {
        val keptTitles = newRoles.map { normalizeTitle(it.title) }.toSet()
        val removed = project.roles.filter { normalizeTitle(it.title) !in keptTitles }

        val removedFilled = removed.filter { it.filled }
        if (removedFilled.isNotEmpty()) {
            throw ApiException(
                "Cannot remove roles that are already filled: " +
                    removedFilled.joinToString(", ") { it.title },
                HttpStatus.CONFLICT
            )
        }

        // A role can also be referenced by an invitation nobody has answered yet. Those survive the
        // edit as role-less invitations rather than blocking it or dangling on a deleted row.
        val removedIds = removed.mapNotNull { it.id }
        if (removedIds.isNotEmpty()) {
            val orphanedMemberships = collabMembershipRepository.findByRoleIdIn(removedIds)
            orphanedMemberships.forEach { it.role = null }
            collabMembershipRepository.saveAll(orphanedMemberships)
        }

        project.roles.removeAll(removed.toSet())

        val existingByTitle = project.roles.associateBy { normalizeTitle(it.title) }
        for (spec in newRoles) {
            val existing = existingByTitle[normalizeTitle(spec.title)]
            if (existing == null) {
                project.roles.add(collabMapper.toProjectRole(project, spec))
            } else {
                existing.title = spec.title
                existing.description = spec.description
                existing.requiredSkills = spec.requiredSkills
                    .map { RequiredSkill(it.name.trim(), it.minLevel) }
                    .toMutableList()
            }
        }
    }

    private fun normalizeTitle(title: String) = title.trim().lowercase()

    private fun shouldRegenerateEmbedding(request: UpdateCollabProjectRequest): Boolean =
        request.title != null ||
            request.description != null ||
            request.goals != null ||
            request.removeGoals == true ||
            request.location != null ||
            request.removeLocation == true ||
            request.workplaceType != null ||
            request.roles != null

    private fun generateProjectEmbedding(
        title: String,
        description: String,
        goals: String?,
        location: String?,
        workplaceType: String,
        roleTitles: List<String>,
        requiredSkills: List<String>
    ): FloatArray {
        val text = buildString {
            appendLine("Collaboration Project: $title")
            location?.let { appendLine("Location: $it") }
            appendLine("Workplace: $workplaceType")
            appendLine("Project Description: ${FormatUtil.cleanText(description)}")
            goals?.let { appendLine("Goals: ${FormatUtil.cleanText(it)}") }
            if (roleTitles.isNotEmpty()) {
                appendLine("Roles Needed: ${roleTitles.joinToString(", ")}")
            }
            if (requiredSkills.isNotEmpty()) {
                appendLine("Skills Needed: ${requiredSkills.distinct().joinToString(", ")}")
            }
        }

        val truncated = FormatUtil.truncate(text.trim(), EMBEDDING_MAX_CHARS)
        val embedding = try {
            embeddingApiClient.embed(truncated)
        } catch (e: Exception) {
            logger.error("Failed to generate collaboration project embedding via EmbeddingApiClient", e)
            throw ApiException(
                "Embedding service is unavailable; the project was not saved",
                HttpStatus.SERVICE_UNAVAILABLE
            )
        }

        if (embedding.size != EMBEDDING_DIMENSIONS) {
            logger.error(
                "Embedding API returned {} dimensions for a project; expected {}",
                embedding.size,
                EMBEDDING_DIMENSIONS
            )
            throw ApiException(
                "Embedding service returned an invalid response; the project was not saved",
                HttpStatus.BAD_GATEWAY
            )
        }

        return embedding
    }
}
