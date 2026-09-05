package com.example.jobhub.repository

import com.example.jobhub.model.CollaboratorSource
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Repository
class CollaboratorSearchRepositoryImpl : CollaboratorSearchRepository {

    companion object {
        private const val MIN_SIMILARITY = 0.5
        private const val MAX_DISTANCE = 1.0 - MIN_SIMILARITY
    }

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    @Transactional(readOnly = true)
    override fun searchCollaborators(
        source: CollaboratorSource,
        queryVector: String,
        excludeUserId: UUID,
        location: String?,
        limit: Int
    ): List<CollaboratorHit> {
        val column = source.column
        val locationFilter = location?.trim()?.takeIf { it.isNotEmpty() }

        val sql = buildString {
            append("SELECT u.id, 1 - (u.").append(column).append(" <=> CAST(:vec AS vector)) AS similarity ")
            append("FROM users u ")
            append("WHERE u.discoverable = true ")
            append("AND u.employer = false ")
            append("AND u.id <> :selfId ")
            append("AND u.").append(column).append(" IS NOT NULL ")
            append("AND (u.").append(column).append(" <=> CAST(:vec AS vector)) <= :maxDistance ")
            if (locationFilter != null) {
                append("AND u.location IS NOT NULL ")
                append("AND LOWER(u.location) LIKE LOWER(CONCAT('%', CAST(:location AS text), '%')) ")
            }
            append("ORDER BY u.").append(column).append(" <=> CAST(:vec AS vector)")
        }

        val query = entityManager.createNativeQuery(sql)
            .setParameter("vec", queryVector)
            .setParameter("selfId", excludeUserId)
            .setParameter("maxDistance", MAX_DISTANCE)
            .setMaxResults(limit)

        if (locationFilter != null) {
            query.setParameter("location", locationFilter)
        }

        @Suppress("UNCHECKED_CAST")
        val rows = query.resultList as List<Array<Any?>>

        return rows.mapNotNull { row ->
            val id = when (val raw = row[0]) {
                null -> return@mapNotNull null
                is UUID -> raw
                else -> UUID.fromString(raw.toString())
            }
            val similarity = (row[1] as? Number)?.toDouble() ?: 0.0
            CollaboratorHit(userId = id, similarity = similarity.coerceIn(0.0, 1.0))
        }
    }
}
