package com.example.jobhub.service.embedding

import com.example.jobhub.model.User
import kotlin.math.sqrt

object EmbeddingAggregator {

    private const val WEIGHT_PLATFORM = 0.50
    private const val WEIGHT_GITHUB = 0.30
    private const val WEIGHT_STACKOVERFLOW = 0.10
    private const val WEIGHT_DEVTO = 0.05
    private const val WEIGHT_ORCID = 0.05


    fun weightedCentroid(user: User): FloatArray? {
        val sources = listOfNotNull(
            user.platformEmbedding?.let { it to WEIGHT_PLATFORM },
            user.githubEmbedding?.let { it to WEIGHT_GITHUB },
            user.stackoverflowEmbedding?.let { it to WEIGHT_STACKOVERFLOW },
            user.devtoEmbedding?.let { it to WEIGHT_DEVTO },
            user.orcidEmbedding?.let { it to WEIGHT_ORCID }
        ).filter { it.first.isNotEmpty() }

        if (sources.isEmpty()) return null

        // Dimension is taken from the first available source; any stale vector of a different
        // length is skipped rather than corrupting the sum.
        val dim = sources.first().first.size
        val acc = DoubleArray(dim)
        var contributed = false

        for ((vector, weight) in sources) {
            if (vector.size != dim) continue
            for (i in 0 until dim) {
                acc[i] += vector[i] * weight
            }
            contributed = true
        }
        if (!contributed) return null

        // No need to divide by the total weight: normalizing the sum makes any positive uniform
        // scaling irrelevant, so the weights only ever matter relative to each other.
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
