package com.example.jobhub.service.embedding

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.dto.GithubProfile
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.util.FormatUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.stereotype.Service

@Service
class GithubEmbeddingService(
    private val embeddingApiClient: EmbeddingApiClient
) : EmbeddingService<GithubProfile> {

    companion object {
        private const val PINNED_README_CHAR_BUDGET = 800
        private const val OTHER_README_CHAR_BUDGET = 400
        private const val TOTAL_CHAR_BUDGET = 8_000
    }

    override suspend fun generateEmbeddings(source: GithubProfile): FloatArray {
        val text = buildEmbeddingText(source)
        return withContext(Dispatchers.IO) {
            embeddingApiClient.embed(text)
        }
    }

    override fun getType(): SocialPlatform = SocialPlatform.GITHUB

    private fun buildEmbeddingText(profile: GithubProfile): String {
        val sb = StringBuilder()

        profile.bio()?.trim()?.takeIf { it.isNotBlank() }?.let {
            sb.appendLine(it)
            sb.appendLine()
        }
        if (profile.uniqueLanguages().isNotEmpty()) {
            sb.appendLine("Languages: ${profile.uniqueLanguages().sorted().joinToString(", ")}")
            sb.appendLine()
        }
        if (profile.repositories().isNotEmpty()) {
            sb.appendLine("Projects:")
            sb.appendLine()
            profile.repositories().forEach { repo ->
                val readmeBudget = if (repo.isPinned) PINNED_README_CHAR_BUDGET else OTHER_README_CHAR_BUDGET
                sb.appendLine("Project: ${repo.name()}")
                repo.description()?.trim()?.takeIf { it.isNotBlank() }?.let {
                    sb.appendLine("Description: $it")
                }
                if (repo.topics().isNotEmpty()) {
                    sb.appendLine("Topics: ${repo.topics().joinToString(", ")}")
                }
                repo.readme?.let { rawReadme ->
                    val cleaned = FormatUtil.truncate(FormatUtil.cleanText(rawReadme), readmeBudget)
                    if (cleaned.isNotBlank()) {
                        sb.appendLine("README: $cleaned")
                    }
                }
                sb.appendLine()
            }
        }
        return FormatUtil.truncate(sb.toString().trim(), TOTAL_CHAR_BUDGET)
    }

}
