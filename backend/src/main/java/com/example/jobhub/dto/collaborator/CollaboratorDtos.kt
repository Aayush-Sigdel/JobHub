package com.example.jobhub.dto.collaborator

import com.example.jobhub.dto.SkillDto
import com.example.jobhub.model.CollaboratorSource
import java.util.UUID

data class UpdateDiscoverabilityRequest(
    val discoverable: Boolean
)

data class CollaboratorMatchResponse(
    val userId: UUID,
    val name: String,
    val email: String,
    val title: String?,
    val bio: String?,
    val location: String?,
    val imageUrl: String?,
    val skills: List<SkillDto>,
    val similarity: Double,
    val matchPercentage: Int,
    val source: CollaboratorSource
)
