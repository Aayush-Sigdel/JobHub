package com.example.jobhub.repository

import com.example.jobhub.model.CollaboratorSource
import java.util.UUID

data class CollaboratorHit(
    val userId: UUID,
    val similarity: Double
)

interface CollaboratorSearchRepository {

    fun searchCollaborators(
        source: CollaboratorSource,
        queryVector: String,
        excludeUserId: UUID,
        location: String?,
        limit: Int
    ): List<CollaboratorHit>
}
