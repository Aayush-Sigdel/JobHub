package com.example.jobhub.service.task.programming.template

import com.example.jobhub.dto.ProgrammingTemplateDto
import com.example.jobhub.exception.ApiException
import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.model.task.TaskScope
import com.example.jobhub.repository.ProgrammingTaskRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class ProgrammingTemplateService(
    private val taskRepository: ProgrammingTaskRepository,
    generators: List<SolutionTemplateGenerator>
) {
    private val generatorsByLanguage = generators.associateBy { it.language }

    val supportedLanguages: List<Language> = generatorsByLanguage.keys.sortedBy { it.name }

    @Transactional(readOnly = true)
    fun getTemplate(userId: UUID, taskId: UUID, language: Language): ProgrammingTemplateDto {
        val generator = generatorsByLanguage[language]
            ?: throw ApiException(
                "Language $language is not supported yet, supported languages: $supportedLanguages",
                HttpStatus.BAD_REQUEST
            )
        return toDto(accessibleTask(userId, taskId), generator)
    }

    @Transactional(readOnly = true)
    fun getTemplates(userId: UUID, taskId: UUID): List<ProgrammingTemplateDto> {
        val task = accessibleTask(userId, taskId)
        return supportedLanguages.map { toDto(task, generatorsByLanguage.getValue(it)) }
    }

    private fun toDto(task: ProgrammingTask, generator: SolutionTemplateGenerator) = ProgrammingTemplateDto(
        taskId = task.id,
        language = generator.language,
        code = generator.generate(task)
    )

    // Same visibility rule as getAllTasks: a task is reachable when it is public or owned by the caller.
    private fun accessibleTask(userId: UUID, taskId: UUID): ProgrammingTask {
        val task = taskRepository.findById(taskId)
            .orElseThrow { ApiException("Task not found", HttpStatus.NOT_FOUND) }

        if (task.scope != TaskScope.PUBLIC && task.createdBy.id != userId) {
            throw ApiException("Task not found", HttpStatus.NOT_FOUND)
        }
        return task
    }
}
