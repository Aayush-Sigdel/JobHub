package com.example.jobhub.service.task.design

import com.example.jobhub.dto.CreateDesignTask
import com.example.jobhub.dto.DesignTaskDto
import com.example.jobhub.dto.SubmitTask
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.TaskMapper
import com.example.jobhub.mapper.TaskSubmissionMapper
import com.example.jobhub.model.task.TaskScope
import com.example.jobhub.model.task.DesignTask
import com.example.jobhub.model.task.TaskSubmission
import com.example.jobhub.model.task.TaskType
import com.example.jobhub.repository.DesignTaskRepository
import com.example.jobhub.repository.TaskSubmissionRepository
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.task.TaskExecutionService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import javax.imageio.ImageIO

@Service
class DesignTaskService(
    private val taskRepository: DesignTaskRepository,
    private val taskSubmissionRepository: TaskSubmissionRepository,
    private val taskMapper: TaskMapper,
    private val taskSubmissionMapper: TaskSubmissionMapper,
    private val renderingService: RenderingService,
    private val scoringService: ScoringService,
    private val userRepository: UserRepository,
): TaskExecutionService {

    override val taskType: TaskType = TaskType.DESIGN

    private val requiredImageWidth = 400
    private val requiredImageHeight = 300

    private val marginOfError = 3.0

    @Transactional
    fun createTask(userId: UUID, createTask: CreateDesignTask): DesignTaskDto {
        if(createTask.minimumMatchingScore > 100){
            throw ApiException("Minimum matching score can't be more than 100 percent", HttpStatus.BAD_REQUEST)
        }
        val image = ImageIO.read(createTask.image.inputStream) ?: throw ApiException("Invalid image", HttpStatus.BAD_REQUEST)
        if (image.width != requiredImageWidth || image.height != requiredImageHeight){
            throw ApiException("Image resolution should be 400x300", HttpStatus.BAD_REQUEST)
        }
        val task = DesignTask(
            createTask.title,
            createTask.image.bytes,
            createTask.minimumMatchingScore,
            createTask.image.contentType,
            createTask.instructions,
            createTask.skillLevel,
            createTask.scope,
            user(userId)
        )
        return taskMapper.toDesignTaskDto(
            taskRepository.save(task)
        )
    }

    @Transactional
    override fun submitTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse{
        val task = task(submitTask.taskId)
        if(submitTask.code == null) {
            throw ApiException("The 'code' field should be present while submitting this task", HttpStatus.BAD_REQUEST)
        }
        val renderedBytes = renderingService.renderAndScreenshot(submitTask.code, requiredImageWidth, requiredImageHeight)
        val score = scoringService.compareImages(renderedBytes, task.imageBytes)
        val passed = score >= task.minimumMatchingScore - marginOfError
        val taskSubmission = TaskSubmission(
            task.id,
            TaskType.DESIGN,
            submitTask.code,
            passed,
            score,
            task.minimumMatchingScore,
            user(userId)
        )
        return taskSubmissionMapper.toTaskSubmissionResponse(
            taskSubmissionRepository.save(taskSubmission)
        )
    }

    fun getTasks(userId: UUID): List<DesignTaskDto> {
        return taskMapper.toDesignTaskDto(taskRepository.findAllByCreatedById(userId))
    }

    // Returns design task submitted by that user + all design tasks with scope PUBLIC
    fun getAllTasks(userId: UUID): List<DesignTaskDto> {
        return taskMapper.toDesignTaskDto(
            taskRepository.findAllByCreatedByIdOrScope(userId, TaskScope.PUBLIC)
        )
    }

    private fun user(userId: UUID) = userRepository.findById(userId)
        .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }

    private fun task(taskId: UUID) = taskRepository.findById(taskId)
        .orElseThrow { ApiException("Task not found", HttpStatus.NOT_FOUND) }
}