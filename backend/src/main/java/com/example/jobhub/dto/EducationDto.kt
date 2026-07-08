package com.example.jobhub.dto

import java.time.Instant
import java.util.UUID

data class EducationDto(
    val id: UUID?,
    val institution: String,
    val degree: String,
    val fieldOfStudy: String,
    val startDate: Instant,
    val endDate: Instant?,
    val description: String?
)

data class CreateEducationRequest(
    val institution: String,
    val degree: String,
    val fieldOfStudy: String,
    val startDate: Instant,
    val endDate: Instant?,
    val description: String?
)

data class UpdateEducationRequest(
    val institution: String?,
    val degree: String?,
    val fieldOfStudy: String?,
    val startDate: Instant?,
    val endDate: Instant?,
    val description: String?
)
