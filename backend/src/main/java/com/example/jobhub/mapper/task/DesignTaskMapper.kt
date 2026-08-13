package com.example.jobhub.mapper.task

import com.example.jobhub.dto.DesignTaskDto
import com.example.jobhub.model.task.DesignTask
import org.springframework.stereotype.Component

@Component
class DesignTaskMapper {

    fun toDesignTaskDto(designTask: DesignTask): DesignTaskDto {
        return DesignTaskDto(
            id = designTask.id,
            title = designTask.title,
            imageBytes = designTask.imageBytes,
            imageContentType = designTask.imageContentType,
            minimumMatchingScore = designTask.minimumMatchingScore,
            instructions = designTask.instructions,
            skillLevel = designTask.skillLevel,
            scope = designTask.scope,
            createdBy = designTask.createdBy.id
        )
    }

    fun toDesignTaskDto(designTasks: List<DesignTask>): List<DesignTaskDto> {
        return designTasks.map { toDesignTaskDto(it) }
    }
}