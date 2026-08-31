package com.example.jobhub.service.embedding

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.dto.StackoverflowProfile
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.util.FormatUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.stereotype.Service

@Service
class StackoverflowEmbeddingService(
    private val embeddingApiClient: EmbeddingApiClient
) : EmbeddingService<StackoverflowProfile> {

    companion object {
        private const val TOTAL_CHAR_BUDGET = 12_000
        private const val EXPERT_THRESHOLD = 1_000
        private const val INTERMEDIATE_THRESHOLD = 200
    }

    override suspend fun generateEmbeddings(source: StackoverflowProfile): FloatArray {
        val text = buildEmbeddingText(source)
        return withContext(Dispatchers.IO) {
            embeddingApiClient.embed(text)
        }
    }

    override fun getType(): SocialPlatform = SocialPlatform.STACKOVERFLOW

    private fun buildEmbeddingText(profile: StackoverflowProfile): String {
        val sb = StringBuilder()

        val (expert, intermediate, familiar) = partitionTags(profile.topTags())

        if (expert.isNotEmpty()) {
            sb.appendLine(
                "Areas of Expertise: ${expert.joinToString(", ") { it.name() }}"
            )
        }

        if (intermediate.isNotEmpty()) {
            sb.appendLine(
                "Intermediate Knowledge: ${intermediate.joinToString(", ") { it.name() }}"
            )
        }

        if (familiar.isNotEmpty()) {
            sb.appendLine(
                "Also familiar with: ${familiar.joinToString(", ") { it.name() }}"
            )
        }

        if (profile.topTags().isNotEmpty()) {
            sb.appendLine()
        }

        if (profile.topAnswerTitles().isNotEmpty()) {
            sb.appendLine("Top answered questions:")
            profile.topAnswerTitles().forEach { title ->
                sb.appendLine("- $title")
            }
            sb.appendLine()
        }

        if (profile.topQuestionTitles().isNotEmpty()) {
            sb.appendLine("Top questions asked:")
            profile.topQuestionTitles().forEach { title ->
                sb.appendLine("- $title")
            }
        }

        return FormatUtil.truncate(sb.toString().trim(), TOTAL_CHAR_BUDGET)
    }

    private data class TagPartition(
        val expert: List<StackoverflowProfile.TagInfo>,
        val intermediate: List<StackoverflowProfile.TagInfo>,
        val familiar: List<StackoverflowProfile.TagInfo>
    )

    private fun partitionTags(tags: List<StackoverflowProfile.TagInfo>): TagPartition {
        val expert = mutableListOf<StackoverflowProfile.TagInfo>()
        val intermediate = mutableListOf<StackoverflowProfile.TagInfo>()
        val familiar = mutableListOf<StackoverflowProfile.TagInfo>()

        tags.forEach { tag ->
            val score = tag.answerScore() ?: 0
            when {
                score >= EXPERT_THRESHOLD -> expert.add(tag)
                score >= INTERMEDIATE_THRESHOLD -> intermediate.add(tag)
                else -> familiar.add(tag)
            }
        }

        return TagPartition(expert, intermediate, familiar)
    }
}