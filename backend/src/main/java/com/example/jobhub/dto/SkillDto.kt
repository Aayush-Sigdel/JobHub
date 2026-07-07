package com.example.jobhub.dto

import com.example.jobhub.model.SkillLevel
import java.util.UUID

data class SkillDto(
    val id: UUID?,
    val name: String,
    val level: SkillLevel
)

data class CreateSkillRequest(
    val name: String,
    val level: SkillLevel
)

data class UpdateSkillRequest(
    val name: String?,
    val level: SkillLevel?
)
