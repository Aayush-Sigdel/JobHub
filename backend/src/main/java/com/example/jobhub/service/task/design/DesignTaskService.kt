package com.example.jobhub.service.task.design

import com.example.jobhub.dto.CreateDesignTask
import com.example.jobhub.dto.DesignTaskDto
import com.example.jobhub.dto.SubmitTask
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.task.DesignTaskMapper
import com.example.jobhub.mapper.task.TaskSubmissionMapper
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
import java.util.UUID
import javax.imageio.ImageIO

@Service
class DesignTaskService(
    val taskRepository: DesignTaskRepository,
    val taskSubmissionRepository: TaskSubmissionRepository,
    val taskSubmissionMapper: TaskSubmissionMapper,
    val mapper: DesignTaskMapper,
    val renderingService: RenderingService,
    val scoringService: ScoringService,
    val userRepository: UserRepository,
): TaskExecutionService {

    override val taskType: TaskType = TaskType.DESIGN

    val requiredImageWidth = 400
    val requiredImageHeight = 300

    val marginOfError = 3.0

    fun createTask(userId: UUID, createTask: CreateDesignTask): DesignTaskDto {
        val userOptional = userRepository.findById(userId)
        if(userOptional.isEmpty){
            throw ApiException("User not found", HttpStatus.NOT_FOUND)
        }
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
            userOptional.get()
        )
        return mapper.toDesignTaskDto(
            taskRepository.save(task)
        )
    }

    override fun submitTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse{
        val taskOptional = taskRepository.findById(submitTask.taskId)
        if(taskOptional.isEmpty){
            throw ApiException("Task not found", HttpStatus.NOT_FOUND)
        }
        val solvedUserOptional = userRepository.findById(userId)
        if(solvedUserOptional.isEmpty){
            throw ApiException("User not found", HttpStatus.NOT_FOUND)
        }
        val task = taskOptional.get()
        val renderedBytes = renderingService.renderAndScreenshot(submitTask.code, requiredImageWidth, requiredImageHeight)
        val score = scoringService.compareImages(renderedBytes, task.imageBytes)
        val passed = score >= task.minimumMatchingScore - marginOfError
        val taskSubmission = TaskSubmission(task.id, TaskType.DESIGN, submitTask.code, passed, solvedUserOptional.get())
        return taskSubmissionMapper.toTaskSubmissionResponse(
            taskSubmissionRepository.save(taskSubmission)
        )
    }

    fun getTasks(userId: UUID): List<DesignTaskDto> {
        return mapper.toDesignTaskDto(taskRepository.findAllByCreatedById(userId));
    }

    // Returns design task submitted by that user + all design tasks with scope PUBLIC
    fun getAllTasks(userId: UUID): List<DesignTaskDto> {
        return mapper.toDesignTaskDto(
            taskRepository.findAllByCreatedByIdOrScope(userId, TaskScope.PUBLIC)
        )
    }
}