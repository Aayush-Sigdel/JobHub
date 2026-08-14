package com.example.jobhub.dto

import com.example.jobhub.model.task.TaskType
import java.util.UUID

data class SubmitTask(
    val taskId: UUID,
    val code: String? = null,
    val codes: List<String>? = null,
    val taskType: TaskType
)

data class TaskSubmissionResponse(
    val taskId: UUID,
    val taskType: TaskType,
    val passed: Boolean,
    val achievedScore: Double,
    val requiredScore: Double,
    val message: String? = null
)
