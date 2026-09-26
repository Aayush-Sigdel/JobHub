package com.example.jobhub.repository

import com.example.jobhub.model.collab.CollabProject
import com.example.jobhub.model.collab.ProjectStatus
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.Optional
import java.util.UUID

interface CollabProjectRepository : JpaRepository<CollabProject, UUID>, JpaSpecificationExecutor<CollabProject> {

    fun findByOwnerIdOrderByCreatedAtDesc(ownerId: UUID): List<CollabProject>

    fun findByIdAndOwnerId(id: UUID, ownerId: UUID): Optional<CollabProject>

    @Query(
        """
        SELECT DISTINCT p FROM CollabProject p
        LEFT JOIN FETCH p.roles
        WHERE p.status = :status
        AND p.embedding IS NOT NULL
        """
    )
    fun findMatchableByStatus(@Param("status") status: ProjectStatus): List<CollabProject>

    @Query(
        """
        SELECT DISTINCT p FROM CollabProject p
        LEFT JOIN FETCH p.roles
        WHERE p.id = :id
        """
    )
    fun findByIdWithRoles(@Param("id") id: UUID): Optional<CollabProject>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM CollabProject p WHERE p.id = :id")
    fun findByIdForUpdate(@Param("id") id: UUID): Optional<CollabProject>
}
