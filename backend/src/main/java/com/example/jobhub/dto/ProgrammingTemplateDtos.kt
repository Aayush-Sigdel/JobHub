package com.example.jobhub.dto

import com.example.jobhub.model.task.Language
import java.util.UUID

data class ProgrammingTemplateDto(
    val taskId: UUID,
    val language: Language,
    val code: String
)
