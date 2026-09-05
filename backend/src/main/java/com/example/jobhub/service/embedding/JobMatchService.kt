package com.example.jobhub.service.embedding

import com.example.jobhub.model.User
import org.springframework.stereotype.Service
import kotlin.math.roundToInt

data class JobMatchBreakdown(
    val overall: Double?,
    val platform: Double?,
    val github: Double?,
    val devto: Double?,
    val orcid: Double?,
    val stackoverflow: Double?,
    val portfolio: Double?
) {
    val percentage: Int?
        get() = overall?.let { (it.coerceIn(0.0, 1.0) * 100).roundToInt() }
}

@Service
class JobMatchService {

    companion object {
        private const val WEIGHT_PLATFORM = 0.50
        private const val WEIGHT_GITHUB = 0.30
        private const val WEIGHT_STACKOVERFLOW = 0.10
        private const val WEIGHT_DEVTO = 0.05
        private const val WEIGHT_ORCID = 0.05
    }

    fun calculate(jobEmbedding: FloatArray?, candidate: User): JobMatchBreakdown {
        if (jobEmbedding == null) {
            return JobMatchBreakdown(null, null, null, null, null, null, null)
        }

        val profile = similarity(jobEmbedding, candidate.profileEmbedding)
        val platform = similarity(jobEmbedding, candidate.platformEmbedding)
        val github = similarity(jobEmbedding, candidate.githubEmbedding)
        val devto = similarity(jobEmbedding, candidate.devtoEmbedding)
        val orcid = similarity(jobEmbedding, candidate.orcidEmbedding)
        val stackoverflow = similarity(jobEmbedding, candidate.stackoverflowEmbedding)
        val portfolio = similarity(jobEmbedding, candidate.portfolioEmbedding)

        val weightedScores = listOfNotNull(
            platform?.let { it to WEIGHT_PLATFORM },
            github?.let { it to WEIGHT_GITHUB },
            stackoverflow?.let { it to WEIGHT_STACKOVERFLOW },
            devto?.let { it to WEIGHT_DEVTO },
            orcid?.let { it to WEIGHT_ORCID }
        )

        val totalWeight = weightedScores.sumOf { it.second }
        val weightedOverall = if (totalWeight > 0.0) {
            weightedScores.sumOf { it.first * it.second } / totalWeight
        } else {
            null
        }

        return JobMatchBreakdown(
            overall = rounded(weightedOverall ?: profile),
            platform = rounded(platform),
            github = rounded(github),
            devto = rounded(devto),
            orcid = rounded(orcid),
            stackoverflow = rounded(stackoverflow),
            portfolio = rounded(portfolio)
        )
    }

    private fun similarity(jobEmbedding: FloatArray, candidateEmbedding: FloatArray?): Double? {
        if (candidateEmbedding == null) return null
        return runCatching { CosineSimilarity.compute(jobEmbedding, candidateEmbedding) }
            .getOrNull()
            ?.coerceIn(0.0, 1.0)
    }

    private fun rounded(value: Double?): Double? =
        value?.let { (it.coerceIn(0.0, 1.0) * 1000.0).roundToInt() / 1000.0 }
}
