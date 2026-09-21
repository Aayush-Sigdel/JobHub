package com.example.jobhub.service.collab

import com.example.jobhub.dto.collab.*
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.CollabMapper
import com.example.jobhub.model.collab.*
import com.example.jobhub.repository.CollabMembershipRepository
import com.example.jobhub.repository.CollabProjectRepository
import com.example.jobhub.repository.CollabProjectRoleRepository
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.EmailService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CollabMembershipService(
    private val collabProjectRepository: CollabProjectRepository,
    private val collabProjectRoleRepository: CollabProjectRoleRepository,
    private val collabMembershipRepository: CollabMembershipRepository,
    private val userRepository: UserRepository,
    private val emailService: EmailService,
    private val collabMapper: CollabMapper
) {

    private val logger = LoggerFactory.getLogger(CollabMembershipService::class.java)

    @Transactional
    fun invite(ownerId: UUID, projectId: UUID, request: InviteMemberRequest): MembershipResponse {
        val project = collabProjectRepository.findByIdAndOwnerId(projectId, ownerId).orElseThrow {
            ApiException("Project not found or you are not authorized to invite to it", HttpStatus.NOT_FOUND)
        }

        requireRecruiting(project)

        if (request.userId == ownerId) {
            throw ApiException("You are already on your own project", HttpStatus.BAD_REQUEST)
        }

        val candidate = userRepository.findById(request.userId).orElseThrow {
            ApiException("User not found", HttpStatus.NOT_FOUND)
        }
        if (candidate.isEmployer) {
            throw ApiException("Employer accounts cannot join collaborations", HttpStatus.BAD_REQUEST)
        }

        requireNoExistingMembership(projectId, request.userId)
        requireOpenSeat(project)

        val role = resolveRole(project, request.roleId)

        val membership = CollabMembership(
            project = project,
            member = candidate,
            role = role,
            status = MembershipStatus.INVITED,
            initiatedBy = MembershipInitiator.OWNER,
            message = request.message
        )

        val saved = collabMembershipRepository.save(membership)

        notify(
            recipient = candidate.email,
            subject = "You have been invited to collaborate on \"${project.title}\"",
            body = buildString {
                appendLine("${project.owner?.name} invited you to join \"${project.title}\" on JobHub.")
                role?.let { appendLine("Role: ${it.title}") }
                request.message?.let { appendLine(); appendLine("Message: $it") }
                appendLine()
                appendLine("Open JobHub to accept or decline.")
            }
        )

        return collabMapper.toMembershipResponse(saved)
    }

    @Transactional
    fun requestToJoin(userId: UUID, projectId: UUID, request: RequestToJoinRequest): MembershipResponse {
        val project = collabProjectRepository.findByIdWithRoles(projectId).orElseThrow {
            ApiException("Project not found", HttpStatus.NOT_FOUND)
        }

        requireRecruiting(project)

        if (project.owner?.id == userId) {
            throw ApiException("You cannot request to join your own project", HttpStatus.BAD_REQUEST)
        }

        val candidate = userRepository.findById(userId).orElseThrow {
            ApiException("User not found", HttpStatus.NOT_FOUND)
        }
        if (candidate.isEmployer) {
            throw ApiException("Employer accounts cannot join collaborations", HttpStatus.BAD_REQUEST)
        }

        requireNoExistingMembership(projectId, userId)
        requireOpenSeat(project)

        val role = resolveRole(project, request.roleId)

        val membership = CollabMembership(
            project = project,
            member = candidate,
            role = role,
            status = MembershipStatus.REQUESTED,
            initiatedBy = MembershipInitiator.CANDIDATE,
            message = request.message
        )

        val saved = collabMembershipRepository.save(membership)

        project.owner?.email?.let { ownerEmail ->
            notify(
                recipient = ownerEmail,
                subject = "${candidate.name} asked to join \"${project.title}\"",
                body = buildString {
                    appendLine("${candidate.name} requested to join your project \"${project.title}\" on JobHub.")
                    role?.let { appendLine("Role: ${it.title}") }
                    request.message?.let { appendLine(); appendLine("Message: $it") }
                    appendLine()
                    appendLine("Open JobHub to accept or decline.")
                }
            )
        }

        return collabMapper.toMembershipResponse(saved)
    }

    @Transactional
    fun updateMembership(
        actorId: UUID,
        membershipId: UUID,
        action: MembershipAction
    ): MembershipResponse {
        val membership = collabMembershipRepository.findById(membershipId).orElseThrow {
            ApiException("Membership not found", HttpStatus.NOT_FOUND)
        }

        val project = membership.project!!
        val member = membership.member!!
        val isOwner = project.owner?.id == actorId
        val isMember = member.id == actorId

        if (!isOwner && !isMember) {
            throw ApiException("You are not part of this collaboration", HttpStatus.FORBIDDEN)
        }

        return when (action) {
            MembershipAction.ACCEPT -> accept(membership, isOwner, isMember)
            MembershipAction.DECLINE -> decline(membership, isOwner, isMember)
            MembershipAction.LEAVE -> leave(membership, isMember)
        }
    }

    private fun accept(
        membership: CollabMembership,
        isOwner: Boolean,
        isMember: Boolean
    ): MembershipResponse {
        // Whoever did *not* open the conversation is the one who gets to accept it.
        when (membership.status) {
            MembershipStatus.INVITED -> if (!isMember) {
                throw ApiException("Only the invited user can accept this invitation", HttpStatus.FORBIDDEN)
            }

            MembershipStatus.REQUESTED -> if (!isOwner) {
                throw ApiException("Only the project owner can accept this request", HttpStatus.FORBIDDEN)
            }

            MembershipStatus.ACTIVE -> throw ApiException(
                "This membership is already active",
                HttpStatus.CONFLICT
            )

            else -> throw ApiException(
                "A ${membership.status.name.lowercase()} membership cannot be accepted",
                HttpStatus.CONFLICT
            )
        }

        val projectId = membership.project!!.id!!

        // Re-read under a row lock: the seat count checked at invite time may no longer hold.
        val project = collabProjectRepository.findByIdForUpdate(projectId).orElseThrow {
            ApiException("Project not found", HttpStatus.NOT_FOUND)
        }
        requireRecruiting(project)
        requireOpenSeat(project)

        membership.role?.let { role ->
            if (role.filled) {
                throw ApiException("The ${role.title} role has already been filled", HttpStatus.CONFLICT)
            }
            role.filled = true
            collabProjectRoleRepository.save(role)
        }

        membership.status = MembershipStatus.ACTIVE
        val saved = collabMembershipRepository.save(membership)

        val member = membership.member!!
        val owner = project.owner
        val recipients = listOfNotNull(member.email, owner?.email).distinct()
        if (recipients.isNotEmpty()) {
            notify(
                recipients = recipients.toTypedArray(),
                subject = "${member.name} joined \"${project.title}\"",
                body = buildString {
                    appendLine("${member.name} is now part of \"${project.title}\".")
                    membership.role?.let { appendLine("Role: ${it.title}") }
                    val active = collabMembershipRepository
                        .countByProjectIdAndStatus(projectId, MembershipStatus.ACTIVE)
                        .toInt() + 1
                    appendLine("Team: $active of ${project.teamSize} seats filled.")
                }
            )
        }

        return collabMapper.toMembershipResponse(saved)
    }

    private fun decline(
        membership: CollabMembership,
        isOwner: Boolean,
        isMember: Boolean
    ): MembershipResponse {
        when (membership.status) {
            // Either side can kill a pending conversation: the receiver declines, the sender withdraws.
            MembershipStatus.INVITED, MembershipStatus.REQUESTED -> if (!isOwner && !isMember) {
                throw ApiException("You cannot decline this membership", HttpStatus.FORBIDDEN)
            }

            else -> throw ApiException(
                "Only a pending invitation or request can be declined",
                HttpStatus.CONFLICT
            )
        }

        membership.status = MembershipStatus.DECLINED
        return collabMapper.toMembershipResponse(collabMembershipRepository.save(membership))
    }

    private fun leave(membership: CollabMembership, isMember: Boolean): MembershipResponse {
        if (!isMember) {
            throw ApiException("Only the member can leave a project", HttpStatus.FORBIDDEN)
        }
        if (membership.status != MembershipStatus.ACTIVE) {
            throw ApiException("You are not an active member of this project", HttpStatus.CONFLICT)
        }

        membership.status = MembershipStatus.LEFT

        // Reopening the role is what puts the seat back into the matcher: the next suggestion run
        // recomputes the residual without this person and ranks a fresh shortlist for the gap.
        membership.role?.let { role ->
            role.filled = false
            collabProjectRoleRepository.save(role)
        }

        return collabMapper.toMembershipResponse(collabMembershipRepository.save(membership))
    }

    @Transactional(readOnly = true)
    fun getProjectMemberships(ownerId: UUID, projectId: UUID): List<MembershipResponse> {
        collabProjectRepository.findByIdAndOwnerId(projectId, ownerId).orElseThrow {
            ApiException("Project not found or you are not authorized to view it", HttpStatus.NOT_FOUND)
        }
        return collabMembershipRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
            .map { collabMapper.toMembershipResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getMyMemberships(userId: UUID): List<MembershipResponse> =
        collabMembershipRepository.findByMemberIdOrderByCreatedAtDesc(userId)
            .map { collabMapper.toMembershipResponse(it) }

    private fun requireRecruiting(project: CollabProject) {
        if (project.status != ProjectStatus.RECRUITING) {
            throw ApiException(
                "This project is ${project.status.name.lowercase().replace('_', ' ')} and is not taking new members",
                HttpStatus.CONFLICT
            )
        }
    }

    private fun requireNoExistingMembership(projectId: UUID, userId: UUID) {
        collabMembershipRepository.findByProjectIdAndMemberId(projectId, userId).ifPresent { existing ->
            val detail = when (existing.status) {
                MembershipStatus.ACTIVE -> "already on this project"
                MembershipStatus.INVITED -> "already has a pending invitation"
                MembershipStatus.REQUESTED -> "already has a pending request"
                MembershipStatus.DECLINED -> "previously declined this project"
                MembershipStatus.LEFT -> "previously left this project"
            }
            throw ApiException("This user is $detail", HttpStatus.CONFLICT)
        }
    }

    private fun requireOpenSeat(project: CollabProject) {
        val active = collabMembershipRepository
            .countByProjectIdAndStatus(project.id!!, MembershipStatus.ACTIVE)
            .toInt() + 1
        if (active >= project.teamSize) {
            throw ApiException("This project is full (${project.teamSize} seats)", HttpStatus.CONFLICT)
        }
    }

    private fun resolveRole(project: CollabProject, roleId: UUID?): CollabProjectRole? {
        if (roleId == null) return null
        val role = collabProjectRoleRepository.findById(roleId).orElseThrow {
            ApiException("Role not found: $roleId", HttpStatus.BAD_REQUEST)
        }
        if (role.project?.id != project.id) {
            throw ApiException("That role belongs to a different project", HttpStatus.BAD_REQUEST)
        }
        if (role.filled) {
            throw ApiException("The ${role.title} role has already been filled", HttpStatus.CONFLICT)
        }
        return role
    }

    private fun notify(recipient: String, subject: String, body: String) =
        notify(arrayOf(recipient), subject, body)

    private fun notify(recipients: Array<String>, subject: String, body: String) {
        try {
            emailService.sendEmail(recipients, subject, body)
        } catch (e: Exception) {
            logger.warn("Failed to send collaboration email '{}': {}", subject, e.message)
        }
    }
}
