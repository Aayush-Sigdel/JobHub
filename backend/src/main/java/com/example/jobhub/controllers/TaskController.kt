package com.example.jobhub.controllers

import com.example.jobhub.dto.CreateDesignTask
import com.example.jobhub.dto.CreateProgrammingTask
import com.example.jobhub.dto.CreateSQLTask
import com.example.jobhub.dto.DesignTaskDto
import com.example.jobhub.dto.ProgrammingTaskDto
import com.example.jobhub.dto.SQLTaskDto
import com.example.jobhub.dto.SubmitTask
import com.example.jobhub.dto.TaskSubmissionCodeResponse
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.task.TaskExecutionResolver
import com.example.jobhub.service.task.TaskSubmissionService
import com.example.jobhub.service.task.design.DesignTaskService
import com.example.jobhub.service.task.programming.ProgrammingTaskService
import com.example.jobhub.service.task.sql.SQLTaskService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import java.util.UUID

@RestController
@RequestMapping("/api/task")
class TaskController(
    private val designTaskService: DesignTaskService,
    private val sqlTaskService: SQLTaskService,
    private val programmingTaskService: ProgrammingTaskService,
    private val taskExecutionResolver: TaskExecutionResolver,
    private val taskSubmissionService: TaskSubmissionService
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

    @GetMapping("/submission/{submissionId}")
    fun getSubmission(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable submissionId: UUID
    ): ResponseEntity<TaskSubmissionCodeResponse> {
        val response = taskSubmissionService.getSubmission(userDetails.id, submissionId)
        return ResponseEntity.ok(response)
    }

    @PostMapping(
        "/design/create",
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE]
    )
    fun createDesignTask(
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

    @PostMapping("/sql/create")
    fun createSQLTask(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody createTask: CreateSQLTask
    ): ResponseEntity<SQLTaskDto> {
        val task = sqlTaskService.createTask(userDetails.id, createTask)
        return ResponseEntity.status(HttpStatus.CREATED).body(task)
    }

    @GetMapping("/sql/get")
    fun getSQLTasks(@AuthenticationPrincipal userDetails: UserPrincipal): ResponseEntity<List<SQLTaskDto>> {
        val tasks = sqlTaskService.getTasks(userDetails.id)
        return ResponseEntity.ok(tasks)
    }

    @GetMapping("/sql/getAll")
    fun getAllSQLTasks(@AuthenticationPrincipal userDetails: UserPrincipal): ResponseEntity<List<SQLTaskDto>> {
        val tasks = sqlTaskService.getAllTasks(userDetails.id)
        return ResponseEntity.ok(tasks)
    }

    @PostMapping("/programming/create")
    fun createProgrammingTask(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody createTask: CreateProgrammingTask
    ): ResponseEntity<ProgrammingTaskDto> {
        val task = programmingTaskService.createTask(userDetails.id, createTask)
        return ResponseEntity.status(HttpStatus.CREATED).body(task)
    }

    @GetMapping("/programming/get")
    fun getProgrammingTasks(@AuthenticationPrincipal userDetails: UserPrincipal): ResponseEntity<List<ProgrammingTaskDto>> {
        val tasks = programmingTaskService.getTasks(userDetails.id)
        return ResponseEntity.ok(tasks)
    }

    @GetMapping("/programming/getAll")
    fun getAllProgrammingTasks(@AuthenticationPrincipal userDetails: UserPrincipal): ResponseEntity<List<ProgrammingTaskDto>> {
        val tasks = programmingTaskService.getAllTasks(userDetails.id)
        return ResponseEntity.ok(tasks)
    }
}