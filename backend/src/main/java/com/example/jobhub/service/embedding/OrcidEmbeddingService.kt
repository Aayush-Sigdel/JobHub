package com.example.jobhub.service.embedding

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.dto.OrcidProfile
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.util.FormatUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.stereotype.Service

@Service
class OrcidEmbeddingService(
    private val embeddingApiClient: EmbeddingApiClient
) : EmbeddingService<OrcidProfile> {

    companion object {
        private const val TOTAL_CHAR_BUDGET = 8_000
    }

    override suspend fun generateEmbeddings(source: OrcidProfile): FloatArray {
        val text = buildEmbeddingText(source)
        return withContext(Dispatchers.IO) {
            embeddingApiClient.embed(text)
        }
    }

    override fun getType(): SocialPlatform = SocialPlatform.ORCID

    private fun buildEmbeddingText(profile: OrcidProfile): String {
        val sb = StringBuilder()

        profile.biography()?.trim()?.takeIf { it.isNotBlank() }?.let {
            sb.appendLine(it)
            sb.appendLine()
        }

        if (profile.keywords().isNotEmpty()) {
            sb.appendLine("Research Areas: ${profile.keywords().joinToString(", ")}")
            sb.appendLine()
        }

        if (profile.employments().isNotEmpty()) {
            sb.appendLine("Experience:")
            profile.employments().forEach { employment ->
                val role = employment.roleTitle()?.trim()
                val org = employment.organization()?.trim()

                val header = when {
                    role != null && org != null -> "$role at $org"
                    role != null -> role
                    org != null -> org
                    else -> return@forEach
                }

                sb.appendLine("Position: $header")
                employment.departmentName()?.trim()?.takeIf { it.isNotBlank() }?.let {
                    sb.appendLine("Department: $it")
                }

                formatPeriod(employment.startDate(), employment.endDate())?.let {
                    sb.appendLine("Period: $it")
                }

                sb.appendLine()
            }
        }

        if (profile.works().isNotEmpty()) {
            sb.appendLine("Publications:")
            profile.works().forEach { work ->
                val title = work.title() ?: return@forEach

                val meta = listOfNotNull(
                    work.type()?.replace("-", " "),
                    work.journalTitle()?.trim()?.takeIf { it.isNotBlank() },
                    work.publicationYear()
                ).joinToString(", ")

                if (meta.isNotBlank()) {
                    sb.appendLine("- $title ($meta)")
                } else {
                    sb.appendLine("- $title")
                }
            }
        }

        return FormatUtil.truncate(sb.toString().trim(), TOTAL_CHAR_BUDGET)
    }

    private fun formatPeriod(start: String?, end: String?): String? {
        if (start == null && end == null) return null
        return when {
            start != null && end != null -> "$start - $end"
            start != null -> "$start - Present"
            else -> "until $end"
        }
    }
}
