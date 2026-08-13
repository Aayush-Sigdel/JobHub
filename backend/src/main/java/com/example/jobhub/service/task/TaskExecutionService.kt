package com.example.jobhub.service.task

import com.example.jobhub.dto.SubmitTask
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.model.task.TaskType
import java.util.UUID

interface TaskExecutionService{

    val taskType: TaskType

    fun submitTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse
}
