package com.example.jobhub.service.embedding

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.model.User
import com.example.jobhub.util.FormatUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class PlatformEmbeddingService(
    private val embeddingApiClient: EmbeddingApiClient
) {

    private val logger = LoggerFactory.getLogger(PlatformEmbeddingService::class.java)

    companion object {
        private const val EXPERIENCE_DESC_CHAR_BUDGET = 300
        private const val EDUCATION_DESC_CHAR_BUDGET = 200
        private const val TOTAL_CHAR_BUDGET = 8_000
    }


    suspend fun generateEmbedding(user: User): FloatArray? {
        val text = buildEmbeddingText(user)
        if (text.isBlank()) {
            logger.debug("Skipping platform embedding for user {}: no professional data available", user.id)
            return null
        }
        return withContext(Dispatchers.IO) {
            embeddingApiClient.embed(text)
        }
    }


    fun buildEmbeddingText(user: User): String {
        val sb = StringBuilder()

        user.title?.trim()?.takeIf { it.isNotBlank() }?.let {
            sb.appendLine("Professional Title: $it")
        }

        user.bio?.trim()?.takeIf { it.isNotBlank() }?.let {
            sb.appendLine("Professional Summary: ${FormatUtil.cleanText(it)}")
        }

        if (!user.skills.isNullOrEmpty()) {
            val expertSkills = user.skills.filter { it.level?.name == "EXPERT" }
            val intermediateSkills = user.skills.filter { it.level?.name == "INTERMEDIATE" }
            val beginnerSkills = user.skills.filter { it.level?.name == "BEGINNER" }

            if (expertSkills.isNotEmpty()) {
                sb.appendLine("Expert Skills: ${expertSkills.joinToString(", ") { it.name ?: "" }}")
            }
            if (intermediateSkills.isNotEmpty()) {
                sb.appendLine("Intermediate Skills: ${intermediateSkills.joinToString(", ") { it.name ?: "" }}")
            }
            if (beginnerSkills.isNotEmpty()) {
                sb.appendLine("Familiar With: ${beginnerSkills.joinToString(", ") { it.name ?: "" }}")
            }
        }

        if (!user.experiences.isNullOrEmpty()) {
            sb.appendLine()
            sb.appendLine("Work Experience:")
            user.experiences.forEach { exp ->
                val parts = mutableListOf<String>()
                exp.title?.trim()?.takeIf { it.isNotBlank() }?.let { parts.add(it) }
                exp.company?.trim()?.takeIf { it.isNotBlank() }?.let { parts.add("at $it") }

                if (parts.isNotEmpty()) {
                    sb.appendLine("- ${parts.joinToString(" ")}")
                }

                exp.description?.let { desc ->
                    val cleaned = FormatUtil.truncate(FormatUtil.cleanText(desc), EXPERIENCE_DESC_CHAR_BUDGET)
                    if (cleaned.isNotBlank()) {
                        sb.appendLine("  $cleaned")
                    }
                }

                if (exp.isCurrentRole == true) {
                    sb.appendLine("  (Current Role)")
                }
            }
        }

        if (!user.educations.isNullOrEmpty()) {
            sb.appendLine()
            sb.appendLine("Education:")
            user.educations.forEach { edu ->
                val parts = mutableListOf<String>()
                edu.degree?.trim()?.takeIf { it.isNotBlank() }?.let { parts.add(it) }
                edu.fieldOfStudy?.trim()?.takeIf { it.isNotBlank() }?.let { parts.add("in $it") }
                edu.institution?.trim()?.takeIf { it.isNotBlank() }?.let { parts.add("at $it") }

                if (parts.isNotEmpty()) {
                    sb.appendLine("- ${parts.joinToString(" ")}")
                }

                edu.description?.let { desc ->
                    val cleaned = FormatUtil.truncate(FormatUtil.cleanText(desc), EDUCATION_DESC_CHAR_BUDGET)
                    if (cleaned.isNotBlank()) {
                        sb.appendLine("  $cleaned")
                    }
                }
            }
        }

        return FormatUtil.truncate(sb.toString().trim(), TOTAL_CHAR_BUDGET)
    }
}
