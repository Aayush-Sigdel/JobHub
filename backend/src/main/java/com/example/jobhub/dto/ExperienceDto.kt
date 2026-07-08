package com.example.jobhub.dto

import java.time.Instant
import java.util.UUID

data class ExperienceDto(
    val id: UUID?,
    val title: String,
    val company: String,
    val startDate: Instant,
    val endDate: Instant?,
    val isCurrentRole: Boolean?,
    val description: String?
)

data class CreateExperienceRequest(
    val title: String,
    val company: String,
    val startDate: Instant,
    val endDate: Instant?,
    val isCurrentRole: Boolean?,
    val description: String?
)

data class UpdateExperienceRequest(
    val title: String?,
    val company: String?,
    val startDate: Instant?,
    val endDate: Instant?,
    val isCurrentRole: Boolean?,
    val description: String?
)
