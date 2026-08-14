package com.example.jobhub.dto

import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.task.TaskScope
import java.util.UUID

data class CreateSQLTask(
    val title: String,
    val setupQueries: List<String>,
    val assertions: List<String>,
    val instructions: String,
    val skillLevel: SkillLevel,
    val scope: TaskScope
)

data class SQLTaskDto(
    val id: UUID,
    val title: String,
    val instructions: String,
    val skillLevel: SkillLevel,
    val scope: TaskScope,
    val createdBy: UUID
)