package com.example.jobhub.repository

import java.util.UUID

data class CandidateHit(
    val userId: UUID,
    val similarity: Double
)

interface CollabCandidateSearchRepository {

    fun searchCollabCandidates(
        queryVector: String,
        excludeUserIds: Collection<UUID>,
        location: String?,
        poolSize: Int
    ): List<CandidateHit>
}
