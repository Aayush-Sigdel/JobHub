package com.example.jobhub.service.task

import com.example.jobhub.dto.SubmitTask
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.model.task.TaskType
import java.util.UUID

interface TaskExecutionService{

    val taskType: TaskType

    fun evaluateTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse {
        throw UnsupportedOperationException("Task type $taskType does not support test runs")
    }

    fun submitTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse
}
