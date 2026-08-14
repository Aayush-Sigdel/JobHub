package com.example.jobhub.service.task.sql

import com.example.jobhub.dto.CreateSQLTask
import com.example.jobhub.dto.SQLTaskDto
import com.example.jobhub.dto.SubmitTask
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.TaskMapper
import com.example.jobhub.mapper.TaskSubmissionMapper
import com.example.jobhub.model.task.SQLTask
import com.example.jobhub.model.task.TaskScope
import com.example.jobhub.model.task.TaskSubmission
import com.example.jobhub.model.task.TaskType
import com.example.jobhub.repository.SQLTaskRepository
import com.example.jobhub.repository.TaskSubmissionRepository
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.task.TaskExecutionService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class SQLTaskService(
    val taskRepository: SQLTaskRepository,
    val taskSubmissionRepository: TaskSubmissionRepository,
    val taskMapper: TaskMapper,
    val taskSubmissionMapper: TaskSubmissionMapper,
    val userRepository: UserRepository,
    val sqlExecutionEngine: SQLExecutionEngine
) : TaskExecutionService{

    override val taskType = TaskType.SQL

    fun createTask(userId: UUID, createTask: CreateSQLTask): SQLTaskDto{
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }

        if (createTask.assertions.isEmpty()) {
            throw ApiException("Task must have at least one assertion", HttpStatus.BAD_REQUEST)
        }
        val task = SQLTask(
            createTask.title,
            createTask.setupQueries,
            createTask.assertions,
            createTask.instructions,
            createTask.skillLevel,
            createTask.scope,
            user
        )
        return taskMapper.toSQLTaskDto(
            taskRepository.save(task)
        )
    }

    override fun submitTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse {
        val task = taskRepository.findById(submitTask.taskId)
            .orElseThrow { ApiException("Task not found", HttpStatus.NOT_FOUND) }

        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }

        if(submitTask.codes.isNullOrEmpty()) {
            throw ApiException("The 'codes' must not be null or empty and must contain at least one item", HttpStatus.BAD_REQUEST)
        }
        val totalAssertions = task.assertions.size
        val allQueries = submitTask.codes.joinToString("") { "<query>$it</query>" }

        val results = try {
            sqlExecutionEngine.run(task.setupQueries, submitTask.codes, task.assertions)
        } catch (e: Exception) {
            val taskSubmission = TaskSubmission(
                task.id,
                TaskType.SQL,
                allQueries,
                false,
                0.0,
                totalAssertions.toDouble(),
                e.message,
                user
            )
            return taskSubmissionMapper.toTaskSubmissionResponse(
                taskSubmissionRepository.save(taskSubmission)
            )
        }
        val passedCount = results.count { it.passed }
        val taskSubmission = TaskSubmission(
            task.id,
            TaskType.SQL,
            allQueries,
            passedCount == totalAssertions,
            passedCount.toDouble(),
            totalAssertions.toDouble(),
            user
        )
        return taskSubmissionMapper.toTaskSubmissionResponse(
            taskSubmissionRepository.save(taskSubmission)
        )
    }

    fun getTasks(userId: UUID): List<SQLTaskDto> {
        return taskMapper.toSQLTaskDto(taskRepository.findAllByCreatedById(userId))
    }

    fun getAllTasks(userId: UUID): List<SQLTaskDto> {
        return taskMapper.toSQLTaskDto(
            taskRepository.findAllByCreatedByIdOrScope(userId, TaskScope.PUBLIC)
        )
    }
}