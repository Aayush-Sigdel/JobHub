package com.example.jobhub.mapper.task

import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.model.task.TaskSubmission
import org.springframework.stereotype.Component

@Component
class TaskSubmissionMapper {

    fun toTaskSubmissionResponse(taskSubmission: TaskSubmission): TaskSubmissionResponse {
        return TaskSubmissionResponse(
            taskId = taskSubmission.taskId,
            taskType = taskSubmission.taskType,
            passed = taskSubmission.isPassed
        )
    }
}