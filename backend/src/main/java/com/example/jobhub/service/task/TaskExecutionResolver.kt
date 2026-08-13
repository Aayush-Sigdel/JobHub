package com.example.jobhub.service.task

import com.example.jobhub.model.task.TaskType
import org.springframework.stereotype.Component

@Component
class TaskExecutionResolver(
    taskExecutions: List<TaskExecutionService>
) {
    private val executions = taskExecutions.associateBy { it.taskType }

    fun resolve(taskType: TaskType): TaskExecutionService? {
        return executions[taskType]
    }
}