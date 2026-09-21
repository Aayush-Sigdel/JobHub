package com.example.jobhub.repository

import com.example.jobhub.model.collab.CollabProjectRole
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface CollabProjectRoleRepository : JpaRepository<CollabProjectRole, UUID> {

    fun findByProjectId(projectId: UUID): List<CollabProjectRole>
}
