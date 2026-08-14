package com.example.jobhub.mapper

import com.example.jobhub.dto.DesignTaskDto
import com.example.jobhub.dto.SQLTaskDto
import com.example.jobhub.model.task.DesignTask
import com.example.jobhub.model.task.SQLTask
import org.springframework.stereotype.Component

@Component
class TaskMapper {

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

    fun toSQLTaskDto(sqlTask: SQLTask): SQLTaskDto{
        return SQLTaskDto(
            id = sqlTask.id,
            title = sqlTask.title,
            instructions = sqlTask.instructions,
            skillLevel = sqlTask.skillLevel,
            scope = sqlTask.scope,
            createdBy = sqlTask.createdBy.id
        )
    }

    fun toSQLTaskDto(sqlTasks: List<SQLTask>): List<SQLTaskDto> {
        return sqlTasks.map { toSQLTaskDto(it) }
    }
}