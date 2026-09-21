package com.example.jobhub.repository

import com.example.jobhub.model.collab.CollabMembership
import com.example.jobhub.model.collab.MembershipStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.Optional
import java.util.UUID

interface CollabMembershipRepository : JpaRepository<CollabMembership, UUID> {

    fun findByProjectIdAndMemberId(projectId: UUID, memberId: UUID): Optional<CollabMembership>

    fun findByProjectIdOrderByCreatedAtDesc(projectId: UUID): List<CollabMembership>

    fun findByMemberIdOrderByCreatedAtDesc(memberId: UUID): List<CollabMembership>

    fun countByProjectIdAndStatus(projectId: UUID, status: MembershipStatus): Long

    fun findByRoleIdIn(roleIds: Collection<UUID>): List<CollabMembership>

    fun findByProjectIdAndStatus(projectId: UUID, status: MembershipStatus): List<CollabMembership>

    @Query(
        """
        SELECT m FROM CollabMembership m
        JOIN FETCH m.member
        WHERE m.project.id IN :projectIds
        AND m.status = :status
        """
    )
    fun findByProjectIdInAndStatus(
        @Param("projectIds") projectIds: Collection<UUID>,
        @Param("status") status: MembershipStatus
    ): List<CollabMembership>

    @Query(
        """
        SELECT m.member.id FROM CollabMembership m
        WHERE m.project.id = :projectId
        AND m.status IN :statuses
        """
    )
    fun findMemberIdsByProjectIdAndStatusIn(
        @Param("projectId") projectId: UUID,
        @Param("statuses") statuses: Collection<MembershipStatus>
    ): List<UUID>

    @Query(
        """
        SELECT m.project.id FROM CollabMembership m
        WHERE m.member.id = :memberId
        AND m.status IN :statuses
        """
    )
    fun findProjectIdsByMemberIdAndStatusIn(
        @Param("memberId") memberId: UUID,
        @Param("statuses") statuses: Collection<MembershipStatus>
    ): List<UUID>
}
