package com.example.jobhub.controllers

import com.example.jobhub.dto.CreateDesignTask
import com.example.jobhub.dto.DesignTaskDto
import com.example.jobhub.dto.SubmitTask
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.task.TaskExecutionResolver
import com.example.jobhub.service.task.design.DesignTaskService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestBody

@RestController
@RequestMapping("/api/task")
class TaskController(
    private val designTaskService: DesignTaskService,
    private val taskExecutionResolver: TaskExecutionResolver
) {

    @PostMapping("/submit",)
    fun submit(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody submitTask: SubmitTask
    ): ResponseEntity<TaskSubmissionResponse> {
        val taskExecution = taskExecutionResolver.resolve(submitTask.taskType)
            ?: return ResponseEntity.status(HttpStatus.FORBIDDEN).build()

        val response = taskExecution.submitTask(
            userDetails.id,
            submitTask
        )
        return ResponseEntity.ok(response)
    }

    @PostMapping(
        "/design/create",
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE]
    )
    fun createDesign(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @ModelAttribute createAssignment: CreateDesignTask
    ): ResponseEntity<DesignTaskDto> {
        val task = designTaskService.createTask(userDetails.id, createAssignment)
        return ResponseEntity.status(HttpStatus.CREATED).body(task)
    }

    @GetMapping("/design/get")
    fun getDesignTasks(@AuthenticationPrincipal userDetails: UserPrincipal): ResponseEntity<List<DesignTaskDto>> {
        val tasks = designTaskService.getTasks(userDetails.id)
        return ResponseEntity.ok(tasks)
    }

    @GetMapping("/design/getAll")
    fun getAllDesignTasks(@AuthenticationPrincipal userDetails: UserPrincipal): ResponseEntity<List<DesignTaskDto>> {
        val tasks = designTaskService.getAllTasks(userDetails.id)
        return ResponseEntity.ok(tasks)
    }
}