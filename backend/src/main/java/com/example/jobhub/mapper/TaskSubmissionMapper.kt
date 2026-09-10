package com.example.jobhub.mapper

import com.example.jobhub.dto.TaskSubmissionCodeResponse
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.model.task.TaskSubmission
import org.springframework.stereotype.Component

@Component
class TaskSubmissionMapper {

    fun toTaskSubmissionResponse(taskSubmission: TaskSubmission): TaskSubmissionResponse {
        return TaskSubmissionResponse(
            id = taskSubmission.id,
            taskId = taskSubmission.taskId,
            taskType = taskSubmission.taskType,
            passed = taskSubmission.isPassed,
            achievedScore = taskSubmission.achievedScore,
            requiredScore = taskSubmission.requiredScore,
            message = taskSubmission.message
        )
    }

    fun toTaskSubmissionCodeResponse(taskSubmission: TaskSubmission): TaskSubmissionCodeResponse {
        return TaskSubmissionCodeResponse(
            id = taskSubmission.id,
            taskId = taskSubmission.taskId,
            taskType = taskSubmission.taskType,
            code = taskSubmission.code,
            submittedById = taskSubmission.solvedBy.id,
            passed = taskSubmission.isPassed,
            achievedScore = taskSubmission.achievedScore,
            requiredScore = taskSubmission.requiredScore,
            message = taskSubmission.message
        )
    }
}