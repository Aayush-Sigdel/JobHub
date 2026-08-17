package com.example.jobhub.repository

import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.model.task.TaskScope
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ProgrammingTaskRepository: JpaRepository<ProgrammingTask, UUID> {

    fun findAllByCreatedById(userId: UUID): List<ProgrammingTask>

    fun findAllByCreatedByIdOrScope(userId: UUID, scope: TaskScope): List<ProgrammingTask>
}