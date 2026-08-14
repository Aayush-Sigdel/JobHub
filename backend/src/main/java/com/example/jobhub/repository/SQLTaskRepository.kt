package com.example.jobhub.repository

import com.example.jobhub.model.task.SQLTask
import com.example.jobhub.model.task.TaskScope
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SQLTaskRepository: JpaRepository<SQLTask, UUID> {

    fun findAllByCreatedById(userId: UUID): List<SQLTask>

    fun findAllByCreatedByIdOrScope(userId: UUID, scope: TaskScope): List<SQLTask>
}