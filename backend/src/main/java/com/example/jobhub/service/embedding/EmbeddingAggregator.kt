package com.example.jobhub.service.embedding

import com.example.jobhub.model.User
import kotlin.math.sqrt

object EmbeddingAggregator {

    fun centroid(user: User): FloatArray? {
        val sources = listOfNotNull(
            user.platformEmbedding,
            user.githubEmbedding,
            user.stackoverflowEmbedding,
            user.devtoEmbedding,
            user.orcidEmbedding
        ).filter { it.isNotEmpty() }

        if (sources.isEmpty()) return null

        // Dimension is taken from the first available source; any stale vector of a different
        // length is skipped rather than corrupting the sum.
        val dim = sources.first().size
        val acc = DoubleArray(dim)
        var contributed = false

        for (vector in sources) {
            if (vector.size != dim) continue
            for (i in 0 until dim) {
                acc[i] += vector[i]
            }
            contributed = true
        }
        if (!contributed) return null
        return normalize(acc)
    }

    private fun normalize(acc: DoubleArray): FloatArray? {
        var norm = 0.0
        for (value in acc) norm += value * value
        norm = sqrt(norm)
        if (norm == 0.0 || !norm.isFinite()) return null

        val result = FloatArray(acc.size)
        for (i in acc.indices) {
            result[i] = (acc[i] / norm).toFloat()
        }
        return result
    }

    fun toPgVector(vector: FloatArray): String =
        vector.joinToString(separator = ",", prefix = "[", postfix = "]")
}
