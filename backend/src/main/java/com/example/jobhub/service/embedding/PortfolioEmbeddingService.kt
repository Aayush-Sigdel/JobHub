package com.example.jobhub.service.embedding

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.dto.Portfolio
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.util.FormatUtil
import tools.jackson.databind.ObjectMapper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.stereotype.Service

@Service
class PortfolioEmbeddingService(
    private val embeddingApiClient: EmbeddingApiClient,
    private val objectMapper: ObjectMapper
) : EmbeddingService<Portfolio> {

    companion object {
        private const val MAX_HEADINGS = 20
        private const val MAX_PARAGRAPHS = 20
        private const val MIN_PARAGRAPH_LEN = 25
        private const val TOTAL_CHAR_BUDGET = 8_000

        private val BOILERPLATE_REGEX = Regex(
            "cookie|privacy policy|all rights reserved|terms (of|and) (service|conditions)|" +
                    "subscribe to (our|my) newsletter|©\\s?\\d{4}|powered by",
            RegexOption.IGNORE_CASE
        )

        private val KNOWN_LINK_HOSTS = mapOf(
            "github.com" to "GitHub",
            "linkedin.com" to "LinkedIn",
            "dribbble.com" to "Dribbble",
            "behance.net" to "Behance",
            "medium.com" to "Medium",
            "dev.to" to "Dev.to",
            "stackoverflow.com" to "StackOverflow",
            "npmjs.com" to "npm"
        )
    }

    override suspend fun generateEmbeddings(source: Portfolio): FloatArray {
        val text = buildEmbeddingText(source)
        return withContext(Dispatchers.IO) {
            embeddingApiClient.embed(text)
        }
    }

    override fun getType(): SocialPlatform = SocialPlatform.PORTFOLIO

    private fun buildEmbeddingText(portfolio: Portfolio): String {
        val sb = StringBuilder()

        portfolio.title?.trim()?.takeIf { it.isNotBlank() }?.let { sb.appendLine(it) }
        portfolio.description?.trim()?.takeIf { it.isNotBlank() }?.let { sb.appendLine(it) }
        sb.appendLine()

        extractJsonLdText(portfolio.jsonLd).takeIf { it.isNotBlank() }?.let {
            sb.appendLine(it)
            sb.appendLine()
        }

        val cleanHeadings = portfolio.headings
            .map { it.trim() }
            .filter { it.isNotBlank() && !BOILERPLATE_REGEX.containsMatchIn(it) }
            .distinct()
            .take(MAX_HEADINGS)
        if (cleanHeadings.isNotEmpty()) {
            sb.appendLine("Sections: ${cleanHeadings.joinToString(" | ")}")
            sb.appendLine()
        }

        val cleanParagraphs = portfolio.paragraphs
            .map { it.trim() }
            .filter { it.length >= MIN_PARAGRAPH_LEN && !BOILERPLATE_REGEX.containsMatchIn(it) }
            .distinct()
            .take(MAX_PARAGRAPHS)
        if (cleanParagraphs.isNotEmpty()) {
            sb.appendLine(cleanParagraphs.joinToString("\n"))
            sb.appendLine()
        }

        val linkedPlatforms = portfolio.links
            .mapNotNull { link -> KNOWN_LINK_HOSTS.entries.firstOrNull { link.contains(it.key) }?.value }
            .distinct()
        if (linkedPlatforms.isNotEmpty()) {
            sb.appendLine("Linked platforms: ${linkedPlatforms.joinToString(", ")}")
        }

        return FormatUtil.truncate(sb.toString().trim(), TOTAL_CHAR_BUDGET)
    }

    private fun extractJsonLdText(jsonLdBlocks: List<String>): String {
        val fields = linkedSetOf<String>()
        for (block in jsonLdBlocks) {
            try {
                collectJsonLdFields(objectMapper.readTree(block), fields)
            } catch (e: Exception) {
            }
        }
        return fields.joinToString("\n")
    }

    private fun collectJsonLdFields(node: tools.jackson.databind.JsonNode?, out: MutableSet<String>) {
        if (node == null) return
        if (node.isArray) {
            node.forEach { collectJsonLdFields(it, out) }
            return
        }
        if (!node.isObject) return

        val interestingKeys = listOf("name", "jobTitle", "headline", "description", "knowsAbout", "alumniOf", "worksFor")
        for (key in interestingKeys) {
            val value = node.get(key) ?: continue
            val text = when {
                value.isString -> value.asText()
                value.isArray -> value.mapNotNull { it.asText(null) }.joinToString(", ")
                value.isObject -> value.get("name")?.asText()
                else -> null
            }
            if (!text.isNullOrBlank()) out.add("$key: $text")
        }
        node.get("@graph")?.let { collectJsonLdFields(it, out) }
    }
}
