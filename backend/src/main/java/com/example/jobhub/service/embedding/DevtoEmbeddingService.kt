package com.example.jobhub.service.embedding

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.dto.DevtoProfile
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.util.FormatUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.stereotype.Service

@Service
class DevtoEmbeddingService(
    private val embeddingApiClient: EmbeddingApiClient
) : EmbeddingService<DevtoProfile> {

    companion object {
        private const val SUMMARY_CHAR_BUDGET = 500
        private const val ARTICLE_BODY_CHAR_BUDGET = 500
        private const val TOTAL_CHAR_BUDGET = 8_000
    }

    override suspend fun generateEmbeddings(
        source: DevtoProfile
    ): FloatArray {
        val text = buildEmbeddingText(source)
        return withContext(Dispatchers.IO) {
            embeddingApiClient.embed(text)
        }
    }

    override fun getType(): SocialPlatform =
        SocialPlatform.DEV_TO

    private fun buildEmbeddingText(
        profile: DevtoProfile
    ): String {
        val sb = StringBuilder()

        profile.summary
            ?.trim()
            ?.takeIf { it.isNotBlank() }
            ?.let {
                sb.appendLine(
                    "Interests: ${
                        FormatUtil.truncate(
                            it,
                            SUMMARY_CHAR_BUDGET
                        )
                    }"
                )
                sb.appendLine()
            }

        if (profile.articles.isNotEmpty()) {
            sb.appendLine("Technical topics and articles:")

            profile.articles.forEach { article ->
                sb.appendLine()

                article.title
                    ?.trim()
                    ?.takeIf { it.isNotBlank() }
                    ?.let {
                        sb.appendLine("Topic: $it")
                    }

                if (article.tags.isNotEmpty()) {
                    sb.appendLine(
                        "Technologies: ${
                            article.tags.joinToString(", ")
                        }"
                    )
                }

                article.bodyMarkdown
                    ?.let(FormatUtil::cleanText)
                    ?.takeIf { it.isNotBlank() }
                    ?.let {
                        sb.appendLine(
                            "Content: ${
                                FormatUtil.truncate(
                                    it,
                                    ARTICLE_BODY_CHAR_BUDGET
                                )
                            }"
                        )
                    }
            }
        }

        return FormatUtil.truncate(
            sb.toString().trim(),
            TOTAL_CHAR_BUDGET
        )
    }
}
