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
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class SQLTaskService(
    private val taskRepository: SQLTaskRepository,
    private val taskSubmissionRepository: TaskSubmissionRepository,
    private val taskMapper: TaskMapper,
    private val taskSubmissionMapper: TaskSubmissionMapper,
    private val userRepository: UserRepository,
    private val sqlExecutionEngine: SQLExecutionEngine
) : TaskExecutionService{

    override val taskType = TaskType.SQL

    @Transactional
    fun createTask(userId: UUID, createTask: CreateSQLTask): SQLTaskDto{
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
            user(userId)
        )
        return taskMapper.toSQLTaskDto(
            taskRepository.save(task)
        )
    }

    override fun evaluateTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse {
        val task = task(submitTask.taskId)
        if(submitTask.codes.isNullOrEmpty()) {
            throw ApiException("The 'codes' must not be null or empty and must contain at least one item", HttpStatus.BAD_REQUEST)
        }
        val totalAssertions = task.assertions.size

        val results = try {
            sqlExecutionEngine.run(task.setupQueries, submitTask.codes, task.assertions)
        } catch (e: Exception) {
            return TaskSubmissionResponse(
                taskId = task.id,
                taskType = TaskType.SQL,
                passed = false,
                achievedScore = 0.0,
                requiredScore = totalAssertions.toDouble(),
                message = e.message
            )
        }
        val passedCount = results.count { it.passed }
        return TaskSubmissionResponse(
            taskId = task.id,
            taskType = TaskType.SQL,
            passed = passedCount == totalAssertions,
            achievedScore = passedCount.toDouble(),
            requiredScore = totalAssertions.toDouble()
        )
    }

    @Transactional
    override fun submitTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse {
        val evaluation = evaluateTask(userId, submitTask)
        val allQueries = submitTask.codes.orEmpty().joinToString("") { "<query>$it</query>" }
        val taskSubmission = TaskSubmission(
            evaluation.taskId,
            TaskType.SQL,
            allQueries,
            evaluation.passed,
            evaluation.achievedScore,
            evaluation.requiredScore,
            evaluation.message,
            user(userId)
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

    private fun user(userId: UUID) = userRepository.findById(userId)
        .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }

    private fun task(taskId: UUID) = taskRepository.findById(taskId)
        .orElseThrow { ApiException("Task not found", HttpStatus.NOT_FOUND) }
}
