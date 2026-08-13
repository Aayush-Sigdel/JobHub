package com.example.jobhub.dto

import com.example.jobhub.model.task.TaskType
import java.util.UUID

data class SubmitTask(
    val taskId: UUID,
    val code: String,
    val taskType: TaskType
)

data class TaskSubmissionResponse(
    val taskId: UUID? = null,
    val taskType: TaskType? = null,
    val passed: Boolean = false
)
