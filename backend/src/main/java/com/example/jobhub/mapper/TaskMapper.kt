package com.example.jobhub.mapper

import com.example.jobhub.dto.DesignTaskDto
import com.example.jobhub.dto.ProgrammingTaskDto
import com.example.jobhub.dto.ProgrammingTestCase
import com.example.jobhub.dto.SQLTaskDto
import com.example.jobhub.model.task.DesignTask
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.model.task.SQLTask
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class TaskMapper(
    val objectMapper: ObjectMapper
) {

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

    fun toProgrammingTaskDto(programmingTask: ProgrammingTask, maximumExampleTestCases: Int): ProgrammingTaskDto {
        val allTestCases: List<ProgrammingTestCase> = objectMapper.readValue(
            programmingTask.testCasesJson,
            objectMapper.typeFactory.constructCollectionType(List::class.java, ProgrammingTestCase::class.java)
        )
        return ProgrammingTaskDto(
            id = programmingTask.id.toString(),
            title = programmingTask.title,
            instructions = programmingTask.instructions,
            skillLevel = programmingTask.skillLevel,
            scope = programmingTask.scope,
            methodName = programmingTask.methodName,
            parameters = programmingTask.parameters,
            returnType = programmingTask.returnType,
            exampleTestCases = allTestCases.take(maximumExampleTestCases),
            orderInsensitiveOutput = programmingTask.isOrderInsensitiveOutput
        )
    }

    fun toProgrammingTaskDto(programmingTasks: List<ProgrammingTask>, maximumExampleTestCases: Int): List<ProgrammingTaskDto> {
        return programmingTasks.map { toProgrammingTaskDto(it, maximumExampleTestCases) }
    }
}