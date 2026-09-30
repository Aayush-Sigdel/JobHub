package com.example.jobhub.service.collab

import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.collab.RequiredSkill
import com.example.jobhub.service.embedding.CosineSimilarity
import org.springframework.stereotype.Service
import java.util.UUID
import kotlin.math.sqrt

data class CandidateProfile(
    val userId: UUID,
    val vector: FloatArray,
    val skills: Map<String, SkillLevel>
) {

    override fun equals(other: Any?) = this === other || (other is CandidateProfile && userId == other.userId)
    override fun hashCode() = userId.hashCode()
}

data class RoleSpec(
    val roleId: UUID?,
    val title: String,
    val requiredSkills: List<RequiredSkill>
)

data class ScoredCandidate(
    val userId: UUID,
    val score: Double,
    val gapFit: Double,
    val skillCoverage: Double,
    val teamOverlap: Double,
    val coveredSkills: List<String>,
    val missingSkills: List<String>
)

data class RoleShortlist(
    val role: RoleSpec,
    val candidates: List<ScoredCandidate>
)

@Service
class TeamMatchService {

    companion object {
        private const val GAP_WEIGHT = 0.6
        private const val SKILL_WEIGHT = 1.0 - GAP_WEIGHT

        // Partial credit for having a required skill, but below the level the role asks for
        private const val UNDER_LEVEL_CREDIT = 0.5

        private val SKILL_NOISE = Regex("[^a-z0-9+#]")
    }

    fun residual(projectVector: FloatArray, memberVectors: List<FloatArray>): FloatArray {
        if (memberVectors.isEmpty()) return projectVector

        val r = DoubleArray(projectVector.size) { projectVector[it].toDouble() }

        for (member in memberVectors) {
            if (member.size != r.size) continue
            val unit = normalized(member) ?: continue

            var dot = 0.0
            for (i in r.indices) dot += r[i] * unit[i]
            if (dot <= 0.0) continue

            for (i in r.indices) r[i] -= dot * unit[i]
        }

        // A team that already spans the whole project leaves a zero residual. There is no gap left
        // to point at, so fall back to the project itself rather than ranking against noise.
        return toFloatArray(r) ?: projectVector
    }

    fun rankForRole(
        residual: FloatArray,
        role: RoleSpec,
        pool: List<CandidateProfile>,
        teamVectors: List<FloatArray>,
        limit: Int = 10
    ): List<ScoredCandidate> =
        pool.map { score(it, residual, role, teamVectors) }
            .sortedByDescending { it.score }
            .take(limit)

    fun buildSquad(
        projectVector: FloatArray,
        openRoles: List<RoleSpec>,
        pool: List<CandidateProfile>,
        teamVectors: List<FloatArray>,
        shortlistSize: Int = 10
    ): List<RoleShortlist> {
        if (openRoles.isEmpty() || pool.isEmpty()) return emptyList()

        val byId = pool.associateBy { it.userId }
        val taken = mutableSetOf<UUID>()
        val selectedVectors = teamVectors.toMutableList()
        var currentResidual = residual(projectVector, teamVectors)
        val shortlists = arrayOfNulls<RoleShortlist>(openRoles.size)
        val remaining = openRoles.indices.toMutableSet()

        // Fill the role with the strongest top pick first. Walking roles in list order let whichever
        // role happened to come first claim a candidate who fits a later role far better.
        while (remaining.isNotEmpty()) {
            val available = pool.filter { it.userId !in taken }
            val (index, ranked) = remaining
                .map { it to rankForRole(currentResidual, openRoles[it], available, selectedVectors, shortlistSize) }
                .maxBy { (_, ranked) -> ranked.firstOrNull()?.score ?: Double.NEGATIVE_INFINITY }

            remaining -= index
            shortlists[index] = RoleShortlist(openRoles[index], ranked)

            ranked.firstOrNull()?.let { top ->
                byId[top.userId]?.let { picked ->
                    taken += picked.userId
                    selectedVectors += picked.vector
                    currentResidual = residual(currentResidual, listOf(picked.vector))
                }
            }
        }

        return shortlists.map { requireNotNull(it) }
    }

    fun score(
        candidate: CandidateProfile,
        residual: FloatArray,
        role: RoleSpec,
        teamVectors: List<FloatArray>,
    ): ScoredCandidate {
        val gapFit = similarity(candidate.vector, residual)
        val coverage = skillCoverage(candidate.skills, role.requiredSkills)

        val overlap = teamVectors
            .maxOfOrNull { similarity(candidate.vector, it) }
            ?: 0.0

        return ScoredCandidate(
            userId = candidate.userId,
            score = GAP_WEIGHT * gapFit + SKILL_WEIGHT * coverage.fraction,
            gapFit = gapFit,
            skillCoverage = coverage.fraction,
            teamOverlap = overlap,
            coveredSkills = coverage.covered,
            missingSkills = coverage.missing
        )
    }

    private class Coverage(
        val fraction: Double,
        val covered: List<String>,
        val missing: List<String>
    )

    private fun skillCoverage(
        candidateSkills: Map<String, SkillLevel>,
        required: List<RequiredSkill>
    ): Coverage {
        if (required.isEmpty()) return Coverage(1.0, emptyList(), emptyList())

        val covered = mutableListOf<String>()
        val missing = mutableListOf<String>()
        var total = 0.0

        for (requirement in required) {
            val held = candidateSkills[normalizeSkill(requirement.name)]
            when {
                held == null -> missing += requirement.name
                held.ordinal >= requirement.minLevel.ordinal -> {
                    total += 1.0
                    covered += requirement.name
                }
                else -> {
                    total += UNDER_LEVEL_CREDIT
                    covered += requirement.name
                }
            }
        }

        return Coverage(total / required.size, covered, missing)
    }

    fun normalizeSkill(name: String): String =
        name.trim().lowercase().replace(SKILL_NOISE, "")

    private fun similarity(a: FloatArray, b: FloatArray): Double =
        if (a.size != b.size) 0.0
        else runCatching { CosineSimilarity.compute(a, b) }.getOrDefault(0.0).coerceIn(0.0, 1.0)

    private fun normalized(vector: FloatArray): DoubleArray? {
        var norm = 0.0
        for (value in vector) norm += value.toDouble() * value.toDouble()
        norm = sqrt(norm)
        if (norm == 0.0 || !norm.isFinite()) return null
        return DoubleArray(vector.size) { vector[it] / norm }
    }

    private fun toFloatArray(values: DoubleArray): FloatArray? {
        var norm = 0.0
        for (value in values) norm += value * value
        norm = sqrt(norm)
        if (norm < 1e-9 || !norm.isFinite()) return null
        return FloatArray(values.size) { (values[it] / norm).toFloat() }
    }
}
