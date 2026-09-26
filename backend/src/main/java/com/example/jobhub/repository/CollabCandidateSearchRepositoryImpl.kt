package com.example.jobhub.repository

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Recall, not ranking.
 *
 * There is deliberately no similarity floor here. `poolSize` is the only bound: the query orders by
 * distance and takes the closest N, so a `WHERE distance <= x` predicate could never improve the
 * ordering — it could only return *fewer* than N, which is exactly the wrong outcome on a small
 * dataset.
 *
 * It would also cut in the wrong place. The query vector is a *residual* (the project with its
 * current team projected out), not an ordinary document embedding, so absolute similarities against
 * it are low and get lower as the team fills up — a fixed floor would quietly filter out more people
 * the closer a project gets to complete. And SQL cannot see skill coverage, so a threshold here can
 * discard the candidate who satisfies every hard requirement but sits off the residual's direction,
 * before TeamMatchService's set-cover term ever gets to rescue them.
 *
 * Filter late, in the ranker, where the full picture is available.
 */
@Repository
class CollabCandidateSearchRepositoryImpl : CollabCandidateSearchRepository {

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    @Transactional(readOnly = true)
    override fun searchCollabCandidates(
        queryVector: String,
        excludeUserIds: Collection<UUID>,
        location: String?,
        poolSize: Int
    ): List<CandidateHit> {
        val locationFilter = location?.trim()?.takeIf { it.isNotEmpty() }
        val excluded = excludeUserIds.toList()

        val sql = buildString {
            append("SELECT u.id, 1 - (u.overall_embedding <=> CAST(:vec AS vector)) AS similarity ")
            append("FROM users u ")
            append("WHERE u.discoverable = true ")
            append("AND u.employer = false ")
            append("AND u.overall_embedding IS NOT NULL ")
            if (excluded.isNotEmpty()) {
                append("AND u.id NOT IN (:excludedIds) ")
            }
            if (locationFilter != null) {
                append("AND u.location IS NOT NULL ")
                append("AND LOWER(u.location) LIKE LOWER(CONCAT('%', CAST(:location AS text), '%')) ")
            }
            append("ORDER BY u.overall_embedding <=> CAST(:vec AS vector)")
        }

        val query = entityManager.createNativeQuery(sql)
            .setParameter("vec", queryVector)
            .setMaxResults(poolSize)

        if (excluded.isNotEmpty()) {
            query.setParameter("excludedIds", excluded)
        }
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
            CandidateHit(userId = id, similarity = similarity.coerceIn(0.0, 1.0))
        }
    }
}
