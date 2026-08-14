package com.example.jobhub.service.task.sql

import com.example.jobhub.dto.CreateSQLTask
import com.example.jobhub.dto.SQLTaskDto
import com.example.jobhub.dto.SubmitTask
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.TaskMapper
import com.example.jobhub.model.task.SQLTask
import com.example.jobhub.model.task.TaskScope
import com.example.jobhub.model.task.TaskType
import com.example.jobhub.repository.SQLTaskRepository
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.task.TaskExecutionService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class SQLTaskService(
    val taskRepository: SQLTaskRepository,
    val mapper: TaskMapper,
    val userRepository: UserRepository
) : TaskExecutionService{

    override val taskType = TaskType.SQL

    fun createTask(userId: UUID, createTask: CreateSQLTask): SQLTaskDto{
        val userOptional = userRepository.findById(userId)
        if(userOptional.isEmpty){
            throw ApiException("User not found", HttpStatus.NOT_FOUND)
        }
        val task = SQLTask(
            createTask.title,
            createTask.setupQueries,
            createTask.assertions,
            createTask.instructions,
            createTask.skillLevel,
            createTask.scope,
            userOptional.get()
        )
        return mapper.toSQLTaskDto(
            taskRepository.save(task)
        )
    }

    override fun submitTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse {
        TODO("Not yet implemented")
    }

    fun getTasks(userId: UUID): List<SQLTaskDto> {
        return mapper.toSQLTaskDto(taskRepository.findAllByCreatedById(userId))
    }

    fun getAllTasks(userId: UUID): List<SQLTaskDto> {
        return mapper.toSQLTaskDto(
            taskRepository.findAllByCreatedByIdOrScope(userId, TaskScope.PUBLIC)
        )
    }
}