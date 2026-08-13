package com.example.jobhub.repository

import com.example.jobhub.model.task.TaskScope
import com.example.jobhub.model.task.DesignTask
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface DesignTaskRepository: JpaRepository<DesignTask, UUID> {

    fun findAllByCreatedById(userId: UUID): List<DesignTask>

    fun findAllByCreatedByIdOrScope(userId: UUID, scope: TaskScope): List<DesignTask>
}